import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILabRevisionRequest extends Document {
  legacyId?: string;
  labOrderId: mongoose.Types.ObjectId;
  labReportId: mongoose.Types.ObjectId;
  consultantId: mongoose.Types.ObjectId;
  versionTarget: number;
  reason: string;
  comment: string;
  status: "PENDING" | "RESOLVED";
  createdAt: Date;
  resolvedAt?: Date;
}

const LabRevisionRequestSchema: Schema<ILabRevisionRequest> = new Schema(
  {
    legacyId: { type: String, index: true },
    labOrderId: { type: Schema.Types.ObjectId, ref: "LabOrder", required: true, index: true },
    labReportId: { type: Schema.Types.ObjectId, ref: "LabReport", required: true, index: true },
    consultantId: { type: Schema.Types.ObjectId, ref: "Consultant", required: true },
    versionTarget: { type: Number, required: true },
    reason: { type: String, required: true },
    comment: { type: String, required: true },
    status: { type: String, default: "PENDING", enum: ["PENDING", "RESOLVED"], index: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const LabRevisionRequestModel: Model<ILabRevisionRequest> =
  mongoose.models.LabRevisionRequest ||
  mongoose.model<ILabRevisionRequest>("LabRevisionRequest", LabRevisionRequestSchema);
