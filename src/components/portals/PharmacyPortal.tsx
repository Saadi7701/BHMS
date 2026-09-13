import React, { useState } from "react";
import {
  Pill,
  Package,
  AlertTriangle,
  History,
  CheckCircle2,
  Plus,
  DollarSign,
  ShoppingCart,
  ShieldAlert,
} from "lucide-react";
import { StatCard } from "../ui/StatCard";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import {
  PrescriptionRecord,
  MedicineRecord,
  CashTransactionRecord,
} from "../../lib/mockDataStore";

interface PharmacyPortalProps {
  activeTab: string;
  prescriptions: PrescriptionRecord[];
  medicines: MedicineRecord[];
  onDispensePrescription: (
    prescriptionId: string,
    transaction: CashTransactionRecord
  ) => void;
  onAddMedicineBatch: (medicine: MedicineRecord) => void;
}

export const PharmacyPortal: React.FC<PharmacyPortalProps> = ({
  activeTab,
  prescriptions,
  medicines,
  onDispensePrescription,
  onAddMedicineBatch,
}) => {
  const [selectedRxForDispense, setSelectedRxForDispense] =
    useState<PrescriptionRecord | null>(null);

  const [newMed, setNewMed] = useState({
    genericName: "Paracetamol",
    brandName: "Panadol 500mg",
    category: "Analgesic",
    purchasePrice: "2.5",
    salePrice: "4.0",
    availableQty: "500",
    batchNumber: "PN-992",
    expiryDate: "2028-09-30",
  });

  const lowStockMeds = medicines.filter((m) => m.availableQty <= m.reorderLevel);
  const expiringMeds = medicines.filter(
    (m) => new Date(m.expiryDate) <= new Date("2026-12-31")
  );

  const handleDispenseSubmit = () => {
    if (!selectedRxForDispense) return;

    const totalAmt = selectedRxForDispense.items.length * 540;

    const newLedgerTxn: CashTransactionRecord = {
      id: `txn-${Date.now()}`,
      transactionNumber: `TXN-2026-${String(Date.now()).slice(-4)}`,
      transactionType: "INCOME",
      category: "Pharmacy Sale",
      department: "Pharmacy",
      amount: totalAmt,
      paymentMethod: "CASH",
      description: `Prescription Medicine Sale - ${selectedRxForDispense.patientName} (${selectedRxForDispense.mrNumber})`,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      patientName: selectedRxForDispense.patientName,
      mrNumber: selectedRxForDispense.mrNumber,
      createdBy: "Zainab Bibi (Pharmacist)",
    };

    onDispensePrescription(selectedRxForDispense.id, newLedgerTxn);
    setSelectedRxForDispense(null);
    alert("Medicines dispensed successfully! Stock deducted & Cash Ledger entry recorded.");
  };

  const handleAddBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const createdMed: MedicineRecord = {
      id: `med-${Date.now()}`,
      genericName: newMed.genericName,
      brandName: newMed.brandName,
      category: newMed.category,
      purchasePrice: parseFloat(newMed.purchasePrice) || 5,
      salePrice: parseFloat(newMed.salePrice) || 8,
      availableQty: parseInt(newMed.availableQty) || 100,
      reorderLevel: 50,
      batchNumber: newMed.batchNumber,
      expiryDate: newMed.expiryDate,
    };
    onAddMedicineBatch(createdMed);
    alert("New medicine stock batch added successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-cyan-900 via-slate-900 to-slate-900 p-6 rounded-2xl border border-cyan-800/40 shadow-lg text-white">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Pill className="w-4 h-4" />
            <span>Hospital Pharmacy & FIFO Inventory</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Prescription Dispensing & Stock Management
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Automated digital prescription queue, batch stock deduction, and automatic cash ledger transaction generation.
          </p>
        </div>
      </div>

      {activeTab === "queue" && (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Prescriptions Queue"
          value={prescriptions.filter((p) => !p.isDispensed).length}
          subtitle="Awaiting Dispensing"
          icon={Pill}
          iconBg="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
        />
        <StatCard
          title="Total Dispensed Today"
          value={prescriptions.filter((p) => p.isDispensed).length}
          subtitle="Completed Pharmacy Sales"
          icon={CheckCircle2}
          iconBg="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Low Stock Warning"
          value={lowStockMeds.length}
          subtitle="Below Reorder Threshold"
          icon={AlertTriangle}
          iconBg="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        />
        <StatCard
          title="Near Expiry Batches"
          value={expiringMeds.length}
          subtitle="Expiring Soon"
          icon={ShieldAlert}
          iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Alerts Row */}
      {lowStockMeds.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>CRITICAL INVENTORY ALERT: Low Stock Detected</span>
          </div>
          {lowStockMeds.map((med) => (
            <div key={med.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
              <span className="font-bold">{med.brandName} ({med.genericName})</span>
              <span className="font-mono font-bold">Qty Remaining: <span className="text-rose-500">{med.availableQty}</span> (Reorder Level: {med.reorderLevel})</span>
            </div>
          ))}
        </div>
      )}

      {/* Prescriptions Queue Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Pill className="w-4 h-4 text-cyan-500" />
            <span>Digital Prescriptions Queue (Dispatched from Clinics)</span>
          </h3>
          <span className="text-xs text-slate-500">
            {prescriptions.length} Total Prescriptions
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Rx Date/Time</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Consultant</th>
                <th className="py-3 px-4">Diagnosis</th>
                <th className="py-3 px-4">Prescribed Medicines</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {prescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {rx.prescriptionDate}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {rx.patientName}
                    <span className="block text-[11px] font-mono text-slate-400">
                      {rx.mrNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {rx.consultantName}
                  </td>
                  <td className="py-3 px-4 font-semibold text-brand-600">
                    {rx.diagnosis}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {rx.items.map((i) => i.medicineName).join(", ")}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={rx.isDispensed ? "success" : "warning"}>
                      {rx.isDispensed ? "DISPENSED" : "PENDING"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="px-3 py-1.5 rounded-lg bg-cyan-600/10 text-cyan-600 font-bold text-xs"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* VIEW: DISPENSE */}
      {activeTab === "dispense" && (
        <div className="space-y-6">
          {!selectedRxForDispense ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Select Pending Prescription to Dispense
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase border-b">
                      <th className="py-2 px-3">Patient Name</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Consultant</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {prescriptions.filter(p => !p.isDispensed).map((rx) => (
                      <tr key={rx.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-bold">{rx.patientName}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{rx.prescriptionDate}</td>
                        <td className="py-2 px-3">{rx.consultantName}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => setSelectedRxForDispense(rx)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-bold text-xs shadow-sm"
                          >
                            Select for Dispensing
                          </button>
                        </td>
                      </tr>
                    ))}
                    {prescriptions.filter(p => !p.isDispensed).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500">No pending prescriptions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b pb-2">
              Dispense Prescription & Record Sale - {selectedRxForDispense.patientName} ({selectedRxForDispense.mrNumber})
            </h3>
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-medium">
                Automated FIFO Batch Deduction: Stock will be deducted from active batches and sale cash will post to Central Cash Ledger.
              </div>

              <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Prescribed Medicines List:
                </h4>
                {selectedRxForDispense.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-slate-200 dark:border-slate-800 last:border-0">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{item.medicineName}</span>
                      <span className="block text-[11px] text-slate-500">{item.dosage} • {item.instructions}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Rs. 540</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Total Pharmacy Bill:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">
                  Rs. {selectedRxForDispense.items.length * 540}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedRxForDispense(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispenseSubmit}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Confirm Dispensing & Log Cash Sale
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* VIEW: INVENTORY */}
      {activeTab === "inventory" && (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-500" />
            <span>Medicine Inventory & Batch Stock Table</span>
          </h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Brand Name</th>
                <th className="py-3 px-4">Generic Name</th>
                <th className="py-3 px-4">Batch No</th>
                <th className="py-3 px-4">Purchase / Sale Price</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {medicines.map((med) => (
                <tr key={med.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {med.brandName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {med.genericName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {med.batchNumber}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    Rs. {med.purchasePrice} / <span className="text-emerald-600">Rs. {med.salePrice}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={med.availableQty <= med.reorderLevel ? "text-rose-500" : "text-slate-900 dark:text-white"}>
                      {med.availableQty} Units
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {med.expiryDate}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={med.availableQty <= med.reorderLevel ? "danger" : "success"}>
                      {med.availableQty <= med.reorderLevel ? "LOW STOCK" : "IN STOCK"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* VIEW: ADD STOCK */}
      {activeTab === "add_stock" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-500" />
            Add New Medicine Stock Batch
          </h3>
          <form onSubmit={handleAddBatchSubmit} className="space-y-4 text-xs max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={newMed.brandName}
                  onChange={(e) => setNewMed({ ...newMed, brandName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Generic Name *</label>
                <input
                  type="text"
                  required
                  value={newMed.genericName}
                  onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Batch Number *</label>
                <input
                  type="text"
                  required
                  value={newMed.batchNumber}
                  onChange={(e) => setNewMed({ ...newMed, batchNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={newMed.expiryDate}
                  onChange={(e) => setNewMed({ ...newMed, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase Price (Rs.)</label>
                <input
                  type="number"
                  value={newMed.purchasePrice}
                  onChange={(e) => setNewMed({ ...newMed, purchasePrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sale Price (Rs.)</label>
                <input
                  type="number"
                  value={newMed.salePrice}
                  onChange={(e) => setNewMed({ ...newMed, salePrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Available Qty (Units) *</label>
                <input
                  type="number"
                  required
                  value={newMed.availableQty}
                  onChange={(e) => setNewMed({ ...newMed, availableQty: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-6">
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              >
                Save Medicine Batch
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
