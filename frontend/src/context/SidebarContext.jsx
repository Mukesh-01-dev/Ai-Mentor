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
    // sidebarOpen is for mobile/tablet responsive view
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // sidebarCollapsed is the "icons view" for desktop
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebarCollapsed");
        return saved !== null ? JSON.parse(saved) : false;
    });

    // isDesktop is debounced so Mac minimize/restore animations don't cause layout flicker
    const [isDesktop, setIsDesktop] = useState(
        typeof window !== "undefined" ? window.innerWidth >= 1024 : true
    );

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    useEffect(() => {
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsDesktop(window.innerWidth >= 1024);
            }, 150);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const toggleCollapse = () => setSidebarCollapsed((prev) => !prev);

    const value = {
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        isDesktop,
        toggleSidebar,
        toggleCollapse,
    };

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
};
