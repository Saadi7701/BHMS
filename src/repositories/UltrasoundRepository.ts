import { connectToProductionDatabase } from "../lib/mongodb";
import { UltrasoundOrderModel, IUltrasoundOrder } from "../models/UltrasoundOrder";
import { UltrasoundReportModel, IUltrasoundReport } from "../models/UltrasoundReport";

export class UltrasoundRepository {
  async createOrder(orderData: Partial<IUltrasoundOrder>): Promise<IUltrasoundOrder> {
    await connectToProductionDatabase();
    const order = new UltrasoundOrderModel(orderData);
    return order.save();
  }

  async findOrdersByPatient(patientId: string): Promise<IUltrasoundOrder[]> {
    await connectToProductionDatabase();
    return UltrasoundOrderModel.find({ patientId }).sort({ createdAt: -1 }).exec();
  }

  async updateOrderStatus(id: string, status: IUltrasoundOrder["status"]): Promise<IUltrasoundOrder | null> {
    await connectToProductionDatabase();
    return UltrasoundOrderModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
  }

  async findReportByOrderId(ultrasoundOrderId: string): Promise<IUltrasoundReport | null> {
    await connectToProductionDatabase();
    return UltrasoundReportModel.findOne({ ultrasoundOrderId }).exec();
  }
}

export const ultrasoundRepository = new UltrasoundRepository();
