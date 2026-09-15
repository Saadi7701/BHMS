import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { cashRepository } from "@/repositories/CashRepository";
import { CashTransactionModel } from "@/models/CashTransaction";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToProductionDatabase();

    const transactions = await CashTransactionModel.find()
      .sort({ transactionDate: -1 })
      .limit(100)
      .exec();

    const todayClosing = await cashRepository.findDailyClosingByDate(new Date());

    return NextResponse.json(
      { transactions, dailyClosing: todayClosing },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Cash API GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch cash ledger transactions." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await connectToProductionDatabase();

    if (body.type === "DAILY_CLOSING") {
      const newClosing = await cashRepository.recordDailyClosing({
        closingDate: new Date(),
        openingBalance: 0,
        totalIncome: Number(body.totalCollectedAmount) || Number(body.totalIncome) || 0,
        totalExpense: Number(body.totalExpense) || 0,
        expectedClosing: Number(body.totalCollectedAmount) || 0,
        actualCash: Number(body.totalCollectedAmount) || 0,
        difference: 0,
        closedBy: body.closedBy || "Admin Supervisor",
        notes: body.notes || "Daily cash closing completed",
        isClosed: true,
      });

      return NextResponse.json(
        { message: "Daily cash closing recorded successfully", dailyClosing: newClosing },
        { status: 201 }
      );
    }

    if (!body.category || !body.amount) {
      return NextResponse.json(
        { error: "Category and Amount are required." },
        { status: 400 }
      );
    }

    const dummyAdminId = new mongoose.Types.ObjectId();

    const newTx = await cashRepository.createTransaction({
      transactionNumber: body.transactionNumber || body.receiptNumber || `TXN-${Date.now().toString().slice(-6)}`,
      transactionType: body.transactionType || "INCOME",
      category: body.category,
      department: body.department || "General Operations",
      amount: Number(body.amount),
      paymentMethod: body.paymentMode || "CASH",
      description: body.description || `Cash transaction for ${body.category}`,
      createdById: dummyAdminId,
      transactionDate: new Date(),
    });

    return NextResponse.json(
      { message: "Cash transaction recorded successfully", transaction: newTx },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Cash API POST Error]:", error);
    return NextResponse.json(
      { error: "Failed to record cash transaction." },
      { status: 500 }
    );
  }
}
