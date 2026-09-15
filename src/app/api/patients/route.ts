import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { patientRepository } from "@/repositories/PatientRepository";

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

    if (!body.mrNumber || !body.fullName || !body.phone) {
      return NextResponse.json(
        { error: "MR Number, Full Name, and Phone are required." },
        { status: 400 }
      );
    }

    await connectToProductionDatabase();

    const existing = await patientRepository.findByMrNumber(body.mrNumber);
    if (existing) {
      return NextResponse.json(
        { error: `Patient with MR Number ${body.mrNumber} already exists.` },
        { status: 400 }
      );
    }

    const newPatient = await patientRepository.createPatient({
      mrNumber: body.mrNumber,
      fullName: body.fullName,
      fatherHusbandName: body.fatherOrHusbandName || body.fatherHusbandName || "",
      age: Number(body.age) || 0,
      gender: body.gender || "MALE",
      phone: body.phone,
      cnic: body.cnic || undefined,
      address: body.address || "",
      bloodGroup: body.bloodGroup || "UNKNOWN",
    });

    return NextResponse.json(
      { message: "Patient registered successfully", patient: newPatient },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Patients API POST Error]:", error);
    return NextResponse.json(
      { error: "Failed to create patient record." },
      { status: 500 }
    );
  }
}
