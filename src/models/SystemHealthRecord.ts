import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISystemHealthRecord extends Document {
  legacyId?: string;
  dbStatus: string;
  dbConnectionPool: number;
  pitrStatus: string;
  lastBackupTime: Date;
  redisStatus: string;
  storageUsageMb: number;
  createdAt: Date;
}

const SystemHealthRecordSchema: Schema<ISystemHealthRecord> = new Schema(
  {
    legacyId: { type: String, index: true },
    dbStatus: { type: String, default: "HEALTHY" },
    dbConnectionPool: { type: Number, default: 10 },
    pitrStatus: { type: String, default: "ACTIVE" },
    lastBackupTime: { type: Date, default: Date.now },
    redisStatus: { type: String, default: "CONNECTED" },
    storageUsageMb: { type: Number, default: 256.4 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SystemHealthRecordModel: Model<ISystemHealthRecord> =
  mongoose.models.SystemHealthRecord ||
  mongoose.model<ISystemHealthRecord>("SystemHealthRecord", SystemHealthRecordSchema);
