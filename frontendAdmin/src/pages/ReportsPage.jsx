import { useEffect, useState } from "react";
import { Flag, MessageSquare, User, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { callApi } from "../utils/api";

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await callApi("/admin/reports");
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

  if (loading) return <div className="p-10 text-center text-muted">Loading reports...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">User Reports</h2>
        <div className="flex gap-2 text-xs font-black uppercase tracking-widest text-muted">
          <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4 text-orange-500" /> Pending</span>
          <span className="flex items-center gap-1 ml-4"><CheckCircle2 className="w-4 h-4 text-green-500" /> Resolved</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="text-left text-[10px] uppercase tracking-widest text-muted bg-canvas-alt/30">
            <tr className="border-b border-border">
              <th className="p-5">Reporter</th>
              <th>Content / Post</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Date</th>
              <th className="pr-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {reports.length > 0 ? (
              reports.map((report) => (
                <tr key={report.id} className="border-b border-border hover:bg-canvas-alt/50 transition-all group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-teal-500" />
                      </div>
                      <div>
                        <div className="font-bold text-main">{report.reporter?.name || "Unknown User"}</div>
                        <div className="text-[10px] text-muted uppercase tracking-tighter">{report.reporter?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="max-w-md">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-muted mt-1 shrink-0" />
                        <p className="text-muted text-[13px] leading-relaxed line-clamp-2 italic">
                          "{report.post?.content || "Content deleted or unavailable"}"
                        </p>
                      </div>
                      {report.post?.author && (
                        <div className="mt-1 text-[10px] text-muted/60 ml-6 uppercase font-bold">
                          By: {report.post.author.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="px-3 py-1 rounded-full bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">
                      {report.reason}
                    </span>
                    <p className="text-[11px] text-muted mt-1 max-w-[200px] truncate">{report.description}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${report.status === 'resolved' ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${report.status === 'resolved' ? 'text-green-500' : 'text-orange-500'}`}>
                        {report.status}
                      </span>
                    </div>
                  </td>
                  <td className="text-muted font-bold text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="pr-8 text-right">
                    <button className="h-9 px-4 rounded-xl border border-border hover:bg-teal-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                      Take Action
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-20 text-center text-muted italic">
                  <div className="flex flex-col items-center gap-4 opacity-50">
                    <Flag className="w-12 h-12" />
                    <p className="text-lg font-bold uppercase tracking-widest">No reports found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ReportsPage;
