import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function setPostgresPasswords() {
  console.log("=================================================");
  console.log("Setting bcrypt password hashes in Supabase PostgreSQL...");
  console.log("=================================================");

  const passwordMap: Record<string, string> = {
    admin: "Admin!2026",
    dr_bilal: "Bilal@1",
    dr_sarah: "Sarah@2",
    receptionist1: "Recep@1",
    lab_tech1: "LabTech",
    pharmacist1: "Pharma1",
    ultrasound_tech1: "UltraS1",
  };

  const users = await prisma.user.findMany();

  for (const user of users) {
    const rawPassword = passwordMap[user.username] || "Pass@12";
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    console.log(`  ✓ Updated password hash for user '${user.username}' -> '${rawPassword}'`);
  }

  console.log("=================================================");
  console.log("All portal user passwords updated successfully in Supabase!");
  console.log("=================================================");
}

setPostgresPasswords()
  .catch((e) => {
    console.error("Error setting passwords:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
