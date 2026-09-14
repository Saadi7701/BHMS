import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConsultation extends Document {
  legacyId?: string;
  visitId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  consultantId: mongoose.Types.ObjectId;
  chiefComplaint: string;
  symptoms?: string;
  diagnosis: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  temperature?: number;
  pulse?: number;
  weight?: number;
  clinicalNotes?: string;
  advice?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema: Schema<IConsultation> = new Schema(
  {
    legacyId: { type: String, index: true },
    visitId: { type: Schema.Types.ObjectId, ref: "PatientVisit", required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    consultantId: { type: Schema.Types.ObjectId, ref: "Consultant", required: true, index: true },
    chiefComplaint: { type: String, required: true },
    symptoms: { type: String },
    diagnosis: { type: String, required: true },
    bpSystolic: { type: Number },
    bpDiastolic: { type: Number },
    temperature: { type: Number },
    pulse: { type: Number },
    weight: { type: Number },
    clinicalNotes: { type: String },
    advice: { type: String },
  },
  { timestamps: true }
);

export const ConsultationModel: Model<IConsultation> =
  mongoose.models.Consultation || mongoose.model<IConsultation>("Consultation", ConsultationSchema);
