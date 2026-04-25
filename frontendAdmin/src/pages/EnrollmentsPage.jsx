import { useEffect, useState } from "react";

function EnrollmentsPage({ api, searchQuery, refreshKey }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [courseId, setCourseId] = useState("");
  const [userId, setUserId] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        search: searchQuery || "",
        status,
        courseId,
        userId,
        limit: "200",
      });
      const response = await api(`/enrollments?${query.toString()}`);
      setRows(response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [searchQuery, status, courseId, userId, refreshKey]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Enrollments</h2>
        <div className="flex gap-2">
          <input
            className="h-10 w-28 px-3 rounded-xl border border-border bg-canvas-alt text-sm"
            placeholder="Course ID"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
          />
          <input
            className="h-10 w-44 px-3 rounded-xl border border-border bg-canvas-alt text-sm"
            placeholder="User ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
          <select
            className="h-10 px-3 rounded-xl border border-border bg-canvas-alt text-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">active</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading enrollments...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[860px]">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr className="border-b border-border">
                <th className="p-4">User</th>
                <th className="p-4">Course</th>
                <th className="p-4">Status</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((item) => (
                <tr key={item.enrollmentId} className="border-b border-border">
                  <td className="p-4">
                    <p className="font-medium">{item.userName}</p>
                    <p className="text-xs text-muted">{item.email}</p>
                  </td>
                  <td className="p-4">{item.courseTitle}</td>
                  <td className="p-4">{item.status}</td>
                  <td className="p-4">{item.progressPercent || 0}%</td>
                  <td className="p-4">{item.amount}</td>
                  <td className="p-4">{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="p-6 text-center text-sm text-muted" colSpan={6}>
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EnrollmentsPage;
