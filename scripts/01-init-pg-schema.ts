import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function initializePostgresSchema(): Promise<boolean> {
  console.log("=================================================");
  console.log("[Phase 3] Initializing Supabase / PostgreSQL Schema...");
  console.log("=================================================");

  try {
    // 1. Verify connection
    await prisma.$connect();
    console.log("[PostgreSQL] Successfully connected to PostgreSQL database.");

    // 2. Execute raw SQL to ensure indexes on frequent lookup columns & foreign keys
    console.log("[PostgreSQL] Creating performance and foreign key indexes...");

    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_users_role ON "User"("role");`,
      `CREATE INDEX IF NOT EXISTS idx_patients_phone ON "Patient"("phone");`,
      `CREATE INDEX IF NOT EXISTS idx_patients_created_by ON "Patient"("createdBy");`,
      `CREATE INDEX IF NOT EXISTS idx_patient_visits_patient_id ON "PatientVisit"("patientId");`,
      `CREATE INDEX IF NOT EXISTS idx_patient_visits_consultant_id ON "PatientVisit"("consultantId");`,
      `CREATE INDEX IF NOT EXISTS idx_patient_visits_status ON "PatientVisit"("status");`,
      `CREATE INDEX IF NOT EXISTS idx_patient_visits_visit_date ON "PatientVisit"("visitDate" DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_consultations_visit_id ON "Consultation"("visitId");`,
      `CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON "Consultation"("patientId");`,
      `CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON "Prescription"("patientId");`,
      `CREATE INDEX IF NOT EXISTS idx_prescriptions_visit_id ON "Prescription"("visitId");`,
      `CREATE INDEX IF NOT EXISTS idx_prescription_items_rx_id ON "PrescriptionItem"("prescriptionId");`,
      `CREATE INDEX IF NOT EXISTS idx_lab_orders_patient_id ON "LabOrder"("patientId");`,
      `CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON "LabOrder"("status");`,
      `CREATE INDEX IF NOT EXISTS idx_lab_order_items_order_id ON "LabOrderItem"("labOrderId");`,
      `CREATE INDEX IF NOT EXISTS idx_lab_report_versions_report_id ON "LabReportVersion"("labReportId");`,
      `CREATE INDEX IF NOT EXISTS idx_us_orders_patient_id ON "UltrasoundOrder"("patientId");`,
      `CREATE INDEX IF NOT EXISTS idx_us_orders_status ON "UltrasoundOrder"("status");`,
      `CREATE INDEX IF NOT EXISTS idx_us_report_versions_report_id ON "UltrasoundReportVersion"("ultrasoundReportId");`,
      `CREATE INDEX IF NOT EXISTS idx_medicine_batches_medicine_id ON "MedicineBatch"("medicineId");`,
      `CREATE INDEX IF NOT EXISTS idx_pharmacy_dispensing_items_disp_id ON "PharmacyDispensingItem"("pharmacyDispensingId");`,
      `CREATE INDEX IF NOT EXISTS idx_cash_tx_date ON "CashTransaction"("transactionDate" DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_cash_tx_type ON "CashTransaction"("transactionType");`,
      `CREATE INDEX IF NOT EXISTS idx_cash_tx_category ON "CashTransaction"("category");`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON "AuditLog"("userId", "createdAt" DESC);`,
    ];

    for (const query of indexQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
      } catch (err: any) {
        // Table might not be pushed yet during initial setup; log gracefully
        console.log(`[PostgreSQL Index Warning] ${err.message}`);
      }
    }

    console.log("[PostgreSQL] Schema initialization & index creation complete!");
    return true;
  } catch (error: any) {
    console.error("[PostgreSQL Schema Init Error]:", error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  initializePostgresSchema().then(() => process.exit(0));
}
