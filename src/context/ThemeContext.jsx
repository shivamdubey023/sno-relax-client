import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage, otherwise default to 'brand' (application default)
    const savedTheme = localStorage.getItem("sno_theme");
    return savedTheme || "brand";
  });

  // Available themes: Brand (app default), Dark, Light
  const themes = [
    { id: "brand", name: "Brand (Default)", hex: "#0b2740" },
    { id: "dark", name: "Dark", hex: "#0f172a" },
    { id: "light", name: "Light", hex: "#f8fafc" }
  ];

  // Save theme to localStorage whenever it changes and apply tokens
  useEffect(() => {
    localStorage.setItem("sno_theme", theme);
    // Apply theme attribute to document for CSS hooks
    document.documentElement.setAttribute("data-theme", theme);

    // Apply theme class to body and other elements for legacy selectors
    document.body.classList.remove(...Array.from(document.body.classList).filter(c => c.startsWith("theme-")));
    document.body.classList.add(`theme-${theme}`);

    // Update Chatbot container theme attribute for consistency
    const chatbotContainer = document.querySelector(".chatbot-container");
    if (chatbotContainer) {
      chatbotContainer.setAttribute("data-theme", theme);
      chatbotContainer.classList.remove(...Array.from(chatbotContainer.classList).filter(c => c.startsWith("theme-")));
      chatbotContainer.classList.add(`theme-${theme}`);
    }

    // Central theme token map (single source of truth)
    const applyTokens = (tokens) => {
      Object.keys(tokens).forEach((k) => {
        document.documentElement.style.setProperty(k, tokens[k]);
      });

      // Maintain backwards-compatible aliases used across styles
      document.documentElement.style.setProperty("--app-background", tokens["--bg-primary"]);
      document.documentElement.style.setProperty("--app-foreground", tokens["--text-primary"]);
      document.documentElement.style.setProperty("--chat-bg", tokens["--bg-secondary"]);
      document.documentElement.style.setProperty("--chat-text", tokens["--text-primary"]);
      document.documentElement.style.setProperty("--chat-input-bg", tokens["--input-bg"]);
      document.documentElement.style.setProperty("--chat-input-text", tokens["--input-text"]);
      document.documentElement.style.setProperty("--chat-input-placeholder", tokens["--placeholder"]);
      document.documentElement.style.setProperty("--group-hover-bg", tokens["--hover-bg"]);
      document.documentElement.style.setProperty("--group-hover-text", tokens["--hover-text"]);
      document.documentElement.style.setProperty("--group-active-bg", tokens["--hover-bg"]);
      document.documentElement.style.setProperty("--chat-title-color", tokens["--text-primary"]);
      document.documentElement.style.setProperty("--danger", "#e74c3c");
    };

    // Token sets per theme
    const brandTokens = {
      "--bg-primary": "#0b2740", // navy
      "--bg-secondary": "#112b46", // dark blue / panels
      "--text-primary": "#FFFFFF",
      "--text-secondary": "#9FB8D0",
      "--accent-primary": "#00FF66", // neon green (use sparingly)
      "--hover-bg": "#07182b",
      "--hover-text": "#FFFFFF",
      "--input-bg": "#062033",
      "--input-text": "#FFFFFF",
      "--placeholder": "#9CA3AF",
    };

    const darkTokens = {
      "--bg-primary": "#000000",
      "--bg-secondary": "#0b1220",
      "--text-primary": "#FFFFFF",
      "--text-secondary": "#CBD5E1",
      "--accent-primary": "#00D07A",
      "--hover-bg": "#03060a",
      "--hover-text": "#FFFFFF",
      "--input-bg": "#0b1220",
      "--input-text": "#FFFFFF",
      "--placeholder": "#9CA3AF",
    };

    const lightTokens = {
      "--bg-primary": "#FFFFFF",
      "--bg-secondary": "#F3F4F6",
      "--text-primary": "#000000",
      "--text-secondary": "#374151",
      "--accent-primary": "#00A86B",
      "--hover-bg": "#E5E7EB",
      "--hover-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#000000",
      "--placeholder": "#6B7280",
    };

    if (theme === "brand") applyTokens(brandTokens);
    else if (theme === "dark") applyTokens(darkTokens);
    else applyTokens(lightTokens);

    // small accessibility helpers
    document.documentElement.style.setProperty("--link-color", theme === "light" ? "#1f2937" : "#9FB8D0");

  }, [theme]);

  // On mount, try to fetch global theme from the server (admin-configured)
  // Only apply server-configured theme if the user has not already chosen a theme
  useEffect(() => {
    const fetchServerTheme = async () => {
      try {
        const savedTheme = localStorage.getItem("sno_theme");
        if (savedTheme) return; // user preference wins

        const base = process.env.REACT_APP_API_BASE || "https://sno-relax-server.onrender.com";
        const res = await axios.get(`${base}/api/admin/settings/theme`);
        if (res && res.data && res.data.ok && res.data.theme) {
          const serverTheme = res.data.theme;
          if (serverTheme && serverTheme !== theme) {
            setTheme(serverTheme);
          }
        }
      } catch (e) {
        // ignore: server may not be configured or reachable in dev
      }
    };
    fetchServerTheme();
  }, []);
  

  const toggleTheme = () => {
    // Quick toggle between dark and light (user preference)
    setTheme((prevTheme) => {
      const next = prevTheme === "dark" ? "light" : "dark";
      localStorage.setItem("sno_theme", next);
      return next;
    });
  };

  const setSpecificTheme = (themeName) => {
    if (themes.find(t => t.id === themeName)) {
      localStorage.setItem("sno_theme", themeName);
      setTheme(themeName);
    }
  };

  const getCurrentTheme = () => {
    return themes.find(t => t.id === theme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      setSpecificTheme,
      themes,
      getCurrentTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

