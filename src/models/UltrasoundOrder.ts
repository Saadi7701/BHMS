import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUltrasoundOrder extends Document {
  legacyId?: string;
  orderNumber: string;
  patientId: mongoose.Types.ObjectId;
  patientName?: string;
  mrNumber?: string;
  visitId: mongoose.Types.ObjectId;
  consultantId: mongoose.Types.ObjectId;
  consultantName?: string;
  requestedExam: string;
  clinicalIndication?: string;
  priority: "NORMAL" | "URGENT";
  status:
    | "ORDERED"
    | "PROCESSING"
    | "REPORT_PREPARED"
    | "SUBMITTED_TO_CONSULTANT"
    | "REVISION_REQUESTED"
    | "ACCEPTED";
  totalFee: number;
  requestDate: Date;
  attachedFileName?: string;
  attachedPdfUrl?: string;
  attachedImageUrl?: string;
  attachedImageBase64?: string;
  findingsV1?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UltrasoundOrderSchema: Schema<IUltrasoundOrder> = new Schema(
  {
    legacyId: { type: String, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true, trim: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    patientName: { type: String, trim: true },
    mrNumber: { type: String, trim: true },
    visitId: { type: Schema.Types.ObjectId, ref: "PatientVisit", required: true, index: true },
    consultantId: { type: Schema.Types.ObjectId, ref: "Consultant", required: true, index: true },
    consultantName: { type: String, trim: true },
    requestedExam: { type: String, required: true },
    clinicalIndication: { type: String },
    priority: { type: String, default: "NORMAL", enum: ["NORMAL", "URGENT"] },
    status: {
      type: String,
      default: "ORDERED",
      enum: [
        "ORDERED",
        "PROCESSING",
        "REPORT_PREPARED",
        "SUBMITTED_TO_CONSULTANT",
        "REVISION_REQUESTED",
        "ACCEPTED",
      ],
      index: true,
    },
    totalFee: { type: Number, default: 0.0 },
    requestDate: { type: Date, default: Date.now },
    attachedFileName: { type: String },
    attachedPdfUrl: { type: String },
    attachedImageUrl: { type: String },
    attachedImageBase64: { type: String },
    findingsV1: { type: String },
  },
  { timestamps: true }
);

export const UltrasoundOrderModel: Model<IUltrasoundOrder> =
  mongoose.models.UltrasoundOrder ||
  mongoose.model<IUltrasoundOrder>("UltrasoundOrder", UltrasoundOrderSchema);
