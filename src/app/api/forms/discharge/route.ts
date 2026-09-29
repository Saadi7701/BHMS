import { NextResponse } from "next/server";
import { hospitalFormsRepository } from "@/repositories/HospitalFormsRepository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || undefined;
    const search = searchParams.get("q") || searchParams.get("search") || undefined;

    const forms = await hospitalFormsRepository.getDischargeForms({ patientId, search });
    return NextResponse.json({ forms }, { status: 200 });
  } catch (error: any) {
    console.error("[Discharge Forms GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch discharge forms." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.patientId) {
      return NextResponse.json(
        { error: "Patient ID is required." },
        { status: 400 }
      );
    }

    const form = await hospitalFormsRepository.createDischargeForm(body);
    return NextResponse.json({ message: "Discharge form created successfully", form }, { status: 201 });
  } catch (error: any) {
    console.error("[Discharge Form POST Error]:", error);
    return NextResponse.json(
      { error: `Failed to create discharge form: ${error.message}` },
      { status: 500 }
    );
  }
}
