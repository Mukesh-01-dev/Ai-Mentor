import { useEffect, useState } from "react";
import {
  Flag,
  MessageSquare,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { callApi } from "../utils/api";

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading)
    return (
      <div className="p-10 text-center text-muted">Loading reports...</div>
    );

  if (error)
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Reports Dashboard
          </h2>
          <p className="text-muted text-sm">
            Monitor and manage all user reports
          </p>
        </div>

        <div className="flex gap-3">
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
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="rounded-2xl border border-border overflow-hidden bg-canvas-alt/20 backdrop-blur-xl">
        <table className="w-full min-w-[800px]">
          <thead className="text-left text-[11px] uppercase tracking-widest text-muted bg-black/20">
            <tr className="border-b border-border">
              <th className="p-5">User</th>
              <th>Course</th>
              <th>Type</th>
              <th>Description</th>
              <th>Status</th>
              <th>Date</th>
              <th className="pr-6 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-border hover:bg-white/5 transition-all"
                >
                  {/* USER */}
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-teal-500" />
                      </div>

                      <div>
                        {/* NAME FIRST */}
                        <div className="font-bold text-white">
                          {report.user?.name || "Unknown User"}
                        </div>

                        {/* ID SECOND */}
                        <div className="text-[11px] text-muted">
                          {report.userId}
                        </div>

                        <div className="text-[10px] text-muted uppercase">
                          Reporter
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* COURSE */}
                  <td className="text-sm text-muted">{report.courseName}</td>

                  {/* TYPE */}
                  <td>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                      {report.reportType}
                    </span>
                  </td>

                  {/* DESCRIPTION */}
                  <td className="text-muted text-sm max-w-[250px] truncate">
                    {report.description || "No description"}
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        report.status === "resolved"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>

                  {/* DATE */}
                  <td className="text-xs text-muted">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* ACTION */}
                  <td className="pr-6 text-right">
                    <button className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white transition">
                      View
                    </button>
                  </td>
                </tr>
              ))
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
  );
}

export default ReportsPage;
