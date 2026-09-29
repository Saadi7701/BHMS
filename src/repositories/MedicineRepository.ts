import { prisma } from "../lib/prisma";

export class MedicineRepository {
  async findAllMedicines(): Promise<any[]> {
    const medicines = await prisma.medicine.findMany({
      orderBy: { brandName: "asc" },
    });
    return medicines.map((m) => ({ ...m, _id: m.id }));
  }

  async findMedicineById(id: string): Promise<any | null> {
    const med = await prisma.medicine.findFirst({
      where: { OR: [{ id }, { legacyId: id }] },
    });
    if (!med) return null;
    return { ...med, _id: med.id };
  }

  async findMedicineByName(brandName: string): Promise<any | null> {
    const med = await prisma.medicine.findFirst({
      where: { brandName: { contains: brandName, mode: "insensitive" } },
    });
    if (!med) return null;
    return { ...med, _id: med.id };
  }

  async createMedicine(medicineData: any): Promise<any> {
    const med = await prisma.medicine.create({
      data: {
        brandName: medicineData.brandName.trim(),
        genericName: medicineData.genericName || null,
        category: medicineData.category || "General",
        dosageForm: medicineData.dosageForm || "Tablet",
        strength: medicineData.strength || null,
        unitPrice: Number(medicineData.unitPrice || 0),
        currentStock: Number(medicineData.currentStock || 0),
        minimumStock: Number(medicineData.minimumStock || 10),
        manufacturer: medicineData.manufacturer || null,
        batchNumber: medicineData.batchNumber || null,
        expiryDate: medicineData.expiryDate ? new Date(medicineData.expiryDate) : null,
        isActive: medicineData.isActive !== undefined ? medicineData.isActive : true,
      },
    });
    return { ...med, _id: med.id };
  }

  async updateMedicine(id: string, updateData: any): Promise<any | null> {
    const existing = await prisma.medicine.findFirst({
      where: { OR: [{ id }, { legacyId: id }] },
    });
    if (!existing) return null;

    const updated = await prisma.medicine.update({
      where: { id: existing.id },
      data: updateData,
    });
    return { ...updated, _id: updated.id };
  }

  async updateStock(id: string, quantity: number): Promise<any | null> {
    const existing = await prisma.medicine.findFirst({
      where: { OR: [{ id }, { legacyId: id }] },
    });
    if (!existing) return null;

    const updated = await prisma.medicine.update({
      where: { id: existing.id },
      data: { currentStock: existing.currentStock + quantity },
    });
    return { ...updated, _id: updated.id };
  }

  async recordInventoryTransaction(txData: any): Promise<any> {
    let medicineId = txData.medicineId ? txData.medicineId.toString() : "";
    const medObj = await prisma.medicine.findFirst({
      where: { OR: [{ id: medicineId }, { legacyId: medicineId }] },
    });
    if (medObj) medicineId = medObj.id;

    let performedById: string | null = null;
    if (txData.performedById) {
      const userStr = txData.performedById.toString();
      const userObj = await prisma.user.findFirst({
        where: { OR: [{ id: userStr }, { legacyId: userStr }] },
      });
      if (userObj) performedById = userObj.id;
    }

    const tx = await prisma.inventoryTransaction.create({
      data: {
        medicineId,
        transactionType: txData.transactionType || "PURCHASE",
        quantity: Number(txData.quantity || 0),
        quantityBefore: Number(txData.quantityBefore || 0),
        quantityAfter: Number(txData.quantityAfter || 0),
        unitCost: Number(txData.unitCost || 0),
        totalCost: Number(txData.totalCost || 0),
        reason: txData.reason || null,
        batchNumber: txData.batchNumber || null,
        supplierName: txData.supplierName || null,
        performedById,
      },
    });
    return { ...tx, _id: tx.id };
  }

  async recordDispensing(dispData: any): Promise<any> {
    let prescriptionId: string | null = null;
    if (dispData.prescriptionId) {
      const pStr = dispData.prescriptionId.toString();
      const prescObj = await prisma.prescription.findFirst({
        where: { OR: [{ id: pStr }, { legacyId: pStr }] },
      });
      if (prescObj) prescriptionId = prescObj.id;
    }

    let patientId: string | null = null;
    if (dispData.patientId) {
      const pStr = dispData.patientId.toString();
      const patientObj = await prisma.patient.findFirst({
        where: { OR: [{ id: pStr }, { legacyId: pStr }] },
      });
      if (patientObj) patientId = patientObj.id;
    }

    let dispensedById: string | null = null;
    if (dispData.dispensedById) {
      const uStr = dispData.dispensedById.toString();
      const userObj = await prisma.user.findFirst({
        where: { OR: [{ id: uStr }, { legacyId: uStr }] },
      });
      if (userObj) dispensedById = userObj.id;
    }

    const disp = await prisma.pharmacyDispensing.create({
      data: {
        prescriptionId,
        patientId,
        patientName: dispData.patientName || "Patient",
        dispensedById,
        dispensedByName: dispData.dispensedByName || "Pharmacist",
        totalAmount: Number(dispData.totalAmount || 0),
        paymentStatus: dispData.paymentStatus || "PAID",
        notes: dispData.notes || null,
        items: {
          create: (dispData.items || []).map((item: any) => ({
            medicineId: item.medicineId || null,
            medicineName: item.medicineName || "Unknown",
            quantity: Number(item.quantity || 0),
            unitPrice: Number(item.unitPrice || 0),
            totalPrice: Number(item.totalPrice || 0),
            batchNumber: item.batchNumber || null,
          })),
        },
      },
      include: { items: true },
    });
    return { ...disp, _id: disp.id };
  }

  async findDispensingByPatient(patientId: string): Promise<any[]> {
    const patientObj = await prisma.patient.findFirst({
      where: { OR: [{ id: patientId }, { legacyId: patientId }] },
    });
    const targetId = patientObj ? patientObj.id : patientId;

    const records = await prisma.pharmacyDispensing.findMany({
      where: { patientId: targetId },
      include: { items: true },
      orderBy: { dispensedAt: "desc" },
    });
    return records.map((r) => ({ ...r, _id: r.id }));
  }
}

export const medicineRepository = new MedicineRepository();
