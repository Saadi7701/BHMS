import { connectToProductionDatabase } from "./mongodb";
import { CashTransactionModel } from "../models/CashTransaction";
import { MedicineModel } from "../models/Medicine";
import { LabOrderModel } from "../models/LabOrder";
import { UltrasoundOrderModel } from "../models/UltrasoundOrder";

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
 * Calculates total income, total expense, and net cash for a given date using MongoDB Aggregation Pipeline.
 * Replaces SQL: SELECT transactionType, SUM(amount) FROM CashTransaction WHERE transactionDate BETWEEN ... GROUP BY transactionType
 */
export async function calculateDailyCashSummary(date: Date): Promise<IDailyCashSummaryResult> {
  await connectToProductionDatabase();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await CashTransactionModel.aggregate([
    {
      $match: {
        transactionDate: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: "$transactionType",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  for (const row of result) {
    if (row._id === "INCOME") {
      totalIncome = row.totalAmount;
    } else if (row._id === "EXPENSE") {
      totalExpense = row.totalAmount;
    }
  }

  return {
    totalIncome,
    totalExpense,
    netCash: totalIncome - totalExpense,
  };
}

/**
 * Returns revenue aggregated by hospital department.
 * Replaces SQL: SELECT department, SUM(amount) FROM CashTransaction WHERE transactionType = 'INCOME' GROUP BY department
 */
export async function calculateDepartmentRevenue(startDate: Date, endDate: Date): Promise<IDepartmentRevenue[]> {
  await connectToProductionDatabase();

  const results = await CashTransactionModel.aggregate([
    {
      $match: {
        transactionType: "INCOME",
        transactionDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$department",
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
  ]);

  return results.map((row) => ({
    department: row._id || "General",
    totalAmount: row.totalAmount,
  }));
}

/**
 * Queries medicine items whose stock is at or below reorder level.
 * Replaces SQL: SELECT * FROM Medicine WHERE availableQuantity <= reorderLevel
 */
export async function getLowStockMedicines() {
  await connectToProductionDatabase();

  return MedicineModel.find({
    $expr: { $lte: ["$availableQuantity", "$reorderLevel"] },
  })
    .sort({ availableQuantity: 1 })
    .exec();
}

/**
 * Aggregates pending lab and ultrasound orders for dashboard widgets.
 */
export async function getPendingDiagnosticsCount() {
  await connectToProductionDatabase();

  const [labCounts, usCounts] = await Promise.all([
    LabOrderModel.aggregate([
      { $match: { status: { $ne: "ACCEPTED" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    UltrasoundOrderModel.aggregate([
      { $match: { status: { $ne: "ACCEPTED" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  return {
    labCounts,
    usCounts,
  };
}
