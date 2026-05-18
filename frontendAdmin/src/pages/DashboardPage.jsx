import { useEffect, useState } from "react";
import { callApi } from "../utils/api";
import { BookOpen, Users, GraduationCap, CreditCard, ShieldAlert } from "lucide-react";

const Metric = ({ label, value, icon: Icon, color }) => (
  <article className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <p className="text-sm font-bold text-muted uppercase tracking-wider">{label}</p>
    <p className="mt-2 text-3xl font-black">{value}</p>
  </article>
);

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Using the enrollments stats endpoint as it returns a good summary
        const res = await callApi("/admin/enrollments?type=stats");
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center text-muted italic">Loading dashboard stats...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-main">Admin Dashboard</h2>
        <p className="text-muted font-medium mt-1">Overview of your platform's performance.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Metric 
          label="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <Metric 
          label="Total Courses" 
          value={stats?.totalCourses || 0} // Note: backend stats endpoint might need courses count added or we can fetch it separately
          icon={BookOpen} 
          color="bg-teal-500" 
        />
        <Metric 
          label="Enrollments" 
          value={stats?.totalEnrollments || 0} 
          icon={GraduationCap} 
          color="bg-purple-500" 
        />
        <Metric 
          label="Total Revenue" 
          value={`Rs ${stats?.totalRevenue || 0}`} 
          icon={CreditCard} 
          color="bg-green-500" 
        />
      </div>

      <div className="bg-canvas-alt rounded-3xl p-8 border border-border/50 border-dashed text-center">
        <ShieldAlert className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-bold text-main opacity-40 uppercase tracking-widest">Platform Insights Coming Soon</h3>
        <p className="text-xs text-muted mt-2 max-w-sm mx-auto">Detailed charts and activity graphs are being prepared to help you make better data-driven decisions.</p>
      </div>
    </div>
  );
}

export default DashboardPage;

