import { NextResponse } from "next/server";
import { connectToProductionDatabase } from "@/lib/mongodb";
import { medicineRepository } from "@/repositories/MedicineRepository";
import { MedicineModel } from "@/models/Medicine";

export async function GET() {
  try {
    await connectToProductionDatabase();
    const medicines = await medicineRepository.findAllMedicines();
    return NextResponse.json({ medicines }, { status: 200 });
  } catch (error: any) {
    console.error("[Medicines API GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch pharmacy medicines." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name && !body.brandName) {
      return NextResponse.json(
        { error: "Medicine Brand Name is required." },
        { status: 400 }
      );
    }

    await connectToProductionDatabase();

    const brandName = body.brandName || body.name;
    const genericName = body.genericName || brandName;

    const newMedicine = await medicineRepository.createMedicine({
      brandName,
      genericName,
      category: body.category || "Tablet",
      manufacturer: body.manufacturer || "General Pharma",
      purchasePrice: Number(body.purchasePrice) || Number(body.unitPrice) * 0.7 || 10,
      salePrice: Number(body.unitPrice) || Number(body.salePrice) || 15,
      availableQuantity: Number(body.totalStockQuantity) || Number(body.availableQuantity) || 100,
      reorderLevel: Number(body.reorderLevel) || 20,
    });

    return NextResponse.json(
      { message: "Medicine added to inventory successfully", medicine: newMedicine },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Medicines API POST Error]:", error);
    return NextResponse.json(
      { error: "Failed to create medicine record." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, quantityPurchased } = body;

    if (!id || !quantityPurchased) {
      return NextResponse.json({ error: "Medicine ID and quantity are required." }, { status: 400 });
    }

    await connectToProductionDatabase();
    const med = await medicineRepository.findMedicineById(id);
    if (!med) {
      return NextResponse.json({ error: "Medicine not found." }, { status: 404 });
    }

    med.availableQuantity += Number(quantityPurchased);
    await med.save();

    return NextResponse.json(
      { message: "Inventory stock updated successfully", medicine: med },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Medicines API PUT Error]:", error);
    return NextResponse.json(
      { error: "Failed to update inventory stock." },
      { status: 500 }
    );
  }
}
