"use client";

import React, { useState } from "react";
import { Navbar, RolePortal } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { AdminPortal } from "../components/portals/AdminPortal";
import { ReceptionistPortal } from "../components/portals/ReceptionistPortal";
import { ConsultantPortal } from "../components/portals/ConsultantPortal";
import { LabPortal } from "../components/portals/LabPortal";
import { UltrasoundPortal } from "../components/portals/UltrasoundPortal";
import { PharmacyPortal } from "../components/portals/PharmacyPortal";

import {
  INITIAL_PATIENTS,
  INITIAL_VISITS,
  INITIAL_ADMISSIONS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_LAB_ORDERS,
  INITIAL_ULTRASOUND_ORDERS,
  INITIAL_MEDICINES,
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_CONSULTANTS,
  PatientRecord,
  VisitRecord,
  AdmissionRecord,
  PrescriptionRecord,
  LabOrderRecord,
  UltrasoundOrderRecord,
  MedicineRecord,
  CashTransactionRecord,
  ConsultantUser,
} from "../lib/mockDataStore";

export default function Home() {
  const [activePortal, setActivePortal] = useState<RolePortal>("RECEPTIONIST");
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Shared Master Reactive Data State
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [visits, setVisits] = useState<VisitRecord[]>(INITIAL_VISITS);
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>(INITIAL_ADMISSIONS);
  const [prescriptions, setPrescriptions] =
    useState<PrescriptionRecord[]>(INITIAL_PRESCRIPTIONS);
  const [labOrders, setLabOrders] = useState<LabOrderRecord[]>(INITIAL_LAB_ORDERS);
  const [ultrasoundOrders, setUltrasoundOrders] = useState<
    UltrasoundOrderRecord[]
  >(INITIAL_ULTRASOUND_ORDERS);
  const [medicines, setMedicines] = useState<MedicineRecord[]>(INITIAL_MEDICINES);
  const [cashTransactions, setCashTransactions] = useState<
    CashTransactionRecord[]
  >(INITIAL_CASH_TRANSACTIONS);
  const [consultants, setConsultants] = useState<ConsultantUser[]>(INITIAL_CONSULTANTS);

  const handleAddConsultant = (consultant: ConsultantUser) => {
    setConsultants([consultant, ...consultants]);
  };

  const handleConsultantLogin = (consultantId: string) => {
    const loginTimeStr = `${new Date().toISOString().split("T")[0]} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    setConsultants(
      consultants.map((c) =>
        c.id === consultantId ? { ...c, isActive: true, lastLoginAt: loginTimeStr } : c
      )
    );
  };

  const handleConsultantLogout = (consultantId: string) => {
    setConsultants(
      consultants.map((c) =>
        c.id === consultantId ? { ...c, isActive: false } : c
      )
    );
  };

  // State Handlers
  const handleSelectPortal = (portal: RolePortal) => {
    setActivePortal(portal);
    switch (portal) {
      case "ADMIN":
        setActiveTab("matrix_cash_in");
        break;
      case "RECEPTIONIST":
        setActiveTab("overview");
        break;
      case "CONSULTANT":
        setActiveTab("queue");
        break;
      case "LABORATORY":
        setActiveTab("lab_queue");
        break;
      case "ULTRASOUND":
        setActiveTab("us_queue");
        break;
      case "PHARMACY":
        setActiveTab("pharmacy_queue");
        break;
    }
  };

  const handleAddPatient = (patient: PatientRecord) => {
    setPatients([patient, ...patients]);
  };

  const handleAddVisit = (
    visit: VisitRecord,
    transaction: CashTransactionRecord
  ) => {
    setVisits([visit, ...visits]);
    setCashTransactions([transaction, ...cashTransactions]);
  };

  const handleAddAdmission = (
    admission: AdmissionRecord,
    transaction: CashTransactionRecord
  ) => {
    setAdmissions([admission, ...admissions]);
  };

  const handleDischargePatient = (admissionId: string) => {
    const dischargeTimeStr = `${new Date().toISOString().split("T")[0]} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    
    setAdmissions(
      admissions.map((a) =>
        a.id === admissionId
          ? { ...a, status: "DISCHARGED", dischargeOutTime: dischargeTimeStr }
          : a
      )
    );

    // Also update matching visit record status
    const matchingAdm = admissions.find((a) => a.id === admissionId);
    if (matchingAdm) {
      setVisits(
        visits.map((v) =>
          v.patientId === matchingAdm.patientId ? { ...v, status: "DISCHARGED", dischargeOutTime: dischargeTimeStr } : v
        )
      );
    }
  };

  const handleAddPrescription = (prescription: PrescriptionRecord) => {
    setPrescriptions([prescription, ...prescriptions]);
  };

  const handleAddLabOrder = (
    order: LabOrderRecord,
    transaction: CashTransactionRecord
  ) => {
    setLabOrders([order, ...labOrders]);
    setCashTransactions([transaction, ...cashTransactions]);
  };

  const handleAddUltrasoundOrder = (
    order: UltrasoundOrderRecord,
    transaction: CashTransactionRecord
  ) => {
    setUltrasoundOrders([order, ...ultrasoundOrders]);
    setCashTransactions([transaction, ...cashTransactions]);
  };

  const handleAcceptLabReport = (labOrderId: string) => {
    setLabOrders(
      labOrders.map((l) =>
        l.id === labOrderId ? { ...l, status: "ACCEPTED" } : l
      )
    );
  };

  const handleRequestLabRevision = (
    labOrderId: string,
    reason: string,
    comment: string
  ) => {
    setLabOrders(
      labOrders.map((l) =>
        l.id === labOrderId
          ? {
              ...l,
              status: "REVISION_REQUESTED",
              revisionReason: reason,
              revisionComment: comment,
            }
          : l
      )
    );
  };

  const handleSubmitLabResult = (
    labOrderId: string,
    resultsJson: string,
    pdfFileName?: string,
    isVersion2?: boolean,
    imageBase64?: string
  ) => {
    setLabOrders(
      labOrders.map((l) => {
        if (l.id === labOrderId) {
          if (isVersion2) {
            return {
              ...l,
              currentVersion: 2,
              resultsV2: resultsJson,
              attachedPdfName: pdfFileName || "LAB_REPORT_V2.pdf",
              attachedPdfUrl: "simulated_pdf",
              attachedImageBase64: imageBase64,
              status: "SUBMITTED_TO_CONSULTANT",
            };
          }
          return {
            ...l,
            resultsV1: resultsJson,
            attachedPdfName: pdfFileName || "LAB_REPORT_V1.pdf",
            attachedPdfUrl: "simulated_pdf",
            attachedImageBase64: imageBase64,
            status: "SUBMITTED_TO_CONSULTANT",
          };
        }
        return l;
      })
    );
  };

  const handleSubmitUltrasoundResult = (
    usOrderId: string,
    findings: string,
    impression: string
  ) => {
    setUltrasoundOrders(
      ultrasoundOrders.map((u) =>
        u.id === usOrderId
          ? {
              ...u,
              findingsV1: findings,
              impressionV1: impression,
              attachedFileName: "ULTRASOUND_SCAN_24WK.pdf",
              attachedPdfUrl: "simulated_us_pdf",
              status: "SUBMITTED_TO_CONSULTANT",
            }
          : u
      )
    );
  };

  const handleDispensePrescription = (
    prescriptionId: string,
    transaction: CashTransactionRecord
  ) => {
    setPrescriptions(
      prescriptions.map((p) =>
        p.id === prescriptionId ? { ...p, isDispensed: true } : p
      )
    );
    setCashTransactions([transaction, ...cashTransactions]);
  };

  const handleAddMedicineBatch = (medicine: MedicineRecord) => {
    setMedicines([medicine, ...medicines]);
  };

  const handleAddExpense = (transaction: CashTransactionRecord) => {
    setCashTransactions([transaction, ...cashTransactions]);
  };

  const handleAddReversal = (originalTxnId: string, reason: string) => {
    const original = cashTransactions.find((t) => t.id === originalTxnId);
    if (!original) return;

    const reversalTxn: CashTransactionRecord = {
      id: `txn-rev-${Date.now()}`,
      transactionNumber: `REV-${original.transactionNumber}`,
      transactionType: "REVERSAL",
      category: original.category,
      department: original.department,
      amount: original.amount,
      paymentMethod: original.paymentMethod,
      description: `REVERSAL of ${original.transactionNumber} Reason: ${reason}`,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdBy: "System Administrator",
    };
    setCashTransactions([reversalTxn, ...cashTransactions]);
  };

  const handleUpdateVisitStatus = (
    visitId: string,
    status: VisitRecord["status"]
  ) => {
    setVisits(
      visits.map((v) => (v.id === visitId ? { ...v, status } : v))
    );
  };

  const handleUpdateLabOrderStatus = (
    labOrderId: string,
    status: LabOrderRecord["status"]
  ) => {
    setLabOrders(
      labOrders.map((l) => (l.id === labOrderId ? { ...l, status } : l))
    );
  };

  const handleUpdateUltrasoundOrderStatus = (
    usOrderId: string,
    status: UltrasoundOrderRecord["status"]
  ) => {
    setUltrasoundOrders(
      ultrasoundOrders.map((u) => (u.id === usOrderId ? { ...u, status } : u))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-brand-500 selection:text-white transition-colors duration-300">
      {/* Navigation Header */}
      <Navbar
        activePortal={activePortal}
        onSelectPortal={handleSelectPortal}
      />

      {/* Main Body Shell */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activePortal={activePortal}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {activePortal === "ADMIN" && (
            <AdminPortal
              activeTab={activeTab}
              cashTransactions={cashTransactions}
              consultants={consultants}
              patients={patients}
              visits={visits}
              onAddExpense={handleAddExpense}
              onAddReversal={handleAddReversal}
              onAddConsultant={handleAddConsultant}
            />
          )}

          {activePortal === "RECEPTIONIST" && (
            <ReceptionistPortal
              activeTab={activeTab}
              patients={patients}
              visits={visits}
              admissions={admissions}
              onAddPatient={handleAddPatient}
              onAddVisit={handleAddVisit}
              onAddAdmission={handleAddAdmission}
              onDischargePatient={handleDischargePatient}
            />
          )}

          {activePortal === "CONSULTANT" && (
            <ConsultantPortal
              activeTab={activeTab}
              visits={visits}
              prescriptions={prescriptions}
              labOrders={labOrders}
              ultrasoundOrders={ultrasoundOrders}
              consultants={consultants}
              onAddPrescription={handleAddPrescription}
              onAddLabOrder={handleAddLabOrder}
              onAddUltrasoundOrder={handleAddUltrasoundOrder}
              onAcceptLabReport={handleAcceptLabReport}
              onRequestLabRevision={handleRequestLabRevision}
              onUpdateVisitStatus={handleUpdateVisitStatus}
              onConsultantLogin={handleConsultantLogin}
              onConsultantLogout={handleConsultantLogout}
            />
          )}


          {activePortal === "LABORATORY" && (
            <LabPortal
              activeTab={activeTab}
              labOrders={labOrders}
              onSubmitLabResult={handleSubmitLabResult}
              onUpdateLabOrderStatus={handleUpdateLabOrderStatus}
            />
          )}

          {activePortal === "ULTRASOUND" && (
            <UltrasoundPortal
              activeTab={activeTab}
              ultrasoundOrders={ultrasoundOrders}
              onSubmitUltrasoundResult={handleSubmitUltrasoundResult}
              onUpdateUltrasoundOrderStatus={handleUpdateUltrasoundOrderStatus}
            />
          )}

          {activePortal === "PHARMACY" && (
            <PharmacyPortal
              activeTab={activeTab}
              prescriptions={prescriptions}
              medicines={medicines}
              onDispensePrescription={handleDispensePrescription}
              onAddMedicineBatch={handleAddMedicineBatch}
            />
          )}
        </main>
      </div>
    </div>
  );
}
