import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { labRepository } from "@/repositories/LabRepository";
import { cashRepository } from "@/repositories/CashRepository";
import { LabOrderModel } from "@/models/LabOrder";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    await connectToProductionDatabase();

    let orders;
    if (patientId) {
      orders = await labRepository.findOrdersByPatient(patientId);
    } else {
      orders = await LabOrderModel.find().sort({ createdAt: -1 }).limit(100).exec();
    }

    return NextResponse.json({ labOrders: orders }, { status: 200 });
  } catch (error: any) {
    console.error("[Lab Orders API GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch lab orders." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let orderNumber = body.orderNumber || body.labOrderNumber || `LAB-${Date.now().toString().slice(-6)}`;
    if (!body.patientId || !body.testName) {
      return NextResponse.json(
        { error: "Patient ID and Test Name are required." },
        { status: 400 }
      );
    }

    await connectToProductionDatabase();

    const existing = await LabOrderModel.findOne({ orderNumber }).exec();
    if (existing) {
      orderNumber = `LAB-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    }

    const patientObjectId = mongoose.Types.ObjectId.isValid(body.patientId)
      ? new mongoose.Types.ObjectId(body.patientId)
      : new mongoose.Types.ObjectId();

    const visitObjectId = mongoose.Types.ObjectId.isValid(body.visitId)
      ? new mongoose.Types.ObjectId(body.visitId)
      : new mongoose.Types.ObjectId();

    const consultantObjectId = mongoose.Types.ObjectId.isValid(body.consultantId)
      ? new mongoose.Types.ObjectId(body.consultantId)
      : new mongoose.Types.ObjectId();

    const newOrder = await labRepository.createLabOrder({
      orderNumber,
      patientId: patientObjectId,
      visitId: visitObjectId,
      consultantId: consultantObjectId,
      testCategory: body.category || body.testCategory || "General Pathology",
      clinicalNotes: body.clinicalIndication || body.clinicalNotes || "",
      priority: body.priority === "URGENT" ? "URGENT" : "NORMAL",
      status: "ORDERED",
      totalFee: Number(body.fee) || 0,
      requestDate: new Date(),
      items: [
        {
          testName: body.testName,
          testCode: body.testCode || "TEST-01",
          unitPrice: Number(body.fee) || 0,
        },
      ],
    });

    if (Number(body.fee) > 0) {
      await cashRepository.createTransaction({
        transactionNumber: `TXN-LAB-${Date.now().toString().slice(-6)}`,
        transactionType: "INCOME",
        category: "LAB_TEST",
        department: "Laboratory",
        amount: Number(body.fee),
        paymentMethod: "CASH",
        description: `Lab test fee for ${body.testName}`,
        patientId: patientObjectId,
        visitId: visitObjectId,
        createdById: consultantObjectId,
        transactionDate: new Date(),
      });
    }

    return NextResponse.json(
      { message: "Lab order created successfully", labOrder: newOrder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Lab Orders API POST Error]:", error);
    return NextResponse.json(
      { error: "Failed to create lab order." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, action, resultsJson, status, revisionReason, revisionComment } = body;

    if (!id) {
      return NextResponse.json({ error: "Lab Order ID is required." }, { status: 400 });
    }

    await connectToProductionDatabase();

    let updatedOrder;
    if (action === "SUBMIT_RESULTS") {
      updatedOrder = await labRepository.updateOrderStatus(id, "REPORT_PREPARED");
      const orderObjectId = new mongoose.Types.ObjectId(id);
      await labRepository.createOrUpdateLabReport({
        labOrderId: orderObjectId,
        currentVersion: 1,
        versions: [
          {
            versionNumber: 1,
            structuredResult: resultsJson || JSON.stringify({ result: "Normal" }),
            summary: "Test completed",
            performedBy: "Lab Technician",
            createdAt: new Date(),
          },
        ],
      });
    } else if (action === "ACCEPT") {
      updatedOrder = await labRepository.updateOrderStatus(id, "ACCEPTED");
    } else if (action === "REVISE") {
      updatedOrder = await labRepository.updateOrderStatus(id, "REVISION_REQUESTED");
      const orderObjectId = new mongoose.Types.ObjectId(id);
      const dummyReportId = new mongoose.Types.ObjectId();
      const dummyConsultantId = new mongoose.Types.ObjectId();
      await labRepository.createRevisionRequest({
        labOrderId: orderObjectId,
        labReportId: dummyReportId,
        consultantId: dummyConsultantId,
        versionTarget: 1,
        reason: revisionReason || "Review requested",
        comment: revisionComment || "",
      });
    } else if (status) {
      updatedOrder = await labRepository.updateOrderStatus(id, status);
    }

    return NextResponse.json(
      { message: "Lab order updated successfully", labOrder: updatedOrder },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Lab Orders API PUT Error]:", error);
    return NextResponse.json(
      { error: "Failed to update lab order." },
      { status: 500 }
    );
  }
}
