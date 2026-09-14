import { connectToProductionDatabase } from "./mongodb";
import { UserModel } from "../models/User";
import { ConsultantModel } from "../models/Consultant";
import { PatientModel } from "../models/Patient";
import { PatientVisitModel } from "../models/PatientVisit";
import { ConsultationModel } from "../models/Consultation";
import { PrescriptionModel } from "../models/Prescription";
import { LabOrderModel } from "../models/LabOrder";
import { LabReportModel } from "../models/LabReport";
import { LabRevisionRequestModel } from "../models/LabRevisionRequest";
import { UltrasoundOrderModel } from "../models/UltrasoundOrder";
import { UltrasoundReportModel } from "../models/UltrasoundReport";
import { UltrasoundRevisionRequestModel } from "../models/UltrasoundRevisionRequest";
import { MedicineModel } from "../models/Medicine";
import { InventoryTransactionModel } from "../models/InventoryTransaction";
import { PharmacyDispensingModel } from "../models/PharmacyDispensing";
import { OTRecordModel } from "../models/OTRecord";
import { GyneRecordModel } from "../models/GyneRecord";
import { CashTransactionModel } from "../models/CashTransaction";
import { DailyCashClosingModel } from "../models/DailyCashClosing";
import { AuditLogModel } from "../models/AuditLog";
import { SystemHealthRecordModel } from "../models/SystemHealthRecord";

/**
 * Programmatically verifies and creates all production MongoDB indexes.
 */
export async function ensureProductionIndexes(): Promise<void> {
  console.log("[MongoDB Indexing] Verifying and synchronizing collection indexes...");
  await connectToProductionDatabase();

  await Promise.all([
    UserModel.syncIndexes(),
    ConsultantModel.syncIndexes(),
    PatientModel.syncIndexes(),
    PatientVisitModel.syncIndexes(),
    ConsultationModel.syncIndexes(),
    PrescriptionModel.syncIndexes(),
    LabOrderModel.syncIndexes(),
    LabReportModel.syncIndexes(),
    LabRevisionRequestModel.syncIndexes(),
    UltrasoundOrderModel.syncIndexes(),
    UltrasoundReportModel.syncIndexes(),
    UltrasoundRevisionRequestModel.syncIndexes(),
    MedicineModel.syncIndexes(),
    InventoryTransactionModel.syncIndexes(),
    PharmacyDispensingModel.syncIndexes(),
    OTRecordModel.syncIndexes(),
    GyneRecordModel.syncIndexes(),
    CashTransactionModel.syncIndexes(),
    DailyCashClosingModel.syncIndexes(),
    AuditLogModel.syncIndexes(),
    SystemHealthRecordModel.syncIndexes(),
  ]);

  console.log("[MongoDB Indexing] All production collection indexes successfully synchronized!");
}
