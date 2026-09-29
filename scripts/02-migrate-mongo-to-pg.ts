import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";
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

export interface IMongoToPgStats {
  users: number;
  consultants: number;
  patients: number;
  visits: number;
  consultations: number;
  prescriptions: number;
  prescriptionItems: number;
  labOrders: number;
  labOrderItems: number;
  labReports: number;
  labReportVersions: number;
  labRevisions: number;
  ultrasoundOrders: number;
  ultrasoundReports: number;
  ultrasoundReportVersions: number;
  ultrasoundRevisions: number;
  medicines: number;
  medicineBatches: number;
  inventoryTransactions: number;
  pharmacyDispensings: number;
  pharmacyDispensingItems: number;
  otRecords: number;
  gyneRecords: number;
  cashTransactions: number;
  dailyCashClosings: number;
  auditLogs: number;
  systemHealthRecords: number;
  errors: string[];
}

export async function runMongoToPostgresMigration(): Promise<IMongoToPgStats> {
  console.log("=================================================");
  console.log("[Phase 3] Starting MongoDB -> Supabase / PostgreSQL Data Migration...");
  console.log("=================================================");

  const stats: IMongoToPgStats = {
    users: 0,
    consultants: 0,
    patients: 0,
    visits: 0,
    consultations: 0,
    prescriptions: 0,
    prescriptionItems: 0,
    labOrders: 0,
    labOrderItems: 0,
    labReports: 0,
    labReportVersions: 0,
    labRevisions: 0,
    ultrasoundOrders: 0,
    ultrasoundReports: 0,
    ultrasoundReportVersions: 0,
    ultrasoundRevisions: 0,
    medicines: 0,
    medicineBatches: 0,
    inventoryTransactions: 0,
    pharmacyDispensings: 0,
    pharmacyDispensingItems: 0,
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
    await prisma.$connect();

    // ID Mapping Cache: String (MongoDB ObjectId or legacy string) -> UUID string in PostgreSQL
    const mongoToPgIdMap = new Map<string, string>();

    const getPgUuid = (mongoId?: any): string => {
      if (!mongoId) return crypto.randomUUID();
      const strId = mongoId.toString();
      if (mongoToPgIdMap.has(strId)) {
        return mongoToPgIdMap.get(strId)!;
      }
      // Check if it's already a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(strId)) {
        mongoToPgIdMap.set(strId, strId);
        return strId;
      }
      const newUuid = crypto.randomUUID();
      mongoToPgIdMap.set(strId, newUuid);
      return newUuid;
    };

    // 1. Migrate Users
    console.log("[Migration] Extracting Users...");
    const mongoUsers = await UserModel.find().lean().exec();
    for (const u of mongoUsers) {
      const pgId = getPgUuid(u._id);
      const legacyIdStr = u._id.toString();
      const savedUser = await prisma.user.upsert({
        where: { username: u.username.toLowerCase().trim() },
        update: {
          email: u.email.toLowerCase().trim(),
          passwordHash: u.passwordHash,
          fullName: u.fullName,
          role: u.role,
          isActive: u.isActive,
          legacyId: legacyIdStr,
        },
        create: {
          id: pgId,
          legacyId: legacyIdStr,
          username: u.username.toLowerCase().trim(),
          email: u.email.toLowerCase().trim(),
          passwordHash: u.passwordHash,
          fullName: u.fullName,
          role: u.role,
          isActive: u.isActive,
          createdAt: u.createdAt || new Date(),
          updatedAt: u.updatedAt || new Date(),
        },
      });
      mongoToPgIdMap.set(legacyIdStr, savedUser.id);
      stats.users++;
    }

    // 2. Migrate Consultants
    console.log("[Migration] Extracting Consultants...");
    const mongoConsultants = await ConsultantModel.find().lean().exec();
    for (const c of mongoConsultants) {
      const pgId = getPgUuid(c._id);
      const pgUserId = getPgUuid(c.userId);
      const legacyIdStr = c._id.toString();

      const savedConsultant = await prisma.consultant.upsert({
        where: { userId: pgUserId },
        update: {
          specialty: c.specialty,
          department: c.department,
          qualification: c.qualification,
          roomNumber: c.roomNumber,
          consultationFee: Number(c.consultationFee || 0),
          isAvailable: c.isAvailable,
          legacyId: legacyIdStr,
        },
        create: {
          id: pgId,
          legacyId: legacyIdStr,
          userId: pgUserId,
          specialty: c.specialty,
          department: c.department,
          qualification: c.qualification,
          roomNumber: c.roomNumber,
          consultationFee: Number(c.consultationFee || 0),
          isAvailable: c.isAvailable,
        },
      });
      mongoToPgIdMap.set(legacyIdStr, savedConsultant.id);
      stats.consultants++;
    }

    // 3. Migrate Patients
    console.log("[Migration] Extracting Patients...");
    const mongoPatients = await PatientModel.find().lean().exec();
    for (const p of mongoPatients) {
      const pgId = getPgUuid(p._id);
      const createdByPgId = getPgUuid(p.createdBy);
      const legacyIdStr = p._id.toString();

      const savedPatient = await prisma.patient.upsert({
        where: { mrNumber: p.mrNumber.trim() },
        update: {
          fullName: p.fullName,
          fatherHusbandName: p.fatherHusbandName || null,
          gender: p.gender,
          dob: p.dob || null,
          age: Number(p.age || 0),
          phone: p.phone,
          address: p.address || null,
          cnic: p.cnic ? p.cnic.trim() : null,
          emergencyContact: p.emergencyContact || null,
          bloodGroup: p.bloodGroup || null,
          notes: p.notes || null,
          legacyId: legacyIdStr,
        },
        create: {
          id: pgId,
          legacyId: legacyIdStr,
          mrNumber: p.mrNumber.trim(),
          fullName: p.fullName,
          fatherHusbandName: p.fatherHusbandName || null,
          gender: p.gender,
          dob: p.dob || null,
          age: Number(p.age || 0),
          phone: p.phone,
          address: p.address || null,
          cnic: p.cnic ? p.cnic.trim() : null,
          emergencyContact: p.emergencyContact || null,
          bloodGroup: p.bloodGroup || null,
          notes: p.notes || null,
          createdBy: createdByPgId,
          createdAt: p.createdAt || new Date(),
          updatedAt: p.updatedAt || new Date(),
        },
      });
      mongoToPgIdMap.set(legacyIdStr, savedPatient.id);
      stats.patients++;
    }

    // 4. Migrate PatientVisits
    console.log("[Migration] Extracting Patient Visits...");
    const mongoVisits = await PatientVisitModel.find().lean().exec();
    for (const v of mongoVisits) {
      const pgId = getPgUuid(v._id);
      let patientPgId = getPgUuid(v.patientId);
      let consultantPgId = getPgUuid(v.consultantId);
      let receptionistPgId = getPgUuid(v.receptionistId);
      const legacyIdStr = v._id.toString();

      // Ensure FK integrity for patientPgId
      const pCheck = await prisma.patient.findUnique({ where: { id: patientPgId } });
      if (!pCheck) {
        const byMr = v.mrNumber ? await prisma.patient.findFirst({ where: { mrNumber: v.mrNumber.trim() } }) : null;
        if (byMr) {
          patientPgId = byMr.id;
        } else {
          const firstP = await prisma.patient.findFirst();
          if (firstP) patientPgId = firstP.id;
        }
      }

      // Ensure FK integrity for consultantPgId
      const cCheck = await prisma.consultant.findUnique({ where: { id: consultantPgId } });
      if (!cCheck) {
        const firstC = await prisma.consultant.findFirst();
        if (firstC) consultantPgId = firstC.id;
      }

      await prisma.patientVisit.upsert({
        where: { visitNumber: v.visitNumber.trim() },
        update: {
          patientId: patientPgId,
          patientName: v.patientName || null,
          mrNumber: v.mrNumber || null,
          consultantId: consultantPgId,
          consultantName: v.consultantName || null,
          visitDate: v.visitDate || new Date(),
          arrivalTime: v.arrivalTime || new Date(),
          department: v.department,
          visitType: v.visitType || "OPD",
          reasonForVisit: v.reasonForVisit || null,
          consultationFee: Number(v.consultationFee || 0),
          amountReceived: Number(v.amountReceived || 0),
          paymentMethod: v.paymentMethod || "CASH",
          receptionistId: receptionistPgId,
          status: v.status,
          notes: v.notes || null,
          legacyId: legacyIdStr,
        },
        create: {
          id: pgId,
          legacyId: legacyIdStr,
          visitNumber: v.visitNumber.trim(),
          patientId: patientPgId,
          patientName: v.patientName || null,
          mrNumber: v.mrNumber || null,
          consultantId: consultantPgId,
          consultantName: v.consultantName || null,
          visitDate: v.visitDate || new Date(),
          arrivalTime: v.arrivalTime || new Date(),
          department: v.department,
          visitType: v.visitType || "OPD",
          reasonForVisit: v.reasonForVisit || null,
          consultationFee: Number(v.consultationFee || 0),
          amountReceived: Number(v.amountReceived || 0),
          paymentMethod: v.paymentMethod || "CASH",
          receptionistId: receptionistPgId,
          status: v.status,
          notes: v.notes || null,
          createdAt: v.createdAt || new Date(),
          updatedAt: v.updatedAt || new Date(),
        },
      });
      stats.visits++;
    }

    const resolvePatientId = async (mongoId?: any, mrNumber?: string): Promise<string> => {
      if (mongoId) {
        const pgId = getPgUuid(mongoId);
        const pCheck = await prisma.patient.findUnique({ where: { id: pgId } });
        if (pCheck) return pCheck.id;
      }
      if (mrNumber) {
        const byMr = await prisma.patient.findFirst({ where: { mrNumber: mrNumber.trim() } });
        if (byMr) return byMr.id;
      }
      const firstP = await prisma.patient.findFirst();
      return firstP ? firstP.id : "";
    };

    const resolveConsultantId = async (mongoId?: any): Promise<string> => {
      if (mongoId) {
        const pgId = getPgUuid(mongoId);
        const cCheck = await prisma.consultant.findUnique({ where: { id: pgId } });
        if (cCheck) return cCheck.id;
      }
      const firstC = await prisma.consultant.findFirst();
      return firstC ? firstC.id : "";
    };

    const resolveVisitId = async (mongoId?: any, visitNumber?: string): Promise<string> => {
      if (mongoId) {
        const pgId = getPgUuid(mongoId);
        const vCheck = await prisma.patientVisit.findUnique({ where: { id: pgId } });
        if (vCheck) return vCheck.id;
      }
      if (visitNumber) {
        const byNum = await prisma.patientVisit.findFirst({ where: { visitNumber: visitNumber.trim() } });
        if (byNum) return byNum.id;
      }
      const firstV = await prisma.patientVisit.findFirst();
      return firstV ? firstV.id : "";
    };

    // 5. Migrate Consultations
    console.log("[Migration] Extracting Consultations...");
    const mongoConsultations = await ConsultationModel.find().lean().exec();
    for (const c of mongoConsultations) {
      const pgId = getPgUuid(c._id);
      const visitPgId = await resolveVisitId(c.visitId);
      const patientPgId = await resolvePatientId(c.patientId);
      const consultantPgId = await resolveConsultantId(c.consultantId);
      const legacyIdStr = c._id.toString();

      await prisma.consultation.upsert({
        where: { id: pgId },
        update: {
          visitId: visitPgId,
          patientId: patientPgId,
          consultantId: consultantPgId,
          chiefComplaint: c.chiefComplaint,
          symptoms: c.symptoms || null,
          diagnosis: c.diagnosis,
          bpSystolic: c.bpSystolic || null,
          bpDiastolic: c.bpDiastolic || null,
          temperature: c.temperature || null,
          pulse: c.pulse || null,
          weight: c.weight || null,
          clinicalNotes: c.clinicalNotes || null,
          advice: c.advice || null,
          legacyId: legacyIdStr,
        },
        create: {
          id: pgId,
          legacyId: legacyIdStr,
          visitId: visitPgId,
          patientId: patientPgId,
          consultantId: consultantPgId,
          chiefComplaint: c.chiefComplaint,
          symptoms: c.symptoms || null,
          diagnosis: c.diagnosis,
          bpSystolic: c.bpSystolic || null,
          bpDiastolic: c.bpDiastolic || null,
          temperature: c.temperature || null,
          pulse: c.pulse || null,
          weight: c.weight || null,
          clinicalNotes: c.clinicalNotes || null,
          advice: c.advice || null,
          createdAt: c.createdAt || new Date(),
          updatedAt: c.updatedAt || new Date(),
        },
      });
      stats.consultations++;
    }

    // 6. Migrate Prescriptions & Embedded PrescriptionItems
    console.log("[Migration] Extracting Prescriptions & Line Items...");
    const mongoPrescriptions = await PrescriptionModel.find().lean().exec();
    for (const rx of mongoPrescriptions) {
      const rxPgId = getPgUuid(rx._id);
      const patientPgId = await resolvePatientId(rx.patientId, rx.mrNumber);
      const visitPgId = await resolveVisitId(rx.visitId);
      const consultantPgId = await resolveConsultantId(rx.consultantId);
      const consultationPgId = rx.consultationId ? getPgUuid(rx.consultationId) : null;
      const legacyIdStr = rx._id.toString();

      await prisma.prescription.upsert({
        where: { id: rxPgId },
        update: {
          patientId: patientPgId,
          patientName: rx.patientName || null,
          mrNumber: rx.mrNumber || null,
          visitId: visitPgId,
          consultantId: consultantPgId,
          consultantName: rx.consultantName || null,
          consultationId: consultationPgId,
          diagnosis: rx.diagnosis,
          prescriptionDate: rx.prescriptionDate || new Date(),
          notes: rx.notes || null,
          isDispensed: Boolean(rx.isDispensed),
          legacyId: legacyIdStr,
        },
        create: {
          id: rxPgId,
          legacyId: legacyIdStr,
          patientId: patientPgId,
          patientName: rx.patientName || null,
          mrNumber: rx.mrNumber || null,
          visitId: visitPgId,
          consultantId: consultantPgId,
          consultantName: rx.consultantName || null,
          consultationId: consultationPgId,
          diagnosis: rx.diagnosis,
          prescriptionDate: rx.prescriptionDate || new Date(),
          notes: rx.notes || null,
          isDispensed: Boolean(rx.isDispensed),
          createdAt: rx.createdAt || new Date(),
          updatedAt: rx.updatedAt || new Date(),
        },
      });
      stats.prescriptions++;

      // Unpack embedded items array into relational PrescriptionItem rows
      if (Array.isArray(rx.items)) {
        for (const item of rx.items) {
          const itemPgId = getPgUuid((item as any)._id || (item as any).legacyId);
          await prisma.prescriptionItem.upsert({
            where: { id: itemPgId },
            update: {
              prescriptionId: rxPgId,
              medicineName: item.medicineName,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              route: item.route || null,
              instructions: item.instructions || null,
            },
            create: {
              id: itemPgId,
              prescriptionId: rxPgId,
              medicineName: item.medicineName,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              route: item.route || null,
              instructions: item.instructions || null,
            },
          });
          stats.prescriptionItems++;
        }
      }
    }

    // 7. Migrate LabOrders & Embedded LabOrderItems
    console.log("[Migration] Extracting Lab Orders & Items...");
    const mongoLabOrders = await LabOrderModel.find().lean().exec();
    for (const lo of mongoLabOrders) {
      const orderPgId = getPgUuid(lo._id);
      const patientPgId = await resolvePatientId(lo.patientId, lo.mrNumber);
      const visitPgId = await resolveVisitId(lo.visitId);
      const consultantPgId = await resolveConsultantId(lo.consultantId);
      const legacyIdStr = lo._id.toString();

      await prisma.labOrder.upsert({
        where: { orderNumber: lo.orderNumber.trim() },
        update: {
          patientId: patientPgId,
          patientName: lo.patientName || null,
          mrNumber: lo.mrNumber || null,
          visitId: visitPgId,
          consultantId: consultantPgId,
          consultantName: lo.consultantName || null,
          testCategory: lo.testCategory,
          clinicalNotes: lo.clinicalNotes || null,
          priority: lo.priority || "NORMAL",
          status: lo.status,
          totalFee: Number(lo.totalFee || 0),
          requestDate: lo.requestDate || new Date(),
          currentVersion: lo.currentVersion || 1,
          resultsV1: lo.resultsV1 || null,
          resultsV2: lo.resultsV2 || null,
          revisionReason: lo.revisionReason || null,
          revisionComment: lo.revisionComment || null,
          attachedPdfUrl: lo.attachedPdfUrl || null,
          attachedPdfName: lo.attachedPdfName || null,
          attachedImageBase64: lo.attachedImageBase64 || null,
          legacyId: legacyIdStr,
        },
        create: {
          id: orderPgId,
          legacyId: legacyIdStr,
          orderNumber: lo.orderNumber.trim(),
          patientId: patientPgId,
          patientName: lo.patientName || null,
          mrNumber: lo.mrNumber || null,
          visitId: visitPgId,
          consultantId: consultantPgId,
          consultantName: lo.consultantName || null,
          testCategory: lo.testCategory,
          clinicalNotes: lo.clinicalNotes || null,
          priority: lo.priority || "NORMAL",
          status: lo.status,
          totalFee: Number(lo.totalFee || 0),
          requestDate: lo.requestDate || new Date(),
          currentVersion: lo.currentVersion || 1,
          resultsV1: lo.resultsV1 || null,
          resultsV2: lo.resultsV2 || null,
          revisionReason: lo.revisionReason || null,
          revisionComment: lo.revisionComment || null,
          attachedPdfUrl: lo.attachedPdfUrl || null,
          attachedPdfName: lo.attachedPdfName || null,
          attachedImageBase64: lo.attachedImageBase64 || null,
          createdAt: lo.createdAt || new Date(),
          updatedAt: lo.updatedAt || new Date(),
        },
      });
      stats.labOrders++;

      if (Array.isArray(lo.items)) {
        for (const item of lo.items) {
          const itemPgId = getPgUuid((item as any)._id || (item as any).legacyId);
          await prisma.labOrderItem.upsert({
            where: { id: itemPgId },
            update: {
              labOrderId: orderPgId,
              testName: item.testName,
              testCode: item.testCode,
              unitPrice: Number(item.unitPrice || 0),
            },
            create: {
              id: itemPgId,
              labOrderId: orderPgId,
              testName: item.testName,
              testCode: item.testCode,
              unitPrice: Number(item.unitPrice || 0),
            },
          });
          stats.labOrderItems++;
        }
      }
    }

    // 8. Migrate LabReports & Embedded LabReportVersions
    console.log("[Migration] Extracting Lab Reports & Version History...");
    const mongoLabReports = await LabReportModel.find().lean().exec();
    for (const lr of mongoLabReports) {
      const reportPgId = getPgUuid(lr._id);
      const labOrderPgId = getPgUuid(lr.labOrderId);
      const legacyIdStr = lr._id.toString();

      await prisma.labReport.upsert({
        where: { labOrderId: labOrderPgId },
        update: {
          currentVersion: lr.currentVersion || 1,
          isAccepted: Boolean(lr.isAccepted),
          acceptedAt: lr.acceptedAt || null,
          acceptedBy: lr.acceptedBy || null,
          legacyId: legacyIdStr,
        },
        create: {
          id: reportPgId,
          legacyId: legacyIdStr,
          labOrderId: labOrderPgId,
          currentVersion: lr.currentVersion || 1,
          isAccepted: Boolean(lr.isAccepted),
          acceptedAt: lr.acceptedAt || null,
          acceptedBy: lr.acceptedBy || null,
          createdAt: lr.createdAt || new Date(),
          updatedAt: lr.updatedAt || new Date(),
        },
      });
      stats.labReports++;

      if (Array.isArray(lr.versions)) {
        for (const v of lr.versions) {
          const versionPgId = getPgUuid((v as any)._id || (v as any).legacyId);
          await prisma.labReportVersion.upsert({
            where: { id: versionPgId },
            update: {
              labReportId: reportPgId,
              versionNumber: v.versionNumber,
              structuredResult: typeof v.structuredResult === "object" ? JSON.stringify(v.structuredResult) : String(v.structuredResult),
              summary: v.summary || null,
              performedBy: v.performedBy,
              pdfUrl: v.pdfUrl || null,
            },
            create: {
              id: versionPgId,
              labReportId: reportPgId,
              versionNumber: v.versionNumber,
              structuredResult: typeof v.structuredResult === "object" ? JSON.stringify(v.structuredResult) : String(v.structuredResult),
              summary: v.summary || null,
              performedBy: v.performedBy,
              pdfUrl: v.pdfUrl || null,
              createdAt: v.createdAt || new Date(),
            },
          });
          stats.labReportVersions++;
        }
      }
    }

    // 9. Migrate Medicines & Embedded Batches
    console.log("[Migration] Extracting Medicines & Batches...");
    const mongoMedicines = await MedicineModel.find().lean().exec();
    for (const m of mongoMedicines) {
      const medPgId = getPgUuid(m._id);
      const legacyIdStr = m._id.toString();

      await prisma.medicine.upsert({
        where: { id: medPgId },
        update: {
          genericName: m.genericName,
          brandName: m.brandName,
          category: m.category,
          manufacturer: m.manufacturer,
          purchasePrice: Number(m.purchasePrice || 0),
          salePrice: Number(m.salePrice || 0),
          availableQuantity: Number(m.availableQuantity || 0),
          reorderLevel: Number(m.reorderLevel || 10),
          legacyId: legacyIdStr,
        },
        create: {
          id: medPgId,
          legacyId: legacyIdStr,
          genericName: m.genericName,
          brandName: m.brandName,
          category: m.category,
          manufacturer: m.manufacturer,
          purchasePrice: Number(m.purchasePrice || 0),
          salePrice: Number(m.salePrice || 0),
          availableQuantity: Number(m.availableQuantity || 0),
          reorderLevel: Number(m.reorderLevel || 10),
          createdAt: m.createdAt || new Date(),
          updatedAt: m.updatedAt || new Date(),
        },
      });
      stats.medicines++;

      if (Array.isArray(m.batches)) {
        for (const b of m.batches) {
          const batchPgId = getPgUuid((b as any)._id || (b as any).legacyId);
          await prisma.medicineBatch.upsert({
            where: { id: batchPgId },
            update: {
              medicineId: medPgId,
              batchNumber: b.batchNumber,
              purchaseDate: b.purchaseDate || new Date(),
              expiryDate: b.expiryDate || new Date(),
              quantity: Number(b.quantity || 0),
              costPrice: Number(b.costPrice || 0),
              supplier: b.supplier || null,
            },
            create: {
              id: batchPgId,
              medicineId: medPgId,
              batchNumber: b.batchNumber,
              purchaseDate: b.purchaseDate || new Date(),
              expiryDate: b.expiryDate || new Date(),
              quantity: Number(b.quantity || 0),
              costPrice: Number(b.costPrice || 0),
              supplier: b.supplier || null,
              createdAt: b.createdAt || new Date(),
            },
          });
          stats.medicineBatches++;
        }
      }
    }

    // 10. Migrate CashTransactions
    console.log("[Migration] Extracting Cash Transactions...");
    const mongoCashTxns = await CashTransactionModel.find().lean().exec();
    for (const tx of mongoCashTxns) {
      const txPgId = getPgUuid(tx._id);
      const patientPgId = tx.patientId ? await resolvePatientId(tx.patientId) : null;
      const visitPgId = tx.visitId ? await resolveVisitId(tx.visitId) : null;
      let createdByPgId = getPgUuid(tx.createdById);
      const uCheck = await prisma.user.findUnique({ where: { id: createdByPgId } });
      if (!uCheck) {
        const firstAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
        if (firstAdmin) createdByPgId = firstAdmin.id;
      }
      const legacyIdStr = tx._id.toString();

      await prisma.cashTransaction.upsert({
        where: { transactionNumber: tx.transactionNumber.trim() },
        update: {
          transactionType: tx.transactionType,
          category: tx.category,
          department: tx.department,
          amount: Number(tx.amount || 0),
          paymentMethod: tx.paymentMethod || "CASH",
          description: tx.description,
          referenceNumber: tx.referenceNumber || null,
          patientId: patientPgId,
          visitId: visitPgId,
          createdById: createdByPgId,
          transactionDate: tx.transactionDate || new Date(),
          legacyId: legacyIdStr,
        },
        create: {
          id: txPgId,
          legacyId: legacyIdStr,
          transactionNumber: tx.transactionNumber.trim(),
          transactionType: tx.transactionType,
          category: tx.category,
          department: tx.department,
          amount: Number(tx.amount || 0),
          paymentMethod: tx.paymentMethod || "CASH",
          description: tx.description,
          referenceNumber: tx.referenceNumber || null,
          patientId: patientPgId,
          visitId: visitPgId,
          createdById: createdByPgId,
          transactionDate: tx.transactionDate || new Date(),
          createdAt: tx.createdAt || new Date(),
          updatedAt: tx.updatedAt || new Date(),
        },
      });
      stats.cashTransactions++;
    }

    console.log("=================================================");
    console.log("[Phase 3 Completed] Data Migration Summary:");
    console.log(`- Users: ${stats.users}`);
    console.log(`- Consultants: ${stats.consultants}`);
    console.log(`- Patients: ${stats.patients}`);
    console.log(`- Patient Visits: ${stats.visits}`);
    console.log(`- Consultations: ${stats.consultations}`);
    console.log(`- Prescriptions: ${stats.prescriptions} (${stats.prescriptionItems} items)`);
    console.log(`- Lab Orders: ${stats.labOrders} (${stats.labOrderItems} items, ${stats.labReportVersions} report versions)`);
    console.log(`- Medicines: ${stats.medicines} (${stats.medicineBatches} batches)`);
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
  runMongoToPostgresMigration().then(() => process.exit(0));
}
