import { connectToProductionDatabase } from "../lib/mongodb";
import { PatientVisitModel, IPatientVisit } from "../models/PatientVisit";

export class VisitRepository {
  async findByVisitNumber(visitNumber: string): Promise<IPatientVisit | null> {
    await connectToProductionDatabase();
    return PatientVisitModel.findOne({ visitNumber: visitNumber.trim() }).exec();
  }

  async findById(id: string): Promise<IPatientVisit | null> {
    await connectToProductionDatabase();
    return PatientVisitModel.findById(id).exec();
  }

  async createVisit(visitData: Partial<IPatientVisit>): Promise<IPatientVisit> {
    await connectToProductionDatabase();
    const visit = new PatientVisitModel(visitData);
    return visit.save();
  }

  async findByConsultant(consultantId: string, status?: string): Promise<IPatientVisit[]> {
    await connectToProductionDatabase();
    const filter: Record<string, any> = { consultantId };
    if (status) filter.status = status;
    return PatientVisitModel.find(filter).sort({ visitDate: -1 }).exec();
  }

  async updateStatus(id: string, status: IPatientVisit["status"]): Promise<IPatientVisit | null> {
    await connectToProductionDatabase();
    return PatientVisitModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
  }
}

export const visitRepository = new VisitRepository();
