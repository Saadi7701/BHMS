import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  return clearAllMockData();
}

export async function DELETE() {
  return clearAllMockData();
}

async function clearAllMockData() {
  try {
    await prisma.$transaction([
      prisma.referralFormMedicine.deleteMany({}),
      prisma.referralForm.deleteMany({}),
      prisma.dischargeFormMedicine.deleteMany({}),
      prisma.dischargeForm.deleteMany({}),
      prisma.admissionForm.deleteMany({}),
      prisma.operationNote.deleteMany({}),
      prisma.doctorNote.deleteMany({}),
      prisma.prescriptionItem.deleteMany({}),
      prisma.prescription.deleteMany({}),
      prisma.labOrder.deleteMany({}),
      prisma.ultrasoundOrder.deleteMany({}),
      prisma.cashTransaction.deleteMany({}),
      prisma.dailyCashClosing.deleteMany({}),
      prisma.patientVisit.deleteMany({}),
      prisma.patient.deleteMany({}),
    ]);

    return NextResponse.json(
      {
        message: "All operational records (patients, visits, orders, lab/ultrasound, hospital forms, cash ledger) cleared successfully.",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Clear Data Error]:", error);
    return NextResponse.json(
      { error: "Failed to purge database records: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}

