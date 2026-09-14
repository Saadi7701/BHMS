import { connectToProductionDatabase } from "../lib/mongodb";
import { AuditLogModel, IAuditLog } from "../models/AuditLog";

export class AuditRepository {
  async logAction(logData: Partial<IAuditLog>): Promise<IAuditLog> {
    await connectToProductionDatabase();
    const log = new AuditLogModel(logData);
    return log.save();
  }

  async findRecentLogs(limit = 100): Promise<IAuditLog[]> {
    await connectToProductionDatabase();
    return AuditLogModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }
}

export const auditRepository = new AuditRepository();
