import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { prescriptionRepository } from "@/repositories/PrescriptionRepository";
import { PrescriptionModel } from "@/models/Prescription";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    await connectToProductionDatabase();

    let prescriptions;
    if (patientId) {
      prescriptions = await prescriptionRepository.findByPatient(patientId);
    } else {
      prescriptions = await PrescriptionModel.find().sort({ createdAt: -1 }).limit(100).exec();
    }

    return NextResponse.json({ prescriptions }, { status: 200 });
  } catch (error: any) {
    console.error("[Prescriptions API GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.patientId || !body.consultantId) {
      return NextResponse.json(
        { error: "Patient ID and Consultant ID are required." },
        { status: 400 }
      );
    }

    await connectToProductionDatabase();

    const patientObjectId = mongoose.Types.ObjectId.isValid(body.patientId)
      ? new mongoose.Types.ObjectId(body.patientId)
      : new mongoose.Types.ObjectId();

    const visitObjectId = mongoose.Types.ObjectId.isValid(body.visitId)
      ? new mongoose.Types.ObjectId(body.visitId)
      : new mongoose.Types.ObjectId();

    const consultantObjectId = mongoose.Types.ObjectId.isValid(body.consultantId)
      ? new mongoose.Types.ObjectId(body.consultantId)
      : new mongoose.Types.ObjectId();

    const newPrescription = await prescriptionRepository.createPrescription({
      patientId: patientObjectId,
      patientName: body.patientName || "Patient",
      mrNumber: body.mrNumber || "MR-0000",
      visitId: visitObjectId,
      consultantId: consultantObjectId,
      consultantName: body.consultantName || "Dr. Bilal Ahmad",
      diagnosis: body.diagnosis || "General Consultation",
      notes: body.instructions || body.clinicalNotes || "",
      isDispensed: false,
      prescriptionDate: new Date(),
      items: (body.medicines || []).map((m: any) => ({
        medicineName: m.medicineName || m.name || "Medicine",
        dosage: m.dosage || "1-0-1",
        frequency: m.frequency || "BID",
        duration: `${m.durationDays || 5} days`,
        instructions: m.instructions || "",
      })),
    });

    return NextResponse.json(
      { message: "Prescription created successfully", prescription: newPrescription },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Prescriptions API POST Error]:", error);
    return NextResponse.json(
      { error: "Failed to create prescription." },
      { status: 500 }
    );
  }
}
