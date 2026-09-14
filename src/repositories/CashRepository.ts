import { connectToProductionDatabase } from "../lib/mongodb";
import { CashTransactionModel, ICashTransaction } from "../models/CashTransaction";
import { DailyCashClosingModel, IDailyCashClosing } from "../models/DailyCashClosing";

export class CashRepository {
  async createTransaction(txData: Partial<ICashTransaction>): Promise<ICashTransaction> {
    await connectToProductionDatabase();
    const tx = new CashTransactionModel(txData);
    return tx.save();
  }

  async findTransactionsByDateRange(startDate: Date, endDate: Date): Promise<ICashTransaction[]> {
    await connectToProductionDatabase();
    return CashTransactionModel.find({
      transactionDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ transactionDate: -1 })
      .exec();
  }

  async findDailyClosingByDate(date: Date): Promise<IDailyCashClosing | null> {
    await connectToProductionDatabase();
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));
    return DailyCashClosingModel.findOne({ closingDate: { $gte: start, $lte: end } }).exec();
  }

  async recordDailyClosing(closingData: Partial<IDailyCashClosing>): Promise<IDailyCashClosing> {
    await connectToProductionDatabase();
    const closing = new DailyCashClosingModel(closingData);
    return closing.save();
  }
}

export const cashRepository = new CashRepository();
