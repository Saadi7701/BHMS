import { prisma } from "../lib/prisma";

export class CashRepository {
  async createTransaction(txData: any): Promise<any> {
    // Resolve createdById to a valid PostgreSQL user ID
    let createdById = txData.createdById ? txData.createdById.toString() : "";
    const userObj = await prisma.user.findFirst({
      where: { OR: [{ id: createdById }, { legacyId: createdById }] },
    });
    if (userObj) {
      createdById = userObj.id;
    } else {
      const firstAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (firstAdmin) {
        createdById = firstAdmin.id;
      } else {
        const defaultAdmin = await prisma.user.create({
          data: {
            username: `system_admin_${Date.now()}`,
            email: `admin_${Date.now()}@bilalhospital.com`,
            passwordHash: "system",
            fullName: "System Admin",
            role: "ADMIN",
          },
        });
        createdById = defaultAdmin.id;
      }
    }

    // Optionally resolve patientId and visitId
    let patientId: string | null = null;
    if (txData.patientId) {
      const pStr = txData.patientId.toString();
      const patientObj = await prisma.patient.findFirst({
        where: { OR: [{ id: pStr }, { legacyId: pStr }] },
      });
      if (patientObj) patientId = patientObj.id;
    }

    let visitId: string | null = null;
    if (txData.visitId) {
      const vStr = txData.visitId.toString();
      const visitObj = await prisma.patientVisit.findFirst({
        where: { OR: [{ id: vStr }, { legacyId: vStr }, { visitNumber: vStr }] },
      });
      if (visitObj) visitId = visitObj.id;
    }

    const tx = await prisma.cashTransaction.create({
      data: {
        transactionNumber: txData.transactionNumber.trim(),
        transactionType: txData.transactionType || "INCOME",
        category: txData.category,
        department: txData.department || "General Operations",
        amount: Number(txData.amount || 0),
        paymentMethod: txData.paymentMethod || txData.paymentMode || "CASH",
        description: txData.description || `Cash transaction for ${txData.category}`,
        referenceNumber: txData.referenceNumber || null,
        patientId,
        visitId,
        createdById,
        transactionDate: txData.transactionDate || new Date(),
      },
    });

    return { ...tx, _id: tx.id };
  }

  async findTransactionsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    const txns = await prisma.cashTransaction.findMany({
      where: {
        transactionDate: { gte: startDate, lte: endDate },
      },
      orderBy: { transactionDate: "desc" },
    });
    return txns.map((t) => ({ ...t, _id: t.id }));
  }

  async findDailyClosingByDate(date: Date): Promise<any> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const closing = await prisma.dailyCashClosing.findFirst({
      where: { closingDate: { gte: start, lte: end } },
    });
    if (!closing) return null;
    return { ...closing, _id: closing.id };
  }

  async recordDailyClosing(closingData: any): Promise<any> {
    const closing = await prisma.dailyCashClosing.create({
      data: {
        closingDate: closingData.closingDate || new Date(),
        openingBalance: Number(closingData.openingBalance || 0),
        totalIncome: Number(closingData.totalIncome || 0),
        totalExpense: Number(closingData.totalExpense || 0),
        expectedClosing: Number(closingData.expectedClosing || 0),
        actualCash: Number(closingData.actualCash || 0),
        difference: Number(closingData.difference || 0),
        closedBy: closingData.closedBy || "Admin Supervisor",
        notes: closingData.notes || null,
        isClosed: closingData.isClosed !== undefined ? closingData.isClosed : true,
      },
    });
    return { ...closing, _id: closing.id };
  }
}

export const cashRepository = new CashRepository();
