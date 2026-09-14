import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConsultant extends Document {
  legacyId?: string;
  userId: mongoose.Types.ObjectId;
  specialty: string;
  department: string;
  qualification: string;
  roomNumber: string;
  consultationFee: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultantSchema: Schema<IConsultant> = new Schema(
  {
    legacyId: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialty: { type: String, required: true },
    department: { type: String, required: true, index: true },
    qualification: { type: String, required: true },
    roomNumber: { type: String, required: true },
    consultationFee: { type: Number, required: true, default: 0.0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ConsultantModel: Model<IConsultant> =
  mongoose.models.Consultant || mongoose.model<IConsultant>("Consultant", ConsultantSchema);
