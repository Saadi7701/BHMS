import { connectToProductionDatabase } from "../lib/mongodb";
import { UserModel, IUser } from "../models/User";

export class UserRepository {
  async findByUsername(username: string): Promise<IUser | null> {
    await connectToProductionDatabase();
    return UserModel.findOne({ username: username.toLowerCase().trim() }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    await connectToProductionDatabase();
    return UserModel.findById(id).exec();
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    await connectToProductionDatabase();
    const user = new UserModel(userData);
    return user.save();
  }

  async findAllActive(): Promise<IUser[]> {
    await connectToProductionDatabase();
    return UserModel.find({ isActive: true }).exec();
  }

  async findAll(): Promise<IUser[]> {
    await connectToProductionDatabase();
    return UserModel.find({}).sort({ createdAt: -1 }).exec();
  }

  async updatePassword(userId: string, passwordHash: string): Promise<IUser | null> {
    await connectToProductionDatabase();
    return UserModel.findByIdAndUpdate(
      userId,
      { passwordHash },
      { new: true }
    ).exec();
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    await connectToProductionDatabase();
    return UserModel.findByIdAndUpdate(
      userId,
      { ...updateData },
      { new: true }
    ).exec();
  }
}

export const userRepository = new UserRepository();

