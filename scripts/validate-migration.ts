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
  pgCount: number;
  mongoCount: number;
  difference: number;
  status: "MATCH" | "DISCREPANCY";
}

export async function validateMigrationData(): Promise<IValidationRow[]> {
  console.log("=================================================");
  console.log("[Validation] Running PostgreSQL vs MongoDB Data Reconciliation...");
  console.log("=================================================");

  const report: IValidationRow[] = [];

  try {
    await connectToProductionDatabase();

    const checkEntity = async (entity: string, pgQuery: Promise<number>, mongoQuery: Promise<number>) => {
      const [pgCount, mongoCount] = await Promise.all([pgQuery, mongoQuery]);
      const difference = mongoCount - pgCount;
      report.push({
        entity,
        pgCount,
        mongoCount,
        difference,
        status: difference === 0 ? "MATCH" : "DISCREPANCY",
      });
    };

    await checkEntity("Users", prisma.user.count(), UserModel.countDocuments());
    await checkEntity("Consultants", prisma.consultant.count(), ConsultantModel.countDocuments());
    await checkEntity("Patients", prisma.patient.count(), PatientModel.countDocuments());
    await checkEntity("PatientVisits", prisma.patientVisit.count(), PatientVisitModel.countDocuments());
    await checkEntity("Consultations", prisma.consultation.count(), ConsultationModel.countDocuments());
    await checkEntity("Prescriptions", prisma.prescription.count(), PrescriptionModel.countDocuments());
    await checkEntity("LabOrders", prisma.labOrder.count(), LabOrderModel.countDocuments());
    await checkEntity("LabReports", prisma.labReport.count(), LabReportModel.countDocuments());
    await checkEntity("Medicines", prisma.medicine.count(), MedicineModel.countDocuments());
    await checkEntity("CashTransactions", prisma.cashTransaction.count(), CashTransactionModel.countDocuments());

    console.log("------------------------------------------------------------------");
    console.log("| Entity               | PG Count | Mongo Count | Diff | Status  |");
    console.log("------------------------------------------------------------------");
    for (const row of report) {
      const entityStr = row.entity.padEnd(20);
      const pgStr = String(row.pgCount).padStart(8);
      const mongoStr = String(row.mongoCount).padStart(11);
      const diffStr = String(row.difference).padStart(4);
      const statusStr = row.status.padEnd(7);
      console.log(`| ${entityStr} | ${pgStr} | ${mongoStr} | ${diffStr} | ${statusStr} |`);
    }
    console.log("------------------------------------------------------------------");
  } catch (err: any) {
    console.error("[Validation Error]:", err.message);
  } finally {
    await prisma.$disconnect();
    await disconnectProductionDatabase();
  }

  return report;
}

if (require.main === module) {
  validateMigrationData().then(() => process.exit(0));
}
