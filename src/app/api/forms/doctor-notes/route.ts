import { NextResponse } from "next/server";
import { hospitalFormsRepository } from "@/repositories/HospitalFormsRepository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || undefined;
    const doctorName = searchParams.get("doctorName") || undefined;
    const search = searchParams.get("q") || searchParams.get("search") || undefined;

    const forms = await hospitalFormsRepository.getDoctorNotes({ patientId, doctorName, search });
    return NextResponse.json({ forms }, { status: 200 });
  } catch (error: any) {
    console.error("[Doctor Notes GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor notes." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.patientId || !body.doctorName || !body.notes) {
      return NextResponse.json(
        { error: "Patient ID, Doctor Name, and Note Content are required." },
        { status: 400 }
      );
    }

    const form = await hospitalFormsRepository.createDoctorNote(body);
    return NextResponse.json({ message: "Doctor note created successfully", form }, { status: 201 });
  } catch (error: any) {
    console.error("[Doctor Note POST Error]:", error);
    return NextResponse.json(
      { error: `Failed to create doctor note: ${error.message}` },
      { status: 500 }
    );
  }
}
