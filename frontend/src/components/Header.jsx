import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, Bell, Menu, X, User, Settings, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/common/ThemeToggle";
import { useSidebar } from "../context/SidebarContext";
import { useTranslation } from "react-i18next";
import NotificationItem from "./common/NotificationItem";
import {
  fetchNotifications,
  markAsReadApi,
  markAllAsReadApi,
  clearAllNotificationsApi
} from "../service/notificationService";
import toast from "react-hot-toast";

const Header = ({ searchQuery = "", onSearchChange }) => {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);

  // Relative Time Formatter helper
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Fetch Notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchNotifications();
      // Format the date for the UI
      const formattedData = data.map(n => ({
        ...n,
        time: formatRelativeTime(n.createdAt)
      }));
      setNotifications(formattedData);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    // Optional: Set up polling or websocket here
  }, [loadNotifications]);

  const unreadCount = notifications.filter(n => n.unread).length;
  const effectiveSearchQuery =
    typeof onSearchChange === "function" ? searchQuery : internalSearchQuery;

  // ReferenceError se bachne ke liye displayName ko sabse upar define karein
  const displayName = user?.name || user?.email?.split('@')[0] || "User";

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setDropdownOpen(false);
    navigate("/login", { state: { logoutSuccess: true } });
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Bahar click karne par dropdown band karne ka logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotifOpen(false);
      }

      if (window.innerWidth < 1024 && !dropdownRef.current?.contains(event.target) && !notificationRef.current?.contains(event.target)) {
        // Only close sidebar if clicking outside both dropdowns on mobile
        // Note: sidebar logic might be different depending on requirements
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      toast.success("Marked all as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const markAsRead = async (id) => {
    try {
      await markAsReadApi(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const clearAll = async () => {
    try {
      await clearAllNotificationsApi();
      setNotifications([]);
      toast.success("Notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  return (
    <>
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 fixed top-0 left-0 right-0 w-full z-[100]">
        <div className="flex items-center justify-between w-full">

          {/* Mobile Menu & Logo */}
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 rounded-xl bg-card border border-border hover:bg-canvas-alt transition-all"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5 text-muted" /> : <Menu className="w-5 h-5 text-muted" />}
            </button>

            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
              {/* ✅ UPDATED: Yahan purana logo lagaya gaya hai */}
              <img
                src="/upto.png"
                alt="UptoSkills Logo"
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Search Bar (Mobile par hidden) */}


          {/* Action Buttons & Profile */}
          <div className="flex items-center space-x-5">
            <ThemeToggle />

            <div className="relative" ref={notificationRef}>
              <div
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative cursor-pointer p-2.5 hover:bg-canvas-alt rounded-xl transition-all group"
              >
                <Bell className="w-5 h-5 text-muted group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-orange-500 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-black text-white animate-in zoom-in duration-300">
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Notification Dropdown - Responsive Positioning */}
              {notifOpen && (
                <div className="fixed md:absolute right-4 left-4 md:right-0 md:left-auto mt-4 md:w-96 bg-card border border-border/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[110] overflow-hidden animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
                  <div className="p-6 bg-gradient-to-br from-teal-500/10 via-blue-500/5 to-transparent border-b border-border/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-main uppercase">Notifications</h4>
                      <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">
                        {unreadCount > 0 ? `You have ${unreadCount} unread messages` : 'All caught up!'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={markAllRead}
                        className="text-[10px] font-black text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors uppercase tracking-wider"
                      >
                        Mark all read
                      </button>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAll}
                          className="text-[10px] font-black text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Updated max-h to show ~4 notifications before scrolling */}
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                      <div className="p-12 text-center">
                        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-xs text-muted">Updating yours...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map(notif => (
                        <NotificationItem
                          key={notif.id}
                          notification={notif}
                          onClick={(n) => markAsRead(n.id)}
                        />
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-canvas rounded-3xl flex items-center justify-center mx-auto mb-4 border border-border/50">
                          <Bell className="w-8 h-8 text-muted/30" />
                        </div>
                        <p className="text-sm font-bold text-main">No Notifications</p>
                        <p className="text-xs text-muted mt-1">Check back later for updates.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE DROPDOWN SECTION */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-3 p-1 pr-3 rounded-2xl hover:bg-canvas-alt transition-all border border-transparent hover:border-border group"
              >
                <div className="relative">
                  <img
                    src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`}
                    className="w-9 h-9 rounded-xl shadow-md border border-border/50 group-hover:border-teal-500 transition-all"
                    alt="Avatar"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
                </div>
                <span className="text-sm font-bold text-main hidden lg:block">{displayName}</span>
              </button>

              {/* Impressive Floating Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[110] overflow-hidden animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
                  <div className="p-6 bg-gradient-to-br from-teal-500/10 via-blue-500/5 to-transparent border-b border-border/50">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`}
                        className="w-14 h-14 rounded-2xl shadow-xl border-2 border-white dark:border-slate-800"
                        alt="User"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-main truncate leading-tight uppercase">{user?.name || displayName}</h4>
                        <p className="text-[10px] text-muted font-bold truncate opacity-60 mt-0.5 uppercase tracking-widest">{user?.role || 'STUDENT'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-black bg-teal-500/10 text-teal-600 dark:text-teal-400 py-1.5 px-3 rounded-full w-fit uppercase">
                      <ShieldCheck className="w-3 h-3" /> <span>Verified Profile</span>
                    </div>
                  </div>

                  <div className="p-3 text-left">
                    <button onClick={() => { navigate("/settings"); setDropdownOpen(false); }} className="flex items-center w-full px-4 py-3.5 text-xs font-bold text-main hover:bg-teal-500 hover:text-white rounded-[1.2rem] transition-all group">
                      <User className="mr-3 w-4 h-4 group-hover:scale-110 transition-transform" /> {t("nav.profile")}
                    </button>
                    <button onClick={() => { navigate("/settings"); setDropdownOpen(false); }} className="flex items-center w-full px-4 py-3.5 text-xs font-bold text-main hover:bg-teal-500 hover:text-white rounded-[1.2rem] transition-all group mt-1">
                      <Settings className="mr-3 w-4 h-4 group-hover:rotate-45 transition-transform" /> {t("nav.settings")}
                    </button>

                    <div className="my-2 border-t border-border/50 mx-2" />

                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-3.5 text-xs font-black text-red-500 hover:bg-red-500 hover:text-white rounded-[1.2rem] transition-all group">
                      <LogOut className="mr-3 w-4 h-4 group-hover:translate-x-1 transition-transform" /> {t("auth.logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-[2rem] shadow-2xl p-8 w-80 text-center">
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
    </>
  );
};

export default Header;