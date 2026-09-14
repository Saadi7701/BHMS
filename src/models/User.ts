import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  legacyId?: string;
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: "ADMIN" | "CONSULTANT" | "RECEPTIONIST" | "LAB_STAFF" | "PHARMACY_STAFF" | "ULTRASOUND_STAFF";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    legacyId: { type: String, index: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "CONSULTANT", "RECEPTIONIST", "LAB_STAFF", "PHARMACY_STAFF", "ULTRASOUND_STAFF"],
      default: "ADMIN",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
