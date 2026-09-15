import {
  PatientRecord,
  VisitRecord,
  LabOrderRecord,
  UltrasoundOrderRecord,
  PrescriptionRecord,
  MedicineRecord,
  CashTransactionRecord,
  INITIAL_PATIENTS,
  INITIAL_VISITS,
  INITIAL_LAB_ORDERS,
  INITIAL_ULTRASOUND_ORDERS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_MEDICINES,
  INITIAL_CASH_TRANSACTIONS,
} from "./mockDataStore";

export async function fetchPatientsFromApi(): Promise<PatientRecord[]> {
  try {
    const res = await fetch("/api/patients");
    if (!res.ok) throw new Error("API returned non-200 status");
    const data = await res.json();
    if (data.patients && data.patients.length > 0) {
      return data.patients.map((p: any) => ({
        id: p._id || p.id,
        mrNumber: p.mrNumber,
        fullName: p.fullName,
        fatherOrHusbandName: p.fatherOrHusbandName || "",
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        cnic: p.cnic || "",
        address: p.address || "",
        bloodGroup: p.bloodGroup || "UNKNOWN",
        registrationDate: p.registrationDate ? new Date(p.registrationDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      }));
    }
    return INITIAL_PATIENTS;
  } catch (err) {
    console.warn("[API Client] Using initial patient records:", err);
    return INITIAL_PATIENTS;
  }
}

export async function createPatientApi(patient: PatientRecord): Promise<boolean> {
  try {
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient),
    });
    return res.ok;
  } catch (err) {
    console.warn("[API Client] Error saving patient to API:", err);
    return false;
  }
}

export async function fetchVisitsFromApi(): Promise<VisitRecord[]> {
  try {
    const res = await fetch("/api/visits");
    if (!res.ok) throw new Error("API returned non-200 status");
    const data = await res.json();
    if (data.visits && data.visits.length > 0) {
      return data.visits.map((v: any) => ({
        id: v._id || v.id,
        visitNumber: v.visitNumber,
        patientId: v.patientId,
        patientName: v.patientName,
        mrNumber: v.mrNumber,
        consultantId: v.consultantId,
        consultantName: v.consultantName,
        visitType: v.visitType,
        feeCharged: v.feeCharged,
        discountAmount: v.discountAmount,
        netCollectedAmount: v.netCollectedAmount,
        status: v.status,
        visitDate: v.visitDate ? new Date(v.visitDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        entryInTime: v.entryInTime || "10:00 AM",
      }));
    }
    return INITIAL_VISITS;
  } catch (err) {
    console.warn("[API Client] Using initial visit records:", err);
    return INITIAL_VISITS;
  }
}

export async function createVisitApi(visit: VisitRecord): Promise<boolean> {
  try {
    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visit),
    });
    return res.ok;
  } catch (err) {
    console.warn("[API Client] Error creating visit via API:", err);
    return false;
  }
}

export async function fetchLabOrdersFromApi(): Promise<LabOrderRecord[]> {
  try {
    const res = await fetch("/api/lab-orders");
    if (!res.ok) throw new Error("API returned non-200 status");
    const data = await res.json();
    if (data.labOrders && data.labOrders.length > 0) {
      return data.labOrders.map((l: any) => ({
        id: l._id || l.id,
        labOrderNumber: l.labOrderNumber,
        patientId: l.patientId,
        patientName: l.patientName,
        mrNumber: l.mrNumber,
        testName: l.testName,
        category: l.category,
        specimenType: l.specimenType,
        fee: l.fee,
        status: l.status,
        orderedBy: l.orderedBy,
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      }));
    }
    return INITIAL_LAB_ORDERS;
  } catch (err) {
    console.warn("[API Client] Using initial lab orders:", err);
    return INITIAL_LAB_ORDERS;
  }
}

