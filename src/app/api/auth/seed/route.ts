import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";

const DEFAULT_ACCOUNTS = [
  {
    username: "admin",
    email: "admin@bilalhospital.com",
    plainPassword: "Admin!2026",
    fullName: "System Administrator",
    role: "ADMIN" as const,
  },
  {
    username: "receptionist1",
    email: "reception@bilalhospital.com",
    plainPassword: "Recep@1",
    fullName: "Ayesha Khan (Head Receptionist)",
    role: "RECEPTIONIST" as const,
  },
  {
    username: "dr_bilal",
    email: "dr.bilal@bilalhospital.com",
    plainPassword: "Bilal@1",
    fullName: "Dr. Bilal Ahmad",
    role: "CONSULTANT" as const,
  },
  {
    username: "dr_sarah",
    email: "dr.sarah@bilalhospital.com",
    plainPassword: "Sarah@2",
    fullName: "Dr. Sarah Fatima",
    role: "CONSULTANT" as const,
  },
  {
    username: "lab_tech1",
    email: "lab@bilalhospital.com",
    plainPassword: "LabTech",
    fullName: "Muhammad Usman (Lab Incharge)",
    role: "LAB_STAFF" as const,
  },
  {
    username: "ultrasound_tech1",
    email: "ultrasound@bilalhospital.com",
    plainPassword: "UltraS1",
    fullName: "Dr. Kamran Raza (Sonologist)",
    role: "ULTRASOUND_STAFF" as const,
  },
  {
    username: "pharmacist1",
    email: "pharmacy@bilalhospital.com",
    plainPassword: "Pharma1",
    fullName: "Zainab Bibi (Chief Pharmacist)",
    role: "PHARMACY_STAFF" as const,
  },
];

export async function GET() {
  return seedDefaultAccounts();
}

export async function POST() {
  return seedDefaultAccounts();
}

async function seedDefaultAccounts() {
  try {
    await connectToProductionDatabase();
    const created: string[] = [];
    const updated: string[] = [];

    for (const acc of DEFAULT_ACCOUNTS) {
      const existing = await UserModel.findOne({ username: acc.username.toLowerCase() });
      if (!existing) {
        const passwordHash = await bcrypt.hash(acc.plainPassword, 10);
        await UserModel.create({
          username: acc.username.toLowerCase(),
          email: acc.email.toLowerCase(),
          passwordHash,
          fullName: acc.fullName,
          role: acc.role,
          isActive: true,
        });
        created.push(acc.username);
      }
    }

    return NextResponse.json(
      {
        message: "Default portal users verification complete.",
        created,
        updated,
        totalAccounts: DEFAULT_ACCOUNTS.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Auto-Seed Error]:", error);
    return NextResponse.json(
      { error: "Failed to seed default portal accounts." },
      { status: 500 }
    );
  }
}
