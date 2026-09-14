import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  legacyId?: string;
  userId: mongoose.Types.ObjectId;
  action: string;
  entityName: string;
  entityId: string;
  ipAddress?: string;
  oldValues?: string;
  newValues?: string;
  createdAt: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    legacyId: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true },
    entityName: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    ipAddress: { type: String },
    oldValues: { type: String },
    newValues: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ userId: 1, createdAt: -1 });

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
