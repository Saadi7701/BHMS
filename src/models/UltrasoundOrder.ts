import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUltrasoundOrder extends Document {
  legacyId?: string;
  orderNumber: string;
  patientId: mongoose.Types.ObjectId;
  visitId: mongoose.Types.ObjectId;
  consultantId: mongoose.Types.ObjectId;
  requestedExam: string;
  clinicalIndication?: string;
  priority: "NORMAL" | "URGENT";
  status:
    | "ORDERED"
    | "PROCESSING"
    | "SUBMITTED_TO_CONSULTANT"
    | "REVISION_REQUESTED"
    | "ACCEPTED";
  totalFee: number;
  requestDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UltrasoundOrderSchema: Schema<IUltrasoundOrder> = new Schema(
  {
    legacyId: { type: String, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true, trim: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    visitId: { type: Schema.Types.ObjectId, ref: "PatientVisit", required: true, index: true },
    consultantId: { type: Schema.Types.ObjectId, ref: "Consultant", required: true, index: true },
    requestedExam: { type: String, required: true },
    clinicalIndication: { type: String },
    priority: { type: String, default: "NORMAL" },
    status: {
      type: String,
      default: "ORDERED",
      enum: ["ORDERED", "PROCESSING", "SUBMITTED_TO_CONSULTANT", "REVISION_REQUESTED", "ACCEPTED"],
      index: true,
    },
    totalFee: { type: Number, default: 0.0 },
    requestDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const UltrasoundOrderModel: Model<IUltrasoundOrder> =
  mongoose.models.UltrasoundOrder ||
  mongoose.model<IUltrasoundOrder>("UltrasoundOrder", UltrasoundOrderSchema);
