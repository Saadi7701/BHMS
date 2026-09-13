import React, { useState } from "react";
import {
  Radio,
  FileText,
  History,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Upload,
  UserCheck,
  Clock,
  Scan,
} from "lucide-react";
import { StatCard } from "../ui/StatCard";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { UltrasoundOrderRecord } from "../../lib/mockDataStore";

interface UltrasoundPortalProps {
  activeTab: string;
  ultrasoundOrders: UltrasoundOrderRecord[];
  onSubmitUltrasoundResult: (
    usOrderId: string,
    findings: string,
    impression: string
  ) => void;
  onUpdateUltrasoundOrderStatus?: (
    usOrderId: string,
    status: UltrasoundOrderRecord["status"]
  ) => void;
}

export const UltrasoundPortal: React.FC<UltrasoundPortalProps> = ({
  activeTab,
  ultrasoundOrders,
  onSubmitUltrasoundResult,
  onUpdateUltrasoundOrderStatus,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<UltrasoundOrderRecord | null>(null);
  const [viewingOrderModal, setViewingOrderModal] = useState<UltrasoundOrderRecord | null>(null);

  // Form State
  const [findings, setFindings] = useState(
    "Single live intrauterine pregnancy in cephalic presentation. Adequate liquor volume. Placenta anterior upper segment grade I maturity. Estimated fetal weight: 680g."
  );
  const [impression, setImpression] = useState(
    "Single live fetus corresponding to 24 weeks gestation with normal anomaly survey."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    onSubmitUltrasoundResult(selectedOrder.id, findings, impression);
    setSelectedOrder(null);
  };

  const pendingOrders = ultrasoundOrders.filter(
    (u) => u.status === "ORDERED" || u.status === "PROCESSING" || u.status === "REVISION_REQUESTED"
  );
  const revisionOrders = ultrasoundOrders.filter(
    (u) => u.status === "REVISION_REQUESTED"
  );

  const isQueueTab = activeTab === "us_queue" || activeTab === "orders" || activeTab === "overview";
  const isFindingsTab = activeTab === "findings_entry" || activeTab === "result_entry";
  const isRevisionTab = activeTab === "us_revisions";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-900 via-slate-900 to-slate-900 p-6 rounded-2xl border border-rose-800/40 shadow-lg text-white">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4" />
            <span>Diagnostic Ultrasound & Sonography Department</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Ultrasound Scan Workspace & Reporting
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            View consultant scan requisitions, conduct exams, record findings & diagnostic impressions, and submit reports to consultants.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scan Requests"
          value={ultrasoundOrders.length}
          subtitle="All Requisitions"
          icon={Radio}
          iconBg="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        />
        <StatCard
          title="Pending Ultrasound Queue"
          value={pendingOrders.length}
          subtitle="Waiting Scan / Reporting"
          icon={Clock}
          iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Submitted to Consultant"
          value={
            ultrasoundOrders.filter(
              (u) => u.status === "SUBMITTED_TO_CONSULTANT"
            ).length
          }
          subtitle="Awaiting Consultant Acceptance"
          icon={CheckCircle2}
          iconBg="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Finalized & Accepted"
          value={
            ultrasoundOrders.filter((u) => u.status === "ACCEPTED").length
          }
          subtitle="Verified Records"
          icon={UserCheck}
          iconBg="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* VIEW: QUEUE & PENDING */}
      {isQueueTab && (
        <div className="space-y-6">
          {/* Pending Requests Section */}
          <div className="bg-white dark:bg-slate-900 border border-rose-500/30 dark:border-rose-900/40 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-500" />
                  <span>Pending Ultrasound Requisitions ({pendingOrders.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scan requisitions placed by consultants waiting for ultrasound procedure and findings entry.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs font-mono">
                {pendingOrders.length} Pending
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/60" />
                <div className="font-bold text-slate-600 dark:text-slate-300">All Ultrasound Requests Completed</div>
                <p className="text-xs text-slate-400">New scan requests ordered by consultants will immediately appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-rose-50/50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4">Order No</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Requested Exam</th>
                      <th className="py-3 px-4">Consultant</th>
                      <th className="py-3 px-4">Request Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pendingOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-rose-50/20 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-rose-600">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {order.patientName}
                          <span className="block text-[11px] font-mono text-slate-400">
                            {order.mrNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {order.requestedExam}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {order.consultantName}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {order.requestDate || "Just now"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              order.status === "REVISION_REQUESTED"
                                ? "danger"
                                : order.status === "PROCESSING"
                                ? "warning"
                                : "info"
                            }
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {order.status === "ORDERED" && onUpdateUltrasoundOrderStatus && (
                            <button
                              onClick={() => onUpdateUltrasoundOrderStatus(order.id, "PROCESSING")}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-600/10 text-amber-600 font-bold text-xs hover:bg-amber-600/20"
                            >
                              Start Scan
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm"
                          >
                            <Scan className="w-3.5 h-3.5" /> Enter Findings
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
                <Radio className="w-4 h-4 text-rose-500" />
                <span>All Ultrasound Examinations Queue</span>
              </h3>
              <span className="text-xs text-slate-500">
                {ultrasoundOrders.length} Total Orders Recorded
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4">Order No</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Requested Exam</th>
                    <th className="py-3 px-4">Consultant</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ultrasoundOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-rose-600">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {order.patientName}
                        <span className="block text-[11px] font-mono text-slate-400">
                          {order.mrNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {order.requestedExam}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {order.consultantName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-[11px]">
                          v{order.currentVersion}
                        </span>
                      </td>
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
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewingOrderModal(order)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs"
                        >
                          View Request
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

      {/* VIEW: FINDINGS ENTRY */}
      {(isFindingsTab || selectedOrder !== null) && (
        <div className="space-y-6">
          {!selectedOrder ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Scan className="w-4 h-4 text-rose-500" />
                <span>Select Pending Order for Ultrasound Findings Entry</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase border-b">
                      <th className="py-2.5 px-3">Order Number</th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3">Requested Exam</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{order.orderNumber}</td>
                        <td className="py-2.5 px-3 font-bold">{order.patientName}</td>
                        <td className="py-2.5 px-3 font-semibold">{order.requestedExam}</td>
                        <td className="py-2.5 px-3"><Badge variant="warning">{order.status}</Badge></td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                          >
                            Enter Findings
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                          No pending ultrasound orders requiring findings entry.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-rose-500/40 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Enter Ultrasound Findings ({selectedOrder.orderNumber})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: <strong className="text-slate-900 dark:text-white">{selectedOrder.patientName}</strong> ({selectedOrder.mrNumber}) | Exam: <strong className="text-rose-600">{selectedOrder.requestedExam}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-3 py-1 rounded-lg border text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Back to List
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ultrasonic Examination Findings *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Diagnostic Impression *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={impression}
                    onChange={(e) => setImpression(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div className="p-4 rounded-xl border border-dashed border-rose-500/30 bg-rose-500/5 text-center space-y-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-rose-500" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Attach DICOM / Ultrasound Image Scan Files
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Uploaded scan report files are saved securely and dispatched to {selectedOrder.consultantName}.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md"
                  >
                    Submit Ultrasound Report to Consultant
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* VIEW: REVISION REQUESTS */}
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
                  <th className="py-2.5 px-3">Requested Exam</th>
                  <th className="py-2.5 px-3">Consultant</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {revisionOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-rose-50/20">
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{order.orderNumber}</td>
                    <td className="py-2.5 px-3 font-bold">{order.patientName}</td>
                    <td className="py-2.5 px-3 font-semibold">{order.requestedExam}</td>
                    <td className="py-2.5 px-3">{order.consultantName}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                      >
                        Update Findings
                      </button>
                    </td>
                  </tr>
                ))}
                {revisionOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                      No pending revision requests for ultrasound scans.
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
          title={`Ultrasound Request Details - ${viewingOrderModal.orderNumber}`}
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
                <span className="font-bold text-slate-500">Requested Exam:</span>
                <span className="font-bold text-rose-600">{viewingOrderModal.requestedExam}</span>
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
