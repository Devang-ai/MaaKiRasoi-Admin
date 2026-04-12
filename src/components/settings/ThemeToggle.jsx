import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="settings-card">
      <h3>Theme Mode</h3>

      <div className="theme-buttons">
        <button
          className={theme === "light" ? "active" : ""}
          onClick={() => toggleTheme("light")}
        >
          Light
        </button>

        <button
          className={theme === "dark" ? "active" : ""}
          onClick={() => toggleTheme("dark")}
        >
          Dark
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;