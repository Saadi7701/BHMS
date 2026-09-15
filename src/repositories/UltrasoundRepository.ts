import { connectToProductionDatabase } from "../lib/mongodb";
import { UltrasoundOrderModel, IUltrasoundOrder } from "../models/UltrasoundOrder";
import { UltrasoundReportModel, IUltrasoundReport } from "../models/UltrasoundReport";

import mongoose from "mongoose";

export class UltrasoundRepository {
  async createOrder(orderData: Partial<IUltrasoundOrder>): Promise<IUltrasoundOrder> {
    await connectToProductionDatabase();
    const order = new UltrasoundOrderModel(orderData);
    return order.save();
  }

  async findOrdersByPatient(patientId: string): Promise<IUltrasoundOrder[]> {
    await connectToProductionDatabase();
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      return UltrasoundOrderModel.find({ patientId: new mongoose.Types.ObjectId(patientId) }).sort({ createdAt: -1 }).exec();
    }
    return UltrasoundOrderModel.find({ $or: [{ mrNumber: patientId }, { legacyId: patientId }] }).sort({ createdAt: -1 }).exec();
  }

  async updateOrderStatus(id: string, status: IUltrasoundOrder["status"]): Promise<IUltrasoundOrder | null> {
    await connectToProductionDatabase();
    if (mongoose.Types.ObjectId.isValid(id)) {
      return UltrasoundOrderModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
    }
    return UltrasoundOrderModel.findOneAndUpdate(
      { $or: [{ orderNumber: id }, { legacyId: id }] },
      { $set: { status } },
      { new: true }
    ).exec();
  }

  async findReportByOrderId(ultrasoundOrderId: string): Promise<IUltrasoundReport | null> {
    await connectToProductionDatabase();
    return UltrasoundReportModel.findOne({ ultrasoundOrderId }).exec();
  }
}

export const ultrasoundRepository = new UltrasoundRepository();
