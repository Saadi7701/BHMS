import {
  PatientRecord,
  VisitRecord,
  LabOrderRecord,
  UltrasoundOrderRecord,
  PrescriptionRecord,
  MedicineRecord,
  CashTransactionRecord,
} from "./mockDataStore";

export async function fetchPatientsFromApi(): Promise<PatientRecord[]> {
  try {
    const res = await fetch("/api/patients");
    if (!res.ok) throw new Error(`API returned status ${res.status}`);
    const data = await res.json();
    if (data.patients && Array.isArray(data.patients)) {
      return data.patients.map((p: any) => ({
        id: p._id || p.id,
        mrNumber: p.mrNumber,
        fullName: p.fullName,
        fatherHusbandName: p.fatherHusbandName || p.fatherOrHusbandName || "",
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        cnic: p.cnic || "",
        address: p.address || "",
        bloodGroup: p.bloodGroup || "UNKNOWN",
        registrationDate: p.registrationDate
          ? new Date(p.registrationDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      }));
    }
    return [];
  } catch (err: any) {
    console.warn("[API Client] Error fetching patients:", err.message);
    return [];
  }
}

export async function createPatientApi(patient: PatientRecord): Promise<boolean> {
  try {
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[API Client Error] Save patient failed:", data.error);
      if (typeof window !== "undefined") {
        alert(`Database Save Error: ${data.error || "Failed to save patient to MongoDB"}`);
      }
      return false;
    }
    console.log("[API Client Success] Patient saved to MongoDB Atlas:", data.patient);
    return true;
  } catch (err: any) {
    console.error("[API Client Error] Save patient exception:", err.message);
    if (typeof window !== "undefined") {
      alert(`Database Network Error: ${err.message}`);
    }
    return false;
  }
}

export async function fetchVisitsFromApi(): Promise<VisitRecord[]> {
  try {
    const res = await fetch("/api/visits");
    if (!res.ok) throw new Error(`API returned status ${res.status}`);
    const data = await res.json();
    if (data.visits && Array.isArray(data.visits)) {
      return data.visits.map((v: any) => ({
        id: v._id || v.id,
        visitNumber: v.visitNumber,
        patientId: v.patientId,
        patientName: v.patientName || "",
        mrNumber: v.mrNumber || "",
        consultantId: v.consultantId,
        consultantName: v.consultantName || "",
        visitType: v.visitType || "OPD",
        destinationType: "OPD",
        department: v.department || "OPD Reception",
        consultationFee: v.consultationFee || v.feeCharged || 0,
        amountReceived: v.amountReceived || v.netCollectedAmount || 0,
        paymentMethod: v.paymentMethod || "CASH",
        status: v.status || "WAITING",
        visitDate: v.visitDate
          ? new Date(v.visitDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        entryInTime: v.arrivalTime
          ? new Date(v.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "10:00 AM",
      }));
    }
    return [];
  } catch (err: any) {
    console.warn("[API Client] Error fetching visits:", err.message);
    return [];
  }
}

export async function createVisitApi(visit: VisitRecord): Promise<boolean> {
  try {
    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visit),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[API Client Error] Create visit failed:", data.error);
      if (typeof window !== "undefined") {
        alert(`Database Visit Error: ${data.error || "Failed to save visit"}`);
      }
      return false;
    }
    console.log("[API Client Success] Visit saved to MongoDB Atlas:", data.visit);
    return true;
  } catch (err: any) {
    console.error("[API Client Error] Create visit exception:", err.message);
    return false;
  }
}

