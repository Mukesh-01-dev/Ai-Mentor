import { useEffect, useState } from "react";
import { callApi } from "../utils/api";

function PaymentsPage() {
  const [data, setData] = useState({ summary: {}, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await callApi("/admin/payments?type=list");
        if (res.success) {
          setData({
            summary: res.summary || {},
            transactions: res.data || [],
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-muted">Loading payments...</div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-border p-5">
          <p className="text-muted text-sm uppercase tracking-wider font-bold">
            Total Revenue
          </p>
          <p className="text-4xl font-black mt-2">
            Rs {data.summary.totalAmount || 0}
          </p>
        </article>
        <article className="rounded-2xl border border-border p-5">
          <p className="text-muted text-sm uppercase tracking-wider font-bold">
            Total Payments
          </p>
          <p className="text-4xl font-black mt-2 text-green-600">
            {data.summary.totalPayments || 0}
          </p>
        </article>
        <article className="rounded-2xl border border-border p-5 opacity-50">
          <p className="text-muted text-sm uppercase tracking-wider font-bold">
            Refunded
          </p>
          <p className="text-4xl font-black mt-2 text-red-600">Rs 0</p>
        </article>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-black uppercase tracking-tight">
            Recent Transactions
          </h3>
          <span className="text-[10px] font-bold text-muted bg-canvas-alt px-3 py-1 rounded-full uppercase tracking-widest">
            Live Updates
          </span>
        </div>

        <div className="divide-y divide-border/50">
          {data.transactions.length > 0 ? (
            data.transactions.map((t) => (
             
              <div
                key={t.paymentId}
                className="grid grid-cols-[1.5fr_1fr_auto] items-center gap-6 p-5 hover:bg-canvas-alt transition-colors"
              >
                {/* LEFT SECTION */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold uppercase text-[10px] shrink-0">
                    Pay
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-sm uppercase tracking-tight truncate">
                      {t.userName}
                    </p>

                    <p className="text-xs text-gray-500 font-medium truncate">
                      {t.courseTitle}
                    </p>

                    <p className="text-[11px] text-gray-400 font-mono mt-1 truncate">
                      TXN ID: {t.transactionId || t.paymentId}
                    </p>
                  </div>
                </div>

                {/* MIDDLE SECTION */}
                <div className="text-center">
                  <p
                    className={`font-black text-sm ${
                      t.status === "paid" ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    + Rs {t.amount}
                  </p>

                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {t.purchaseDate
                      ? new Date(t.purchaseDate).toLocaleDateString()
                      : "Pending"}
                  </p>
                </div>

                {/* RIGHT SECTION */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="h-10 px-4 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-colors font-semibold whitespace-nowrap"
                  >
                    See Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-muted italic text-sm">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentsPage;
