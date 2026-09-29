import { prisma } from "../lib/prisma";

export class UserRepository {
  async findByUsername(username: string): Promise<any> {
    const user = await prisma.user.findFirst({
      where: { username: username.toLowerCase().trim() },
    });
    if (!user) return null;
    return { ...user, _id: user.id };
  }

  async findById(id: string): Promise<any> {
    const user = await prisma.user.findFirst({
      where: { OR: [{ id }, { legacyId: id }, { username: id }] },
    });
    if (!user) return null;
    return { ...user, _id: user.id };
  }

  async createUser(userData: any): Promise<any> {
    const user = await prisma.user.create({
      data: {
        username: userData.username.toLowerCase().trim(),
        email: userData.email ? userData.email.toLowerCase().trim() : `${userData.username}@bilalhospital.com`,
        passwordHash: userData.passwordHash,
        fullName: userData.fullName,
        role: userData.role || "ADMIN",
        isActive: userData.isActive !== undefined ? userData.isActive : true,
      },
    });
    return { ...user, _id: user.id };
  }

  async findAllActive(): Promise<any[]> {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return users.map((u) => ({ ...u, _id: u.id }));
  }

  async findAll(): Promise<any[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return users.map((u) => ({ ...u, _id: u.id }));
  }

  async updatePassword(userId: string, passwordHash: string): Promise<any> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { ...user, _id: user.id };
  }

  async updateUser(userId: string, updateData: any): Promise<any> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    return { ...user, _id: user.id };
  }
}

export const userRepository = new UserRepository();
