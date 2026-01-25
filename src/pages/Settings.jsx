import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Palette } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import "../styles/Settings.css";

export default function Settings() {
  const navigate = useNavigate();

  const {
    theme,
    setSpecificTheme,
    themes: availableThemes,
  } = useContext(ThemeContext);

  /**
   * Normalize themes coming from ThemeContext
   * (ThemeContext currently supports light / dark only)
   */
  const themes = (availableThemes || []).map((t) => ({
    id: t.id,
    name: t.name || t.id,
    icon: t.id === "dark" ? Moon : Sun,
    color: t.hex || "#f1f5f9",
  }));

  // Fallback (extra safety – should not normally execute)
  if (!themes.length) {
    themes.push({
      id: "light",
      name: "Light",
      icon: Sun,
      color: "#f1f5f9",
    });
    themes.push({
      id: "dark",
      name: "Dark",
      icon: Moon,
      color: "#0f172a",
    });
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} /> Back
        </button>
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        {/* Theme Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Palette size={24} />
            <h2>Theme Settings</h2>
          </div>

          <div className="theme-grid">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon || Sun;

              return (
                <button
                  key={themeOption.id}
                  className={`theme-option ${
                    theme === themeOption.id ? "active" : ""
                  }`}
                  onClick={() => setSpecificTheme(themeOption.id)}
                  title={`Switch to ${themeOption.name}`}
                >
                  <div
                    className="theme-preview"
                    style={{ backgroundColor: themeOption.color }}
                  >
                    <Icon size={32} />
                  </div>
                  <p>{themeOption.name}</p>
                  {theme === themeOption.id && (
                    <div className="checkmark">✓</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Display Settings</h2>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                defaultChecked={true}
                onChange={(e) => {
                  document.documentElement.style.fontSize = e.target.checked
                    ? "16px"
                    : "14px";
                }}
              />
              <span>Standard Text Size</span>
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked={true} />
              <span>Animations Enabled</span>
            </label>
          </div>
        </div>

        {/* About Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>About SnoRelax</h2>
          </div>

          <p className="about-text">
            <strong>SnoRelax v1.0.0</strong>
            <br />
            A mental wellness platform designed to help you manage stress, mood,
            and mental health.
          </p>

          <p className="about-text">
            <strong>Current Theme:</strong>{" "}
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </p>
        </div>
      </div>
    </div>
  );
}
