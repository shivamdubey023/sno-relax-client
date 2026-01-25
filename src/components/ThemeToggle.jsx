// src/components/ThemeToggle.jsx
import React from "react";

/**
 * ThemeToggle
 * --------------------------------------------------
 * A simple button component to toggle between
 * light and dark themes.
 *
 * Props:
 *  - theme  : current theme string ("light" | "dark")
 *  - toggle : function to switch theme
 *
 * Responsibility:
 *  - UI-only component
 *  - Does NOT manage theme state itself
 *
 * Design Notes:
 *  - Keeps logic minimal and reusable
 *  - Parent decides how theme is stored (context, localStorage, backend)
 *
 * Future Enhancements (non-breaking):
 *  - Add animation between theme switch
 *  - Replace text with icon-only toggle
 *  - Support more than 2 themes
 */
export default function ThemeToggle({ theme, toggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle theme"
      title="Toggle light / dark mode"
    >
      {theme === "light" ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
}
