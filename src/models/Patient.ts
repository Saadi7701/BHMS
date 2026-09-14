import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatient extends Document {
  legacyId?: string;
  mrNumber: string;
  fullName: string;
  fatherHusbandName?: string;
  gender: string;
  dob?: Date;
  age: number;
  phone: string;
  address?: string;
  cnic?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema<IPatient> = new Schema(
  {
    legacyId: { type: String, index: true },
    mrNumber: { type: String, required: true, unique: true, index: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    fatherHusbandName: { type: String, trim: true },
    gender: { type: String, required: true },
    dob: { type: Date },
    age: { type: Number, required: true },
    phone: { type: String, required: true, index: true },
    address: { type: String },
    cnic: { type: String, unique: true, sparse: true, trim: true },
    emergencyContact: { type: String },
    bloodGroup: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

PatientSchema.index({ fullName: "text", mrNumber: "text", phone: "text" });

export const PatientModel: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);
