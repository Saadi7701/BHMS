import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";
import { connectToProductionDatabase, disconnectProductionDatabase } from "../src/lib/mongodb";
import { ensureProductionIndexes } from "../src/lib/ensureIndexes";
import {
  UserModel,
  ConsultantModel,
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
  MedicineModel,
  InventoryTransactionModel,
  PharmacyDispensingModel,
  OTRecordModel,
  GyneRecordModel,
  CashTransactionModel,
  DailyCashClosingModel,
  AuditLogModel,
  SystemHealthRecordModel,
} from "../src/models";

const prisma = new PrismaClient();

export interface IMigrationStats {
  users: number;
  consultants: number;
  patients: number;
  visits: number;
  consultations: number;
  prescriptions: number;
  labOrders: number;
  labReports: number;
  labRevisions: number;
  ultrasoundOrders: number;
  ultrasoundReports: number;
  ultrasoundRevisions: number;
  medicines: number;
  inventoryTransactions: number;
  pharmacyDispensings: number;
  otRecords: number;
  gyneRecords: number;
  cashTransactions: number;
  dailyCashClosings: number;
  auditLogs: number;
  systemHealthRecords: number;
  errors: string[];
}

export async function runMigration(): Promise<IMigrationStats> {
  console.log("=================================================");
  console.log("[Migration] Starting PostgreSQL -> MongoDB Migration Process...");
  console.log("=================================================");

  const stats: IMigrationStats = {
    users: 0,
    consultants: 0,
    patients: 0,
    visits: 0,
    consultations: 0,
    prescriptions: 0,
    labOrders: 0,
    labReports: 0,
    labRevisions: 0,
    ultrasoundOrders: 0,
    ultrasoundReports: 0,
    ultrasoundRevisions: 0,
    medicines: 0,
    inventoryTransactions: 0,
    pharmacyDispensings: 0,
    otRecords: 0,
    gyneRecords: 0,
    cashTransactions: 0,
    dailyCashClosings: 0,
    auditLogs: 0,
    systemHealthRecords: 0,
    errors: [],
  };

  try {
    await connectToProductionDatabase();
    await ensureProductionIndexes();

    // Map to preserve relational links: legacy UUID string -> MongoDB ObjectId
    const idMap = new Map<string, mongoose.Types.ObjectId>();

    const getOrGenerateObjectId = (legacyId?: string | null): mongoose.Types.ObjectId => {
      if (!legacyId) return new mongoose.Types.ObjectId();
      if (idMap.has(legacyId)) {
        return idMap.get(legacyId)!;
      }
      const newId = new mongoose.Types.ObjectId();
      idMap.set(legacyId, newId);
      return newId;
    };

    // 1. Migrate Users
    console.log("[Migration] Processing Users...");
    const users = await prisma.user.findMany();
    for (const u of users) {
      const mongoId = getOrGenerateObjectId(u.id);
      await UserModel.updateOne(
        { username: u.username.toLowerCase().trim() },
        {
          $set: {
            _id: mongoId,
            legacyId: u.id,
            username: u.username.toLowerCase().trim(),
            email: u.email.toLowerCase().trim(),
            passwordHash: u.passwordHash,
            fullName: u.fullName,
            role: u.role as any,
            isActive: u.isActive,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          },
        },
        { upsert: true }
      );
      stats.users++;
    }

    // 2. Migrate Consultants
    console.log("[Migration] Processing Consultants...");
    const consultants = await prisma.consultant.findMany();
    for (const c of consultants) {
      const mongoId = getOrGenerateObjectId(c.id);
      const userMongoId = getOrGenerateObjectId(c.userId);
      await ConsultantModel.updateOne(
        { userId: userMongoId },
        {
          $set: {
            _id: mongoId,
            legacyId: c.id,
            userId: userMongoId,
            specialty: c.specialty,
            department: c.department,
            qualification: c.qualification,
            roomNumber: c.roomNumber,
            consultationFee: Number(c.consultationFee || 0),
            isAvailable: c.isAvailable,
          },
        },
        { upsert: true }
      );
      stats.consultants++;
    }

    // 3. Migrate Patients
    console.log("[Migration] Processing Patients...");
    const patients = await prisma.patient.findMany();
    for (const p of patients) {
      const mongoId = getOrGenerateObjectId(p.id);
      const createdByMongoId = getOrGenerateObjectId(p.createdBy);
      await PatientModel.updateOne(
        { mrNumber: p.mrNumber.trim() },
        {
          $set: {
            _id: mongoId,
            legacyId: p.id,
            mrNumber: p.mrNumber.trim(),
            fullName: p.fullName,
            fatherHusbandName: p.fatherHusbandName || undefined,
            gender: p.gender,
            dob: p.dob || undefined,
            age: p.age,
            phone: p.phone,
            address: p.address || undefined,
            cnic: p.cnic || undefined,
            emergencyContact: p.emergencyContact || undefined,
            bloodGroup: p.bloodGroup || undefined,
            notes: p.notes || undefined,
            createdBy: createdByMongoId,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          },
        },
        { upsert: true }
      );
      stats.patients++;
    }

    // 4. Migrate PatientVisits
    console.log("[Migration] Processing Patient Visits...");
    const visits = await prisma.patientVisit.findMany();
    for (const v of visits) {
      const mongoId = getOrGenerateObjectId(v.id);
      const patientMongoId = getOrGenerateObjectId(v.patientId);
      const consultantMongoId = getOrGenerateObjectId(v.consultantId);
      const recepMongoId = getOrGenerateObjectId(v.receptionistId);

      await PatientVisitModel.updateOne(
        { visitNumber: v.visitNumber.trim() },
        {
          $set: {
            _id: mongoId,
            legacyId: v.id,
            visitNumber: v.visitNumber.trim(),
            patientId: patientMongoId,
            consultantId: consultantMongoId,
            visitDate: v.visitDate,
            arrivalTime: v.arrivalTime,
            department: v.department,
            visitType: v.visitType,
            reasonForVisit: v.reasonForVisit || undefined,
            consultationFee: Number(v.consultationFee || 0),
            amountReceived: Number(v.amountReceived || 0),
            paymentMethod: v.paymentMethod,
            receptionistId: recepMongoId,
            status: v.status as any,
            notes: v.notes || undefined,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
          },
        },
        { upsert: true }
      );
      stats.visits++;
    }

    // 5. Migrate Consultations
    console.log("[Migration] Processing Consultations...");
    const consultations = await prisma.consultation.findMany();
    for (const c of consultations) {
      const mongoId = getOrGenerateObjectId(c.id);
      const visitMongoId = getOrGenerateObjectId(c.visitId);
      const patientMongoId = getOrGenerateObjectId(c.patientId);
      const consultantMongoId = getOrGenerateObjectId(c.consultantId);

      await ConsultationModel.updateOne(
        { _id: mongoId },
        {
          $set: {
            legacyId: c.id,
            visitId: visitMongoId,
            patientId: patientMongoId,
            consultantId: consultantMongoId,
            chiefComplaint: c.chiefComplaint,
            symptoms: c.symptoms || undefined,
            diagnosis: c.diagnosis,
            bpSystolic: c.bpSystolic || undefined,
            bpDiastolic: c.bpDiastolic || undefined,
            temperature: c.temperature || undefined,
            pulse: c.pulse || undefined,
            weight: c.weight || undefined,
            clinicalNotes: c.clinicalNotes || undefined,
            advice: c.advice || undefined,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          },
        },
        { upsert: true }
      );
      stats.consultations++;
    }

    // 6. Migrate Prescriptions (with embedded items)
    console.log("[Migration] Processing Prescriptions...");
    const prescriptions = await prisma.prescription.findMany({ include: { items: true } });
    for (const rx of prescriptions) {
      const mongoId = getOrGenerateObjectId(rx.id);
      const patientMongoId = getOrGenerateObjectId(rx.patientId);
      const visitMongoId = getOrGenerateObjectId(rx.visitId);
      const consultantMongoId = getOrGenerateObjectId(rx.consultantId);
      const consultationMongoId = rx.consultationId ? getOrGenerateObjectId(rx.consultationId) : undefined;

      const items = rx.items.map((item) => ({
        legacyId: item.id,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        route: item.route || undefined,
        instructions: item.instructions || undefined,
      }));

      await PrescriptionModel.updateOne(
        { _id: mongoId },
        {
          $set: {
            legacyId: rx.id,
            patientId: patientMongoId,
            visitId: visitMongoId,
            consultantId: consultantMongoId,
            consultationId: consultationMongoId,
            diagnosis: rx.diagnosis,
            prescriptionDate: rx.prescriptionDate,
            notes: rx.notes || undefined,
            isDispensed: rx.isDispensed,
            items,
            createdAt: rx.createdAt,
            updatedAt: rx.updatedAt,
          },
        },
        { upsert: true }
      );
      stats.prescriptions++;
    }

    // 7. Migrate LabOrders (with embedded items)
    console.log("[Migration] Processing Lab Orders...");
    const labOrders = await prisma.labOrder.findMany({ include: { items: true } });
    for (const lo of labOrders) {
      const mongoId = getOrGenerateObjectId(lo.id);
      const patientMongoId = getOrGenerateObjectId(lo.patientId);
      const visitMongoId = getOrGenerateObjectId(lo.visitId);
      const consultantMongoId = getOrGenerateObjectId(lo.consultantId);

      const items = lo.items.map((item) => ({
        legacyId: item.id,
        testName: item.testName,
        testCode: item.testCode,
        unitPrice: Number(item.unitPrice || 0),
      }));

      await LabOrderModel.updateOne(
        { orderNumber: lo.orderNumber.trim() },
        {
          $set: {
            _id: mongoId,
            legacyId: lo.id,
            orderNumber: lo.orderNumber.trim(),
            patientId: patientMongoId,
            visitId: visitMongoId,
            consultantId: consultantMongoId,
            testCategory: lo.testCategory,
            clinicalNotes: lo.clinicalNotes || undefined,
            priority: lo.priority as any,
            status: lo.status as any,
            totalFee: Number(lo.totalFee || 0),
            requestDate: lo.requestDate,
            items,
            createdAt: lo.createdAt,
            updatedAt: lo.updatedAt,
          },
        },
        { upsert: true }
      );
      stats.labOrders++;
    }

    // 8. Migrate LabReports (with embedded versions)
    console.log("[Migration] Processing Lab Reports...");
    const labReports = await prisma.labReport.findMany({ include: { versions: true } });
    for (const lr of labReports) {
      const mongoId = getOrGenerateObjectId(lr.id);
      const labOrderMongoId = getOrGenerateObjectId(lr.labOrderId);

      const versions = lr.versions.map((v) => ({
        legacyId: v.id,
        versionNumber: v.versionNumber,
        structuredResult: v.structuredResult,
        summary: v.summary || undefined,
        performedBy: v.performedBy,
        pdfUrl: v.pdfUrl || undefined,
        createdAt: v.createdAt,
      }));

      await LabReportModel.updateOne(
        { labOrderId: labOrderMongoId },
        {
          $set: {
            _id: mongoId,
            legacyId: lr.id,
            labOrderId: labOrderMongoId,
            currentVersion: lr.currentVersion,
            isAccepted: lr.isAccepted,
            acceptedAt: lr.acceptedAt || undefined,
            acceptedBy: lr.acceptedBy || undefined,
            versions,
            createdAt: lr.createdAt,
            updatedAt: lr.updatedAt,
          },
        },
        { upsert: true }
      );
      stats.labReports++;
    }

    // 9. Migrate Medicines (with embedded batches)
    console.log("[Migration] Processing Medicines & Inventory...");
    const medicines = await prisma.medicine.findMany({ include: { batches: true } });
    for (const m of medicines) {
      const mongoId = getOrGenerateObjectId(m.id);

      const batches = m.batches.map((b) => ({
        legacyId: b.id,
        batchNumber: b.batchNumber,
        purchaseDate: b.purchaseDate,
        expiryDate: b.expiryDate,
        quantity: b.quantity,
        costPrice: Number(b.costPrice || 0),
        supplier: b.supplier || undefined,
        createdAt: b.createdAt,
      }));

      await MedicineModel.updateOne(
        { _id: mongoId },
        {
          $set: {
            legacyId: m.id,
            genericName: m.genericName,
            brandName: m.brandName,
            category: m.category,
            manufacturer: m.manufacturer,
            purchasePrice: Number(m.purchasePrice || 0),
            salePrice: Number(m.salePrice || 0),
            availableQuantity: m.availableQuantity,
            reorderLevel: m.reorderLevel,
            batches,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
          },
        },
        { upsert: true }
      );
      stats.medicines++;
    }

    // 10. Migrate CashTransactions
    console.log("[Migration] Processing Cash Transactions...");
    const cashTxns = await prisma.cashTransaction.findMany();
    for (const tx of cashTxns) {
      const mongoId = getOrGenerateObjectId(tx.id);
      const patientMongoId = tx.patientId ? getOrGenerateObjectId(tx.patientId) : undefined;
      const visitMongoId = tx.visitId ? getOrGenerateObjectId(tx.visitId) : undefined;
      const createdByMongoId = getOrGenerateObjectId(tx.createdById);

      await CashTransactionModel.updateOne(
        { transactionNumber: tx.transactionNumber.trim() },
        {
          $set: {
            _id: mongoId,
            legacyId: tx.id,
            transactionNumber: tx.transactionNumber.trim(),
            transactionType: tx.transactionType as any,
            category: tx.category,
            department: tx.department,
            amount: Number(tx.amount || 0),
            paymentMethod: tx.paymentMethod,
            description: tx.description,
            referenceNumber: tx.referenceNumber || undefined,
            patientId: patientMongoId,
            visitId: visitMongoId,
            createdById: createdByMongoId,
            transactionDate: tx.transactionDate,
            createdAt: tx.createdAt,
            updatedAt: tx.updatedAt,
          },
        },
        { upsert: true }
      );
      stats.cashTransactions++;
    }

    console.log("=================================================");
    console.log("[Migration Completed] Summary of Migrated Records:");
    console.log(`- Users: ${stats.users}`);
    console.log(`- Consultants: ${stats.consultants}`);
    console.log(`- Patients: ${stats.patients}`);
    console.log(`- Patient Visits: ${stats.visits}`);
    console.log(`- Consultations: ${stats.consultations}`);
    console.log(`- Prescriptions: ${stats.prescriptions}`);
    console.log(`- Lab Orders: ${stats.labOrders}`);
    console.log(`- Lab Reports: ${stats.labReports}`);
    console.log(`- Medicines: ${stats.medicines}`);
    console.log(`- Cash Transactions: ${stats.cashTransactions}`);
    console.log("=================================================");
  } catch (err: any) {
    console.error("[Migration Error]:", err.message);
    stats.errors.push(err.message);
  } finally {
    await prisma.$disconnect();
    await disconnectProductionDatabase();
  }

  return stats;
}

if (require.main === module) {
  runMigration().then(() => process.exit(0));
}
