import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { PatientModel } from "@/models/Patient";
import { PatientVisitModel } from "@/models/PatientVisit";
import { LabOrderModel } from "@/models/LabOrder";
import { UltrasoundOrderModel } from "@/models/UltrasoundOrder";
import { PrescriptionModel } from "@/models/Prescription";
import { MedicineModel } from "@/models/Medicine";
import { CashTransactionModel } from "@/models/CashTransaction";
import { UserModel } from "@/models/User";

export async function GET() {
  try {
    await connectToProductionDatabase();

    const [patients, visits, labOrders, ultrasoundOrders, prescriptions, medicines, cashTransactions, users] =
      await Promise.all([
        PatientModel.find().lean().exec(),
        PatientVisitModel.find().lean().exec(),
        LabOrderModel.find().lean().exec(),
        UltrasoundOrderModel.find().lean().exec(),
        PrescriptionModel.find().lean().exec(),
        MedicineModel.find().lean().exec(),
        CashTransactionModel.find().lean().exec(),
        UserModel.find({}, { passwordHash: 0 }).lean().exec(),
      ]);

    const backupPayload = {
      exportTimestamp: new Date().toISOString(),
      hospital: "BILAL HOSPITAL MANAGEMENT SYSTEM",
      database: "bilal_hospital_prod",
      collections: {
        patientsCount: patients.length,
        visitsCount: visits.length,
        labOrdersCount: labOrders.length,
        ultrasoundOrdersCount: ultrasoundOrders.length,
        prescriptionsCount: prescriptions.length,
        medicinesCount: medicines.length,
        cashTransactionsCount: cashTransactions.length,
        usersCount: users.length,
      },
      data: {
        patients,
        visits,
        labOrders,
        ultrasoundOrders,
        prescriptions,
        medicines,
        cashTransactions,
        users,
      },
    };

    return new Response(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="BHMS_Database_Dump_${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error: any) {
    console.error("[Database Backup Dump Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate database backup dump." },
      { status: 500 }
    );
  }
}
