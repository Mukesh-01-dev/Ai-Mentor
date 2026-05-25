import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ChevronRight,
  LogOut,
  Settings,
  User,
  ShieldCheck,
  LayoutGrid,
  ChevronDown,
  ArrowLeft,
  Search,
  BookOpen,
  Code,
  Server,
  Sparkles,
} from "lucide-react";
import API_BASE_URL from "../lib/api";
import { useSidebar } from "../context/SidebarContext";
import { useTranslation } from "react-i18next";
import { docsStructure, docsContent } from "../data/docsData";

const Sidebar = ({ activePage = "dashboard" }) => {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationItems, setNavigationItems] = useState([]);
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const profileRef = useRef(null);

  // Docs Specific States
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredSection, setHoveredSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    "getting-started": true,
    "frontend-docs": false,
    "backend-docs": false,
    "backend-admin-docs": false,
    "frontend-admin-docs": false,
    "ai-service-docs": false,
  });

  const sectionIcons = {
    "getting-started": BookOpen,
    "frontend-docs": Code,
    "backend-docs": Server,
    "backend-admin-docs": ShieldCheck,
    "frontend-admin-docs": LayoutGrid,
    "ai-service-docs": Sparkles,
  };

  // Filter doc items based on search query
  const getFilteredDocs = () => {
    if (!searchQuery) return docsStructure;
    const query = searchQuery.toLowerCase();

    return docsStructure
      .map((sec) => {
        const matchedItems = sec.items.filter((item) => {
          const titleMatch = item.title.toLowerCase().includes(query);
          const contentMatch = docsContent[sec.id]?.[item.id]?.content
            ?.toLowerCase()
            .includes(query);
          return titleMatch || contentMatch;
        });
        return { ...sec, items: matchedItems };
      })
      .filter((sec) => sec.items.length > 0);
  };

  const filteredDocs = getFilteredDocs();

  // If search is active, automatically expand all matching sections
  useEffect(() => {
    if (searchQuery) {
      const newExpanded = {};
      filteredDocs.forEach((sec) => {
        newExpanded[sec.id] = true;
      });
      setExpandedSections(newExpanded);
    }
  }, [searchQuery]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

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

      <div className={`fixed lg:fixed top-18.5 left-0 z-[70] bg-card/70 backdrop-blur-2xl border-r border-border/80 transform transition-all duration-500 ease-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${sidebarCollapsed ? "lg:w-24" : "lg:w-80"} w-80 h-[calc(100vh-4rem)] overflow-visible`}>

        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex absolute -right-5 top-8 w-10 h-10 bg-card border border-border rounded-xl items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-xl z-80">
          <ChevronRight className={`w-5 h-5 transition-transform duration-500 ${sidebarCollapsed ? "" : "rotate-180"}`} />
        </button>

        {activePage === "docs" ? (
          <nav className={`mt-8 px-4 h-[calc(100vh-16rem)] scrollbar-hide relative ${sidebarCollapsed ? "overflow-visible" : "overflow-y-auto"}`}>
            {/* Dashboard Back trigger */}
            <div
              onClick={() => { navigate("/dashboard"); setSidebarOpen(false); }}
              className={`group relative flex items-center px-4 py-4 rounded-3xl cursor-pointer transition-all duration-300 mb-4 border border-border/30 hover:bg-canvas-alt ${sidebarCollapsed ? "justify-center" : ""}`}
            >
              <ArrowLeft className="w-5 h-5 text-teal-500 shrink-0 transition-transform group-hover:-translate-x-1" />
              {!sidebarCollapsed && (
                <span className="ml-4 text-xs font-black uppercase tracking-wider text-muted group-hover:text-main">
                  Dashboard
                </span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl z-50 uppercase tracking-widest">
                  Back to Dashboard
                </div>
              )}
            </div>

            {/* Search Input */}
            {!sidebarCollapsed && (
              <div className="relative mb-6 px-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-canvas-alt border border-border text-xs font-bold text-main placeholder-muted focus:outline-none focus:border-teal-500 transition-colors shadow-inner"
                />
              </div>
            )}

            <div className="space-y-4">
              {filteredDocs.map((sec) => {
                const SecIcon = sectionIcons[sec.id] || BookOpen;
                const isExpanded = !!expandedSections[sec.id] || searchQuery.trim().length > 0;
                return (
                  <div key={sec.id} className="relative group/sec">
                    {/* Collapsed Section Icon */}
                    {sidebarCollapsed ? (
                      <div
                        onMouseEnter={() => setHoveredSection(sec.id)}
                        onMouseLeave={() => setHoveredSection(null)}
                        className={`relative flex items-center justify-center w-12 h-12 mx-auto rounded-2xl cursor-pointer transition-all duration-300 border border-transparent ${
                          location.pathname.includes(`/docs/${sec.id}`)
                            ? "bg-teal-500/10 text-teal-500 border-teal-500/20"
                            : "hover:bg-canvas-alt text-muted hover:text-main"
                        }`}
                      >
                        <SecIcon className="w-5 h-5" />
                        {/* Hover Flyout */}
                        {hoveredSection === sec.id && (
                          <div className="absolute left-full top-0 ml-4 w-60 bg-card border border-border rounded-2xl shadow-2xl p-3 z-[100] animate-in fade-in slide-in-from-left-2 duration-200">
                            <h4 className="text-[10px] font-black uppercase text-main tracking-wider mb-2 pb-1 border-b border-border/40">
                              {sec.title}
                            </h4>
                            <div className="space-y-1 max-h-60 overflow-y-auto">
                              {sec.items.map((item) => {
                                const isItemActive = location.pathname === `/docs/${sec.id}/${item.id}`;
                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => {
                                      navigate(`/docs/${sec.id}/${item.id}`);
                                      setSidebarOpen(false);
                                    }}
                                    className={`px-3 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                                      isItemActive
                                        ? "text-teal-500 bg-teal-500/5 font-extrabold"
                                        : "text-muted hover:text-main hover:bg-canvas-alt"
                                    }`}
                                  >
                                    {item.title}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Expanded view
                      <div>
                        <button
                          onClick={() => toggleSection(sec.id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-canvas-alt text-left text-xs font-black uppercase tracking-wider text-main select-none transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <SecIcon className="w-4 h-4 text-teal-500" />
                            <span className="text-[11px] tracking-tight">{sec.title}</span>
                          </div>
                          <ChevronRight
                            className={`w-3.5 h-3.5 text-muted transition-transform duration-300 ${
                              isExpanded ? "rotate-90 text-teal-500" : ""
                            }`}
                          />
                        </button>

                        {/* Collapsible Subitems */}
                        <div
                          className={`pl-4 border-l border-border/40 ml-5.5 mt-1.5 space-y-1.5 overflow-hidden transition-all duration-300 ${
                            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                          }`}
                        >
                          {sec.items.map((item) => {
                            const isItemActive = location.pathname === `/docs/${sec.id}/${item.id}`;
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  navigate(`/docs/${sec.id}/${item.id}`);
                                  setSidebarOpen(false);
                                }}
                                className={`block px-3 py-2.5 rounded-2xl text-xs cursor-pointer transition-all duration-200 ${
                                  isItemActive
                                    ? "text-teal-500 bg-teal-500/5 font-extrabold shadow-sm border border-teal-500/10"
                                    : "text-muted hover:text-main hover:bg-canvas-alt/50 font-semibold"
                                }`}
                              >
                                {item.title}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        ) : (
          <nav className={`mt-8 px-4 h-[calc(100vh-16rem)] scrollbar-hide ${sidebarCollapsed ? "overflow-visible" : "overflow-y-auto"}`}>
            <div className="space-y-3">
              {navigationItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <div key={item.id} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className={`group relative flex items-center px-4 py-4 rounded-3xl cursor-pointer transition-all duration-300 ${sidebarCollapsed ? "justify-center" : ""} ${isActive ? "bg-teal-500 text-white shadow-xl shadow-teal-500/30" : "hover:bg-canvas-alt"}`}>
                    <img src={item.icon} alt={item.label} className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "brightness-0 invert" : "opacity-80"}`} />
                    {!sidebarCollapsed && <span className={`ml-4 text-sm font-black uppercase tracking-tight ${isActive ? "text-white" : ""}`} style={isActive ? {} : { color: '#b2b2b3' }}>{t(`nav.${item.id}`, item.label)}</span>}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl z-50 uppercase tracking-widest">{t(`nav.${item.id}`, item.label)}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        )}

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
            className={`cursor-pointer group relative p-0.5 rounded-4xl bg-linear-to-br from-teal-500/20 via-blue-500/10 to-transparent transition-all duration-500 shadow-lg hover:shadow-teal-500/5 ${profilePopupOpen ? 'ring-2 ring-teal-500/50' : 'ring-1 ring-white/5'}`}
          >
            <div className={`bg-card dark:bg-[#0a0f1e] rounded-[1.9rem] transition-all duration-300 ${sidebarCollapsed ? 'p-1' : 'p-4 flex items-center'}`}>
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
                  <div className="text-[11px] font-black truncate uppercase tracking-tight" style={{ color: '#a3a2a3' }}>{displayName}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#a3a2a3' }}>{t("nav.account")}</div>
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