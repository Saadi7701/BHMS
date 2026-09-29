import { prisma } from "./prisma";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates that a Patient exists in PostgreSQL by ID, Legacy ID, or MR Number.
 * Throws a ValidationError if the patient cannot be found.
 */
export async function validatePatientExists(patientId: string): Promise<void> {
  const patient = await prisma.patient.findFirst({
    where: { OR: [{ id: patientId }, { legacyId: patientId }, { mrNumber: patientId }] },
  });
  if (!patient) {
    throw new ValidationError(`Referenced Patient with ID/MR '${patientId}' does not exist.`);
  }
}

/**
 * Validates that a Consultant exists in PostgreSQL by ID or Legacy ID.
 * Throws a ValidationError if the consultant cannot be found.
 */
export async function validateConsultantExists(consultantId: string): Promise<void> {
  const consultant = await prisma.consultant.findFirst({
    where: { OR: [{ id: consultantId }, { legacyId: consultantId }] },
  });
  if (!consultant) {
    throw new ValidationError(`Referenced Consultant with ID '${consultantId}' does not exist.`);
  }
}

/**
 * Validates that a PatientVisit exists in PostgreSQL by ID, Legacy ID, or Visit Number.
 * Throws a ValidationError if the visit cannot be found.
 */
export async function validateVisitExists(visitId: string): Promise<void> {
  const visit = await prisma.patientVisit.findFirst({
    where: { OR: [{ id: visitId }, { legacyId: visitId }, { visitNumber: visitId }] },
  });
  if (!visit) {
    throw new ValidationError(`Referenced PatientVisit with ID/VisitNumber '${visitId}' does not exist.`);
  }
}

/**
 * Validates that a Prescription exists before dispensing.
 */
export async function validatePrescriptionExists(prescriptionId: string): Promise<void> {
  const rx = await prisma.prescription.findFirst({
    where: { OR: [{ id: prescriptionId }, { legacyId: prescriptionId }] },
  });
  if (!rx) {
    throw new ValidationError(`Referenced Prescription with ID '${prescriptionId}' does not exist.`);
  }
}

/**
 * Validates LabOrder existence.
 */
export async function validateLabOrderExists(labOrderId: string): Promise<void> {
  const order = await prisma.labOrder.findFirst({
    where: { OR: [{ id: labOrderId }, { legacyId: labOrderId }, { orderNumber: labOrderId }] },
  });
  if (!order) {
    throw new ValidationError(`Referenced LabOrder with ID/OrderNumber '${labOrderId}' does not exist.`);
  }
}

/**
 * Validates UltrasoundOrder existence.
 */
export async function validateUltrasoundOrderExists(usOrderId: string): Promise<void> {
  const order = await prisma.ultrasoundOrder.findFirst({
    where: { OR: [{ id: usOrderId }, { legacyId: usOrderId }, { orderNumber: usOrderId }] },
  });
  if (!order) {
    throw new ValidationError(`Referenced UltrasoundOrder with ID/OrderNumber '${usOrderId}' does not exist.`);
  }
}

/**
 * Executes a transaction in Prisma.
 */
export async function executeInTransaction<T>(
  work: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await work(tx);
  });
}
