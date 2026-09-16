import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { userRepository } from "@/repositories/UserRepository";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { userId, username, newPassword } = await req.json();

    if ((!userId && !username) || !newPassword) {
      return NextResponse.json(
        { error: "User ID or Username, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 5) {
      return NextResponse.json(
        { error: "New password must be at least 5 characters long." },
        { status: 400 }
      );
    }

    await connectToProductionDatabase();

    let targetUser = null;
    if (userId) {
      targetUser = await userRepository.findById(userId);
    } else if (username) {
      targetUser = await userRepository.findByUsername(username);
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target portal user account not found in database." },
        { status: 404 }
      );
    }

    // Hash the new password securely using bcrypt with 10 salt rounds
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await userRepository.updatePassword(
      targetUser._id.toString(),
      passwordHash
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user password in database." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Password for portal user '${updatedUser.username}' updated successfully!`,
        user: {
          id: updatedUser._id.toString(),
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Password Change Error]:", error);
    return NextResponse.json(
      { error: "Failed to update portal user password." },
      { status: 500 }
    );
  }
}
