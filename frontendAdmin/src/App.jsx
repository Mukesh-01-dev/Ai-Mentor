import { useMemo, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import AdminSidebar from "./components/layout/AdminSidebar";
import { PAGE_TITLES } from "./constants/adminNavigation";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import EnrollmentsPage from "./pages/EnrollmentsPage";
import LoginPage from "./pages/LoginPage";
import PaymentsPage from "./pages/PaymentsPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";


const PAGE_COMPONENTS = {
  dashboard: DashboardPage,
  courses: CoursesPage,
  users: UsersPage,
  enrollments: EnrollmentsPage,
  payments: PaymentsPage,
  reports: ReportsPage,
  profile: ProfilePage,
  settings: SettingsPage,
};

function App() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [page, setPage] = useState("courses");
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const pathName = location.pathname.replace("/", "");     
    if (PAGE_COMPONENTS[pathName]) {
      setPage(pathName);
    }
  }, [location.pathname]);

  const title = useMemo(() => PAGE_TITLES[page] ?? PAGE_TITLES.dashboard, [page]);
  const CurrentPage = PAGE_COMPONENTS[page] ?? DashboardPage;
  const isLoginRoute = location.pathname === "/login";

  if (isLoginRoute) {
    return <LoginPage />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-canvas-alt text-main">
      <AdminSidebar
        page={page}
        onPageChange={setPage}
        mobileOpen={mobileNav}
        onMobileClose={() => setMobileNav(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? "lg:ml-24" : "lg:ml-80"}`}>
        <Header title={title} onMenuClick={() => setMobileNav(true)} />

        <section className="p-4 md:p-8">
          <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-[0_2px_8px_rgba(26,26,26,0.06)]">
            <CurrentPage />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
