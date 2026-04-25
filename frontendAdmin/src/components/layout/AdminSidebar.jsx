import { useMemo } from "react";
import {
  BookOpen,
  ChevronRight,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  ShieldAlert,
  Settings,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { NAV_ITEMS } from "../../constants/adminNavigation";

const ICONS = {
  dashboard: LayoutDashboard,
  courses: BookOpen,
  users: Users,
  enrollments: GraduationCap,
  payments: CreditCard,
  complaints: ShieldAlert,
  admins: UserCog,
};

function AdminSidebar({
  page,
  onPageChange,
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  onToggleCollapsed,
}) {
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";
  const roleLabel = user?.role || "Admin";
  const avatarUrl =
    user?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-60 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed lg:fixed top-0 left-0 z-[70] bg-card/70 backdrop-blur-2xl border-r border-border/50 transform transition-all duration-500 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-24" : "lg:w-80"} w-80 h-screen overflow-visible`}
      >
        <button
          onClick={onToggleCollapsed}
          className="hidden lg:flex absolute -right-5 top-8 w-10 h-10 bg-card border border-border rounded-xl items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-xl z-80"
          type="button"
        >
          <ChevronRight className={`w-5 h-5 transition-transform duration-500 ${collapsed ? "" : "rotate-180"}`} />
        </button>

        <div className="h-16 px-4 flex items-center justify-between border-b border-border/30">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img src="/upto.png" alt="UptoSkills" className="h-8 w-auto" />
              <div>
                <p className="text-sm font-black uppercase tracking-tight text-main">Admin Panel</p>
                <p className="text-[9px] text-muted uppercase tracking-widest">UptoSkills</p>
              </div>
            </div>
          )}
          <button
            onClick={onMobileClose}
            className="lg:hidden w-9 h-9 rounded-xl border border-border bg-card"
            type="button"
          >
            <X className="w-4 h-4 mx-auto" />
          </button>
        </div>

        <nav className={`mt-6 px-4 h-[calc(100vh-18rem)] scrollbar-hide ${collapsed ? "overflow-visible" : "overflow-y-auto"}`}>
          <div className="space-y-3">
            {NAV_ITEMS.map(([id, label]) => {
              const Icon = ICONS[id] || LayoutDashboard;
              const active = page === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onPageChange(id);
                    onMobileClose?.();
                  }}
                  className={`group relative w-full flex items-center px-4 py-4 rounded-3xl cursor-pointer transition-all duration-300 ${
                    collapsed ? "justify-center" : ""
                  } ${active ? "bg-teal-500 text-white shadow-xl shadow-teal-500/30" : "text-muted hover:bg-canvas-alt"}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : "text-main"}`} />
                  {!collapsed && (
                    <span className={`ml-4 text-sm font-black uppercase tracking-tight ${active ? "text-white" : ""}`}>
                      {label}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl z-50 uppercase tracking-widest">
                      {label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-4">
          <div className={`cursor-default p-0.5 rounded-4xl bg-linear-to-br from-teal-500/30 via-blue-500/20 to-transparent`}>
            <div className={`bg-card dark:bg-slate-900 rounded-[1.9rem] transition-all duration-300 ${collapsed ? "p-1" : "p-4 flex items-center"}`}>
              <img
                src={avatarUrl}
                className={`${collapsed ? "w-12 h-12" : "w-10 h-10"} rounded-[1.2rem] shadow-md border-2 border-white dark:border-slate-800 transition-all`}
                alt="Avatar"
              />
              {!collapsed && (
                <div className="ml-3 flex-1 min-w-0 text-left">
                  <div className="text-[11px] font-black text-main truncate uppercase tracking-tight">{displayName}</div>
                  <div className="text-[9px] text-muted font-bold opacity-60 uppercase tracking-widest mt-0.5">{roleLabel}</div>
                </div>
              )}
              {!collapsed && <Settings className="w-4 h-4 text-muted" />}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
