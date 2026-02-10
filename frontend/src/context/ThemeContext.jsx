import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

  // Get initial theme from localStorage or system preference
  const getInitialTheme = () => {
    if (typeof window === "undefined") return "light"; // SSR safety

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const [isDark, setIsDark] = useState(getInitialTheme);

  // Apply body class whenever isDark changes
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(isDark);
    localStorage.setItem("theme", isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
