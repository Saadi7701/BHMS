import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { connectToProductionDatabase, disconnectProductionDatabase } from "../src/lib/mongodb";
import {
  UserModel,
  ConsultantModel,
  PatientModel,
  PatientVisitModel,
  ConsultationModel,
  PrescriptionModel,
  LabOrderModel,
  LabReportModel,
  MedicineModel,
  CashTransactionModel,
} from "../src/models";

const prisma = new PrismaClient();

export interface IValidationRow {
  entity: string;
  mongoCount: number;
  pgCount: number;
  difference: number;
  status: "MATCH" | "DISCREPANCY";
}

export async function validatePostgresMigration(): Promise<{
  countReconciliation: IValidationRow[];
  financialCheck: { mongoTotalIncome: number; pgTotalIncome: number; passed: boolean };
  orphanCheck: { orphanCount: number; passed: boolean };
}> {
  console.log("=================================================");
  console.log("[Phase 3] Running Automated Validation & Reconciliation...");
  console.log("=================================================");

  const report: IValidationRow[] = [];
  let mongoTotalIncome = 0;
  let pgTotalIncome = 0;
  let orphanCount = 0;

  try {
    await connectToProductionDatabase();
    await prisma.$connect();

    const checkEntity = async (entity: string, mongoQuery: Promise<number>, pgQuery: Promise<number>) => {
      const [mongoCount, pgCount] = await Promise.all([mongoQuery, pgQuery]);
      const difference = pgCount - mongoCount;
      report.push({
        entity,
        mongoCount,
        pgCount,
        difference,
        status: difference === 0 ? "MATCH" : "DISCREPANCY",
      });
    };

    // 1. Record Count Reconciliation
    await checkEntity("Users", UserModel.countDocuments(), prisma.user.count());
    await checkEntity("Consultants", ConsultantModel.countDocuments(), prisma.consultant.count());
    await checkEntity("Patients", PatientModel.countDocuments(), prisma.patient.count());
    await checkEntity("PatientVisits", PatientVisitModel.countDocuments(), prisma.patientVisit.count());
    await checkEntity("Consultations", ConsultationModel.countDocuments(), prisma.consultation.count());
    await checkEntity("Prescriptions", PrescriptionModel.countDocuments(), prisma.prescription.count());
    await checkEntity("LabOrders", LabOrderModel.countDocuments(), prisma.labOrder.count());
    await checkEntity("LabReports", LabReportModel.countDocuments(), prisma.labReport.count());
    await checkEntity("Medicines", MedicineModel.countDocuments(), prisma.medicine.count());
    await checkEntity("CashTransactions", CashTransactionModel.countDocuments(), prisma.cashTransaction.count());

    // 2. Financial Totals Reconciliation
    const mongoIncomeAgg = await CashTransactionModel.aggregate([
      { $match: { transactionType: "INCOME" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    mongoTotalIncome = mongoIncomeAgg.length > 0 ? mongoIncomeAgg[0].total : 0;

    const pgIncomeAgg = await prisma.cashTransaction.aggregate({
      where: { transactionType: "INCOME" },
      _sum: { amount: true },
    });
    pgTotalIncome = Number(pgIncomeAgg._sum.amount || 0);

    // 3. Orphan Record Verification
    const allPatientIds = (await prisma.patient.findMany({ select: { id: true } })).map((p) => p.id);
    const orphanVisits = await prisma.patientVisit.findMany({
      where: {
        patientId: { notIn: allPatientIds.length > 0 ? allPatientIds : ["none"] },
      },
    });
    orphanCount = orphanVisits.length;

    console.log("------------------------------------------------------------------");
    console.log("| Entity               | Mongo Count | PG Count | Diff | Status  |");
    console.log("------------------------------------------------------------------");
    for (const row of report) {
      const entityStr = row.entity.padEnd(20);
      const mongoStr = String(row.mongoCount).padStart(11);
      const pgStr = String(row.pgCount).padStart(8);
      const diffStr = String(row.difference).padStart(4);
      const statusStr = row.status.padEnd(7);
      console.log(`| ${entityStr} | ${mongoStr} | ${pgStr} | ${diffStr} | ${statusStr} |`);
    }
    console.log("------------------------------------------------------------------");
    console.log(`Financial Income Totals Reconciliation:`);
    console.log(`  - MongoDB Total Income : PKR ${mongoTotalIncome}`);
    console.log(`  - PostgreSQL Total Income: PKR ${pgTotalIncome}`);
    console.log(`  - Financial Match      : ${mongoTotalIncome === pgTotalIncome ? "YES (PASSED)" : "NO (DISCREPANCY)"}`);
    console.log(`Orphan Records Check    : ${orphanCount === 0 ? "0 Orphans (PASSED)" : `${orphanCount} Orphans Found`}`);
    console.log("------------------------------------------------------------------");

  } catch (err: any) {
    console.error("[Validation Error]:", err.message);
  } finally {
    await prisma.$disconnect();
    await disconnectProductionDatabase();
  }

  return {
    countReconciliation: report,
    financialCheck: {
      mongoTotalIncome,
      pgTotalIncome,
      passed: mongoTotalIncome === pgTotalIncome,
    },
    orphanCheck: {
      orphanCount,
      passed: orphanCount === 0,
    },
  };
}

if (require.main === module) {
  validatePostgresMigration().then(() => process.exit(0));
}
