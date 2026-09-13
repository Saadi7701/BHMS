import React, { useState } from "react";
import {
  TestTube,
  FileSpreadsheet,
  History,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Eye,
  FileText,
  UserCheck,
  Paperclip,
  FlaskConical,
  ArrowRight,
  Clock,
} from "lucide-react";
import { StatCard } from "../ui/StatCard";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { LabOrderRecord } from "../../lib/mockDataStore";

interface LabPortalProps {
  activeTab: string;
  labOrders: LabOrderRecord[];
  onSubmitLabResult: (
    labOrderId: string,
    resultsJson: string,
    pdfFileName?: string,
    isVersion2?: boolean,
    imageBase64?: string
  ) => void;
  onUpdateLabOrderStatus?: (
    labOrderId: string,
    status: LabOrderRecord["status"]
  ) => void;
}

export const LabPortal: React.FC<LabPortalProps> = ({
  activeTab,
  labOrders,
  onSubmitLabResult,
  onUpdateLabOrderStatus,
}) => {
  const [selectedOrderForResult, setSelectedOrderForResult] =
    useState<LabOrderRecord | null>(null);
  const [viewingOrderModal, setViewingOrderModal] =
    useState<LabOrderRecord | null>(null);

  // Result Form State
  const [labResults, setLabResults] = useState({
    hb: "12.4 g/dL",
    tlc: "7,800 /uL",
    platelets: "210,000 /uL (Re-verified manually under microscope)",
    cholesterol: "245 mg/dL",
    triglycerides: "190 mg/dL",
    notes: "Sample processed according to standard SOPs.",
  });
  const [uploadedFileName, setUploadedFileName] = useState("LAB_REPORT_CBC_LIPID.pdf");
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | undefined>(undefined);
  const [versionHistoryModalOrder, setVersionHistoryModalOrder] =
    useState<LabOrderRecord | null>(null);

  const handleSubmitResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForResult) return;

    const isV2 = selectedOrderForResult.status === "REVISION_REQUESTED";
    onSubmitLabResult(
      selectedOrderForResult.id,
      JSON.stringify(labResults),
      uploadedFileName,
      isV2,
      uploadedImageBase64
    );
    setSelectedOrderForResult(null);
    setUploadedImageBase64(undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const revisionOrders = labOrders.filter(
    (l) => l.status === "REVISION_REQUESTED"
  );
  const pendingOrders = labOrders.filter(
    (l) =>
      l.status === "ORDERED" ||
      l.status === "SAMPLE_COLLECTED" ||
      l.status === "REVISION_REQUESTED"
  );

  // Determine active view tab match
  const isQueueTab = activeTab === "lab_queue" || activeTab === "orders" || activeTab === "overview";
  const isResultEntryTab = activeTab === "result_entry";
  const isVersionHistoryTab = activeTab === "version_history";
  const isRevisionTab = activeTab === "revision_notices";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-900 via-slate-900 to-slate-900 p-6 rounded-2xl border border-amber-800/40 shadow-lg text-white">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TestTube className="w-4 h-4" />
            <span>Pathology & Biochemistry Laboratory</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Lab Test Processing & Diagnostic Reports
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Receive consultant requisitions, collect samples, enter lab values, attach report files, and dispatch to consultants.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requisitions"
          value={labOrders.length}
          subtitle="Orders Placed"
          icon={TestTube}
          iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Pending Action"
          value={pendingOrders.length}
          subtitle="Awaiting Sample / Processing"
          icon={Clock}
          iconBg="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Revision Requests"
          value={revisionOrders.length}
          subtitle="Requires Correction / Re-check"
          icon={AlertTriangle}
          iconBg="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        />
        <StatCard
          title="Completed & Accepted"
          value={labOrders.filter((l) => l.status === "ACCEPTED" || l.status === "SUBMITTED_TO_CONSULTANT").length}
          subtitle="Dispatched / Verified Reports"
          icon={CheckCircle2}
          iconBg="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* VIEW: QUEUE & PENDING ORDERS */}
      {isQueueTab && (
        <div className="space-y-6">
          {/* Pending Section */}
          <div className="bg-white dark:bg-slate-900 border border-amber-500/30 dark:border-amber-900/40 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>Pending Lab Orders ({pendingOrders.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Orders placed by consultants waiting for lab sample collection or result entry.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs font-mono">
                {pendingOrders.length} Pending
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/60" />
                <div className="font-bold text-slate-600 dark:text-slate-300">All Lab Requisitions Processed</div>
                <p className="text-xs text-slate-400">New lab orders requested by consultants will automatically appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-amber-50/50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4">Order Number</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Requesting Consultant</th>
                      <th className="py-3 px-4">Requested Tests</th>
                      <th className="py-3 px-4">Requested On</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pendingOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-amber-50/20 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-600">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {order.patientName}
                          <span className="block text-[11px] font-mono text-slate-400">
                            {order.mrNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          {order.consultantName}
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">
                          {order.tests.join(", ")}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {order.requestDate || "Just now"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              order.status === "REVISION_REQUESTED"
                                ? "danger"
                                : order.status === "SAMPLE_COLLECTED"
                                ? "warning"
                                : "info"
                            }
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {order.status === "ORDERED" && onUpdateLabOrderStatus && (
                            <button
                              onClick={() => onUpdateLabOrderStatus(order.id, "SAMPLE_COLLECTED")}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-600/20"
                            >
                              Collect Sample
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrderForResult(order)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm"
                          >
                            <FlaskConical className="w-3.5 h-3.5" /> Enter Results
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* All Orders Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                <span>All Laboratory Requisitions Log</span>
              </h3>
              <span className="text-xs text-slate-500">
                {labOrders.length} Total Records
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4">Order Number</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Requesting Consultant</th>
                    <th className="py-3 px-4">Requested Tests</th>
                    <th className="py-3 px-4">Attached File</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {labOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {order.patientName}
                        <span className="block text-[11px] font-mono text-slate-400">
                          {order.mrNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {order.consultantName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {order.tests.join(", ")}
                      </td>
                      <td className="py-3 px-4 font-mono text-brand-600 font-bold">
                        {order.attachedPdfName || "-"}
                      </td>
                      <td className="py-3 px-4 font-mono">v{order.currentVersion}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            order.status === "ACCEPTED"
                              ? "success"
                              : order.status === "SUBMITTED_TO_CONSULTANT"
                              ? "warning"
                              : order.status === "REVISION_REQUESTED"
                              ? "danger"
                              : "info"
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setViewingOrderModal(order)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs"
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
        </div>
      )}

      {/* VIEW: RESULT ENTRY (Or when order selected for result entry) */}
      {(isResultEntryTab || selectedOrderForResult !== null) && (
        <div className="space-y-6">
          {!selectedOrderForResult ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-500" />
                <span>Select Pending Order for Result Entry</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase border-b">
                      <th className="py-2.5 px-3">Order Number</th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3">Tests</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-brand-600">{order.orderNumber}</td>
                        <td className="py-2.5 px-3 font-bold">{order.patientName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{order.tests.join(", ")}</td>
                        <td className="py-2.5 px-3"><Badge variant="warning">{order.status}</Badge></td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedOrderForResult(order)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                          >
                            Upload Results
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                          No pending orders requiring result entry.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-amber-500/40 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Upload Lab Results ({selectedOrderForResult.orderNumber})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: <strong className="text-slate-900 dark:text-white">{selectedOrderForResult.patientName}</strong> ({selectedOrderForResult.mrNumber}) | Tests: {selectedOrderForResult.tests.join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrderForResult(null)}
                  className="px-3 py-1 rounded-lg border text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Back to List
                </button>
              </div>

              <form onSubmit={handleSubmitResults} className="space-y-4 text-xs">
                {/* FILE UPLOAD DROPZONE */}
                <div className="p-6 border-2 border-dashed border-amber-500/40 rounded-2xl bg-amber-500/5 text-center space-y-3">
                  <Upload className="w-8 h-8 mx-auto text-amber-500" />
                  <div className="font-bold text-slate-900 dark:text-white">
                    Upload Report PDF / Scan Image for Consultant Direct Viewing
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleImageUpload}
                    className="w-full sm:w-80 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border font-mono text-center text-xs mx-auto block"
                  />
                  {uploadedImageBase64 && (
                    <div className="mt-2 text-emerald-600 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Attached: {uploadedFileName}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">
                    The uploaded file is made available immediately to {selectedOrderForResult.consultantName} in their workstation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Hemoglobin (Hb)</label>
                    <input
                      type="text"
                      value={labResults.hb}
                      onChange={(e) => setLabResults({ ...labResults, hb: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Total Leucocyte Count (TLC)</label>
                    <input
                      type="text"
                      value={labResults.tlc}
                      onChange={(e) => setLabResults({ ...labResults, tlc: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Platelet Count</label>
                    <input
                      type="text"
                      value={labResults.platelets}
                      onChange={(e) => setLabResults({ ...labResults, platelets: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-emerald-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Serum Cholesterol</label>
                    <input
                      type="text"
                      value={labResults.cholesterol}
                      onChange={(e) => setLabResults({ ...labResults, cholesterol: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Technician Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={labResults.notes}
                    onChange={(e) => setLabResults({ ...labResults, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForResult(null)}
                    className="px-4 py-2 rounded-xl border font-bold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md"
                  >
                    Submit & Dispatch Lab Report
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* VIEW: VERSION HISTORY */}
      {isVersionHistoryTab && (
        <div className="space-y-6">
          {!versionHistoryModalOrder ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-amber-500" />
                <span>Select Order for Version History</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase border-b">
                      <th className="py-2.5 px-3">Order Number</th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3">Version</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {labOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-brand-600">{order.orderNumber}</td>
                        <td className="py-2.5 px-3 font-bold">{order.patientName}</td>
                        <td className="py-2.5 px-3 font-mono">v{order.currentVersion}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setVersionHistoryModalOrder(order)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600/10 text-amber-600 font-bold text-xs"
                          >
                            View History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Report Version History ({versionHistoryModalOrder.orderNumber}) - {versionHistoryModalOrder.patientName}
                </h3>
                <button
                  onClick={() => setVersionHistoryModalOrder(null)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold"
                >
                  Back to List
                </button>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border space-y-2 text-xs">
                <div className="flex justify-between font-bold text-brand-600">
                  <span>Version 1 File: {versionHistoryModalOrder.attachedPdfName || "LAB_REPORT_FINAL.pdf"}</span>
                  <span className="text-slate-400">Preserved History</span>
                </div>
                {versionHistoryModalOrder.currentVersion > 1 && (
                  <div className="flex justify-between font-bold text-emerald-600 pt-2 border-t">
                    <span>Version 2 File: {versionHistoryModalOrder.attachedPdfName}</span>
                    <span className="text-emerald-500 font-bold">Current Active</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: REVISION NOTICES */}
      {isRevisionTab && (
        <div className="bg-white dark:bg-slate-900 border border-rose-500/30 rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Consultant Revision Requests ({revisionOrders.length})</span>
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-rose-50 dark:bg-slate-800 text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase border-b">
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Consultant</th>
                  <th className="py-2.5 px-3">Revision Reason</th>
                  <th className="py-2.5 px-3">Comments</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {revisionOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-rose-50/20">
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{order.orderNumber}</td>
                    <td className="py-2.5 px-3 font-bold">{order.patientName}</td>
                    <td className="py-2.5 px-3">{order.consultantName}</td>
                    <td className="py-2.5 px-3 font-bold text-rose-600">{order.revisionReason || "Recalibration required"}</td>
                    <td className="py-2.5 px-3 text-slate-600">{order.revisionComment || "Please re-verify platelet count."}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedOrderForResult(order)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                      >
                        Re-upload Revised Report
                      </button>
                    </td>
                  </tr>
                ))}
                {revisionOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                      No pending revision requests from consultants.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Order Details */}
      {viewingOrderModal && (
        <Modal
          isOpen
          onClose={() => setViewingOrderModal(null)}
          title={`Lab Requisition Details - ${viewingOrderModal.orderNumber}`}
          subtitle={`Patient: ${viewingOrderModal.patientName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 border">
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">MR Number:</span>
                <span className="font-mono font-bold">{viewingOrderModal.mrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Consultant:</span>
                <span>{viewingOrderModal.consultantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Tests Requested:</span>
                <span className="font-bold text-amber-600">{viewingOrderModal.tests.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Current Status:</span>
                <Badge variant="warning">{viewingOrderModal.status}</Badge>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewingOrderModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
