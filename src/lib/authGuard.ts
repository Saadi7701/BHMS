import { auditRepository } from "../repositories/AuditRepository";

export interface IAuthUser {
  id: string;
  username: string;
  role: "ADMIN" | "CONSULTANT" | "RECEPTIONIST" | "LAB_STAFF" | "PHARMACY_STAFF" | "ULTRASOUND_STAFF";
}

/**
 * Validates staff role permissions for protected hospital operations.
 */
export function authorizeRole(user: IAuthUser, allowedRoles: IAuthUser["role"][]): boolean {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Emits security audit trail logs for medical and financial record changes.
 */
export async function logAuditEvent(
  userId: string,
  action: string,
  entityName: string,
  entityId: string,
  ipAddress?: string,
  oldValues?: any,
  newValues?: any
): Promise<void> {
  try {
    await auditRepository.logAction({
      userId: userId as any,
      action,
      entityName,
      entityId,
      ipAddress,
      oldValues: oldValues ? JSON.stringify(oldValues) : undefined,
      newValues: newValues ? JSON.stringify(newValues) : undefined,
    });
  } catch (err: any) {
    console.error("[Audit System Error] Failed to log audit event:", err.message);
  }
}
