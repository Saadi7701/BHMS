import { NextResponse } from "next/server";
import { hospitalFormsRepository } from "@/repositories/HospitalFormsRepository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || undefined;
    const search = searchParams.get("q") || searchParams.get("search") || undefined;

    const forms = await hospitalFormsRepository.getOperationNotes({ patientId, search });
    return NextResponse.json({ forms }, { status: 200 });
  } catch (error: any) {
    console.error("[Operation Notes GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch operation notes." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.patientId || !body.surgeonName) {
      return NextResponse.json(
        { error: "Patient ID and Surgeon Name are required." },
        { status: 400 }
      );
    }

    const form = await hospitalFormsRepository.createOperationNote(body);
    return NextResponse.json({ message: "Operation note created successfully", form }, { status: 201 });
  } catch (error: any) {
    console.error("[Operation Note POST Error]:", error);
    return NextResponse.json(
      { error: `Failed to create operation note: ${error.message}` },
      { status: 500 }
    );
  }
}
