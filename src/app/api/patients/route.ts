import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { patientRepository } from "@/repositories/PatientRepository";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    await connectToProductionDatabase();
    const patients = await patientRepository.searchPatients(query);

    return NextResponse.json({ patients }, { status: 200 });
  } catch (error: any) {
    console.error("[Patients API GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients records." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.fullName || !body.phone) {
      return NextResponse.json(
        { error: "Full Name and Phone are required." },
        { status: 400 }
      );
    }

    await connectToProductionDatabase();

    // Generate unique MR Number if missing or if passed mrNumber already exists
    let mrNumber = body.mrNumber || `MR-${Date.now().toString().slice(-6)}`;
    const existing = await patientRepository.findByMrNumber(mrNumber);
    if (existing) {
      mrNumber = `MR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    }

    const dummyUserObjectId = new mongoose.Types.ObjectId();

    const newPatient = await patientRepository.createPatient({
      mrNumber,
      fullName: body.fullName,
      fatherHusbandName: body.fatherOrHusbandName || body.fatherHusbandName || "",
      age: Number(body.age) || 30,
      gender: body.gender || "MALE",
      phone: body.phone,
      cnic: body.cnic && body.cnic.trim() ? body.cnic.trim() : undefined,
      address: body.address || "",
      bloodGroup: body.bloodGroup || "UNKNOWN",
      createdBy: dummyUserObjectId,
    });

    console.log(`[MongoDB Success] Patient ${newPatient.fullName} (${newPatient.mrNumber}) saved to Atlas!`);

    return NextResponse.json(
      { message: "Patient registered successfully", patient: newPatient },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Patients API POST Error]:", error);
    return NextResponse.json(
      { error: `Failed to create patient record: ${error.message}` },
      { status: 500 }
    );
  }
}
