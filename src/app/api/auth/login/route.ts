import { NextResponse } from "next/server";
import { userRepository } from "@/repositories/UserRepository";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { roleToPortal } from "@/lib/authSession";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const user = await userRepository.findByUsername(username);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is disabled. Please contact system administrator." },
        { status: 403 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const portal = roleToPortal(user.role);

    // For consultants, look up their real Consultant record UUID so the portal
    // can filter the waiting queue correctly using the database ID.
    let consultantId: string | undefined;
    let consultantDbId: string | undefined;
    if (user.role === "CONSULTANT") {
      const consultantRecord = await prisma.consultant.findFirst({
        where: { userId: user._id.toString() },
      });
      if (consultantRecord) {
        consultantDbId = consultantRecord.id;
      }
      // Legacy frontend IDs for backwards compat
      if (user.username === "dr_bilal") consultantId = "doc-1";
      else if (user.username === "dr_sarah") consultantId = "doc-2";
      else consultantId = consultantDbId;
    }

    return NextResponse.json(
      {
        message: "Login successful",
        token: `token-${user._id}-${Date.now()}`,
        user: {
          id: user._id.toString(),
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          portal,
          consultantId,
          consultantDbId,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Auth API Error] Login failed:", error);
    return NextResponse.json(
      { error: "Authentication system error. Please try again." },
      { status: 500 }
    );
  }
}
