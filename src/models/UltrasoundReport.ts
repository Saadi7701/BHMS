import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUltrasoundReportVersion {
  legacyId?: string;
  versionNumber: number;
  findings: string;
  impression: string;
  sonographerNotes?: string;
  imageUrl?: string;
  pdfUrl?: string;
  performedBy: string;
  createdAt: Date;
}

export interface IUltrasoundReport extends Document {
  legacyId?: string;
  ultrasoundOrderId: mongoose.Types.ObjectId;
  currentVersion: number;
  isAccepted: boolean;
  acceptedAt?: Date;
  acceptedBy?: string;
  versions: IUltrasoundReportVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const UltrasoundReportVersionSchema = new Schema<IUltrasoundReportVersion>({
  legacyId: { type: String },
  versionNumber: { type: Number, required: true },
  findings: { type: String, required: true },
  impression: { type: String, required: true },
  sonographerNotes: { type: String },
  imageUrl: { type: String },
  pdfUrl: { type: String },
  performedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UltrasoundReportSchema: Schema<IUltrasoundReport> = new Schema(
  {
    legacyId: { type: String, index: true },
    ultrasoundOrderId: {
      type: Schema.Types.ObjectId,
      ref: "UltrasoundOrder",
      required: true,
      unique: true,
      index: true,
    },
    currentVersion: { type: Number, default: 1 },
    isAccepted: { type: Boolean, default: false },
    acceptedAt: { type: Date },
    acceptedBy: { type: String },
    versions: [UltrasoundReportVersionSchema],
  },
  { timestamps: true }
);

export const UltrasoundReportModel: Model<IUltrasoundReport> =
  mongoose.models.UltrasoundReport ||
  mongoose.model<IUltrasoundReport>("UltrasoundReport", UltrasoundReportSchema);
