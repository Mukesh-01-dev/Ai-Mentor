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
  "/report": "report",
};

const DashboardLayout = () => {
  const location = useLocation();
  const { sidebarCollapsed, isDesktop } = useSidebar();

  // Derive activePage from the current path
  const activePage =
    routeToPage[location.pathname] ||
    (location.pathname.startsWith("/learning") ? "courses" : "dashboard");

  return (
    <div className="min-h-dvh bg-canvas-alt flex flex-col">
      <Header />
      <Sidebar activePage={activePage} />
      <div
        className={`flex-1 flex flex-col transition-[margin-left] duration-300 mt-[4.5rem] ${
          isDesktop ? (sidebarCollapsed ? "ml-20" : "ml-80") : ""
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
