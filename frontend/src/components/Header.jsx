import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, Menu, X, User, Settings, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/common/ThemeToggle";
import { useSidebar } from "../context/SidebarContext";

const Header = () => {
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // ReferenceError se bachne ke liye displayName ko sabse upar define karein
  const displayName = user?.name || user?.email?.split('@')[0] || "User";

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    // LoginPage par "Logged out" popup dikhane ke liye state pass karein
    navigate("/login", { state: { logoutSuccess: true } });
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Bahar click karne par dropdown band karne ka logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (window.innerWidth < 1024) {
          setSidebarOpen(false); // Mobile par sidebar bhi band karein
        }
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSidebarOpen]);

  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 sm:px-6 py-3 sm:py-4 fixed top-0 left-0 right-0 z-[100]">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto gap-4">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          <button
            className="lg:hidden p-2 rounded-xl bg-card border border-border hover:bg-canvas-alt transition-all"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X className="w-5 h-5 text-muted" /> : <Menu className="w-5 h-5 text-muted" />}
          </button>
          
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <img
              src="/upto.png"
              alt="UptoSkills Logo"
              className="h-8 sm:h-10 w-auto"
            />
          </div>
        </div>

        {/* Search Bar (Mobile par hidden, tablet+ par responsive) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-teal-500 transition-colors w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-11 pr-4 py-2 bg-canvas border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Action Buttons & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-5 shrink-0">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          <div className="relative cursor-pointer p-2 hover:bg-canvas-alt rounded-xl transition-all group">
            <Bell className="w-5 h-5 text-muted group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-card" />
          </div>

          {/* PROFILE DROPDOWN SECTION */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleDropdown}
              className="flex items-center space-x-2 sm:space-x-3 p-1 sm:pr-3 rounded-2xl hover:bg-canvas-alt transition-all border border-transparent hover:border-border group"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="relative">
                <img
                  src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-md border border-border/50 group-hover:border-teal-500 transition-all"
                  alt=""
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
              </div>
              <span className="text-sm font-bold text-main hidden lg:block truncate max-w-[120px]">{displayName}</span>
            </button>

            {/* Impressive Floating Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-4 w-64 sm:w-72 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[110] overflow-hidden animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-teal-500/10 via-blue-500/5 to-transparent border-b border-border/50">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                    <img
                      src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-xl border-2 border-white dark:border-slate-800"
                      alt=""
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-main truncate leading-tight uppercase">{displayName}</h4>
                      <p className="text-[9px] sm:text-[10px] text-muted font-bold truncate opacity-60 mt-0.5 uppercase tracking-widest">{user?.role || 'STUDENT'}</p>
                    </div>
                  </div>
                  <div className="lg:hidden mb-4">
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-black bg-teal-500/10 text-teal-600 dark:text-teal-400 py-1.5 px-3 rounded-full w-fit uppercase">
                     <ShieldCheck className="w-3 h-3" /> <span>Verified Profile</span>
                  </div>
                </div>
                
                <div className="p-2 sm:p-3 text-left">
                  <button onClick={() => { navigate("/settings"); setDropdownOpen(false); }} className="flex items-center w-full px-4 py-3 sm:py-3.5 text-xs font-bold text-main hover:bg-teal-500 hover:text-white rounded-[1rem] sm:rounded-[1.2rem] transition-all group">
                    <User className="mr-3 w-4 h-4 group-hover:scale-110 transition-transform" /> My Account
                  </button>
                  <button onClick={() => { navigate("/settings"); setDropdownOpen(false); }} className="flex items-center w-full px-4 py-3 sm:py-3.5 text-xs font-bold text-main hover:bg-teal-500 hover:text-white rounded-[1rem] sm:rounded-[1.2rem] transition-all group mt-1">
                    <Settings className="mr-3 w-4 h-4 group-hover:rotate-45 transition-transform" /> Settings
                  </button>
                  
                  <div className="my-2 border-t border-border/50 mx-2" />
                  
                  <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 sm:py-3.5 text-xs font-black text-red-500 hover:bg-red-500 hover:text-white rounded-[1rem] sm:rounded-[1.2rem] transition-all group">
                    <LogOut className="mr-3 w-4 h-4 group-hover:translate-x-1 transition-transform" /> Logout Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;