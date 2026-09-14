import { connectToProductionDatabase } from "../lib/mongodb";
import { PrescriptionModel, IPrescription } from "../models/Prescription";

export class PrescriptionRepository {
  async createPrescription(prescriptionData: Partial<IPrescription>): Promise<IPrescription> {
    await connectToProductionDatabase();
    const rx = new PrescriptionModel(prescriptionData);
    return rx.save();
  }

  async findByPatient(patientId: string): Promise<IPrescription[]> {
    await connectToProductionDatabase();
    return PrescriptionModel.find({ patientId }).sort({ createdAt: -1 }).exec();
  }

  async findByVisit(visitId: string): Promise<IPrescription | null> {
    await connectToProductionDatabase();
    return PrescriptionModel.findOne({ visitId }).exec();
  }

  async markDispensed(id: string): Promise<IPrescription | null> {
    await connectToProductionDatabase();
    return PrescriptionModel.findByIdAndUpdate(id, { $set: { isDispensed: true } }, { new: true }).exec();
  }
}

export const prescriptionRepository = new PrescriptionRepository();
