import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDailyCashClosing extends Document {
  legacyId?: string;
  closingDate: Date;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  expectedClosing: number;
  actualCash: number;
  difference: number;
  closedBy: string;
  notes?: string;
  isClosed: boolean;
  createdAt: Date;
}

const DailyCashClosingSchema: Schema<IDailyCashClosing> = new Schema(
  {
    legacyId: { type: String, index: true },
    closingDate: { type: Date, required: true, unique: true, index: true },
    openingBalance: { type: Number, default: 0.0 },
    totalIncome: { type: Number, default: 0.0 },
    totalExpense: { type: Number, default: 0.0 },
    expectedClosing: { type: Number, default: 0.0 },
    actualCash: { type: Number, default: 0.0 },
    difference: { type: Number, default: 0.0 },
    closedBy: { type: String, required: true },
    notes: { type: String },
    isClosed: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const DailyCashClosingModel: Model<IDailyCashClosing> =
  mongoose.models.DailyCashClosing ||
  mongoose.model<IDailyCashClosing>("DailyCashClosing", DailyCashClosingSchema);
