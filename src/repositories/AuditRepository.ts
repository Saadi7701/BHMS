import { prisma } from "../lib/prisma";

export class AuditRepository {
  async logAction(logData: any): Promise<any> {
    let userId: string | null = null;
    if (logData.userId || logData.performedById) {
      const uStr = (logData.userId || logData.performedById).toString();
      const userObj = await prisma.user.findFirst({
        where: { OR: [{ id: uStr }, { legacyId: uStr }] },
      });
      if (userObj) userId = userObj.id;
    }

    const log = await prisma.auditLog.create({
      data: {
        action: logData.action,
        entityType: logData.entityType || logData.resource || "UNKNOWN",
        entityId: logData.entityId || logData.resourceId || null,
        userId,
        userEmail: logData.userEmail || logData.email || null,
        userName: logData.userName || logData.username || null,
        userRole: logData.userRole || logData.role || null,
        ipAddress: logData.ipAddress || null,
        userAgent: logData.userAgent || null,
        oldValues: logData.oldValues || null,
        newValues: logData.newValues || null,
        description: logData.description || logData.details || null,
        status: logData.status || "SUCCESS",
        errorMessage: logData.errorMessage || null,
      },
    });
    return { ...log, _id: log.id };
  }

  async findRecentLogs(limit = 100): Promise<any[]> {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return logs.map((l) => ({ ...l, _id: l.id }));
  }

  async findLogsByUser(userId: string, limit = 50): Promise<any[]> {
    const userObj = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { legacyId: userId }] },
    });
    const targetId = userObj ? userObj.id : userId;

    const logs = await prisma.auditLog.findMany({
      where: { userId: targetId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return logs.map((l) => ({ ...l, _id: l.id }));
  }

  async findLogsByEntity(entityType: string, entityId: string): Promise<any[]> {
    const logs = await prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
    });
    return logs.map((l) => ({ ...l, _id: l.id }));
  }

  async findLogsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: "desc" },
    });
    return logs.map((l) => ({ ...l, _id: l.id }));
  }
}

export const auditRepository = new AuditRepository();
