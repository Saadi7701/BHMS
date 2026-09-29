import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: {
          status: "connected",
          provider: "PostgreSQL (Supabase)",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Database health check failed: " + error.message,
      },
      { status: 500 }
    );
  }
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}

