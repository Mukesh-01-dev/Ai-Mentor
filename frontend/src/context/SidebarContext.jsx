import React, { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({ children }) => {
    // sidebarOpen is for mobile/tablet - starts CLOSED on mobile
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // sidebarCollapsed is the "icons view" for desktop
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebarCollapsed");
        return saved !== null ? JSON.parse(saved) : false;
    });

    // Close sidebar on mobile when screen resizes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const toggleCollapse = () => setSidebarCollapsed((prev) => !prev);

    const value = {
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        toggleCollapse,
    };

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
};