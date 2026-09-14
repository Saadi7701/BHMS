import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatientVisit extends Document {
  legacyId?: string;
  visitNumber: string;
  patientId: mongoose.Types.ObjectId;
  consultantId: mongoose.Types.ObjectId;
  visitDate: Date;
  arrivalTime: Date;
  department: string;
  visitType: string;
  reasonForVisit?: string;
  consultationFee: number;
  amountReceived: number;
  paymentMethod: string;
  receptionistId: mongoose.Types.ObjectId;
  status:
    | "REGISTERED"
    | "WAITING"
    | "WITH_CONSULTANT"
    | "LAB_REQUESTED"
    | "PHARMACY"
    | "COMPLETED";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientVisitSchema: Schema<IPatientVisit> = new Schema(
  {
    legacyId: { type: String, index: true },
    visitNumber: { type: String, required: true, unique: true, index: true, trim: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    consultantId: { type: Schema.Types.ObjectId, ref: "Consultant", required: true, index: true },
    visitDate: { type: Date, default: Date.now, index: true },
    arrivalTime: { type: Date, default: Date.now },
    department: { type: String, required: true },
    visitType: { type: String, default: "OPD" },
    reasonForVisit: { type: String },
    consultationFee: { type: Number, default: 0.0 },
    amountReceived: { type: Number, default: 0.0 },
    paymentMethod: { type: String, default: "CASH" },
    receptionistId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      required: true,
      enum: ["REGISTERED", "WAITING", "WITH_CONSULTANT", "LAB_REQUESTED", "PHARMACY", "COMPLETED"],
      default: "REGISTERED",
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

PatientVisitSchema.index({ patientId: 1, visitDate: -1 });
PatientVisitSchema.index({ consultantId: 1, status: 1 });

export const PatientVisitModel: Model<IPatientVisit> =
  mongoose.models.PatientVisit || mongoose.model<IPatientVisit>("PatientVisit", PatientVisitSchema);
