import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILabReportVersion {
  legacyId?: string;
  versionNumber: number;
  structuredResult: string; // JSON string or object
  summary?: string;
  performedBy: string;
  pdfUrl?: string;
  createdAt: Date;
}

export interface ILabReport extends Document {
  legacyId?: string;
  labOrderId: mongoose.Types.ObjectId;
  currentVersion: number;
  isAccepted: boolean;
  acceptedAt?: Date;
  acceptedBy?: string;
  versions: ILabReportVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const LabReportVersionSchema = new Schema<ILabReportVersion>({
  legacyId: { type: String },
  versionNumber: { type: Number, required: true },
  structuredResult: { type: String, required: true },
  summary: { type: String },
  performedBy: { type: String, required: true },
  pdfUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const LabReportSchema: Schema<ILabReport> = new Schema(
  {
    legacyId: { type: String, index: true },
    labOrderId: { type: Schema.Types.ObjectId, ref: "LabOrder", required: true, unique: true, index: true },
    currentVersion: { type: Number, default: 1 },
    isAccepted: { type: Boolean, default: false },
    acceptedAt: { type: Date },
    acceptedBy: { type: String },
    versions: [LabReportVersionSchema],
  },
  { timestamps: true }
);

export const LabReportModel: Model<ILabReport> =
  mongoose.models.LabReport || mongoose.model<ILabReport>("LabReport", LabReportSchema);
