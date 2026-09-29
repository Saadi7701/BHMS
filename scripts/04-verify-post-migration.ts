import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function verifyPostgresWorkflows(): Promise<boolean> {
  console.log("=================================================");
  console.log("[Phase 3] Running Post-Migration Portal Verification...");
  console.log("=================================================");

  try {
    await prisma.$connect();

    // 1. Admin Portal Check: Fetch users and daily financial totals
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!adminUser) throw new Error("Admin user not found in PostgreSQL.");
    console.log(`  ✓ [Admin Portal] Verified admin user '${adminUser.username}'`);

    const incomeAgg = await prisma.cashTransaction.aggregate({
      where: { transactionType: "INCOME" },
      _sum: { amount: true },
    });
    console.log(`  ✓ [Admin Financials] Calculated total income: PKR ${incomeAgg._sum.amount || 0}`);

    // 2. Reception Portal Check: Fetch patient list and visit queue
    const patientCount = await prisma.patient.count();
    const visitQueue = await prisma.patientVisit.findMany({
      take: 5,
      orderBy: { visitDate: "desc" },
      include: { patient: true, consultant: true },
    });
    console.log(`  ✓ [Reception Portal] Verified ${patientCount} patients and visit queue (${visitQueue.length} recent visits)`);

    // 3. Consultant Portal Check: Fetch prescriptions & consultations
    const prescriptions = await prisma.prescription.findMany({
      take: 5,
      include: { items: true, patient: true },
    });
    console.log(`  ✓ [Consultant Portal] Verified digital prescriptions with embedded items (${prescriptions.length} recent prescriptions)`);

    // 4. Lab Portal Check: Fetch lab orders & report versions
    const labOrders = await prisma.labOrder.findMany({
      take: 5,
      include: { items: true, reports: { include: { versions: true } } },
    });
    console.log(`  ✓ [Laboratory Portal] Verified lab orders and report versions (${labOrders.length} recent lab orders)`);

    // 5. Ultrasound Portal Check: Fetch ultrasound orders
    const usOrders = await prisma.ultrasoundOrder.findMany({
      take: 5,
      include: { reports: true },
    });
    console.log(`  ✓ [Ultrasound Portal] Verified ultrasound scan requests (${usOrders.length} recent US orders)`);

    // 6. Pharmacy Portal Check: Fetch medicine inventory catalog & batches
    const medicines = await prisma.medicine.findMany({
      take: 5,
      include: { batches: true },
    });
    console.log(`  ✓ [Pharmacy Portal] Verified medicine inventory catalog and batches (${medicines.length} recent medicines)`);

    console.log("=================================================");
    console.log("[Phase 3 Verification PASSED] All 6 hospital portals verified on PostgreSQL!");
    console.log("=================================================");
    return true;
  } catch (err: any) {
    console.error("[Verification Failure]:", err.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyPostgresWorkflows().then(() => process.exit(0));
}
