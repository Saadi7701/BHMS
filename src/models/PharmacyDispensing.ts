import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPharmacyDispensingItem {
  legacyId?: string;
  prescriptionItemId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IPharmacyDispensing extends Document {
  legacyId?: string;
  dispensingNo: string;
  prescriptionId: mongoose.Types.ObjectId;
  patientName: string;
  totalAmount: number;
  pharmacistId: mongoose.Types.ObjectId;
  dispensedAt: Date;
  items: IPharmacyDispensingItem[];
  createdAt: Date;
}

const PharmacyDispensingItemSchema = new Schema<IPharmacyDispensingItem>({
  legacyId: { type: String },
  prescriptionItemId: { type: Schema.Types.ObjectId, required: true },
  batchId: { type: Schema.Types.ObjectId, required: true },
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, default: 0.0 },
  totalPrice: { type: Number, default: 0.0 },
});

const PharmacyDispensingSchema: Schema<IPharmacyDispensing> = new Schema(
  {
    legacyId: { type: String, index: true },
    dispensingNo: { type: String, required: true, unique: true, index: true, trim: true },
    prescriptionId: { type: Schema.Types.ObjectId, ref: "Prescription", required: true, index: true },
    patientName: { type: String, required: true },
    totalAmount: { type: Number, default: 0.0 },
    pharmacistId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dispensedAt: { type: Date, default: Date.now },
    items: [PharmacyDispensingItemSchema],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const PharmacyDispensingModel: Model<IPharmacyDispensing> =
  mongoose.models.PharmacyDispensing ||
  mongoose.model<IPharmacyDispensing>("PharmacyDispensing", PharmacyDispensingSchema);
