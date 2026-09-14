import { connectToProductionDatabase } from "../lib/mongodb";
import { LabOrderModel, ILabOrder } from "../models/LabOrder";
import { LabReportModel, ILabReport } from "../models/LabReport";
import { LabRevisionRequestModel, ILabRevisionRequest } from "../models/LabRevisionRequest";

export class LabRepository {
  async createLabOrder(orderData: Partial<ILabOrder>): Promise<ILabOrder> {
    await connectToProductionDatabase();
    const order = new LabOrderModel(orderData);
    return order.save();
  }

  async findOrdersByPatient(patientId: string): Promise<ILabOrder[]> {
    await connectToProductionDatabase();
    return LabOrderModel.find({ patientId }).sort({ createdAt: -1 }).exec();
  }

  async findOrderById(id: string): Promise<ILabOrder | null> {
    await connectToProductionDatabase();
    return LabOrderModel.findById(id).exec();
  }

  async updateOrderStatus(id: string, status: ILabOrder["status"]): Promise<ILabOrder | null> {
    await connectToProductionDatabase();
    return LabOrderModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
  }

  async createOrUpdateLabReport(reportData: Partial<ILabReport>): Promise<ILabReport> {
    await connectToProductionDatabase();
    const existing = await LabReportModel.findOne({ labOrderId: reportData.labOrderId }).exec();
    if (existing) {
      existing.versions.push(...(reportData.versions || []));
      existing.currentVersion = existing.versions.length;
      return existing.save();
    }
    const report = new LabReportModel(reportData);
    return report.save();
  }

  async findReportByOrderId(labOrderId: string): Promise<ILabReport | null> {
    await connectToProductionDatabase();
    return LabReportModel.findOne({ labOrderId }).exec();
  }

  async createRevisionRequest(reqData: Partial<ILabRevisionRequest>): Promise<ILabRevisionRequest> {
    await connectToProductionDatabase();
    const req = new LabRevisionRequestModel(reqData);
    return req.save();
  }
}

export const labRepository = new LabRepository();
