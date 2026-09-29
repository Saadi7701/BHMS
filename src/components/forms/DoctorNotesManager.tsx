import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Printer,
  Calendar,
  User,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PatientRecord, VisitRecord } from "../../lib/mockDataStore";
import { fetchDoctorNotesFromApi, createDoctorNoteApi } from "../../lib/apiClient";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { HospitalFormPrintView } from "./HospitalFormPrintView";

interface DoctorNotesManagerProps {
  doctorName: string;
  visits?: VisitRecord[];
  patients?: PatientRecord[];
}

export const DoctorNotesManager: React.FC<DoctorNotesManagerProps> = ({
  doctorName,
  visits = [],
  patients = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState<any[]>([]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [printRecord, setPrintRecord] = useState<any | null>(null);

  // Form input state
  const [formData, setFormData] = useState({
    noteDate: new Date().toISOString().split("T")[0],
    noteTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    notes: "",
    doctorName: doctorName || "Dr. Bilal Ahmad",
    signDate: new Date().toISOString().split("T")[0],
    signTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const notes = await fetchDoctorNotesFromApi(searchQuery);
      setDoctorNotes(notes);
    } catch (e) {
      console.error("Failed to load doctor notes:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const handlePatientSelect = (patientObj: any) => {
    setSelectedPatient(patientObj);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert("Please select a patient first.");
      return;
    }

    if (!formData.notes.trim()) {
      alert("Please write note content before saving.");
      return;
    }

    const payload = {
      patientId: selectedPatient.patientId || selectedPatient.id,
      patientName: selectedPatient.patientName || selectedPatient.fullName,
      mrNumber: selectedPatient.mrNumber,
      patient: selectedPatient,
      noteDate: formData.noteDate,
      noteTime: formData.noteTime,
      notes: formData.notes,
      doctorName: formData.doctorName || doctorName,
      signDate: formData.signDate,
      signTime: formData.signTime,
      status: "FINALIZED",
    };

    const res = await createDoctorNoteApi(payload);
    if (res.success) {
      alert("Doctor Note created successfully!");
      setIsCreateModalOpen(false);
      setSelectedPatient(null);
      setFormData((prev) => ({ ...prev, notes: "" }));
      loadData();
    } else {
      alert(`Error creating Doctor Note: ${res.error || "Failed"}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 rounded-2xl border border-emerald-800/40 shadow-lg text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Consultant / MO / WMO Notes Workspace</span>
          </div>
          <h2 className="text-xl font-black">Doctor Clinical Progress Notes</h2>
          <p className="text-xs text-slate-300 mt-1">
            Create, view history, and print official hospital doctor notes matching paper sheets.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPatient(null);
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Doctor Note</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes by Patient Name, MR Number, Doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          {doctorNotes.length} Notes Logged
        </span>
      </div>

      {/* Doctor Notes History List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase border-b">
                <th className="py-3.5 px-4">Note ID</th>
                <th className="py-3.5 px-4">Date / Time</th>
                <th className="py-3.5 px-4">Patient Name & MR No</th>
                <th className="py-3.5 px-4">Clinical Progress Note Snippet</th>
                <th className="py-3.5 px-4">Doctor Name</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {doctorNotes.map((note) => (
                <tr key={note.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600">{note.formNumber}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {new Date(note.noteDate || note.createdAt).toLocaleDateString()} {note.noteTime || ""}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {note.patient?.fullName || note.patientName}
                    <span className="block text-[10px] font-mono text-slate-400">{note.patient?.mrNumber || note.mrNumber}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-md truncate">
                    {note.notes}
                  </td>
                  <td className="py-3 px-4 font-semibold text-brand-600">{note.doctorName}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setPrintRecord(note)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold flex items-center gap-1 text-[11px] ml-auto"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / PDF
                    </button>
                  </td>
                </tr>
              ))}
              {doctorNotes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                    No doctor notes found. Click button above to add a new note.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DOCTOR NOTE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Doctor Progress Note"
        subtitle="CONSULTANT / MO / WMO - NOTES (Paper Form Replicated)"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Patient Selection */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="block font-bold">Select Patient for Note *</label>
            <select
              value={selectedPatient?.id || ""}
              onChange={(e) => {
                const foundVisit = visits.find((v) => v.id === e.target.value);
                if (foundVisit) {
                  handlePatientSelect(foundVisit);
                } else {
                  const foundPat = patients.find((p) => p.id === e.target.value);
                  if (foundPat) handlePatientSelect(foundPat);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-xs"
              required
            >
              <option value="">-- Select Patient from Queue or Master Database --</option>
              <optgroup label="Active Encounters Queue">
                {visits.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.patientName} (MR: {v.mrNumber}) — Visit: {v.visitNumber}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Master Patient Index">
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (MR: {p.mrNumber}) — Phone: {p.phone}
                  </option>
                ))}
              </optgroup>
            </select>

            {selectedPatient && (
              <div className="flex gap-4 bg-white dark:bg-slate-900 p-2.5 rounded-lg border font-mono text-xs">
                <div><span className="text-slate-400">Patient:</span> {selectedPatient.patientName || selectedPatient.fullName}</div>
                <div><span className="text-slate-400">MR:</span> {selectedPatient.mrNumber}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.noteDate}
                onChange={(e) => setFormData({ ...formData, noteDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Time *</label>
              <input
                type="text"
                required
                value={formData.noteTime}
                onChange={(e) => setFormData({ ...formData, noteTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">
              CONSULTANT/MO/WMO - NOTES Content *
            </label>
            <textarea
              rows={10}
              required
              placeholder="Write detailed daily progress notes, clinical examination findings, treatment adjustments, and doctor advice..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-4 rounded-xl border font-serif text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Doctor Name *</label>
            <input
              type="text"
              required
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border font-bold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md"
            >
              Save Doctor Note
            </button>
          </div>
        </form>
      </Modal>

      {/* PRINT PREVIEW MODAL */}
      {printRecord && (
        <Modal
          isOpen={!!printRecord}
          onClose={() => setPrintRecord(null)}
          title="Doctor Note Printable View"
          subtitle="A4 exact paper sheet format"
          maxWidth="4xl"
        >
          <HospitalFormPrintView
            formType="DOCTOR_NOTE"
            data={printRecord}
            onClose={() => setPrintRecord(null)}
          />
        </Modal>
      )}
    </div>
  );
};
