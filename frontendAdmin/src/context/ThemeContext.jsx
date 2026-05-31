import React, { createContext, useContext, useEffect, useState } from "react";
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "auto";
  });

  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const isDark =
    theme === "dark" || (theme === "auto" && getSystemTheme());

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme, isDark]);

  // Listen to system changes ONLY in auto mode
  useEffect(() => {
    if (theme !== "auto") return;

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleChange = () => {
      // force re-render
      setTheme("auto");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () =>
      mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, isDark }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);