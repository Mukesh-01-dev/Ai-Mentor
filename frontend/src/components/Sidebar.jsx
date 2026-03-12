import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChevronRight, LogOut, Settings, User, ShieldCheck, LayoutGrid, X } from "lucide-react";
import API_BASE_URL from "../lib/api";
import { useSidebar } from "../context/SidebarContext";

const Sidebar = ({ activePage = "dashboard" }) => {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [navigationItems, setNavigationItems] = useState([]);
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
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
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden transition-opacity duration-300" 
          onClick={() => setSidebarOpen(false)} 
          aria-hidden="true"
        />
      )}

      <aside 
        className={`fixed top-0 lg:top-[4.5rem] left-0 z-[70] bg-card/70 backdrop-blur-2xl border-r border-border/50 transform transition-all duration-500 ease-out 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
          ${sidebarCollapsed ? "lg:w-20" : "lg:w-80"} 
          w-[280px] sm:w-80 h-full lg:h-[calc(100vh-4.5rem)] overflow-visible`}
        aria-label="Main Sidebar"
      >
        {/* Mobile Header inside Sidebar */}
        <div className="flex items-center justify-between p-6 lg:hidden border-b border-border/50">
          <img src="/upto.png" alt="UptoSkills Logo" className="h-8 w-auto" />
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl hover:bg-canvas-alt transition-all"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
          className="hidden lg:flex absolute -right-4 top-8 w-8 h-8 bg-card border border-border rounded-lg items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-xl z-[80]"
          aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-500 ${sidebarCollapsed ? "" : "rotate-180"}`} />
        </button>

        <nav className={`mt-4 lg:mt-8 px-4 h-[calc(100vh-16rem)] scrollbar-hide ${sidebarCollapsed ? "overflow-visible" : "overflow-y-auto"}`}>
          <ul className="space-y-2 lg:space-y-3">
            {navigationItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button 
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }} 
                    className={`group relative flex items-center w-full px-4 py-3 lg:py-4 rounded-2xl cursor-pointer transition-all duration-300 
                      ${sidebarCollapsed ? "lg:justify-center" : ""} 
                      ${isActive ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30" : "text-muted hover:bg-canvas-alt"}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <img 
                      src={item.icon} 
                      alt="" 
                      className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "brightness-0 invert" : ""}`} 
                    />
                    <span className={`ml-4 text-xs lg:text-sm font-black uppercase tracking-tight transition-opacity duration-300
                      ${sidebarCollapsed ? "lg:hidden" : "block"} 
                      ${isActive ? "text-white" : ""}`}
                    >
                      {item.label}
                    </span>
                    {sidebarCollapsed && (
                      <div className="hidden lg:block absolute left-full ml-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl z-50 uppercase tracking-widest whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* --- BOTTOM PROFILE WITH POPUP --- */}
        <div className="absolute bottom-8 left-0 right-0 px-4" ref={profileRef}>
          {profilePopupOpen && (
            <div className={`absolute bottom-full mb-6 left-4 right-4 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-[0_-20px_80px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-[90] ${sidebarCollapsed ? "w-52 -left-2" : ""}`}>
              <div className="p-6 border-b border-border/50 bg-gradient-to-tr from-teal-500/10 to-transparent text-center">
                 <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`} className="w-16 h-16 rounded-[1.5rem] mx-auto mb-3 shadow-2xl border-2 border-card" alt="User" />
                 <h4 className="text-xs font-black text-main uppercase tracking-tighter">{displayName}</h4>
              </div>
              <div className="p-2">
                <button onClick={() => {navigate("/settings"); setProfilePopupOpen(false);}} className="flex items-center w-full px-4 py-4 text-[10px] font-black uppercase text-main hover:bg-teal-500 hover:text-white rounded-[1.5rem] transition-all"><Settings className="w-4 h-4 mr-3" /> Dashboard Settings</button>
                <button onClick={handleLogout} className="flex items-center w-full px-4 py-4 text-[10px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white rounded-[1.5rem] transition-all mt-1"><LogOut className="w-4 h-4 mr-3" /> End Session</button>
              </div>
            </div>
          )}

          <div 
            onClick={() => setProfilePopupOpen(!profilePopupOpen)}
            className={`cursor-pointer group relative p-[2px] rounded-[2rem] bg-gradient-to-br from-teal-500/30 via-blue-500/20 to-transparent transition-all duration-500 shadow-lg hover:shadow-teal-500/10 ${profilePopupOpen ? 'ring-2 ring-teal-500' : ''}`}
          >
            <div className={`bg-card dark:bg-slate-900 rounded-[1.9rem] transition-all duration-300 ${sidebarCollapsed ? 'p-1' : 'p-4 flex items-center'}`}>
              <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`} className={`${sidebarCollapsed ? 'w-12 h-12' : 'w-10 h-10'} rounded-[1.2rem] shadow-md border-2 border-white dark:border-slate-800 transition-all`} alt="Avatar" />
              {!sidebarCollapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <div className="text-[11px] font-black text-main truncate uppercase tracking-tight">{displayName}</div>
                  <div className="text-[9px] text-muted font-bold opacity-50 uppercase tracking-widest mt-0.5">Account</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;