export async function createLabOrderApi(order: LabOrderRecord): Promise<boolean> {
  try {
    const res = await fetch("/api/lab-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return res.ok;
  } catch (err) {
    console.warn("[API Client] Error creating lab order via API:", err);
    return false;
  }
}

export async function fetchUltrasoundOrdersFromApi(): Promise<UltrasoundOrderRecord[]> {
  try {
    const res = await fetch("/api/ultrasound-orders");
    if (!res.ok) throw new Error("API returned non-200 status");
    const data = await res.json();
    if (data.ultrasoundOrders && data.ultrasoundOrders.length > 0) {
      return data.ultrasoundOrders.map((u: any) => ({
        id: u._id || u.id,
        usOrderNumber: u.usOrderNumber,
        patientId: u.patientId,
        patientName: u.patientName,
        mrNumber: u.mrNumber,
        scanType: u.scanType,
        clinicalIndication: u.clinicalIndication,
        fee: u.fee,
        status: u.status,
        orderedBy: u.orderedBy,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      }));
    }
    return INITIAL_ULTRASOUND_ORDERS;
  } catch (err) {
    console.warn("[API Client] Using initial ultrasound orders:", err);
    return INITIAL_ULTRASOUND_ORDERS;
  }
}

export async function createUltrasoundOrderApi(order: UltrasoundOrderRecord): Promise<boolean> {
  try {
    const res = await fetch("/api/ultrasound-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return res.ok;
  } catch (err) {
    console.warn("[API Client] Error creating ultrasound order via API:", err);
    return false;
  }
}

export async function fetchPrescriptionsFromApi(): Promise<PrescriptionRecord[]> {
  try {
    const res = await fetch("/api/prescriptions");
    if (!res.ok) throw new Error("API returned non-200 status");
    const data = await res.json();
    if (data.prescriptions && data.prescriptions.length > 0) {
      return data.prescriptions.map((p: any) => ({
        id: p._id || p.id,
        rxNumber: p.rxNumber,
        patientId: p.patientId,
        patientName: p.patientName,
        mrNumber: p.mrNumber,
        consultantId: p.consultantId,
        consultantName: p.consultantName,
        diagnosis: p.diagnosis,
        medicines: p.medicines || [],
        instructions: p.instructions,
        status: p.status,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      }));
    }
    return INITIAL_PRESCRIPTIONS;
  } catch (err) {
    console.warn("[API Client] Using initial prescriptions:", err);
    return INITIAL_PRESCRIPTIONS;
  }
}

export async function createPrescriptionApi(prescription: PrescriptionRecord): Promise<boolean> {
  try {
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prescription),
    });
    return res.ok;
  } catch (err) {
    console.warn("[API Client] Error creating prescription via API:", err);
    return false;
  }
}

export async function fetchMedicinesFromApi(): Promise<MedicineRecord[]> {
  try {
    const res = await fetch("/api/medicines");
    if (!res.ok) throw new Error("API returned non-200 status");
    const data = await res.json();
    if (data.medicines && data.medicines.length > 0) {
      return data.medicines.map((m: any) => ({
        id: m._id || m.id,
        name: m.name,
        genericName: m.genericName,
        category: m.category,
        totalStockQuantity: m.totalStockQuantity,
        unitPrice: m.unitPrice,
        reorderLevel: m.reorderLevel,
        manufacturer: m.manufacturer,
      }));
    }
    return INITIAL_MEDICINES;
  } catch (err) {
    console.warn("[API Client] Using initial medicines:", err);
    return INITIAL_MEDICINES;
  }
}

export async function fetchCashTransactionsFromApi(): Promise<CashTransactionRecord[]> {
  try {
    const res = await fetch("/api/cash");
    if (!res.ok) throw new Error("API returned non-200 status");
    const data = await res.json();
    if (data.transactions && data.transactions.length > 0) {
      return data.transactions.map((t: any) => ({
        id: t._id || t.id,
        transactionNumber: t.transactionNumber || t.receiptNumber || `TXN-${Date.now()}`,
        transactionType: t.transactionType || "INCOME",
        category: t.category,
        department: t.department || "General",
        amount: t.amount,
        paymentMethod: t.paymentMethod || t.paymentMode || "CASH",
        description: t.description || `Cash transaction for ${t.category}`,
        date: t.transactionDate ? new Date(t.transactionDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        time: t.transactionDate ? new Date(t.transactionDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "12:00 PM",
        patientName: t.patientName,
        mrNumber: t.mrNumber,
        createdBy: t.enteredBy || t.createdBy || "Staff",
      }));
    }
    return INITIAL_CASH_TRANSACTIONS;
  } catch (err) {
    console.warn("[API Client] Using initial cash transactions:", err);
    return INITIAL_CASH_TRANSACTIONS;
  }
}
