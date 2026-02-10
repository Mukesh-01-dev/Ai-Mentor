import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-sm d-flex align-items-center gap-2"
      aria-label="Toggle Theme"
    >
      {isDark ==="dark" ? <Sun size={18} className="text-white" /> :  <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
