import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUltrasoundRevisionRequest extends Document {
  legacyId?: string;
  ultrasoundOrderId: mongoose.Types.ObjectId;
  ultrasoundReportId: mongoose.Types.ObjectId;
  consultantId: mongoose.Types.ObjectId;
  versionTarget: number;
  reason: string;
  comment: string;
  status: "PENDING" | "RESOLVED";
  createdAt: Date;
  resolvedAt?: Date;
}

const UltrasoundRevisionRequestSchema: Schema<IUltrasoundRevisionRequest> = new Schema(
  {
    legacyId: { type: String, index: true },
    ultrasoundOrderId: { type: Schema.Types.ObjectId, ref: "UltrasoundOrder", required: true, index: true },
    ultrasoundReportId: { type: Schema.Types.ObjectId, ref: "UltrasoundReport", required: true, index: true },
    consultantId: { type: Schema.Types.ObjectId, ref: "Consultant", required: true },
    versionTarget: { type: Number, required: true },
    reason: { type: String, required: true },
    comment: { type: String, required: true },
    status: { type: String, default: "PENDING", enum: ["PENDING", "RESOLVED"], index: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const UltrasoundRevisionRequestModel: Model<IUltrasoundRevisionRequest> =
  mongoose.models.UltrasoundRevisionRequest ||
  mongoose.model<IUltrasoundRevisionRequest>("UltrasoundRevisionRequest", UltrasoundRevisionRequestSchema);
