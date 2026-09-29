import { NextResponse } from "next/server";
import { medicineRepository } from "@/repositories/MedicineRepository";

export async function GET() {
  try {
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

    const brandName = body.brandName || body.name;
    const genericName = body.genericName || brandName;
    const price = Number(body.unitPrice) || Number(body.salePrice) || 15;
    const stock = Number(body.totalStockQuantity) || Number(body.availableQuantity) || 100;

    const newMedicine = await medicineRepository.createMedicine({
      brandName,
      genericName,
      category: body.category || "Tablet",
      manufacturer: body.manufacturer || "General Pharma",
      unitPrice: price,
      purchasePrice: Number(body.purchasePrice) || price * 0.7,
      salePrice: price,
      currentStock: stock,
      availableQuantity: stock,
      minimumStock: Number(body.reorderLevel) || 20,
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

    const updated = await medicineRepository.updateStock(id, Number(quantityPurchased));

    return NextResponse.json(
      { message: "Inventory stock updated successfully", medicine: updated },
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
