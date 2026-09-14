import mongoose from "mongoose";
import { connectToProductionDatabase } from "./mongodb";
import { PatientModel } from "../models/Patient";
import { ConsultantModel } from "../models/Consultant";
import { PatientVisitModel } from "../models/PatientVisit";
import { PrescriptionModel } from "../models/Prescription";
import { LabOrderModel } from "../models/LabOrder";
import { UltrasoundOrderModel } from "../models/UltrasoundOrder";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates that a Patient exists in MongoDB by ID or MR Number.
 * Throws a ValidationError if the patient cannot be found.
 */
export async function validatePatientExists(patientId: string): Promise<void> {
  await connectToProductionDatabase();
  const isValidId = mongoose.Types.ObjectId.isValid(patientId);
  const filter = isValidId ? { _id: patientId } : { mrNumber: patientId };

  const patient = await PatientModel.findOne(filter).exec();
  if (!patient) {
    throw new ValidationError(`Referenced Patient with ID/MR '${patientId}' does not exist.`);
  }
}

/**
 * Validates that a Consultant exists in MongoDB by ID.
 * Throws a ValidationError if the consultant cannot be found.
 */
export async function validateConsultantExists(consultantId: string): Promise<void> {
  await connectToProductionDatabase();
  const isValidId = mongoose.Types.ObjectId.isValid(consultantId);
  if (!isValidId) {
    throw new ValidationError(`Invalid Consultant ID format '${consultantId}'.`);
  }

  const consultant = await ConsultantModel.findById(consultantId).exec();
  if (!consultant) {
    throw new ValidationError(`Referenced Consultant with ID '${consultantId}' does not exist.`);
  }
}

/**
 * Validates that a PatientVisit exists in MongoDB by ID or Visit Number.
 * Throws a ValidationError if the visit cannot be found.
 */
export async function validateVisitExists(visitId: string): Promise<void> {
  await connectToProductionDatabase();
  const isValidId = mongoose.Types.ObjectId.isValid(visitId);
  const filter = isValidId ? { _id: visitId } : { visitNumber: visitId };

  const visit = await PatientVisitModel.findOne(filter).exec();
  if (!visit) {
    throw new ValidationError(`Referenced PatientVisit with ID/VisitNumber '${visitId}' does not exist.`);
  }
}

/**
 * Validates that a Prescription exists before dispensing.
 */
export async function validatePrescriptionExists(prescriptionId: string): Promise<void> {
  await connectToProductionDatabase();
  const isValidId = mongoose.Types.ObjectId.isValid(prescriptionId);
  if (!isValidId) {
    throw new ValidationError(`Invalid Prescription ID format '${prescriptionId}'.`);
  }

  const rx = await PrescriptionModel.findById(prescriptionId).exec();
  if (!rx) {
    throw new ValidationError(`Referenced Prescription with ID '${prescriptionId}' does not exist.`);
  }
}

/**
 * Validates LabOrder existence.
 */
export async function validateLabOrderExists(labOrderId: string): Promise<void> {
  await connectToProductionDatabase();
  const isValidId = mongoose.Types.ObjectId.isValid(labOrderId);
  const filter = isValidId ? { _id: labOrderId } : { orderNumber: labOrderId };

  const order = await LabOrderModel.findOne(filter).exec();
  if (!order) {
    throw new ValidationError(`Referenced LabOrder with ID/OrderNumber '${labOrderId}' does not exist.`);
  }
}

/**
 * Validates UltrasoundOrder existence.
 */
export async function validateUltrasoundOrderExists(usOrderId: string): Promise<void> {
  await connectToProductionDatabase();
  const isValidId = mongoose.Types.ObjectId.isValid(usOrderId);
  const filter = isValidId ? { _id: usOrderId } : { orderNumber: usOrderId };

  const order = await UltrasoundOrderModel.findOne(filter).exec();
  if (!order) {
    throw new ValidationError(`Referenced UltrasoundOrder with ID/OrderNumber '${usOrderId}' does not exist.`);
  }
}

/**
 * Executes a multi-document operation within a Mongoose session transaction where supported.
 */
export async function executeInTransaction<T>(
  work: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const mongooseInstance = await connectToProductionDatabase();
  const session = await mongooseInstance.startSession();
  try {
    session.startTransaction();
    const result = await work(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
