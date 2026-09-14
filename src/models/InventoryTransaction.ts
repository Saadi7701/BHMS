import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInventoryTransaction extends Document {
  legacyId?: string;
  medicineId: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;
  movementType: "PURCHASE" | "DISPENSE" | "RETURN" | "ADJUSTMENT" | "DAMAGED" | "EXPIRED";
  quantity: number;
  unitCost: number;
  referenceNo?: string;
  notes?: string;
  performedBy: string;
  createdAt: Date;
}

const InventoryTransactionSchema: Schema<IInventoryTransaction> = new Schema(
  {
    legacyId: { type: String, index: true },
    medicineId: { type: Schema.Types.ObjectId, ref: "Medicine", required: true, index: true },
    batchId: { type: Schema.Types.ObjectId },
    movementType: {
      type: String,
      required: true,
      enum: ["PURCHASE", "DISPENSE", "RETURN", "ADJUSTMENT", "DAMAGED", "EXPIRED"],
      index: true,
    },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, default: 0.0 },
    referenceNo: { type: String },
    notes: { type: String },
    performedBy: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const InventoryTransactionModel: Model<IInventoryTransaction> =
  mongoose.models.InventoryTransaction ||
  mongoose.model<IInventoryTransaction>("InventoryTransaction", InventoryTransactionSchema);
