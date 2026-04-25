import { transactions } from "../data/adminData";

function PaymentsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-border p-5"><p className="text-muted">Total Revenue</p><p className="text-5xl font-bold">Rs 45,200</p></article>
        <article className="rounded-2xl border border-border p-5"><p className="text-muted">This Month</p><p className="text-5xl font-bold text-green-600">Rs 8,450</p></article>
        <article className="rounded-2xl border border-border p-5"><p className="text-muted">Pending</p><p className="text-5xl font-bold text-orange-500">Rs 1,230</p></article>
        <article className="rounded-2xl border border-border p-5"><p className="text-muted">Refunded</p><p className="text-5xl font-bold text-red-600">Rs 450</p></article>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-2xl font-semibold">Recent Transactions</h3>
        </div>
        {transactions.map(([name, course, amount, date, amountColor]) => (
          <div key={`${name}-${date}-${amount}`} className="p-5 border-b border-border flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-muted">{course}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${amountColor}`}>{amount}</p>
              <p className="text-sm text-muted">{date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentsPage;
