import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedicineBatch {
  legacyId?: string;
  batchNumber: string;
  purchaseDate: Date;
  expiryDate: Date;
  quantity: number;
  costPrice: number;
  supplier?: string;
  createdAt: Date;
}

export interface IMedicine extends Document {
  legacyId?: string;
  genericName: string;
  brandName: string;
  category: string;
  manufacturer: string;
  purchasePrice: number;
  salePrice: number;
  availableQuantity: number;
  reorderLevel: number;
  batches: IMedicineBatch[];
  createdAt: Date;
  updatedAt: Date;
}

const MedicineBatchSchema = new Schema<IMedicineBatch>({
  legacyId: { type: String },
  batchNumber: { type: String, required: true },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  costPrice: { type: Number, default: 0.0 },
  supplier: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const MedicineSchema: Schema<IMedicine> = new Schema(
  {
    legacyId: { type: String, index: true },
    genericName: { type: String, required: true, index: true },
    brandName: { type: String, required: true, index: true },
    category: { type: String, required: true },
    manufacturer: { type: String, required: true },
    purchasePrice: { type: Number, default: 0.0 },
    salePrice: { type: Number, default: 0.0 },
    availableQuantity: { type: Number, default: 0, index: true },
    reorderLevel: { type: Number, default: 10 },
    batches: [MedicineBatchSchema],
  },
  { timestamps: true }
);

export const MedicineModel: Model<IMedicine> =
  mongoose.models.Medicine || mongoose.model<IMedicine>("Medicine", MedicineSchema);
