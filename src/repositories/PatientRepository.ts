import { connectToProductionDatabase } from "../lib/mongodb";
import { PatientModel, IPatient } from "../models/Patient";

export class PatientRepository {
  async findByMrNumber(mrNumber: string): Promise<IPatient | null> {
    await connectToProductionDatabase();
    return PatientModel.findOne({ mrNumber: mrNumber.trim() }).exec();
  }

  async findById(id: string): Promise<IPatient | null> {
    await connectToProductionDatabase();
    return PatientModel.findById(id).exec();
  }

  async createPatient(patientData: Partial<IPatient>): Promise<IPatient> {
    await connectToProductionDatabase();
    const patient = new PatientModel(patientData);
    return patient.save();
  }

  async searchPatients(query: string): Promise<IPatient[]> {
    await connectToProductionDatabase();
    if (!query || query.trim() === "") {
      return PatientModel.find().sort({ createdAt: -1 }).limit(100).exec();
    }
    const regex = new RegExp(query.trim(), "i");
    return PatientModel.find({
      $or: [
        { fullName: regex },
        { mrNumber: regex },
        { phone: regex },
        { cnic: regex },
      ],
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updatePatient(id: string, updateData: Partial<IPatient>): Promise<IPatient | null> {
    await connectToProductionDatabase();
    return PatientModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }
}

export const patientRepository = new PatientRepository();
