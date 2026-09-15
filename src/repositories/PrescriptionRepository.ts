import { connectToProductionDatabase } from "../lib/mongodb";
import { PrescriptionModel, IPrescription } from "../models/Prescription";

import mongoose from "mongoose";

export class PrescriptionRepository {
  async createPrescription(prescriptionData: Partial<IPrescription>): Promise<IPrescription> {
    await connectToProductionDatabase();
    const rx = new PrescriptionModel(prescriptionData);
    return rx.save();
  }

  async findByPatient(patientId: string): Promise<IPrescription[]> {
    await connectToProductionDatabase();
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      return PrescriptionModel.find({ patientId: new mongoose.Types.ObjectId(patientId) }).sort({ createdAt: -1 }).exec();
    }
    return PrescriptionModel.find({ $or: [{ mrNumber: patientId }, { legacyId: patientId }] }).sort({ createdAt: -1 }).exec();
  }

  async findByVisit(visitId: string): Promise<IPrescription | null> {
    await connectToProductionDatabase();
    if (mongoose.Types.ObjectId.isValid(visitId)) {
      return PrescriptionModel.findOne({ visitId: new mongoose.Types.ObjectId(visitId) }).exec();
    }
    return PrescriptionModel.findOne({ legacyId: visitId }).exec();
  }

  async markDispensed(id: string): Promise<IPrescription | null> {
    await connectToProductionDatabase();
    if (mongoose.Types.ObjectId.isValid(id)) {
      return PrescriptionModel.findByIdAndUpdate(id, { $set: { isDispensed: true } }, { new: true }).exec();
    }
    return PrescriptionModel.findOneAndUpdate(
      { legacyId: id },
      { $set: { isDispensed: true } },
      { new: true }
    ).exec();
  }
}

export const prescriptionRepository = new PrescriptionRepository();