export async function fetchLabOrdersFromApi(): Promise<LabOrderRecord[]> {
  try {
    const res = await fetch("/api/lab-orders");
    if (!res.ok) throw new Error(`API returned status ${res.status}`);
    const data = await res.json();
    if (data.labOrders && Array.isArray(data.labOrders)) {
      return data.labOrders.map((l: any) => ({
        id: l._id || l.id,
        orderNumber: l.orderNumber || l.labOrderNumber || `LAB-${l._id}`,
        patientId: l.patientId,
        patientName: l.patientName || "",
        mrNumber: l.mrNumber || "",
        visitId: l.visitId || "",
        consultantId: l.consultantId || "",
        consultantName: l.consultantName || "Doctor",
        testCategory: l.testCategory || l.category || "General Pathology",
        tests: l.items ? l.items.map((item: any) => item.testName) : [l.testName || "Lab Test"],
        totalFee: l.totalFee || l.fee || 0,
        priority: l.priority || "NORMAL",
        status: l.status || "ORDERED",
        requestDate: l.requestDate
          ? new Date(l.requestDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        currentVersion: l.currentVersion || 1,
      }));
    }
    return [];
  } catch (err: any) {
    console.warn("[API Client] Error fetching lab orders:", err.message);
    return [];
  }
}

export async function createLabOrderApi(order: LabOrderRecord): Promise<boolean> {
  try {
    const res = await fetch("/api/lab-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[API Client Error] Lab order failed:", data.error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error("[API Client Error] Lab order exception:", err.message);
    return false;
  }
}

export async function fetchUltrasoundOrdersFromApi(): Promise<UltrasoundOrderRecord[]> {
  try {
    const res = await fetch("/api/ultrasound-orders");
    if (!res.ok) throw new Error(`API returned status ${res.status}`);
    const data = await res.json();
    if (data.ultrasoundOrders && Array.isArray(data.ultrasoundOrders)) {
      return data.ultrasoundOrders.map((u: any) => ({
        id: u._id || u.id,
        orderNumber: u.orderNumber || u.usOrderNumber || `US-${u._id}`,
        patientId: u.patientId,
        patientName: u.patientName || "",
        mrNumber: u.mrNumber || "",
        visitId: u.visitId || "",
        consultantId: u.consultantId || "",
        consultantName: u.consultantName || "Doctor",
        requestedExam: u.requestedExam || u.scanType || "Ultrasound Scan",
        clinicalIndication: u.clinicalIndication || "",
        totalFee: u.totalFee || u.fee || 0,
        status: u.status || "ORDERED",
        requestDate: u.requestDate
          ? new Date(u.requestDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        currentVersion: u.currentVersion || 1,
      }));
    }
    return [];
  } catch (err: any) {
    console.warn("[API Client] Error fetching ultrasound orders:", err.message);
    return [];
  }
}

export async function createUltrasoundOrderApi(order: UltrasoundOrderRecord): Promise<boolean> {
  try {
    const res = await fetch("/api/ultrasound-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    return res.ok;
  } catch (err: any) {
    console.error("[API Client Error] Ultrasound order exception:", err.message);
    return false;
  }
}

export async function fetchPrescriptionsFromApi(): Promise<PrescriptionRecord[]> {
  try {
    const res = await fetch("/api/prescriptions");
    if (!res.ok) throw new Error(`API returned status ${res.status}`);
    const data = await res.json();
    if (data.prescriptions && Array.isArray(data.prescriptions)) {
      return data.prescriptions.map((p: any) => ({
        id: p._id || p.id,
        patientId: p.patientId,
        patientName: p.patientName || "",
        mrNumber: p.mrNumber || "",
        visitId: p.visitId || "",
        consultantId: p.consultantId || "",
        consultantName: p.consultantName || "Dr. Bilal Ahmad",
        diagnosis: p.diagnosis || "",
        prescriptionDate: p.prescriptionDate
          ? new Date(p.prescriptionDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        items: (p.items || []).map((m: any) => ({
          medicineName: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          route: m.route || "Oral",
          instructions: m.instructions || "",
        })),
        isDispensed: Boolean(p.isDispensed),
      }));
    }
    return [];
  } catch (err: any) {
    console.warn("[API Client] Error fetching prescriptions:", err.message);
    return [];
  }
}

export async function createPrescriptionApi(prescription: PrescriptionRecord): Promise<boolean> {
  try {
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prescription),
    });
    const data = await res.json();
    return res.ok;
  } catch (err: any) {
    console.error("[API Client Error] Create prescription exception:", err.message);
    return false;
  }
}

export async function fetchMedicinesFromApi(): Promise<MedicineRecord[]> {
  try {
    const res = await fetch("/api/medicines");
    if (!res.ok) throw new Error(`API returned status ${res.status}`);
    const data = await res.json();
    if (data.medicines && Array.isArray(data.medicines)) {
      return data.medicines.map((m: any) => ({
        id: m._id || m.id,
        genericName: m.genericName || "",
        brandName: m.brandName || m.name || "",
        category: m.category || "Tablet",
        purchasePrice: m.purchasePrice || 0,
        salePrice: m.salePrice || m.unitPrice || 0,
        availableQty: m.availableQuantity || m.totalStockQuantity || 0,
        reorderLevel: m.reorderLevel || 10,
        batchNumber: m.batches && m.batches.length > 0 ? m.batches[0].batchNumber : "BATCH-01",
        expiryDate: "2027-12-31",
      }));
    }
    return [];
  } catch (err: any) {
    console.warn("[API Client] Error fetching medicines:", err.message);
    return [];
  }
}

export async function fetchCashTransactionsFromApi(): Promise<CashTransactionRecord[]> {
  try {
    const res = await fetch("/api/cash");
    if (!res.ok) throw new Error(`API returned status ${res.status}`);
    const data = await res.json();
    if (data.transactions && Array.isArray(data.transactions)) {
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
    return [];
  } catch (err: any) {
    console.warn("[API Client] Error fetching cash transactions:", err.message);
    return [];
  }
}
