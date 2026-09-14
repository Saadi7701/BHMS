import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGyneRecord extends Document {
  legacyId?: string;
  gyneNumber: string;
  patientId: mongoose.Types.ObjectId;
  visitId: mongoose.Types.ObjectId;
  consultantName: string;
  admissionDate: Date;
  reasonForAdmission: string;
  diagnosis: string;
  bedNumber: string;
  wardName: string;
  treatmentPlan?: string;
  dischargeDate?: Date;
  dischargeNotes?: string;
  status: string;
  totalFee: number;
  createdAt: Date;
  updatedAt: Date;
}

const GyneRecordSchema: Schema<IGyneRecord> = new Schema(
  {
    legacyId: { type: String, index: true },
    gyneNumber: { type: String, required: true, unique: true, index: true, trim: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    visitId: { type: Schema.Types.ObjectId, ref: "PatientVisit", required: true, index: true },
    consultantName: { type: String, required: true },
    admissionDate: { type: Date, default: Date.now },
    reasonForAdmission: { type: String, required: true },
    diagnosis: { type: String, required: true },
    bedNumber: { type: String, required: true },
    wardName: { type: String, required: true },
    treatmentPlan: { type: String },
    dischargeDate: { type: Date },
    dischargeNotes: { type: String },
    status: { type: String, default: "ADMITTED", index: true },
    totalFee: { type: Number, default: 0.0 },
  },
  { timestamps: true }
);

export const GyneRecordModel: Model<IGyneRecord> =
  mongoose.models.GyneRecord || mongoose.model<IGyneRecord>("GyneRecord", GyneRecordSchema);
