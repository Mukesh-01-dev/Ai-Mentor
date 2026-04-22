import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChevronRight, LogOut, Settings, User, ShieldCheck, LayoutGrid } from "lucide-react";
import API_BASE_URL from "../lib/api";
import { useSidebar } from "../context/SidebarContext";
import { useTranslation } from "react-i18next";

const Sidebar = ({ activePage = "dashboard" }) => {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [navigationItems, setNavigationItems] = useState([]);
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setProfilePopupOpen(false);
    navigate("/login", { state: { logoutSuccess: true } });
  };

  const displayName = user?.name || user?.email?.split('@')[0] || "User";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfilePopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchNavigationItems = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch(`${API_BASE_URL}/api/sidebar/navigation`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (isMounted) setNavigationItems(data);
      } catch (error) { console.error("Error:", error); }
    };
    fetchNavigationItems();
    return () => { isMounted = false; };
  }, []);

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-4xl shadow-2xl p-8 w-80 text-center">
            <LogOut className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-sm font-black uppercase tracking-tight text-main mb-2">Logout</h3>
            <p className="text-xs text-muted mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border border-border hover:bg-canvas-alt transition-all">Cancel</button>
              <button onClick={confirmLogout} className="flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all">Logout</button>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed lg:fixed top-18.5 left-0 z-[70] bg-card/70 backdrop-blur-2xl border-r border-border/50 transform transition-all duration-500 ease-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${sidebarCollapsed ? "lg:w-24" : "lg:w-80"} w-80 h-[calc(100vh-4rem)] overflow-visible`}>

        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex absolute -right-5 top-8 w-10 h-10 bg-card border border-border rounded-xl items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-xl z-80">
          <ChevronRight className={`w-5 h-5 transition-transform duration-500 ${sidebarCollapsed ? "" : "rotate-180"}`} />
        </button>

        <nav className={`mt-8 px-4 h-[calc(100vh-16rem)] scrollbar-hide ${sidebarCollapsed ? "overflow-visible" : "overflow-y-auto"}`}>
          <div className="space-y-3">
            {navigationItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <div key={item.id} onClick={() => navigate(item.path)} className={`group relative flex items-center px-4 py-4 rounded-3xl cursor-pointer transition-all duration-300 ${sidebarCollapsed ? "justify-center" : ""} ${isActive ? "bg-teal-500 text-white shadow-xl shadow-teal-500/30" : "text-muted hover:bg-canvas-alt"}`}>
                  <img src={item.icon} alt={item.label} className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "brightness-0 invert" : ""}`} />
                  {!sidebarCollapsed && <span className={`ml-4 text-sm font-black uppercase tracking-tight ${isActive ? "text-white" : ""}`}>{t(`nav.${item.id}`)}</span>}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl z-50 uppercase tracking-widest">{t(`nav.${item.id}`)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* --- BOTTOM PROFILE WITH POPUP --- */}
        <div className="absolute bottom-8 left-0 right-0 px-4" ref={profileRef}>
          {profilePopupOpen && (
            <div className={`absolute bottom-full mb-6 left-4 right-4 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-[0_-20px_80px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-90 ${sidebarCollapsed ? "w-52 -left-2" : ""}`}>
              <div className="p-6 border-b border-border/50 bg-linear-to-tr from-teal-500/10 to-transparent text-center">
                 <img 
                   src={user?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.name || displayName)}`} 
                   className="w-16 h-16 rounded-3xl mx-auto mb-3 shadow-2xl border-2 border-card object-cover" 
                   alt="User" 
                   onError={(e) => {
                     const seed = encodeURIComponent(`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.name || displayName);
                     e.target.src = `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;
                   }}
                 />
                 <h4 className="text-xs font-black text-main uppercase tracking-tighter">{displayName}</h4>
              </div>
              <div className="p-2">
                <button onClick={() => {navigate("/settings"); setProfilePopupOpen(false);}} className="flex items-center w-full px-4 py-4 text-[10px] font-black uppercase text-main hover:bg-teal-500 hover:text-white rounded-3xl transition-all"><Settings className="w-4 h-4 mr-3" /> {t("header.dashboard_settings")}</button>
                <button onClick={handleLogout} className="flex items-center w-full px-4 py-4 text-[10px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white rounded-3xl transition-all mt-1"><LogOut className="w-4 h-4 mr-3" /> {t("auth.logout")}</button>
              </div>
            </div>
          )}

          <div
            onClick={() => setProfilePopupOpen(!profilePopupOpen)}
            className={`cursor-pointer group relative p-0.5 rounded-4xl bg-linear-to-br from-teal-500/30 via-blue-500/20 to-transparent transition-all duration-500 shadow-lg hover:shadow-teal-500/10 ${profilePopupOpen ? 'ring-2 ring-teal-500' : ''}`}
          >
            <div className={`bg-card dark:bg-slate-900 rounded-[1.9rem] transition-all duration-300 ${sidebarCollapsed ? 'p-1' : 'p-4 flex items-center'}`}>
              <img 
                src={user?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.name || displayName)}`} 
                className={`${sidebarCollapsed ? 'w-12 h-12' : 'w-10 h-10'} rounded-[1.2rem] shadow-md border-2 border-white dark:border-slate-800 transition-all object-cover`} 
                alt="Avatar" 
                onError={(e) => {
                  const seed = encodeURIComponent(`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.name || displayName);
                  e.target.src = `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;
                }}
              />
              {!sidebarCollapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <div className="text-[11px] font-black text-main truncate uppercase tracking-tight">{displayName}</div>
                  <div className="text-[9px] text-muted font-bold opacity-50 uppercase tracking-widest mt-0.5">{t("nav.account")}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;