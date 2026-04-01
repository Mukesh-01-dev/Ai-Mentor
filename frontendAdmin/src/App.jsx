import { useMemo, useState } from "react";

const courses = [
  ["UI/UX Masterclass", "Design", "Rs 89.00", "1,204", "Published"],
  ["Full Stack Dev Bootcamp", "Development", "Rs 149.00", "3,450", "Published"],
  ["Digital Marketing Strategy", "Marketing", "Rs 59.00", "892", "Draft"],
  ["Python for Data Science", "Development", "Rs 120.00", "2,115", "Published"],
  ["AWS Cloud Certification", "Development", "Rs 199.00", "1,876", "Published"],
  ["Product Management Fundamentals", "Business", "Rs 79.00", "654", "Draft"],
];

const users = [
  ["John Doe", "john@example.com", "5", "2024-01-15", "Active"],
  ["Jane Smith", "jane@example.com", "3", "2024-02-01", "Active"],
  ["Mike Johnson", "mike@example.com", "8", "2023-11-20", "Active"],
  ["Sarah Williams", "sarah@example.com", "2", "2024-01-28", "Inactive"],
  ["David Brown", "david@example.com", "6", "2023-12-10", "Active"],
];

const enrollments = [
  ["John Doe", "UI/UX Masterclass", "2024-02-08", "Rs 89.00", "Completed"],
  ["Jane Smith", "Full Stack Dev Bootcamp", "2024-02-07", "Rs 149.00", "Completed"],
  ["Mike Johnson", "Python for Data Science", "2024-02-06", "Rs 120.00", "Pending"],
  ["Sarah Williams", "Digital Marketing Strategy", "2024-02-05", "Rs 59.00", "Completed"],
  ["David Brown", "AWS Cloud Certification", "2024-02-04", "Rs 199.00", "Refunded"],
];

const transactions = [
  ["John Doe", "UI/UX Masterclass", "+Rs 89.00", "2024-02-08", "text-green-600"],
  ["Jane Smith", "Full Stack Dev Bootcamp", "+Rs 149.00", "2024-02-07", "text-green-600"],
  ["Mike Johnson", "Python for Data Science", "+Rs 120.00", "2024-02-06", "text-amber-500"],
  ["Sarah Williams", "Digital Marketing Strategy", "+Rs 59.00", "2024-02-05", "text-green-600"],
  ["David Brown", "AWS Cloud Certification", "-Rs 199.00", "2024-02-04", "text-red-600"],
];

const navItems = [
  ["dashboard", "Dashboard"],
  ["courses", "Courses"],
  ["users", "Users"],
  ["enrollments", "Enrollments"],
  ["payments", "Payments"],
];

