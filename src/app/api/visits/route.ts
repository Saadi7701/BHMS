import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { visitRepository } from "@/repositories/VisitRepository";
import { cashRepository } from "@/repositories/CashRepository";
import { PatientVisitModel } from "@/models/PatientVisit";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");
    const status = searchParams.get("status");

    await connectToProductionDatabase();

    let visits;
    if (consultantId) {
      visits = await visitRepository.findByConsultant(consultantId, status || undefined);
    } else {
      const filter: Record<string, any> = {};
      if (status) filter.status = status;
      visits = await PatientVisitModel.find(filter).sort({ visitDate: -1 }).limit(100).exec();
    }

    return NextResponse.json({ visits }, { status: 200 });
  } catch (error: any) {
    console.error("[Visits API GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient visits." },
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

    // Auto-generate unique visitNumber if missing or duplicate
    let visitNumber = body.visitNumber || `VIS-${Date.now().toString().slice(-6)}`;
    const existing = await visitRepository.findByVisitNumber(visitNumber);
    if (existing) {
      visitNumber = `VIS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    }

    const patientObjectId = mongoose.Types.ObjectId.isValid(body.patientId)
      ? new mongoose.Types.ObjectId(body.patientId)
      : new mongoose.Types.ObjectId();

    const consultantObjectId = mongoose.Types.ObjectId.isValid(body.consultantId)
      ? new mongoose.Types.ObjectId(body.consultantId)
      : new mongoose.Types.ObjectId();

    const receptionistObjectId = new mongoose.Types.ObjectId();

    const fee = Number(body.feeCharged) || Number(body.consultationFee) || 0;
    const received = Number(body.netCollectedAmount) || Number(body.amountReceived) || fee;

    const newVisit = await visitRepository.createVisit({
      visitNumber,
      patientId: patientObjectId,
      patientName: body.patientName || "Patient",
      mrNumber: body.mrNumber || "MR-0000",
      consultantId: consultantObjectId,
      consultantName: body.consultantName || "Dr. Bilal Ahmad",
      department: body.department || "OPD Reception",
      visitType: body.visitType || "OPD",
      reasonForVisit: body.reasonForVisit || "OPD Consultation",
      consultationFee: fee,
      amountReceived: received,
      paymentMethod: body.paymentMethod || "CASH",
      receptionistId: receptionistObjectId,
      status: body.status || "WAITING",
      visitDate: new Date(),
      arrivalTime: new Date(),
    });

    if (received > 0) {
      await cashRepository.createTransaction({
        transactionNumber: `TXN-OPD-${Date.now().toString().slice(-6)}`,
        transactionType: "INCOME",
        category: "OPD_REGISTRATION",
        department: "OPD Reception",
        amount: received,
        paymentMethod: "CASH",
        description: `OPD Fee collected for ${body.patientName || visitNumber}`,
        patientId: patientObjectId,
        visitId: newVisit._id as mongoose.Types.ObjectId,
        createdById: receptionistObjectId,
        transactionDate: new Date(),
      });
    }

    console.log(`[MongoDB Success] Visit ${visitNumber} for ${body.patientName} saved to Atlas!`);

    return NextResponse.json(
      { message: "Visit created successfully", visit: newVisit },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Visits API POST Error]:", error);
    return NextResponse.json(
      { error: `Failed to create patient visit: ${error.message}` },
      { status: 500 }
    );
  }
}
