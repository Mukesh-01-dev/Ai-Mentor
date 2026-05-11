import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  BookOpen,
  MessageCircle,
  BarChart3,
  Video,
  Award,
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";

import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useSidebar();

  const { logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: <LayoutGrid size={20} /> },
    { id: "courses", label: "My Courses", path: "/courses", icon: <BookOpen size={20} /> },
    { id: "discussions", label: "Discussions", path: "/discussions", icon: <MessageCircle size={20} /> },
    { id: "analytics", label: "Analytics", path: "/analytics", icon: <BarChart3 size={20} /> },
    { id: "watched", label: "Watched Videos", path: "/watched", icon: <Video size={20} /> },
    { id: "certificates", label: "Certificates", path: "/certificates", icon: <Award size={20} /> },
    { id: "settings", label: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* 🔹 Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🔹 Sidebar */}
      <div
        className={`
          fixed left-0 top-16 h-[calc(100%-4rem)] bg-white border-r shadow-md z-50
          transition-all duration-300
          ${sidebarCollapsed ? "w-20" : "w-64"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* 🔹 Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-4 top-6 bg-gray-200 p-2 rounded-full shadow"
        >
          <ChevronRight
            size={16}
            className={`transition-transform ${
              sidebarCollapsed ? "" : "rotate-180"
            }`}
          />
        </button>

        {/* 🔹 Logo / Title */}
        <div className="p-4 font-bold text-lg border-b text-center">
          {sidebarCollapsed ? "AI" : "AI Tutor"}
        </div>

        {/* 🔹 Menu Items */}
        <div className="p-2 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <div
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
                  ${isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100"}
                  ${sidebarCollapsed ? "justify-center" : ""}
                `}
              >
                {item.icon}

                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* 🔹 Logout */}
        <div className="absolute bottom-4 w-full px-2">
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-red-100 text-red-500 transition"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;