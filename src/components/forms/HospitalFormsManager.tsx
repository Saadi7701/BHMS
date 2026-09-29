import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Printer,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Building,
  Activity,
  Bed,
} from "lucide-react";
import { PatientRecord } from "../../lib/mockDataStore";
import {
  fetchReferralFormsFromApi,
  createReferralFormApi,
  fetchDischargeFormsFromApi,
  createDischargeFormApi,
  fetchAdmissionFormsFromApi,
  createAdmissionFormApi,
  fetchOperationNotesFromApi,
  createOperationNoteApi,
} from "../../lib/apiClient";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { HospitalFormPrintView } from "./HospitalFormPrintView";

interface HospitalFormsManagerProps {
  patients: PatientRecord[];
}

export const HospitalFormsManager: React.FC<HospitalFormsManagerProps> = ({ patients }) => {
  const [activeSubTab, setActiveSubTab] = useState<"ADMISSION" | "REFERRAL" | "DISCHARGE" | "OPERATION">("ADMISSION");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forms Data Lists
  const [admissionForms, setAdmissionForms] = useState<any[]>([]);
  const [referralForms, setReferralForms] = useState<any[]>([]);
  const [dischargeForms, setDischargeForms] = useState<any[]>([]);
  const [operationNotes, setOperationNotes] = useState<any[]>([]);

  // Modals & Active Record State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [printRecord, setPrintRecord] = useState<{ type: any; data: any } | null>(null);
  const [viewRecord, setViewRecord] = useState<any | null>(null);

  // Form Input States
  const [formData, setFormData] = useState<any>({
    // Referral & Discharge shared
    presentingComplaint: "",
    provisionalDiagnosis: "",
    briefHistoryExamination: "",
    investigationsResults: "",
    diagnosticInvestigations: "",
    diagnosis: "",
    procedureDone: "",
    outcome: "",
    doctorName: "Dr. Bilal Ahmad",
    // Referral specific
    conditionAtRefer: "Satisfactory",
    referredHospitalName: "",
    reasonForReferral: "",
    // Discharge specific
    dischargeAdvisedByDoctor: true,
    isLAMA: false,
    dischargeDate: new Date().toISOString().split("T")[0],
    dischargeCondition: "Satisfactory",
    followUpDate: "",
    followUpDepartment: "OPD",
    dietaryInstructions: "",
    // Admission specific
    phcRegNumber: "",
    dateOfAdmission: new Date().toISOString().split("T")[0],
    timeOfAdmission: "10:00 AM",
    maritalStatus: "Single",
    cnic: "",
    finalDiagnosis: "",
    admittedThrough: "OPD",
    opdErMrNo: "",
    dateOfDischargeRefer: "",
    timeOfDischargeRefer: "",
    consentName: "",
    consentRelation: "Self",
    // Operation Note specific
    operationDate: new Date().toISOString().split("T")[0],
    operationTime: "11:00 AM",
    surgeonName: "Dr. Bilal Ahmad",
    assistantTeamName: "Dr. Kamran Raza",
    anesthetistName: "Dr. Tariq Mahmood",
    anesthesiaType: "General Anesthesia",
    incision: "Right Subcostal Incision",
    procedureDetails: "",
    findings: "",
    drain: "No Drain",
    specimenRemoved: "Gallbladder",
    histopathology: "Routine Histopathology",
    bloodLoss: "100 ml",
    transfusion: "No",
    uneventfulDevelopment: "Uneventful",
    conditionAtEnd: "Satisfactory",
    postOpOrders: "1. NPO for 6 hours\n2. IV Fluids NS 1000ml @ 100ml/hr\n3. Inj. Ceftriaxone 1g IV BD\n4. Monitor Vitals 1 hourly",
    // Dynamic Medicine Table
    medicines: [
      { medicine: "", dose: "", route: "Oral", frequency: "1-0-1", timing: "After meals", duration: "5 days" },
    ],
  });

  // Load records
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeSubTab === "ADMISSION") {
        const res = await fetchAdmissionFormsFromApi(searchQuery);
        setAdmissionForms(res);
      } else if (activeSubTab === "REFERRAL") {
        const res = await fetchReferralFormsFromApi(searchQuery);
        setReferralForms(res);
      } else if (activeSubTab === "DISCHARGE") {
        const res = await fetchDischargeFormsFromApi(searchQuery);
        setDischargeForms(res);
      } else if (activeSubTab === "OPERATION") {
        const res = await fetchOperationNotesFromApi(searchQuery);
        setOperationNotes(res);
      }
    } catch (e) {
      console.error("Failed to fetch forms:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSubTab, searchQuery]);

  const handlePatientSelect = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setFormData((prev: any) => ({
      ...prev,
      cnic: patient.cnic || "",
      consentName: patient.fullName || "",
    }));
  };

  const handleAddMedicineRow = () => {
    setFormData((prev: any) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { medicine: "", dose: "", route: "Oral", frequency: "1-0-1", timing: "After meals", duration: "5 days" },
      ],
    }));
  };

  const handleRemoveMedicineRow = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      medicines: prev.medicines.filter((_: any, idx: number) => idx !== index),
    }));
  };

  const handleMedicineChange = (index: number, field: string, value: string) => {
    setFormData((prev: any) => {
      const updated = [...prev.medicines];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, medicines: updated };
    });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert("Please search and select a patient first.");
      return;
    }

    const payload = {
      ...formData,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      mrNumber: selectedPatient.mrNumber,
      patient: selectedPatient,
    };

    let res: any = { success: false };
    if (activeSubTab === "ADMISSION") {
      res = await createAdmissionFormApi(payload);
    } else if (activeSubTab === "REFERRAL") {
      res = await createReferralFormApi(payload);
    } else if (activeSubTab === "DISCHARGE") {
      res = await createDischargeFormApi(payload);
    } else if (activeSubTab === "OPERATION") {
      res = await createOperationNoteApi(payload);
    }

    if (res.success) {
      alert(`${activeSubTab.replace("_", " ")} Form created successfully!`);
      setIsCreateModalOpen(false);
      setSelectedPatient(null);
      loadData();
    } else {
      alert(`Error creating form: ${res.error || "Failed"}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Sub-Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveSubTab("ADMISSION")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "ADMISSION"
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>1. Admission Forms</span>
          </button>

          <button
            onClick={() => setActiveSubTab("REFERRAL")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "REFERRAL"
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>2. Referral Forms</span>
          </button>

          <button
            onClick={() => setActiveSubTab("DISCHARGE")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "DISCHARGE"
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Discharge Forms</span>
          </button>

          <button
            onClick={() => setActiveSubTab("OPERATION")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "OPERATION"
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>4. Operation Notes</span>
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedPatient(null);
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New {activeSubTab.replace("_", " ")}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeSubTab} forms by MR, Patient Name, Form #...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          Showing {activeSubTab === "ADMISSION" ? admissionForms.length : activeSubTab === "REFERRAL" ? referralForms.length : activeSubTab === "DISCHARGE" ? dischargeForms.length : operationNotes.length} Records
        </span>
      </div>

      {/* RECORDS TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase border-b">
                <th className="py-3.5 px-4">Form No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Patient Name & MR No</th>
                <th className="py-3.5 px-4">Key Information</th>
                <th className="py-3.5 px-4">Doctor / Surgeon</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* ADMISSION LIST */}
              {activeSubTab === "ADMISSION" &&
                admissionForms.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-brand-600">{item.formNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{new Date(item.dateOfAdmission || item.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold">
                      {item.patient?.fullName || item.patientName}
                      <span className="block text-[10px] font-mono text-slate-400">{item.patient?.mrNumber || item.mrNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      Admitted via: {item.admittedThrough || "OPD"} • Diag: {item.provisionalDiagnosis || "-"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-600">{item.doctorName || "Dr. Bilal Ahmad"}</td>
                    <td className="py-3 px-4"><Badge variant="success">{item.status || "FINALIZED"}</Badge></td>
                    <td className="py-3 px-4 text-right flex justify-end gap-2">
                      <button onClick={() => setPrintRecord({ type: "ADMISSION", data: item })} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold flex items-center gap-1 text-[11px]">
                        <Printer className="w-3.5 h-3.5" /> Print / PDF
                      </button>
                    </td>
                  </tr>
                ))}

              {/* REFERRAL LIST */}
              {activeSubTab === "REFERRAL" &&
                referralForms.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-brand-600">{item.formNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{new Date(item.formDate || item.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold">
                      {item.patient?.fullName || item.patientName}
                      <span className="block text-[10px] font-mono text-slate-400">{item.patient?.mrNumber || item.mrNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      Referred to: {item.referredHospitalName || "-"} • Condition: {item.conditionAtRefer || "-"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-600">{item.doctorName || "Dr. Bilal Ahmad"}</td>
                    <td className="py-3 px-4"><Badge variant="warning">{item.status || "FINALIZED"}</Badge></td>
                    <td className="py-3 px-4 text-right flex justify-end gap-2">
                      <button onClick={() => setPrintRecord({ type: "REFERRAL", data: item })} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold flex items-center gap-1 text-[11px]">
                        <Printer className="w-3.5 h-3.5" /> Print / PDF
                      </button>
                    </td>
                  </tr>
                ))}

              {/* DISCHARGE LIST */}
              {activeSubTab === "DISCHARGE" &&
                dischargeForms.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-brand-600">{item.formNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{new Date(item.dischargeDate || item.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold">
                      {item.patient?.fullName || item.patientName}
                      <span className="block text-[10px] font-mono text-slate-400">{item.patient?.mrNumber || item.mrNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      Type: {item.isLAMA ? "LAMA" : "Regular Discharge"} • Condition: {item.dischargeCondition || "-"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-600">{item.doctorName || "Dr. Bilal Ahmad"}</td>
                    <td className="py-3 px-4"><Badge variant="purple">{item.status || "FINALIZED"}</Badge></td>
                    <td className="py-3 px-4 text-right flex justify-end gap-2">
                      <button onClick={() => setPrintRecord({ type: "DISCHARGE", data: item })} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold flex items-center gap-1 text-[11px]">
                        <Printer className="w-3.5 h-3.5" /> Print / PDF
                      </button>
                    </td>
                  </tr>
                ))}

              {/* OPERATION NOTES LIST */}
              {activeSubTab === "OPERATION" &&
                operationNotes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-brand-600">{item.formNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{new Date(item.operationDate || item.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold">
                      {item.patient?.fullName || item.patientName}
                      <span className="block text-[10px] font-mono text-slate-400">{item.patient?.mrNumber || item.mrNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      Incision: {item.incision || "-"} • Procedure: {item.procedureDetails?.slice(0, 30) || "-"}...
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-600">{item.surgeonName || "Dr. Bilal Ahmad"}</td>
                    <td className="py-3 px-4"><Badge variant="danger">{item.status || "FINALIZED"}</Badge></td>
                    <td className="py-3 px-4 text-right flex justify-end gap-2">
                      <button onClick={() => setPrintRecord({ type: "OPERATION", data: item })} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold flex items-center gap-1 text-[11px]">
                        <Printer className="w-3.5 h-3.5" /> Print / PDF
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE FORM MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Create New ${activeSubTab.replace("_", " ")} Form`}
        subtitle="Search patient and complete original hospital paper form fields"
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-6 text-xs">
          {/* Patient Search & Auto-Fill Section */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" />
              <span>Select Patient (Auto-Populates Hospital Record Data) *</span>
            </h4>
            <select
              value={selectedPatient?.id || ""}
              onChange={(e) => {
                const found = patients.find((p) => p.id === e.target.value);
                if (found) handlePatientSelect(found);
              }}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
              required
            >
              <option value="">-- Click to Select Registered Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} (MR: {p.mrNumber}) — Phone: {p.phone}
                </option>
              ))}
            </select>

            {selectedPatient && (
              <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-3 rounded-lg border font-mono text-[11px]">
                <div><span className="text-slate-400">MR:</span> {selectedPatient.mrNumber}</div>
                <div><span className="text-slate-400">Age/Gender:</span> {selectedPatient.age}Y / {selectedPatient.gender}</div>
                <div><span className="text-slate-400">Father/Husband:</span> {selectedPatient.fatherHusbandName || "-"}</div>
                <div><span className="text-slate-400">Phone:</span> {selectedPatient.phone}</div>
                <div><span className="text-slate-400">CNIC:</span> {selectedPatient.cnic || "-"}</div>
                <div><span className="text-slate-400">Address:</span> {selectedPatient.address || "-"}</div>
              </div>
            )}
          </div>

          {/* DYNAMIC FORM FIELDS BY SUB-TAB */}
          {/* A. REFERRAL FORM FIELDS */}
          {activeSubTab === "REFERRAL" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Date of Admission</label>
                  <input type="date" value={formData.dateOfAdmission} onChange={(e) => setFormData({ ...formData, dateOfAdmission: e.target.value })} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Attending / Referring Doctor</label>
                  <input type="text" value={formData.doctorName} onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Presenting Complaint</label>
                <textarea rows={2} value={formData.presentingComplaint} onChange={(e) => setFormData({ ...formData, presentingComplaint: e.target.value })} className="w-full p-2.5 rounded-xl border" />
              </div>

              <div>
                <label className="block font-bold mb-1">Provisional Diagnosis</label>
                <input type="text" value={formData.provisionalDiagnosis} onChange={(e) => setFormData({ ...formData, provisionalDiagnosis: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
              </div>

              <div>
                <label className="block font-bold mb-1">Brief History & Examination</label>
                <textarea rows={2} value={formData.briefHistoryExamination} onChange={(e) => setFormData({ ...formData, briefHistoryExamination: e.target.value })} className="w-full p-2.5 rounded-xl border" />
              </div>

              <div>
                <label className="block font-bold mb-1">Investigations Significant Results</label>
                <textarea rows={2} value={formData.investigationsResults} onChange={(e) => setFormData({ ...formData, investigationsResults: e.target.value })} className="w-full p-2.5 rounded-xl border" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Diagnosis</label>
                  <input type="text" value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Procedure Done</label>
                  <input type="text" value={formData.procedureDone} onChange={(e) => setFormData({ ...formData, procedureDone: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Condition at the time of Refer</label>
                <select value={formData.conditionAtRefer} onChange={(e) => setFormData({ ...formData, conditionAtRefer: e.target.value })} className="w-full px-3 py-2 rounded-xl border">
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              {/* Treatment Given Medicine Table */}
              <div className="border p-3 rounded-xl space-y-2 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold">Referral Notes — Treatment Given Table</h5>
                  <button type="button" onClick={handleAddMedicineRow} className="px-3 py-1 bg-brand-600 text-white font-bold rounded-lg">+ Add Medicine</button>
                </div>
                {formData.medicines.map((m: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-7 gap-2 items-center">
                    <input type="text" placeholder="Medicine" value={m.medicine} onChange={(e) => handleMedicineChange(idx, "medicine", e.target.value)} className="col-span-2 p-1.5 border rounded-lg" />
                    <input type="text" placeholder="Dose" value={m.dose} onChange={(e) => handleMedicineChange(idx, "dose", e.target.value)} className="p-1.5 border rounded-lg" />
                    <input type="text" placeholder="Route" value={m.route} onChange={(e) => handleMedicineChange(idx, "route", e.target.value)} className="p-1.5 border rounded-lg" />
                    <input type="text" placeholder="Freq" value={m.frequency} onChange={(e) => handleMedicineChange(idx, "frequency", e.target.value)} className="p-1.5 border rounded-lg" />
                    <input type="text" placeholder="Duration" value={m.duration} onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)} className="p-1.5 border rounded-lg" />
                    <button type="button" onClick={() => handleRemoveMedicineRow(idx)} className="text-rose-600 font-bold">X</button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold mb-1">Name of Hospital to be Referred</label>
                <input type="text" value={formData.referredHospitalName} onChange={(e) => setFormData({ ...formData, referredHospitalName: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
              </div>

              <div>
                <label className="block font-bold mb-1">Reason of Refer</label>
                <textarea rows={2} value={formData.reasonForReferral} onChange={(e) => setFormData({ ...formData, reasonForReferral: e.target.value })} className="w-full p-2.5 rounded-xl border" />
              </div>
            </div>
          )}

          {/* B. DISCHARGE FORM FIELDS */}
          {activeSubTab === "DISCHARGE" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold mb-1">Date of Admission</label>
                  <input type="date" value={formData.dateOfAdmission} onChange={(e) => setFormData({ ...formData, dateOfAdmission: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Date of Discharge</label>
                  <input type="date" value={formData.dischargeDate} onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Doctor Name</label>
                  <input type="text" value={formData.doctorName} onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
              </div>

              <div className="flex gap-6 border p-3 rounded-xl bg-slate-50">
                <label className="flex items-center gap-2 font-bold">
                  <input type="checkbox" checked={formData.dischargeAdvisedByDoctor} onChange={(e) => setFormData({ ...formData, dischargeAdvisedByDoctor: e.target.checked })} /> Discharge Advised by Doctor
                </label>
                <label className="flex items-center gap-2 font-bold text-rose-600">
                  <input type="checkbox" checked={formData.isLAMA} onChange={(e) => setFormData({ ...formData, isLAMA: e.target.checked })} /> LAMA (Left Against Medical Advice)
                </label>
              </div>

              <div>
                <label className="block font-bold mb-1">Presenting Complaint</label>
                <textarea rows={2} value={formData.presentingComplaint} onChange={(e) => setFormData({ ...formData, presentingComplaint: e.target.value })} className="w-full p-2.5 rounded-xl border" />
              </div>

              <div>
                <label className="block font-bold mb-1">Brief History & Examination</label>
                <textarea rows={2} value={formData.briefHistoryExamination} onChange={(e) => setFormData({ ...formData, briefHistoryExamination: e.target.value })} className="w-full p-2.5 rounded-xl border" />
              </div>

              <div>
                <label className="block font-bold mb-1">Diagnostic Investigations Significant Results</label>
                <textarea rows={2} value={formData.diagnosticInvestigations} onChange={(e) => setFormData({ ...formData, diagnosticInvestigations: e.target.value })} className="w-full p-2.5 rounded-xl border" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Diagnosis</label>
                  <input type="text" value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Procedure Done & Outcome</label>
                  <input type="text" value={formData.procedureDone} onChange={(e) => setFormData({ ...formData, procedureDone: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Condition on Discharge</label>
                <select value={formData.dischargeCondition} onChange={(e) => setFormData({ ...formData, dischargeCondition: e.target.value })} className="w-full px-3 py-2 rounded-xl border">
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              {/* Medication Table */}
              <div className="border p-3 rounded-xl space-y-2 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold">Medication Given on Discharge</h5>
                  <button type="button" onClick={handleAddMedicineRow} className="px-3 py-1 bg-brand-600 text-white font-bold rounded-lg">+ Add Medicine</button>
                </div>
                {formData.medicines.map((m: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-7 gap-2 items-center">
                    <input type="text" placeholder="Medicine" value={m.medicine} onChange={(e) => handleMedicineChange(idx, "medicine", e.target.value)} className="col-span-2 p-1.5 border rounded-lg" />
                    <input type="text" placeholder="Dose" value={m.dose} onChange={(e) => handleMedicineChange(idx, "dose", e.target.value)} className="p-1.5 border rounded-lg" />
                    <input type="text" placeholder="Route" value={m.route} onChange={(e) => handleMedicineChange(idx, "route", e.target.value)} className="p-1.5 border rounded-lg" />
                    <input type="text" placeholder="Freq" value={m.frequency} onChange={(e) => handleMedicineChange(idx, "frequency", e.target.value)} className="p-1.5 border rounded-lg" />
                    <input type="text" placeholder="Duration" value={m.duration} onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)} className="p-1.5 border rounded-lg" />
                    <button type="button" onClick={() => handleRemoveMedicineRow(idx)} className="text-rose-600 font-bold">X</button>
                  </div>
                ))}
              </div>

              {/* Urdu Follow-up */}
              <div className="border p-3 rounded-xl space-y-3 bg-blue-50/30">
                <h5 className="font-bold text-brand-600">Urdu Follow-up & Dietary Instructions</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">تاریخ معائنہ (Follow-up Date)</label>
                    <input type="date" value={formData.followUpDate} onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">ڈیپارٹمنٹ (Department)</label>
                    <input type="text" value={formData.followUpDepartment} onChange={(e) => setFormData({ ...formData, followUpDepartment: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1">ہدایات برائے خوراک (Dietary Instructions)</label>
                  <textarea rows={2} value={formData.dietaryInstructions} onChange={(e) => setFormData({ ...formData, dietaryInstructions: e.target.value })} className="w-full p-2.5 rounded-xl border" />
                </div>
              </div>
            </div>
          )}

          {/* C. ADMISSION FORM FIELDS */}
          {activeSubTab === "ADMISSION" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold mb-1">PHC Reg #</label>
                  <input type="text" value={formData.phcRegNumber} onChange={(e) => setFormData({ ...formData, phcRegNumber: e.target.value })} className="w-full px-3 py-2 rounded-xl border font-mono" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Date of Admission (DoA)</label>
                  <input type="date" value={formData.dateOfAdmission} onChange={(e) => setFormData({ ...formData, dateOfAdmission: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Time of Admission (ToA)</label>
                  <input type="text" value={formData.timeOfAdmission} onChange={(e) => setFormData({ ...formData, timeOfAdmission: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Marital Status</label>
                  <select value={formData.maritalStatus} onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })} className="w-full px-3 py-2 rounded-xl border">
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">CNIC (13 Digits)</label>
                  <input type="text" value={formData.cnic} onChange={(e) => setFormData({ ...formData, cnic: e.target.value })} className="w-full px-3 py-2 rounded-xl border font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Provisional Diagnosis</label>
                  <input type="text" value={formData.provisionalDiagnosis} onChange={(e) => setFormData({ ...formData, provisionalDiagnosis: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Final Diagnosis</label>
                  <input type="text" value={formData.finalDiagnosis} onChange={(e) => setFormData({ ...formData, finalDiagnosis: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Admitted through</label>
                  <select value={formData.admittedThrough} onChange={(e) => setFormData({ ...formData, admittedThrough: e.target.value })} className="w-full px-3 py-2 rounded-xl border">
                    <option value="OPD">OPD</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">OPD/ER MR No. (if any)</label>
                  <input type="text" value={formData.opdErMrNo} onChange={(e) => setFormData({ ...formData, opdErMrNo: e.target.value })} className="w-full px-3 py-2 rounded-xl border font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Consent Signed By (Name)</label>
                  <input type="text" value={formData.consentName} onChange={(e) => setFormData({ ...formData, consentName: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Relation to Patient</label>
                  <input type="text" value={formData.consentRelation} onChange={(e) => setFormData({ ...formData, consentRelation: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
              </div>
            </div>
          )}

          {/* D. OPERATION NOTES FIELDS */}
          {activeSubTab === "OPERATION" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold mb-1">Operation Date</label>
                  <input type="date" value={formData.operationDate} onChange={(e) => setFormData({ ...formData, operationDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Surgeon Name *</label>
                  <input type="text" required value={formData.surgeonName} onChange={(e) => setFormData({ ...formData, surgeonName: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Assistant / Team Name</label>
                  <input type="text" value={formData.assistantTeamName} onChange={(e) => setFormData({ ...formData, assistantTeamName: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Anesthetist Name</label>
                  <input type="text" value={formData.anesthetistName} onChange={(e) => setFormData({ ...formData, anesthetistName: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Type of Anesthesia</label>
                  <input type="text" value={formData.anesthesiaType} onChange={(e) => setFormData({ ...formData, anesthesiaType: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Incision</label>
                <input type="text" value={formData.incision} onChange={(e) => setFormData({ ...formData, incision: e.target.value })} className="w-full px-3 py-2 rounded-xl border" />
              </div>

              <div>
                <label className="block font-bold mb-1">Procedure Details</label>
                <textarea rows={3} value={formData.procedureDetails} onChange={(e) => setFormData({ ...formData, procedureDetails: e.target.value })} className="w-full p-2.5 rounded-xl border" />
              </div>

              <div>
                <label className="block font-bold mb-1">Findings</label>
                <textarea rows={3} value={formData.findings} onChange={(e) => setFormData({ ...formData, findings: e.target.value })} className="w-full p-2.5 rounded-xl border" />
              </div>

              <div className="grid grid-cols-3 gap-4 border p-3 rounded-xl bg-slate-50">
                <div>
                  <label className="block font-bold mb-1">Drain</label>
                  <input type="text" value={formData.drain} onChange={(e) => setFormData({ ...formData, drain: e.target.value })} className="w-full p-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Specimen (if Removed)</label>
                  <input type="text" value={formData.specimenRemoved} onChange={(e) => setFormData({ ...formData, specimenRemoved: e.target.value })} className="w-full p-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Histopathology</label>
                  <input type="text" value={formData.histopathology} onChange={(e) => setFormData({ ...formData, histopathology: e.target.value })} className="w-full p-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Blood Loss</label>
                  <input type="text" value={formData.bloodLoss} onChange={(e) => setFormData({ ...formData, bloodLoss: e.target.value })} className="w-full p-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Transfusion (Y/N)</label>
                  <input type="text" value={formData.transfusion} onChange={(e) => setFormData({ ...formData, transfusion: e.target.value })} className="w-full p-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Condition at End</label>
                  <input type="text" value={formData.conditionAtEnd} onChange={(e) => setFormData({ ...formData, conditionAtEnd: e.target.value })} className="w-full p-2 rounded-lg border" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">POST-OPERATIVE ORDER</label>
                <textarea rows={4} value={formData.postOpOrders} onChange={(e) => setFormData({ ...formData, postOpOrders: e.target.value })} className="w-full p-2.5 rounded-xl border font-mono" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 rounded-xl border font-bold">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md">
              Save {activeSubTab.replace("_", " ")} Record
            </button>
          </div>
        </form>
      </Modal>

      {/* PRINT/PDF MODAL */}
      {printRecord && (
        <Modal
          isOpen={!!printRecord}
          onClose={() => setPrintRecord(null)}
          title="Hospital Document Printable View"
          subtitle="A4 exact paper format preview"
          maxWidth="4xl"
        >
          <HospitalFormPrintView
            formType={printRecord.type}
            data={printRecord.data}
            onClose={() => setPrintRecord(null)}
          />
        </Modal>
      )}
    </div>
  );
};
