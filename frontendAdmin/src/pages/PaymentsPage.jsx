import { useEffect, useMemo, useState } from "react";

function PaymentsPage({ api, searchQuery, refreshKey }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ totalPayments: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        search: searchQuery || "",
        status,
        limit: "200",
      });
      const response = await api(`/payments?${query.toString()}`);
      setRows(response?.data || []);
      setSummary(response?.summary || { totalPayments: 0, totalAmount: 0 });
    } catch (err) {
      setError(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [searchQuery, status, refreshKey]);

  const paidCount = useMemo(
    () => rows.filter((row) => row.status === "paid").length,
    [rows]
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Payments</h2>
        <select
          className="h-10 px-3 rounded-xl border border-border bg-canvas-alt text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All Status</option>
          <option value="paid">paid</option>
          <option value="pending">pending</option>
          <option value="failed">failed</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-border p-5">
          <p className="text-muted">Total Payments</p>
          <p className="text-4xl font-bold">{summary.totalPayments || 0}</p>
        </article>
        <article className="rounded-2xl border border-border p-5">
          <p className="text-muted">Collected Amount</p>
          <p className="text-4xl font-bold">{summary.totalAmount || 0}</p>
        </article>
        <article className="rounded-2xl border border-border p-5">
          <p className="text-muted">Paid Transactions</p>
          <p className="text-4xl font-bold">{paidCount}</p>
        </article>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading payments...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[860px]">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr className="border-b border-border">
                <th className="p-4">User</th>
                <th className="p-4">Course</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Transaction</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((item) => (
                <tr key={item.paymentId} className="border-b border-border">
                  <td className="p-4">
                    <p className="font-medium">{item.userName}</p>
                    <p className="text-xs text-muted">{item.email}</p>
                  </td>
                  <td className="p-4">{item.courseTitle}</td>
                  <td className="p-4">{item.amount}</td>
                  <td className="p-4">{item.status}</td>
                  <td className="p-4 text-xs">{item.transactionId || "-"}</td>
                  <td className="p-4">{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="p-6 text-center text-sm text-muted" colSpan={6}>
                    No payments found.
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

export default PaymentsPage;
