import { NextResponse } from "next/server";
import { hospitalFormsRepository } from "@/repositories/HospitalFormsRepository";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const form = await hospitalFormsRepository.getReferralFormById(params.id);
    if (!form) {
      return NextResponse.json({ error: "Referral form not found" }, { status: 404 });
    }
    return NextResponse.json({ form }, { status: 200 });
  } catch (error: any) {
    console.error("[Referral Form GET ID Error]:", error);
    return NextResponse.json({ error: "Failed to fetch referral form" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await hospitalFormsRepository.updateReferralForm(params.id, body);
    return NextResponse.json({ message: "Referral form updated successfully", form: updated }, { status: 200 });
  } catch (error: any) {
    console.error("[Referral Form PUT Error]:", error);
    return NextResponse.json({ error: `Failed to update referral form: ${error.message}` }, { status: 500 });
  }
}
