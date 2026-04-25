import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, LogOut, Menu, Search, Settings, ShieldCheck, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Themetoggle from "../components/common/ThemeToggle";

const seedNotifications = [
  { id: "n1", title: "New report submitted", message: "A comment was reported in community.", unread: true, time: "5m ago" },
  { id: "n2", title: "Course published", message: "React Fundamentals was updated.", unread: true, time: "1h ago" },
  { id: "n3", title: "Weekly digest", message: "New admin analytics are ready.", unread: false, time: "1d ago" },
];

const Header = ({ title, onMenuClick, searchQuery = "", onSearchChange }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";
  const avatarUrl =
    user?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
  const unreadCount = notifications.filter((item) => item.unread).length;
  const effectiveSearchQuery =
    typeof onSearchChange === "function" ? searchQuery : internalSearchQuery;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notification.id ? { ...item, unread: false } : item))
    );
    setNotifOpen(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutConfirm(false);
    setDropdownOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-400 mx-auto">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 rounded-xl bg-card border border-border hover:bg-canvas-alt transition-all"
              onClick={onMenuClick}
              type="button"
            >
              <Menu className="w-5 h-5 text-muted" />
            </button>

            <div className="hidden lg:block min-w-[120px]">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight capitalize">{title}</h1>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-teal-500 transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={effectiveSearchQuery}
                onChange={(event) => {
                  const value = event.target.value;
                  if (typeof onSearchChange === "function") {
                    onSearchChange(value);
                    return;
                  }
                  setInternalSearchQuery(value);
                }}
                className="w-full pl-12 pr-4 py-2.5 bg-canvas border border-border rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <div className="relative" ref={notificationRef}>
              <div
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative cursor-pointer p-2.5 hover:bg-canvas-alt rounded-xl transition-all group"
              >
                <Bell className="w-5 h-5 text-muted group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-orange-500 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </div>

              {notifOpen && (
                <div className="fixed md:absolute right-4 left-4 md:right-0 md:left-auto mt-4 md:w-96 bg-card border border-border/50 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[110] overflow-hidden">
                  <div className="p-6 bg-linear-to-br from-teal-500/10 via-blue-500/5 to-transparent border-b border-border/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-main uppercase">Notifications</h4>
                      <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">
                        {unreadCount > 0 ? `You have ${unreadCount} unread messages` : "All caught up!"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={markAllRead}
                        className="text-[10px] font-black text-teal-600 hover:text-teal-500 transition-colors uppercase tracking-wider"
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
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left px-4 py-3 border-b border-border/30 hover:bg-canvas-alt transition ${
                            notification.unread ? "bg-teal-500/5" : ""
                          }`}
                        >
                          <p className="text-xs font-bold">{notification.title}</p>
                          <p className="text-xs text-muted mt-1">{notification.message}</p>
                          <p className="text-[10px] text-muted mt-1">{notification.time}</p>
                        </button>
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
            <Themetoggle/> 

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-3 p-1 pr-3 rounded-2xl hover:bg-canvas-alt transition-all border border-transparent hover:border-border group"
                type="button"
              >
                <div className="relative">
                  <img
                    src={avatarUrl}
                    className="w-9 h-9 rounded-xl shadow-md border border-border/50 group-hover:border-teal-500 transition-all object-cover"
                    alt="Avatar"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
                </div>
                <span className="text-sm font-bold text-main hidden lg:block">{displayName}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[110] overflow-hidden">
                  <div className="p-6 bg-linear-to-br from-teal-500/10 via-blue-500/5 to-transparent border-b border-border/50">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={avatarUrl}
                        className="w-14 h-14 rounded-2xl shadow-xl border-2 border-white object-cover"
                        alt="User"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-main truncate leading-tight uppercase">{displayName}</h4>
                        <p className="text-[10px] text-muted font-bold truncate opacity-60 mt-0.5 uppercase tracking-widest">
                          {user?.role || "ADMIN"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-black bg-teal-500/10 text-teal-600 py-1.5 px-3 rounded-full w-fit uppercase">
                      <ShieldCheck className="w-3 h-3" /> <span>Verified Profile</span>
                    </div>
                  </div>

                  <div className="p-3 text-left">
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3.5 text-xs font-bold text-main hover:bg-teal-500 hover:text-white rounded-[1.2rem] transition-all group"
                    >
                      <User className="mr-3 w-4 h-4 group-hover:scale-110 transition-transform" /> Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3.5 text-xs font-bold text-main hover:bg-teal-500 hover:text-white rounded-[1.2rem] transition-all group mt-1"
                    >
                      <Settings className="mr-3 w-4 h-4 group-hover:rotate-45 transition-transform" /> Settings
                    </button>

                    <div className="my-2 border-t border-border/50 mx-2" />

                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="flex items-center w-full px-4 py-3.5 text-xs font-black text-red-500 hover:bg-red-500 hover:text-white rounded-[1.2rem] transition-all group"
                    >
                      <LogOut className="mr-3 w-4 h-4 group-hover:translate-x-1 transition-transform" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border/50 rounded-4xl shadow-2xl p-8 w-80 text-center">
            <LogOut className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-sm font-black uppercase tracking-tight text-main mb-2">Logout</h3>
            <p className="text-xs text-muted mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border border-border hover:bg-canvas-alt transition-all">
                Cancel
              </button>
              <button onClick={confirmLogout} className="flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
