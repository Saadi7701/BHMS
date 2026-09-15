"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { AdminPortal } from "../components/portals/AdminPortal";
import { ReceptionistPortal } from "../components/portals/ReceptionistPortal";
import { ConsultantPortal } from "../components/portals/ConsultantPortal";
import { LabPortal } from "../components/portals/LabPortal";
import { UltrasoundPortal } from "../components/portals/UltrasoundPortal";
import { PharmacyPortal } from "../components/portals/PharmacyPortal";
import { LoginPage } from "../components/auth/LoginPage";

import {
  AuthSessionUser,
  getAuthSession,
  setAuthSession,
  clearAuthSession,
} from "../lib/authSession";

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

import {
  fetchPatientsFromApi,
  createPatientApi,
  fetchVisitsFromApi,
  createVisitApi,
  fetchLabOrdersFromApi,
  createLabOrderApi,
  fetchUltrasoundOrdersFromApi,
  createUltrasoundOrderApi,
  fetchPrescriptionsFromApi,
  createPrescriptionApi,
  fetchMedicinesFromApi,
  fetchCashTransactionsFromApi,
} from "../lib/apiClient";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isInitializing, setIsInitializing] = useState(true);

  // Master Dynamic Data State
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [visits, setVisits] = useState<VisitRecord[]>(INITIAL_VISITS);
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>(INITIAL_ADMISSIONS);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(INITIAL_PRESCRIPTIONS);
  const [labOrders, setLabOrders] = useState<LabOrderRecord[]>(INITIAL_LAB_ORDERS);
  const [ultrasoundOrders, setUltrasoundOrders] = useState<UltrasoundOrderRecord[]>(INITIAL_ULTRASOUND_ORDERS);
  const [medicines, setMedicines] = useState<MedicineRecord[]>(INITIAL_MEDICINES);
  const [cashTransactions, setCashTransactions] = useState<CashTransactionRecord[]>(INITIAL_CASH_TRANSACTIONS);
  const [consultants, setConsultants] = useState<ConsultantUser[]>(INITIAL_CONSULTANTS);

  // Initialize Auth Session on mount
  useEffect(() => {
    const session = getAuthSession();
    if (session) {
      setCurrentUser(session);
      setDefaultTabForPortal(session.portal);
    }
    setIsInitializing(false);
  }, []);

  // Sync real-time dynamic data from API endpoints
  useEffect(() => {
    if (currentUser) {
      const loadDynamicData = async () => {
        const [pats, vsts, labs, us, rxs, meds, cash] = await Promise.all([
          fetchPatientsFromApi(),
          fetchVisitsFromApi(),
          fetchLabOrdersFromApi(),
          fetchUltrasoundOrdersFromApi(),
          fetchPrescriptionsFromApi(),
          fetchMedicinesFromApi(),
          fetchCashTransactionsFromApi(),
        ]);
        setPatients(pats);
        setVisits(vsts);
        setLabOrders(labs);
        setUltrasoundOrders(us);
        setPrescriptions(rxs);
        setMedicines(meds);
        setCashTransactions(cash);
      };
      loadDynamicData();
    }
  }, [currentUser]);

  const setDefaultTabForPortal = (portal: AuthSessionUser["portal"]) => {
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

  const handleLoginSuccess = (userSession: AuthSessionUser) => {
    setAuthSession(userSession);
    setCurrentUser(userSession);
    setDefaultTabForPortal(userSession.portal);
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
  };

  const handleAddPatient = (patient: PatientRecord) => {
    setPatients([patient, ...patients]);
    createPatientApi(patient);
  };

  const handleAddVisit = (visit: VisitRecord, transaction: CashTransactionRecord) => {
    setVisits([visit, ...visits]);
    setCashTransactions([transaction, ...cashTransactions]);
    createVisitApi(visit);
  };

  const handleAddAdmission = (admission: AdmissionRecord, transaction: CashTransactionRecord) => {
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
  };

  const handleAddPrescription = (prescription: PrescriptionRecord) => {
    setPrescriptions([prescription, ...prescriptions]);
    createPrescriptionApi(prescription);
  };

  const handleAddLabOrder = (order: LabOrderRecord, transaction: CashTransactionRecord) => {
    setLabOrders([order, ...labOrders]);
    setCashTransactions([transaction, ...cashTransactions]);
    createLabOrderApi(order);
  };

  const handleAddUltrasoundOrder = (order: UltrasoundOrderRecord, transaction: CashTransactionRecord) => {
    setUltrasoundOrders([order, ...ultrasoundOrders]);
    setCashTransactions([transaction, ...cashTransactions]);
    createUltrasoundOrderApi(order);
  };

  const handleAcceptLabReport = (labOrderId: string) => {
    setLabOrders(
      labOrders.map((l) => (l.id === labOrderId ? { ...l, status: "ACCEPTED" } : l))
    );
  };

  const handleRequestLabRevision = (labOrderId: string, reason: string, comment: string) => {
    setLabOrders(
      labOrders.map((l) =>
        l.id === labOrderId
          ? { ...l, status: "REVISION_REQUESTED", revisionReason: reason, revisionComment: comment }
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
          return { ...l, status: "REPORT_PREPARED", pdfUrl: pdfFileName || "lab_report_v1.pdf" };
        }
        return l;
      })
    );
  };

  const handleSubmitUltrasoundResult = (usOrderId: string, findings: string) => {
    setUltrasoundOrders(
      ultrasoundOrders.map((u) => (u.id === usOrderId ? { ...u, status: "REPORT_PREPARED" } : u))
    );
  };

  const handleDispensePrescription = (prescriptionId: string) => {
    setPrescriptions(
      prescriptions.map((p) => (p.id === prescriptionId ? { ...p, status: "DISPENSED" } : p))
    );
  };

  const handleAddMedicineBatch = (newMed: MedicineRecord) => {
    setMedicines([newMed, ...medicines]);
  };

  const handleAddExpense = (transaction: CashTransactionRecord) => {
    setCashTransactions([transaction, ...cashTransactions]);
  };

  const handleAddReversal = (originalTxnId: string, reason: string) => {
    const orig = cashTransactions.find((t) => t.id === originalTxnId);
    if (orig) {
      const reversalTxn: CashTransactionRecord = {
        id: `rev-${Date.now()}`,
        transactionNumber: `REV-${orig.transactionNumber || "TXN"}`,
        transactionType: "REVERSAL",
        category: "REVERSAL",
        department: orig.department || "Admin",
        amount: -orig.amount,
        paymentMethod: orig.paymentMethod || "CASH",
        description: `Reversal: ${reason}`,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        patientName: orig.patientName,
        mrNumber: orig.mrNumber,
        createdBy: "Admin Supervisor",
      };
      setCashTransactions([reversalTxn, ...cashTransactions]);
    }
  };

  const handleAddConsultant = (consultant: ConsultantUser) => {
    setConsultants([consultant, ...consultants]);
  };

  const handleConsultantLogin = (consultantId: string) => {
    setConsultants(
      consultants.map((c) => (c.id === consultantId ? { ...c, isActive: true } : c))
    );
  };

  const handleConsultantLogout = (consultantId: string) => {
    setConsultants(
      consultants.map((c) => (c.id === consultantId ? { ...c, isActive: false } : c))
    );
  };

  const handleUpdateVisitStatus = (visitId: string, status: VisitRecord["status"]) => {
    setVisits(
      visits.map((v) => (v.id === visitId ? { ...v, status } : v))
    );
  };

  const handleUpdateLabOrderStatus = (labOrderId: string, status: LabOrderRecord["status"]) => {
    setLabOrders(
      labOrders.map((l) => (l.id === labOrderId ? { ...l, status } : l))
    );
  };

  const handleUpdateUltrasoundOrderStatus = (usOrderId: string, status: UltrasoundOrderRecord["status"]) => {
    setUltrasoundOrders(
      ultrasoundOrders.map((u) => (u.id === usOrderId ? { ...u, status } : u))
    );
  };

  // If loading session state from localStorage
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400">Loading Bilal Hospital Portal...</p>
        </div>
      </div>
    );
  }

  // If NOT logged in, show the Login Page!
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // If logged in, render authenticated portal shell!
  const activePortal = currentUser.portal;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-brand-500 selection:text-white transition-colors duration-300">
      {/* Navigation Header with logged in user profile & logout button */}
      <Navbar currentUser={currentUser} onLogout={handleLogout} />

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
