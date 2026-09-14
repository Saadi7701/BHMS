import { connectToProductionDatabase } from "../lib/mongodb";
import { MedicineModel, IMedicine } from "../models/Medicine";
import { InventoryTransactionModel, IInventoryTransaction } from "../models/InventoryTransaction";
import { PharmacyDispensingModel, IPharmacyDispensing } from "../models/PharmacyDispensing";

export class MedicineRepository {
  async findAllMedicines(): Promise<IMedicine[]> {
    await connectToProductionDatabase();
    return MedicineModel.find().sort({ brandName: 1 }).exec();
  }

  async findMedicineById(id: string): Promise<IMedicine | null> {
    await connectToProductionDatabase();
    return MedicineModel.findById(id).exec();
  }

  async createMedicine(medicineData: Partial<IMedicine>): Promise<IMedicine> {
    await connectToProductionDatabase();
    const med = new MedicineModel(medicineData);
    return med.save();
  }

  async recordInventoryTransaction(txData: Partial<IInventoryTransaction>): Promise<IInventoryTransaction> {
    await connectToProductionDatabase();
    const tx = new InventoryTransactionModel(txData);
    return tx.save();
  }

  async recordDispensing(dispData: Partial<IPharmacyDispensing>): Promise<IPharmacyDispensing> {
    await connectToProductionDatabase();
    const disp = new PharmacyDispensingModel(dispData);
    return disp.save();
  }
}

export const medicineRepository = new MedicineRepository();