function App() {
  const [page, setPage] = useState("courses");

  const title = useMemo(() => {
    switch (page) {
      case "dashboard":
        return "Dashboard";
      case "courses":
        return "Manage Courses";
      case "users":
        return "Manage Users";
      case "enrollments":
        return "Enrollments";
      case "payments":
        return "Payments";
      default:
        return "Dashboard";
    }
  }, [page]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]" style={{ backgroundColor: "var(--admin-bg)" }}>
      <aside className="text-white flex flex-col" style={{ backgroundColor: "var(--admin-sidebar)" }}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: "var(--admin-primary)" }}>S</div>
            <div>
              <p className="font-semibold text-xl leading-5">UptoSkills</p>
              <p className="text-xs text-white/70">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map(([id, label]) => {
            const active = page === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPage(id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition ${active ? "text-white" : "hover:bg-white/10"}`}
                style={active ? { backgroundColor: "var(--admin-primary)" } : undefined}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-4 space-y-3">
          <button type="button" className="w-full text-left px-4 py-3 rounded-xl font-medium hover:bg-white/10 transition">Settings</button>
          <div className="px-4 py-3 rounded-xl bg-white/5 flex items-center justify-between">
            <div>
              <p className="font-semibold">Admin</p>
              <p className="text-xs text-white/70">Super Admin</p>
            </div>
            <span className="h-8 w-8 rounded-full text-slate-900 font-bold flex items-center justify-center" style={{ backgroundColor: "var(--brand-orange)" }}>A</span>
          </div>
        </div>
      </aside>

      <main className="flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b px-4 md:px-8 flex items-center justify-between gap-3" style={{ borderColor: "var(--neutral-100)" }}>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full px-4 py-2 min-w-64" style={{ backgroundColor: "var(--neutral-50)" }}>
              <span className="text-sm" style={{ color: "rgba(51,51,51,0.6)" }}>Search courses...</span>
            </div>
            <button type="button" className="relative h-10 w-10 rounded-xl" style={{ backgroundColor: "var(--neutral-50)", color: "var(--neutral-800)" }}>
              B
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button type="button" className="h-11 px-4 md:px-6 rounded-xl text-white font-semibold" style={{ backgroundColor: "var(--admin-primary)" }}>
              + Add Course
            </button>
          </div>
        </header>

        <section className="p-4 md:p-8">
          <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: "var(--neutral-100)", boxShadow: "0 2px 8px rgba(26,26,26,0.06)" }}>
            {page === "dashboard" && <DashboardPage />}
            {page === "courses" && <CoursesPage />}
            {page === "users" && <UsersPage />}
            {page === "enrollments" && <EnrollmentsPage />}
            {page === "payments" && <PaymentsPage />}
          </div>
        </section>
      </main>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-semibold mb-3">Admin Dashboard</h2>
      <p style={{ color: "rgba(51,51,51,0.7)" }}>
        Use sidebar navigation to manage courses, users, enrollments, and payments.
      </p>
    </div>
  );
}

function CoursesPage() {
  return (
    <>
      <div className="border-b p-6 md:p-8 flex items-center justify-between" style={{ borderColor: "var(--neutral-100)" }}>
        <h2 className="text-3xl font-semibold">Active Courses</h2>
        <div className="flex gap-2">
          <button type="button" className="h-10 px-4 rounded-xl border" style={{ borderColor: "var(--neutral-100)" }}>Filter</button>
          <button type="button" className="h-10 px-4 rounded-xl border" style={{ borderColor: "var(--neutral-100)" }}>Export</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead className="text-left text-xs uppercase tracking-wider" style={{ color: "rgba(51,51,51,0.6)" }}>
            <tr className="border-b" style={{ borderColor: "var(--neutral-100)" }}>
              <th className="p-5">Course Detail</th>
              <th>Category</th>
              <th>Pricing</th>
              <th>Enrolled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {courses.map(([name, category, price, enrolled, status]) => (
              <tr key={name} className="border-b" style={{ borderColor: "var(--neutral-100)" }}>
                <td className="p-5">
                  <div className="font-semibold">{name}</div>
                  <div style={{ color: "rgba(51,51,51,0.6)" }}>Last updated recently</div>
                </td>
                <td><span className="px-3 py-1 rounded-full" style={{ backgroundColor: "var(--neutral-50)" }}>{category}</span></td>
                <td className="font-semibold">{price}</td>
                <td>{enrolled}</td>
                <td className={status === "Published" ? "text-green-600" : "text-orange-500"}>{status}</td>
                <td className="text-lg">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function UsersPage() {
  return (
    <>
      <div className="border-b p-6 md:p-8 flex items-center justify-between" style={{ borderColor: "var(--neutral-100)" }}>
        <h2 className="text-3xl font-semibold">All Users</h2>
        <div className="flex gap-2">
          <button type="button" className="h-10 px-4 rounded-xl border" style={{ borderColor: "var(--neutral-100)" }}>Filter</button>
          <button type="button" className="h-10 px-4 rounded-xl text-white" style={{ backgroundColor: "var(--admin-primary)" }}>+ Add User</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead className="text-left text-xs uppercase tracking-wider" style={{ color: "rgba(51,51,51,0.6)" }}>
            <tr className="border-b" style={{ borderColor: "var(--neutral-100)" }}>
              <th className="p-5">User</th>
              <th>Email</th>
              <th>Enrolled Courses</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {users.map(([name, mail, enrolled, joinDate, status]) => (
              <tr key={mail} className="border-b" style={{ borderColor: "var(--neutral-100)" }}>
                <td className="p-5 font-medium">{name}</td>
                <td>{mail}</td>
                <td>{enrolled}</td>
                <td>{joinDate}</td>
                <td className={status === "Active" ? "text-green-600" : "text-red-600"}>{status}</td>
                <td className="text-lg">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function EnrollmentsPage() {
  return (
    <>
      <div className="border-b p-6 md:p-8 flex items-center justify-between" style={{ borderColor: "var(--neutral-100)" }}>
        <h2 className="text-3xl font-semibold">All Enrollments</h2>
        <button type="button" className="h-10 px-4 rounded-xl border" style={{ borderColor: "var(--neutral-100)" }}>Export Report</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-215">
          <thead className="text-left text-xs uppercase tracking-wider" style={{ color: "rgba(51,51,51,0.6)" }}>
            <tr className="border-b" style={{ borderColor: "var(--neutral-100)" }}>
              <th className="p-5">Student</th>
              <th>Course</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {enrollments.map(([name, course, date, amount, status]) => (
              <tr key={`${name}-${course}`} className="border-b" style={{ borderColor: "var(--neutral-100)" }}>
                <td className="p-5 font-medium">{name}</td>
                <td>{course}</td>
                <td>{date}</td>
                <td className="font-semibold">{amount}</td>
                <td className={status === "Completed" ? "text-green-600" : status === "Pending" ? "text-amber-500" : "text-red-600"}>{status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PaymentsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--neutral-100)" }}><p style={{ color: "rgba(51,51,51,0.7)" }}>Total Revenue</p><p className="text-5xl font-bold">Rs 45,200</p></article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--neutral-100)" }}><p style={{ color: "rgba(51,51,51,0.7)" }}>This Month</p><p className="text-5xl font-bold text-green-600">Rs 8,450</p></article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--neutral-100)" }}><p style={{ color: "rgba(51,51,51,0.7)" }}>Pending</p><p className="text-5xl font-bold text-orange-500">Rs 1,230</p></article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--neutral-100)" }}><p style={{ color: "rgba(51,51,51,0.7)" }}>Refunded</p><p className="text-5xl font-bold text-red-600">Rs 450</p></article>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--neutral-100)" }}>
        <div className="p-5 border-b" style={{ borderColor: "var(--neutral-100)" }}>
          <h3 className="text-2xl font-semibold">Recent Transactions</h3>
        </div>
        {transactions.map(([name, course, amount, date, amountColor]) => (
          <div key={`${name}-${date}-${amount}`} className="p-5 border-b flex items-center justify-between gap-4" style={{ borderColor: "var(--neutral-100)" }}>
            <div>
              <p className="font-medium">{name}</p>
              <p style={{ color: "rgba(51,51,51,0.6)" }}>{course}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${amountColor}`}>{amount}</p>
              <p className="text-sm" style={{ color: "rgba(51,51,51,0.6)" }}>{date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
