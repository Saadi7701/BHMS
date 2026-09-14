import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const mongooseInstance = await connectToProductionDatabase();
    const isDbConnected = mongooseInstance.connection.readyState === 1;

    return NextResponse.json(
      {
        status: isDbConnected ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: {
          status: isDbConnected ? "connected" : "disconnected",
          provider: "MongoDB Production Cluster",
        },
      },
      { status: isDbConnected ? 200 : 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Database health check failed",
      },
      { status: 500 }
    );
  }
}
