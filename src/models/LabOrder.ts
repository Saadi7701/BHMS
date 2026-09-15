import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILabOrderItem {
  legacyId?: string;
  testName: string;
  testCode: string;
  unitPrice: number;
}

export interface ILabOrder extends Document {
  legacyId?: string;
  orderNumber: string;
  patientId: mongoose.Types.ObjectId;
  patientName?: string;
  mrNumber?: string;
  visitId: mongoose.Types.ObjectId;
  consultantId: mongoose.Types.ObjectId;
  consultantName?: string;
  testCategory: string;
  clinicalNotes?: string;
  priority: "NORMAL" | "URGENT";
  status:
    | "ORDERED"
    | "SAMPLE_COLLECTED"
    | "PROCESSING"
    | "REPORT_PREPARED"
    | "SUBMITTED_TO_CONSULTANT"
    | "REVISION_REQUESTED"
    | "ACCEPTED";
  totalFee: number;
  requestDate: Date;
  items: ILabOrderItem[];
  currentVersion?: number;
  resultsV1?: string;
  resultsV2?: string;
  revisionReason?: string;
  revisionComment?: string;
  attachedPdfUrl?: string;
  attachedPdfName?: string;
  attachedImageBase64?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabOrderItemSchema = new Schema<ILabOrderItem>({
  legacyId: { type: String },
  testName: { type: String, required: true },
  testCode: { type: String, required: true },
  unitPrice: { type: Number, default: 0.0 },
});

const LabOrderSchema: Schema<ILabOrder> = new Schema(
  {
    legacyId: { type: String, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true, trim: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    patientName: { type: String, trim: true },
    mrNumber: { type: String, trim: true },
    visitId: { type: Schema.Types.ObjectId, ref: "PatientVisit", required: true, index: true },
    consultantId: { type: Schema.Types.ObjectId, ref: "Consultant", required: true, index: true },
    consultantName: { type: String, trim: true },
    testCategory: { type: String, required: true },
    clinicalNotes: { type: String },
    priority: { type: String, default: "NORMAL", enum: ["NORMAL", "URGENT"] },
    status: {
      type: String,
      default: "ORDERED",
      enum: [
        "ORDERED",
        "SAMPLE_COLLECTED",
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
    items: [LabOrderItemSchema],
    currentVersion: { type: Number, default: 1 },
    resultsV1: { type: String },
    resultsV2: { type: String },
    revisionReason: { type: String },
    revisionComment: { type: String },
    attachedPdfUrl: { type: String },
    attachedPdfName: { type: String },
    attachedImageBase64: { type: String },
  },
  { timestamps: true }
);

export const LabOrderModel: Model<ILabOrder> =
  mongoose.models.LabOrder || mongoose.model<ILabOrder>("LabOrder", LabOrderSchema);
