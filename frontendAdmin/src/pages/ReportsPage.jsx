import { useEffect, useState } from "react";
import {
  Flag,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  Award,
  Mail,
  Phone,
  FileText,
  Filter,
  ChevronDown,
} from "lucide-react";
import { callApi } from "../utils/api";

function CertificateBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
      <Award className="w-3 h-3" />
      Certificate
    </span>
  );
}

function ReportModal({ report, onClose }) {
  const isCertificate =
    report?.reportType?.toLowerCase() === "certificate" ||
    report?.subType?.toLowerCase()?.includes("certificate");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg relative">
        {/* Certificate tag — top right corner */}
        {isCertificate && (
          <div className="absolute -top-3 right-5">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white shadow-lg shadow-amber-500/30">
              <Award className="w-3.5 h-3.5" />
              Certificate Report
            </span>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-canvas-alt border border-border flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 pt-8">
          {/* Header */}
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
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Email</p>
                  <p className="text-sm text-main">{report.email}</p>
                </div>
              </div>
            )}

            {report.phone && (
              <div className="flex items-start gap-3 p-4 bg-canvas-alt rounded-2xl border border-border">
                <Phone className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Phone</p>
                  <p className="text-sm text-main">{report.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-canvas-alt rounded-2xl border border-border flex-wrap">
              <Flag className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Report Type</p>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                  {report.reportType}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-canvas-alt rounded-2xl border border-border">
              <FileText className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Description</p>
                <p className="text-sm text-main leading-relaxed">{report.description || "No description provided."}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-canvas-alt rounded-2xl border border-border">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Status</p>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                  report.status === "resolved"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                }`}>
                  {report.status}
                </span>
              </div>
              <div className="p-4 bg-canvas-alt rounded-2xl border border-border">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Submitted</p>
                <p className="text-xs text-main flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(report.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await callApi("/admin/coures-reports");
        const data = Array.isArray(response?.data) ? response.data : [];
        setReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const pendingCount = reports.filter((r) => r.status !== "resolved").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const certificateCount = reports.filter(
    (r) =>
      r.reportType?.toLowerCase() === "certificate" ||
      r.subType?.toLowerCase()?.includes("certificate")
  ).length;

const filteredReports = reports.filter((report) => {
  const type = report.reportType?.toLowerCase() || "";
  switch (activeFilter) {
    case "certificate":
      return type.includes("certificate");
    case "bug":
      return (
        type.includes("bug") ||
        type.includes("error")
      );
    case "course":
      return type.includes("course");
    case "payment":
      return type.includes("payment");
    case "others":
      return (
        !type.includes("certificate") &&
        !type.includes("bug") &&
        !type.includes("error") &&
        !type.includes("course") &&
        !type.includes("payment")
      );
    default:
      return true;
  }
});

  if (loading)
    return <div className="p-10 text-center text-muted">Loading reports...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      {selectedReport && (
        <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}

      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reports Dashboard</h2>
            <p className="text-muted text-sm">Monitor and manage all user reports</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-500">Certificate: {certificateCount}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-orange-500">Pending: {pendingCount}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-green-500">Resolved: {resolvedCount}</span>
            </div>
            <div className="relative">
          <button
           onClick={() => setShowFilterMenu((prev) => !prev)}
           className="h-12 px-5 rounded-2xl border border-border bg-card flex items-center gap-3 text-sm font-black uppercase tracking-widest text-main hover:bg-canvas-alt transition-all shadow-lg"
          >
          <Filter className="w-4 h-4 text-teal-500" />
           <span> Filter: {activeFilter} </span>
           <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
           showFilterMenu ? "rotate-180" : ""
        }`}
          />
         </button>
      {showFilterMenu && (
    <div className="absolute top-14 right-0 min-w-[240px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden z-[500] animate-in fade-in zoom-in-95 duration-200">
      <button
        onClick={() => {
          setActiveFilter("all");
          setShowFilterMenu(false);
        }}
        className={`w-full px-5 py-4 text-left text-sm font-bold transition-all ${
          activeFilter === "all"
            ? "bg-teal-500 text-white"
            : "hover:bg-canvas-alt text-main"
        }`}
      >
        All Reports
      </button>
      <button
        onClick={() => {
          setActiveFilter("certificate");
          setShowFilterMenu(false);
        }}
        className={`w-full px-5 py-4 text-left text-sm font-bold transition-all ${
          activeFilter === "certificate"
            ? "bg-amber-500 text-white"
            : "hover:bg-canvas-alt text-main"
        }`}
      >
        Certificate
      </button>
      <button
        onClick={() => {
          setActiveFilter("bug");
          setShowFilterMenu(false);
        }}
        className={`w-full px-5 py-4 text-left text-sm font-bold transition-all ${
          activeFilter === "bug"
            ? "bg-red-500 text-white"
            : "hover:bg-canvas-alt text-main"
        }`}
      >
        Bug / Error
      </button>
      <button
        onClick={() => {
          setActiveFilter("course");
          setShowFilterMenu(false);
        }}
        className={`w-full px-5 py-4 text-left text-sm font-bold transition-all ${
          activeFilter === "course"
            ? "bg-blue-500 text-white"
            : "hover:bg-canvas-alt text-main"
        }`}
      >
        Course
      </button>
      <button
        onClick={() => {
          setActiveFilter("payment");
          setShowFilterMenu(false);
        }}
        className={`w-full px-5 py-4 text-left text-sm font-bold transition-all ${
          activeFilter === "payment"
            ? "bg-green-500 text-white"
            : "hover:bg-canvas-alt text-main"
        }`}
      >
        Payment Issue
      </button>
      <button
        onClick={() => {
          setActiveFilter("others");
          setShowFilterMenu(false);
        }}
        className={`w-full px-5 py-4 text-left text-sm font-bold transition-all ${
          activeFilter === "others"
            ? "bg-purple-500 text-white"
            : "hover:bg-canvas-alt text-main"
        }`}
      >
        Others
      </button>
    </div>
  )}
</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-canvas-alt/20 backdrop-blur-xl overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[800px]">
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
                  const isCertificate =
                    report.reportType?.toLowerCase() === "certificate" ||
                    report.subType?.toLowerCase()?.includes("certificate");
                  return (
                    <tr key={report.id} className="border-b border-border hover:bg-white/5 transition-all">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-teal-500" />
                          </div>
                          <div>
                            <div className="font-bold text-main">{report.user?.name || "Unknown User"}</div>
                            <div className="text-[10px] text-muted uppercase">Reporter</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-muted">
                        <div className="space-y-1">
                          {report.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[140px]">{report.email}</span>
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
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20 w-fit">
                          {report.reportType}
                        </span>
                      </td>
                      <td className="text-muted text-sm max-w-[200px] truncate">
                        {report.description || "No description"}
                      </td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          report.status === "resolved"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="text-xs text-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="pr-6 text-right">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-20 text-center text-muted">
                    <Flag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    No reports found
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