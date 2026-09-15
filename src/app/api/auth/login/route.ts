import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { userRepository } from "@/repositories/UserRepository";
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

    await connectToProductionDatabase();

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
          consultantId: user.username === "dr_bilal" ? "doc-1" : user.username === "dr_sarah" ? "doc-2" : undefined,
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
