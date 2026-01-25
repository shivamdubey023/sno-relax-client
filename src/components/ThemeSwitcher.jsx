// src/components/ThemeSwitcher.jsx
import React from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/ThemeSwitcher.css";

/**
 * ThemeSwitcher
 * --------------------------------------------------
 * UI component that allows users to switch between
 * available application themes.
 *
 * Data Source:
 *  - Uses ThemeContext (useTheme hook)
 *
 * Context Values:
 *  - theme   : currently active theme id
 *  - setTheme: function to update theme
 *  - themes  : array of available themes
 *              [{ id, name, hex }]
 *
 * Design Notes:
 *  - Each theme is represented by a small button
 *  - Active theme is visually highlighted
 *  - Button color is derived from theme hex value
 *
 * Accessibility:
 *  - Uses button elements (keyboard accessible)
 *  - Includes title attribute for clarity
 *
 * Future Enhancements (non-breaking):
 *  - Tooltip with full theme name
 *  - Preview swatches
 *  - Persist theme preference to backend
 */
export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();

  // Guard: if themes are not loaded yet
  if (!Array.isArray(themes) || themes.length === 0) {
    return null;
  }

  return (
    <div className="theme-switcher">
      {/* Label */}
      <span className="theme-label">🎨 Theme:</span>

      {/* Theme Buttons */}
      <div className="theme-buttons">
        {themes.map((t) => {
          const isActive = theme === t.id;

          return (
            <button
              key={t.id}
              className={`theme-btn ${isActive ? "active" : ""}`}
              onClick={() => setTheme(t.id)}
              title={t.name}
              aria-pressed={isActive}
              style={{
                backgroundColor: isActive ? t.hex : "transparent",
                borderColor: t.hex,
                color: isActive ? "white" : t.hex,
              }}
            >
              {/* First letter as compact visual indicator */}
              {t.name?.charAt(0) || "T"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
