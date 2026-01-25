import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

/**
 * useTheme hook
 * --------------------------------------------------
 * Safe wrapper around ThemeContext.
 * Ensures the hook is only used inside ThemeProvider.
 *
 * Usage:
 * const { theme, setTheme, toggleTheme } = useTheme();
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};
