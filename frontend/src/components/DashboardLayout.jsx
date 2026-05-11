import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useSidebar } from "../context/SidebarContext";

const routeToPage = {
  "/dashboard": "dashboard",
  "/analytics": "analytics",
  "/courses": "courses",
  "/discussions": "discussions",
  "/settings": "settings",
  "/watchedvideos": "watched",
  "/certificates": "certificates",
};

const DashboardLayout = () => {
  const location = useLocation();
  const { sidebarCollapsed } = useSidebar();

  const activePage =
    routeToPage[location.pathname] ||
    (location.pathname.startsWith("/learning") ? "courses" : "dashboard");

  return (
    <div className="min-h-screen bg-canvas-alt">
      {/* HEADER FIXED */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* SIDEBAR FIXED */}
      <div className="fixed top-[4.5rem] left-0 h-[calc(100vh-4.5rem)] z-40">
        <Sidebar activePage={activePage} />
      </div>

      {/* MAIN CONTENT */}
      <div
        className={`pt-[4.5rem] transition-all duration-300 ${
          sidebarCollapsed ? "pl-20" : "pl-64"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;