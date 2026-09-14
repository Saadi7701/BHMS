import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICashTransaction extends Document {
  legacyId?: string;
  transactionNumber: string;
  transactionType: "INCOME" | "EXPENSE" | "REFUND" | "ADJUSTMENT" | "REVERSAL";
  category: string;
  department: string;
  amount: number;
  paymentMethod: string;
  description: string;
  referenceNumber?: string;
  patientId?: mongoose.Types.ObjectId;
  visitId?: mongoose.Types.ObjectId;
  createdById: mongoose.Types.ObjectId;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CashTransactionSchema: Schema<ICashTransaction> = new Schema(
  {
    legacyId: { type: String, index: true },
    transactionNumber: { type: String, required: true, unique: true, index: true, trim: true },
    transactionType: {
      type: String,
      required: true,
      enum: ["INCOME", "EXPENSE", "REFUND", "ADJUSTMENT", "REVERSAL"],
      index: true,
    },
    category: { type: String, required: true, index: true },
    department: { type: String, required: true },
    amount: { type: Number, required: true, default: 0.0 },
    paymentMethod: { type: String, default: "CASH" },
    description: { type: String, required: true },
    referenceNumber: { type: String },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    visitId: { type: Schema.Types.ObjectId, ref: "PatientVisit" },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    transactionDate: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const CashTransactionModel: Model<ICashTransaction> =
  mongoose.models.CashTransaction ||
  mongoose.model<ICashTransaction>("CashTransaction", CashTransactionSchema);
