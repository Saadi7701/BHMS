import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { ultrasoundRepository } from "@/repositories/UltrasoundRepository";
import { cashRepository } from "@/repositories/CashRepository";
import { UltrasoundOrderModel } from "@/models/UltrasoundOrder";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    await connectToProductionDatabase();

    let orders;
    if (patientId) {
      orders = await ultrasoundRepository.findOrdersByPatient(patientId);
    } else {
      orders = await UltrasoundOrderModel.find().sort({ createdAt: -1 }).limit(100).exec();
    }

    return NextResponse.json({ ultrasoundOrders: orders }, { status: 200 });
  } catch (error: any) {
    console.error("[Ultrasound API GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch ultrasound orders." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderNumber = body.orderNumber || body.usOrderNumber || `US-${Date.now().toString().slice(-6)}`;
    if (!body.patientId || !body.scanType) {
      return NextResponse.json(
        { error: "Patient ID and Scan Type are required." },
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

    const newOrder = await ultrasoundRepository.createOrder({
      orderNumber,
      patientId: patientObjectId,
      patientName: body.patientName || "Patient",
      mrNumber: body.mrNumber || "MR-0000",
      visitId: visitObjectId,
      consultantId: consultantObjectId,
      consultantName: body.consultantName || "Doctor",
      requestedExam: body.scanType,
      clinicalIndication: body.clinicalIndication || "",
      priority: body.priority === "URGENT" ? "URGENT" : "NORMAL",
      status: "ORDERED",
      totalFee: Number(body.fee) || 0,
      requestDate: new Date(),
    });

    if (Number(body.fee) > 0) {
      await cashRepository.createTransaction({
        transactionNumber: `TXN-US-${Date.now().toString().slice(-6)}`,
        transactionType: "INCOME",
        category: "ULTRASOUND_SCAN",
        department: "Ultrasound Department",
        amount: Number(body.fee),
        paymentMethod: "CASH",
        description: `Ultrasound scan fee for ${body.scanType}`,
        patientId: patientObjectId,
        visitId: visitObjectId,
        createdById: consultantObjectId,
        transactionDate: new Date(),
      });
    }

    return NextResponse.json(
      { message: "Ultrasound order created successfully", ultrasoundOrder: newOrder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Ultrasound API POST Error]:", error);
    return NextResponse.json(
      { error: "Failed to create ultrasound order." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, action, findings, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Ultrasound Order ID is required." }, { status: 400 });
    }

    await connectToProductionDatabase();

    let updatedOrder;
    if (action === "SUBMIT_REPORT") {
      updatedOrder = await ultrasoundRepository.updateOrderStatus(id, "SUBMITTED_TO_CONSULTANT");
    } else if (status) {
      updatedOrder = await ultrasoundRepository.updateOrderStatus(id, status);
    }

    return NextResponse.json(
      { message: "Ultrasound order updated successfully", ultrasoundOrder: updatedOrder },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Ultrasound API PUT Error]:", error);
    return NextResponse.json(
      { error: "Failed to update ultrasound order." },
      { status: 500 }
    );
  }
}
