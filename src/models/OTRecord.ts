import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTRecord extends Document {
  legacyId?: string;
  otNumber: string;
  patientId: mongoose.Types.ObjectId;
  visitId: mongoose.Types.ObjectId;
  surgeonName: string;
  procedureName: string;
  diagnosis: string;
  otDate: Date;
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  otRoom: string;
  anesthesiaType: string;
  anesthetistName: string;
  preOpNotes?: string;
  procedureNotes?: string;
  postOpNotes?: string;
  status: "SCHEDULED" | "ADMITTED" | "PRE_OP" | "IN_OT" | "POST_OP" | "RECOVERY" | "DISCHARGED";
  totalFee: number;
  createdAt: Date;
  updatedAt: Date;
}

const OTRecordSchema: Schema<IOTRecord> = new Schema(
  {
    legacyId: { type: String, index: true },
    otNumber: { type: String, required: true, unique: true, index: true, trim: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    visitId: { type: Schema.Types.ObjectId, ref: "PatientVisit", required: true, index: true },
    surgeonName: { type: String, required: true },
    procedureName: { type: String, required: true },
    diagnosis: { type: String, required: true },
    otDate: { type: Date, required: true, index: true },
    scheduledTime: { type: String, required: true },
    actualStartTime: { type: String },
    actualEndTime: { type: String },
    otRoom: { type: String, required: true },
    anesthesiaType: { type: String, required: true },
    anesthetistName: { type: String, required: true },
    preOpNotes: { type: String },
    procedureNotes: { type: String },
    postOpNotes: { type: String },
    status: {
      type: String,
      default: "SCHEDULED",
      enum: ["SCHEDULED", "ADMITTED", "PRE_OP", "IN_OT", "POST_OP", "RECOVERY", "DISCHARGED"],
      index: true,
    },
    totalFee: { type: Number, default: 0.0 },
  },
  { timestamps: true }
);

export const OTRecordModel: Model<IOTRecord> =
  mongoose.models.OTRecord || mongoose.model<IOTRecord>("OTRecord", OTRecordSchema);
