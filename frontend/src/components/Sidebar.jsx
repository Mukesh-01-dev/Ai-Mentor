import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChevronRight } from "lucide-react";
import API_BASE_URL from "../lib/api";

import { useSidebar } from "../context/SidebarContext";

const Sidebar = ({
  activePage = "dashboard",
}) => {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed
  } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [navigationItems, setNavigationItems] = useState([]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.name || user?.email?.split('@')[0] || "User";

  useEffect(() => {
    let isMounted = true;

    const fetchNavigationItems = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/sidebar/navigation`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch sidebar navigation");
          return;
        }

        const data = await response.json();
        if (isMounted) setNavigationItems(data);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };

    fetchNavigationItems();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
        fixed lg:fixed top-18.5 left-0 z-50 bg-card border-r border-border
        transform transition-all duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${sidebarCollapsed ? "lg:w-20" : "lg:w-80"}
        w-80 h-[calc(100vh-4rem)]
        overflow-visible
      `}
      >
        <button
          className="hidden lg:block absolute -right-5 -top-5 w-10 h-10 bg-card border border-border rounded-full hover:bg-canvas-alt z-10"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <ChevronRight
            className={`mx-auto w-5 h-5 text-muted transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""
              }`}
          />
        </button>

        <nav className={`mt-8 px-4 h-[calc(100vh-4rem-110px)] scrollbar-hide ${sidebarCollapsed ? "overflow-visible" : "overflow-y-auto"
          }`}>
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = activePage === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(item.path)}
                  className={`cursor-pointer flex items-center px-3 py-3 rounded-xl group relative
                    ${sidebarCollapsed ? "justify-center" : ""}
                    ${isActive
                      ? "bg-teal-50 text-teal-600"
                      : "text-muted hover:bg-canvas-alt"
                    }
                  `}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-5 h-5 shrink-0"
                  />
                  {!sidebarCollapsed && (
                    <span className={`ml-3 ${isActive ? "font-medium" : ""}`}>
                      {item.label}
                    </span>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap shadow-xl z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {!sidebarCollapsed ? (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-linear-to-r from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-purple-100 dark:border-slate-700">
              <div className="flex items-center">
                <img
                  src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
                    displayName
                  )}`}
                  alt={user?.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium text-main">
                    {user?.name}
                  </div>
                  <div className="text-xs text-muted">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <img
              src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
                displayName
              )}`}
              alt={user?.name || "User"}
              className="w-10 h-10 rounded-full border-2 border-purple-200"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
