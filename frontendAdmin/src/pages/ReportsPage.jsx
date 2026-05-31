import { useEffect, useState } from "react";
import {
  Flag,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  XCircle,
  Award,
  Mail,
  Phone,
  FileText,
  Trash2,
} from "lucide-react";
import { callApi } from "../utils/api";

const REJECT_PRESETS = [
  "Insufficient evidence provided",
  "Duplicate report",
  "Out of scope",
  "Already resolved internally",
];

function RejectReasonModal({ onCancel, onConfirm, submitting }) {
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  const MIN_LENGTH = 5;
  const MAX_LENGTH = 500;
  const isValid = trimmed.length >= MIN_LENGTH;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-red-500/20 rounded-3xl shadow-2xl shadow-red-500/10 w-full max-w-md relative"
      >
        <div className="p-6 pb-4 border-b border-border flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-main text-base uppercase tracking-tight">
              Reject Report
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              The user will receive this reason in their notifications.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="w-8 h-8 rounded-xl bg-canvas-alt border border-border flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">
              Quick reasons
            </p>
            <div className="flex flex-wrap gap-2">
              {REJECT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  disabled={submitting}
                  className="px-3 py-1.5 rounded-lg bg-canvas-alt border border-border text-[11px] text-muted hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5 transition-all disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this report is being rejected..."
              rows={4}
              maxLength={MAX_LENGTH}
              autoFocus
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-canvas-alt border border-border text-sm text-main placeholder:text-muted/50 resize-none focus:outline-none focus:border-red-500/50 transition-all disabled:opacity-50"
            />
            <div className="flex items-center justify-between mt-2">
              <p
                className={`text-[11px] ${
                  trimmed.length > 0 && !isValid ? "text-red-400" : "text-muted"
                }`}
              >
                {trimmed.length > 0 && !isValid
                  ? `Minimum ${MIN_LENGTH} characters required`
                  : "This message will be sent to the user."}
              </p>
              <p className="text-[11px] text-muted tabular-nums">
                {reason.length} / {MAX_LENGTH}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 pt-2 flex gap-3 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted hover:bg-canvas-alt hover:text-main transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {submitting ? "Rejecting..." : "Confirm Reject"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteConfirmModal({ report, onCancel, onConfirm, submitting }) {
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-card border border-red-500/20 rounded-3xl shadow-2xl shadow-red-500/10 w-full max-w-md relative">
        <div className="p-6 pb-4 border-b border-border flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-main text-base uppercase tracking-tight">
              Delete Report
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              This permanently removes the report. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="w-8 h-8 rounded-xl bg-canvas-alt border border-border flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div className="rounded-xl border border-border bg-canvas-alt p-4 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted">
              Reporter
            </div>
            <div className="text-sm font-bold text-main">
              {report?.user?.name || "Unknown User"}
            </div>
            {report?.reportType && (
              <div className="text-xs text-muted">
                Type: <span className="text-main">{report.reportType}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-2 flex gap-3 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted hover:bg-canvas-alt hover:text-main transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {submitting ? "Deleting..." : "Delete Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportModal({ report, onClose, onActionComplete }) {
  const [submitting, setSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const isCertificate =
    report?.reportType?.toLowerCase() === "certificate" ||
    report?.subType?.toLowerCase()?.includes("certificate");

  const performAction = async (status, reason) => {
    try {
      setSubmitting(true);
      await callApi(`/admin/course-reports/${report.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
      });
      onActionComplete?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Failed to update report: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg relative">
        {isCertificate && (
          <div className="absolute -top-3 right-5">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white shadow-lg shadow-amber-500/30">
              <Award className="w-3.5 h-3.5" />
              Certificate Report
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-canvas-alt border border-border flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 pt-8">
          <div className="flex items-center gap-4 mb-6 mt-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h3 className="font-black text-main text-base uppercase tracking-tight">
                {report.user?.name || "Unknown User"}
              </h3>
              <p className="text-[10px] text-muted uppercase tracking-widest mt-0.5">
                {report.userId}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {report.email && (
              <div className="flex items-start gap-3 p-4 bg-canvas-alt rounded-2xl border border-border">
                <Mail className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">
                    Email
                  </p>
                  <p className="text-sm text-main">{report.email}</p>
                </div>
              </div>
            )}

            {report.phone && (
              <div className="flex items-start gap-3 p-4 bg-canvas-alt rounded-2xl border border-border">
                <Phone className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">
                    Phone
                  </p>
                  <p className="text-sm text-main">{report.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-canvas-alt rounded-2xl border border-border flex-wrap">
              <Flag className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">
                  Report Type
                </p>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                  {report.reportType}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-canvas-alt rounded-2xl border border-border">
              <FileText className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">
                  Description
                </p>
                <p className="text-sm text-main leading-relaxed">
                  {report.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-canvas-alt rounded-2xl border border-border">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">
                  Status
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    report.status === "resolved"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : report.status === "rejected"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <div className="p-4 bg-canvas-alt rounded-2xl border border-border">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">
                  Submitted
                </p>
                <p className="text-xs text-main flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {report.status === "pending" ? (
            <div className="flex gap-3 mt-6">
              <button
                disabled={submitting}
                onClick={() => performAction("resolved")}
                className="flex-1 py-3 rounded-xl bg-green-500/10 text-green-400 font-bold hover:bg-green-500 hover:text-white transition disabled:opacity-50"
              >
                {submitting ? "Working..." : "Mark as Resolved"}
              </button>

              <button
                disabled={submitting}
                onClick={() => setShowRejectModal(true)}
                className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500 hover:text-white transition disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          ) : (
            <p className="mt-6 text-center text-xs text-muted italic">
              This report has already been {report.status}.
            </p>
          )}
        </div>
      </div>

      {showRejectModal && (
        <RejectReasonModal
          onCancel={() => setShowRejectModal(false)}
          onConfirm={(reason) => performAction("rejected", reason)}
          submitting={submitting}
        />
      )}
    </div>
  );
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");


  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await callApi("/admin/course-reports");
      const data = Array.isArray(response?.data) ? response.data : [];
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    try {
      setDeleting(true);
      await callApi(`/admin/course-reports/${reportToDelete.id}`, {
        method: "DELETE",
      });
      setReportToDelete(null);
      await fetchReports();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete report: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const rejectedCount = reports.filter((r) => r.status === "rejected").length;
  const certificateCount = reports.filter(
    (r) =>
      r.reportType?.toLowerCase() === "certificate" ||
      r.subType?.toLowerCase()?.includes("certificate")
  ).length;

  const filterCounts = {
    all: reports.length,
    pending: pendingCount,
    resolved: resolvedCount,
    rejected: rejectedCount,
  };

  const filteredReports = reports
    .filter((r) =>
      statusFilter === "all" ? true : r.status === statusFilter
    )

  if (loading)
    return (
      <div className="p-10 text-center text-muted">Loading reports...</div>
    );

  if (error)
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onActionComplete={fetchReports}
        />
      )}

      {reportToDelete && (
        <DeleteConfirmModal
          report={reportToDelete}
          onCancel={() => (deleting ? null : setReportToDelete(null))}
          onConfirm={handleDeleteConfirm}
          submitting={deleting}
        />
      )}

      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Reports Dashboard
            </h2>
            <p className="text-muted text-sm">
              Monitor and manage all user reports
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-500">
                Certificate: {certificateCount}
              </span>
            </div>

            <div className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-orange-500">
                Pending: {pendingCount}
              </span>
            </div>

            <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-green-500">
                Resolved: {resolvedCount}
              </span>
            </div>

            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <X className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-red-500">
                Rejected: {rejectedCount}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted mr-1">
            Filter
          </span>
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            const activeClass =
              f.value === "pending"
                ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
                : f.value === "resolved"
                ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20"
                : f.value === "rejected"
                ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20"
                : "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20";
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${
                  active
                    ? activeClass
                    : "bg-canvas-alt border-border text-muted hover:text-main hover:border-white/20"
                }`}
              >
                {f.label}
                <span
                  className={`ml-2 text-[10px] tabular-nums ${
                    active ? "opacity-90" : "opacity-60"
                  }`}
                >
                  {filterCounts[f.value]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border overflow-hidden bg-canvas-alt/20 backdrop-blur-xl overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead className="text-left text-[11px] uppercase tracking-widest text-muted bg-black/20">
              <tr className="border-b border-border">
                <th className="p-5">User</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
                <th className="pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => {
                  const canDelete =
                    report.status === "resolved" ||
                    report.status === "rejected";

                  return (
                    <tr
                      key={report.id}
                      className="border-b border-border hover:bg-white/5 transition-all"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-teal-500" />
                          </div>
                          <div>
                            <div className="font-bold text-white">
                              {report.user?.name || "Unknown User"}
                            </div>
                            <div className="text-[10px] text-muted uppercase">
                              Reporter
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="text-xs text-muted">
                        <div className="space-y-1">
                          {report.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[140px]">
                                {report.email}
                              </span>
                            </div>
                          )}
                          {report.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 shrink-0" />
                              {report.phone}
                            </div>
                          )}
                          {!report.email && !report.phone && <span>—</span>}
                        </div>
                      </td>

                      <td>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                          {report.reportType}
                        </span>
                      </td>

                      <td className="text-muted text-sm max-w-[200px] truncate">
                        {report.description || "No description"}
                      </td>

                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            report.status === "resolved"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : report.status === "rejected"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>

                      <td className="text-xs text-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {report.createdAt
                            ? new Date(report.createdAt).toLocaleDateString()
                            : "—"}
                        </div>
                      </td>

                      <td className="pr-6 py-4 text-right align-middle">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="h-9 px-4 inline-flex items-center justify-center rounded-xl text-xs font-bold bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white transition"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              canDelete && setReportToDelete(report)
                            }
                            disabled={!canDelete}
                            className={`h-9 w-9 inline-flex items-center justify-center rounded-xl transition ${
                              canDelete
                                ? "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                                : "bg-canvas-alt text-muted/50 cursor-not-allowed opacity-50"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-20 text-center text-muted">
                    <Flag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    {statusFilter === "all"
                      ? "No reports found"
                      : `No ${statusFilter} reports`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ReportsPage;