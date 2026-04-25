import { useMemo, useState } from "react";
import Header from "./components/Header";
import AdminSidebar from "./components/layout/AdminSidebar";
import { PAGE_TITLES } from "./constants/adminNavigation";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import UsersPage from "./pages/UsersPage";
import EnrollmentsPage from "./pages/EnrollmentsPage";
import PaymentsPage from "./pages/PaymentsPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import AdminsPage from "./pages/AdminsPage";
import { adminRequest, getAdminSession } from "./lib/adminApi";

const PAGE_COMPONENTS = {
  dashboard: DashboardPage,
  courses: CoursesPage,
  users: UsersPage,
  enrollments: EnrollmentsPage,
  payments: PaymentsPage,
  complaints: ComplaintsPage,
  admins: AdminsPage,
};

function App() {
  const [page, setPage] = useState("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const { user } = getAdminSession();
  const title = useMemo(() => PAGE_TITLES[page] ?? PAGE_TITLES.dashboard, [page]);
  const CurrentPage = PAGE_COMPONENTS[page] ?? DashboardPage;

  if (token && isAdminRole(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <div className="min-h-screen bg-canvas-alt text-main">
      <AdminSidebar
        page={page}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          setSearchQuery("");
        }}
        mobileOpen={mobileNav}
        onMobileClose={() => setMobileNav(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? "lg:ml-24" : "lg:ml-80"}`}>
        <Header
          title={title}
          onMenuClick={() => setMobileNav(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <section className="p-4 md:p-8">
          <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-[0_2px_8px_rgba(26,26,26,0.06)]">
            <CurrentPage
              api={adminRequest}
              user={user}
              isSuperAdmin={user?.role === "superAdmin"}
              searchQuery={searchQuery}
              refreshKey={refreshKey}
              triggerRefresh={() => setRefreshKey((prev) => prev + 1)}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
