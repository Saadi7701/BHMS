import { prisma } from "./prisma";

export interface IDailyCashSummaryResult {
  totalIncome: number;
  totalExpense: number;
  netCash: number;
}

export interface IDepartmentRevenue {
  department: string;
  totalAmount: number;
}

/**
 * Calculates total income, total expense, and net cash for a given date using Prisma / PostgreSQL.
 */
export async function calculateDailyCashSummary(date: Date): Promise<IDailyCashSummaryResult> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const incomeGroup = await prisma.cashTransaction.aggregate({
    where: {
      transactionType: "INCOME",
      transactionDate: { gte: startOfDay, lte: endOfDay },
    },
    _sum: { amount: true },
  });

  const expenseGroup = await prisma.cashTransaction.aggregate({
    where: {
      transactionType: "EXPENSE",
      transactionDate: { gte: startOfDay, lte: endOfDay },
    },
    _sum: { amount: true },
  });

  const totalIncome = Number(incomeGroup._sum.amount || 0);
  const totalExpense = Number(expenseGroup._sum.amount || 0);

  return {
    totalIncome,
    totalExpense,
    netCash: totalIncome - totalExpense,
  };
}

/**
 * Returns revenue aggregated by hospital department using Prisma / PostgreSQL.
 */
export async function calculateDepartmentRevenue(startDate: Date, endDate: Date): Promise<IDepartmentRevenue[]> {
  const results = await prisma.cashTransaction.groupBy({
    by: ["department"],
    where: {
      transactionType: "INCOME",
      transactionDate: { gte: startDate, lte: endDate },
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  return results.map((row) => ({
    department: row.department || "General",
    totalAmount: Number(row._sum.amount || 0),
  }));
}

/**
 * Queries medicine items whose stock is at or below minimum stock level.
 */
export async function getLowStockMedicines() {
  const medicines = await prisma.medicine.findMany({
    orderBy: { availableQuantity: "asc" },
  });
  return medicines.filter((m) => m.availableQuantity <= m.reorderLevel);
}

/**
 * Aggregates pending lab and ultrasound orders for dashboard widgets.
 */
export async function getPendingDiagnosticsCount() {
  const labCounts = await prisma.labOrder.groupBy({
    by: ["status"],
    where: { status: { not: "ACCEPTED" } },
    _count: { status: true },
  });

  const usCounts = await prisma.ultrasoundOrder.groupBy({
    by: ["status"],
    where: { status: { not: "ACCEPTED" } },
    _count: { status: true },
  });

  return {
    labCounts: labCounts.map((l) => ({ _id: l.status, count: l._count.status })),
    usCounts: usCounts.map((u) => ({ _id: u.status, count: u._count.status })),
  };
}
