import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import {
  PatientModel,
  PatientVisitModel,
  ConsultationModel,
  PrescriptionModel,
  LabOrderModel,
  LabReportModel,
  LabRevisionRequestModel,
  UltrasoundOrderModel,
  UltrasoundReportModel,
  UltrasoundRevisionRequestModel,
  PharmacyDispensingModel,
  InventoryTransactionModel,
  OTRecordModel,
  GyneRecordModel,
  CashTransactionModel,
  DailyCashClosingModel,
  AuditLogModel,
} from "@/models";

export async function POST() {
  return clearAllMockData();
}

export async function DELETE() {
  return clearAllMockData();
}

async function clearAllMockData() {
  try {
    await connectToProductionDatabase();

    await Promise.all([
      PatientModel.deleteMany({}),
      PatientVisitModel.deleteMany({}),
      ConsultationModel.deleteMany({}),
      PrescriptionModel.deleteMany({}),
      LabOrderModel.deleteMany({}),
      LabReportModel.deleteMany({}),
      LabRevisionRequestModel.deleteMany({}),
      UltrasoundOrderModel.deleteMany({}),
      UltrasoundReportModel.deleteMany({}),
      UltrasoundRevisionRequestModel.deleteMany({}),
      PharmacyDispensingModel.deleteMany({}),
      InventoryTransactionModel.deleteMany({}),
      OTRecordModel.deleteMany({}),
      GyneRecordModel.deleteMany({}),
      CashTransactionModel.deleteMany({}),
      DailyCashClosingModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
    ]);

    return NextResponse.json(
      {
        message: "All operational records (patients, visits, orders, lab/ultrasound, pharmacy, cash ledger) cleared successfully.",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Clear Data Error]:", error);
    return NextResponse.json(
      { error: "Failed to purge database records: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
