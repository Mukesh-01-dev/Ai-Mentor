import { useEffect, useState } from "react";
import { AlertCircle, MessageSquare } from "lucide-react";

function ComplaintsPage({ api, searchQuery, refreshKey, triggerRefresh }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        search: searchQuery || "",
        status: statusFilter,
        limit: "200",
      });
      const response = await api(`/complaints?${query.toString()}`);
      setRows(response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load complaints and reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [searchQuery, statusFilter, refreshKey]);

  const updateStatus = async (id, status, type) => {
    setBusyId(id);
    setError("");
    try {
      if (type === "report") {
        // For reports, use moderate endpoint with action
        await api(`/complaints/${id}/moderate`, {
          method: "PUT",
          body: JSON.stringify({ action: status }),
        });
      } else {
        // For general complaints, use status endpoint
        await api(`/complaints/${id}/status`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        });
      }
      await load();
      triggerRefresh();
    } catch (err) {
      setError(err.message || "Failed to update");
    } finally {
      setBusyId("");
    }
  };

  const filteredRows = rows.filter((row) => {
    if (typeFilter && row.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-3xl font-semibold">Complaints & Reports</h2>
        <div className="flex gap-2">
          <select
            className="h-10 px-3 rounded-xl border border-border bg-canvas-alt text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="complaint">General Complaints</option>
            <option value="report">Reported Content</option>
          </select>
          <select
            className="h-10 px-3 rounded-xl border border-border bg-canvas-alt text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
            <option value="closed">closed</option>
            <option value="pending">pending</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading complaints and reports...</p>
      ) : (
        <div className="space-y-3">
          {filteredRows.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.type === "report" ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <h3 className="text-base font-semibold">{item.subject}</h3>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          REPORT
                        </span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <h3 className="text-base font-semibold">{item.subject}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          COMPLAINT
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    {item.user?.name || "Unknown user"} ({item.user?.email || "-"})
                    {item.priority && ` • Priority: ${item.priority}`}
                    {item.reason && ` • Reason: ${item.reason}`}
                  </p>
                </div>
                <div className="text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</div>
              </div>

              <p className="mt-3 text-sm bg-canvas-alt p-3 rounded">{item.message}</p>

              {item.type === "report" && item.post && (
                <div className="mt-3 p-2 bg-canvas-alt rounded text-xs text-muted border-l-2 border-orange-500">
                  <p className="font-semibold mb-1">
                    {item.replyId ? "Reported Comment:" : "Reported Post:"}
                  </p>
                  <p>{item.post?.replies?.find((r) => String(r.id) === String(item.replyId))?.text || item.post?.content || "-"}</p>
                  {item.post?.author && (
                    <p className="text-xs mt-1">Author: {item.post.author.name}</p>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-muted">
                  Status: <span className="font-semibold">{item.status}</span>
                </span>

                {item.type === "report" ? (
                  <div className="flex gap-2">
                    <select
                      className="h-8 px-2 rounded-lg border border-border bg-canvas-alt text-xs"
                      value={item.action || ""}
                      disabled={busyId === item.id}
                      onChange={(e) => updateStatus(item.id, e.target.value, "report")}
                    >
                      <option value="">Take Action</option>
                      <option value="hidden">Hide</option>
                      <option value="deleted">Delete</option>
                      <option value="dismissed">Dismiss</option>
                    </select>
                  </div>
                ) : (
                  <select
                    className="h-8 px-2 rounded-lg border border-border bg-canvas-alt text-xs"
                    value={item.status}
                    disabled={busyId === item.id}
                    onChange={(e) => updateStatus(item.id, e.target.value, "complaint")}
                  >
                    <option value="open">open</option>
                    <option value="in_progress">in_progress</option>
                    <option value="resolved">resolved</option>
                    <option value="closed">closed</option>
                  </select>
                )}
              </div>
            </article>
          ))}
          {!filteredRows.length && (
            <p className="text-sm text-muted">No complaints or reports found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ComplaintsPage;
