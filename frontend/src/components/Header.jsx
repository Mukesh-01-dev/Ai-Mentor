import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/common/ThemeToggle"; // ✅ ADDITION
import { useSidebar } from "../context/SidebarContext";

const Header = () => {
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || user?.email?.split('@')[0] || "User";

  return (
    <header className="bg-card border-b border-border px-6 py-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <button
            className="lg:hidden p-2 rounded-lg bg-card border border-border"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-muted" />
            ) : (
              <Menu className="w-5 h-5 text-muted" />
            )}
          </button>

          <img
            src="/upto.png"
            alt="UptoSkills Logo"
            className="h-10 w-auto"
          />
        </div>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Try search programming courses ....."
              className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-full text-sm text-main focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* 🔥 UNIVERSAL THEME TOGGLE (ADDED) */}
          <ThemeToggle />

          <div className="relative">
            <Bell className="w-5 h-5 text-muted" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
          </div>

          <div
            className="flex items-center space-x-3 relative"
            ref={dropdownRef}
          >
            <img
              src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
                displayName
              )}`}
              alt="User Avatar"
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={toggleDropdown}
            />

            <span
              className="text-main font-medium hidden sm:block cursor-pointer select-none"
              onClick={toggleDropdown}
            >
              {displayName}
            </span>

            {dropdownOpen && (
              <div className="absolute right-0 mt-10 w-32 bg-card border border-border rounded-md shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-main hover:bg-canvas-alt"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
