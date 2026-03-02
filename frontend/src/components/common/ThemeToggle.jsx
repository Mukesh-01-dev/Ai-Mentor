// frontend/src/components/common/ThemeToggle.jsx
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, setTheme, isDark } = useTheme();

  const toggleTheme = () => {
    // Always switch explicitly between light & dark
    if (isDark) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="p-2 rounded-lg border border-border bg-card hover:bg-canvas-alt transition-colors"
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;