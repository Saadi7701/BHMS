import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPrescriptionItem {
  legacyId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  legacyId?: string;
  patientId: mongoose.Types.ObjectId;
  patientName?: string;
  mrNumber?: string;
  visitId: mongoose.Types.ObjectId;
  consultantId: mongoose.Types.ObjectId;
  consultantName?: string;
  consultationId?: mongoose.Types.ObjectId;
  diagnosis: string;
  prescriptionDate: Date;
  notes?: string;
  isDispensed: boolean;
  items: IPrescriptionItem[];
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionItemSchema = new Schema<IPrescriptionItem>({
  legacyId: { type: String },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  route: { type: String },
  instructions: { type: String },
});

const PrescriptionSchema: Schema<IPrescription> = new Schema(
  {
    legacyId: { type: String, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    patientName: { type: String, trim: true },
    mrNumber: { type: String, trim: true },
    visitId: { type: Schema.Types.ObjectId, ref: "PatientVisit", required: true, index: true },
    consultantId: { type: Schema.Types.ObjectId, ref: "Consultant", required: true, index: true },
    consultantName: { type: String, trim: true },
    consultationId: { type: Schema.Types.ObjectId, ref: "Consultation" },
    diagnosis: { type: String, required: true },
    prescriptionDate: { type: Date, default: Date.now },
    notes: { type: String },
    isDispensed: { type: Boolean, default: false, index: true },
    items: [PrescriptionItemSchema],
  },
  { timestamps: true }
);

export const PrescriptionModel: Model<IPrescription> =
  mongoose.models.Prescription || mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
