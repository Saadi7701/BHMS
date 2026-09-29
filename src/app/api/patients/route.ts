import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { patientRepository } from "@/repositories/PatientRepository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

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

    let mrNumber = body.mrNumber || `MR-${Date.now().toString().slice(-6)}`;
    const existing = await patientRepository.findByMrNumber(mrNumber);
    if (existing) {
      mrNumber = `MR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    }

    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const createdBy = adminUser ? adminUser.id : "";

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
      createdBy,
    });

    console.log(`[Supabase PG Success] Patient ${newPatient.fullName} (${newPatient.mrNumber}) saved to PostgreSQL!`);

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
