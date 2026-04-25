import { useEffect, useMemo, useState } from "react";

const StatCard = ({ label, value }) => (
  <article className="rounded-2xl border border-border p-4">
    <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
    <p className="mt-2 text-3xl font-bold">{value}</p>
  </article>
);

const Section = ({ title, children }) => (
  <div className="rounded-2xl border border-border p-4">
    <h3 className="text-base font-semibold">{title}</h3>
    <div className="mt-3">{children}</div>
  </div>
);

function DashboardPage({ api, refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api("/dashboard");
        if (!isActive) return;
        setData(response?.data || null);
      } catch (err) {
        if (!isActive) return;
        setError(err.message || "Failed to load dashboard");
      } finally {
        if (isActive) setLoading(false);
      }
    };
    run();
    return () => {
      isActive = false;
    };
  }, [api, refreshKey]);

  const stats = data?.stats || {};
  const chartMax = useMemo(
    () => Math.max(1, ...(data?.charts || []).map((item) => item.revenue || 0)),
    [data?.charts]
  );

  if (loading) {
    return <div className="p-6 md:p-8 text-sm text-muted">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 md:p-8 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Users" value={stats.totalUsers || 0} />
        <StatCard label="Total Courses" value={stats.totalCourses || 0} />
        <StatCard label="Enrollments" value={stats.totalEnrollments || 0} />
        <StatCard label="Payments" value={stats.totalPayments || 0} />
        <StatCard label="Complaints" value={stats.totalComplaints || 0} />
        <StatCard label="Pending Complaints" value={stats.pendingComplaints || 0} />
      </div>

      <Section title="Revenue Trend (Last 6 Months)">
        <div className="space-y-2">
          {(data?.charts || []).map((item) => (
            <div key={item.label} className="grid grid-cols-[50px_1fr_auto] gap-3 items-center">
              <span className="text-xs text-muted">{item.label}</span>
              <div className="h-2 rounded bg-canvas-alt overflow-hidden">
                <div
                  className="h-2 rounded bg-primary"
                  style={{ width: `${Math.max(4, Math.round((item.revenue / chartMax) * 100))}%` }}
                />
              </div>
              <span className="text-xs font-medium">{item.revenue}</span>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-4 xl:grid-cols-3">
        <Section title="Recent Users">
          <div className="space-y-2">
            {(data?.recent?.users || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted">{item.email}</p>
                </div>
                <span className="text-xs text-muted">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Recent Enrollments">
          <div className="space-y-2">
            {(data?.recent?.enrollments || []).map((item) => (
              <div key={item.enrollmentId} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <div>
                  <p className="font-medium">{item.userName}</p>
                  <p className="text-xs text-muted">{item.courseTitle}</p>
                </div>
                <span className="text-xs text-muted">{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : "-"}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Recent Payments">
          <div className="space-y-2">
            {(data?.recent?.payments || []).map((item) => (
              <div key={item.paymentId} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <div>
                  <p className="font-medium">{item.userName}</p>
                  <p className="text-xs text-muted">{item.courseTitle}</p>
                </div>
                <span className="text-xs font-medium">+{item.amount}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

export default DashboardPage;
