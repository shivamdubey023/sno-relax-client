import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    const savedTheme = localStorage.getItem("sno_theme");
    return savedTheme || "dark";
  });

  // Available themes (only light and dark)
  const themes = [
    { id: "light", name: "Light", hex: "#f3f4f6" },
    { id: "dark", name: "Dark", hex: "#0f172a" }
  ];

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sno_theme", theme);
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);
    
    // Apply theme class to body and other elements
    // swap theme class on body
    document.body.classList.remove(...Array.from(document.body.classList).filter(c => c.startsWith("theme-")));
    document.body.classList.add(`theme-${theme}`);

    // Update Chatbot container theme attribute
    const chatbotContainer = document.querySelector(".chatbot-container");
    if (chatbotContainer) {
      chatbotContainer.setAttribute("data-theme", theme);
      chatbotContainer.classList.remove(...Array.from(chatbotContainer.classList).filter(c => c.startsWith("theme-")));
      chatbotContainer.classList.add(`theme-${theme}`);
    }

    // Apply CSS variables for easier global theming
    const t = themes.find(t => t.id === theme) || themes[0];
    const baseHex = t.hex || "#667eea";
    document.documentElement.style.setProperty("--app-primary", baseHex);
    document.documentElement.style.setProperty("--app-gradient", theme === "light" ? `linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)` : `linear-gradient(135deg, ${baseHex} 0%, ${baseHex}66 100%)`);

// Defaults for chat variables. We'll set per-theme values below.
    // Input area defaults (will be overridden by theme-specific settings)
    document.documentElement.style.setProperty("--chat-input-bg", "#ffffff");
    document.documentElement.style.setProperty("--chat-input-text", "#000000");
    document.documentElement.style.setProperty("--chat-input-placeholder", "rgba(0,0,0,0.45)");

    // Set defaults that will be overridden by theme-specific values
    document.documentElement.style.setProperty("--chat-bg", "#ffffff");
    document.documentElement.style.setProperty("--chat-text", "#000000");
    document.documentElement.style.setProperty("--bot-bubble-bg", "#ffffff");
    document.documentElement.style.setProperty("--bot-text", "#333333");
    document.documentElement.style.setProperty("--user-bubble-bg", baseHex);
    document.documentElement.style.setProperty("--user-text", "#ffffff");

    // foreground and background
    if (theme === "light") {
      document.documentElement.style.setProperty("--app-foreground", "#0f172a");
      document.documentElement.style.setProperty("--app-background", "#ffffff");
      // Chat area in light theme: light paper with dark text
      document.documentElement.style.setProperty("--chat-bg", "#f7f9fc");
      document.documentElement.style.setProperty("--chat-text", "#0b1220");
      document.documentElement.style.setProperty("--bot-bubble-bg", "#ffffff");
      document.documentElement.style.setProperty("--bot-text", "#111827");
      document.documentElement.style.setProperty("--user-bubble-bg", baseHex);
      document.documentElement.style.setProperty("--user-text", "#ffffff");

      // Input area for light theme remains white with dark placeholder
      document.documentElement.style.setProperty("--chat-input-bg", "#ffffff");
      document.documentElement.style.setProperty("--chat-input-text", "#000000");
      document.documentElement.style.setProperty("--chat-input-placeholder", "rgba(0,0,0,0.45)");

      // Therapist-specific variables fall back to defaults for light theme
      document.documentElement.style.setProperty("--therapist-chat-bg", "#ffffff");
      document.documentElement.style.setProperty("--therapist-text", "#000000");
    } else {
      document.documentElement.style.setProperty("--app-foreground", "#ffffff");
      document.documentElement.style.setProperty("--app-background", "#0b1220");
      // Dark theme: darker chat surface, light text, translucent bubbles
      document.documentElement.style.setProperty("--chat-bg", "#0b1220");
      document.documentElement.style.setProperty("--chat-text", "#e6eef8");
      document.documentElement.style.setProperty("--bot-bubble-bg", "rgba(255,255,255,0.03)");
      document.documentElement.style.setProperty("--bot-text", "#e6eef8");
      document.documentElement.style.setProperty("--user-bubble-bg", baseHex);
      document.documentElement.style.setProperty("--user-text", "#ffffff");

      // Input area for dark theme should be dark with white text and whitish placeholder
      document.documentElement.style.setProperty("--chat-input-bg", "#0f1724");
      document.documentElement.style.setProperty("--chat-input-text", "#ffffff");
      document.documentElement.style.setProperty("--chat-input-placeholder", "rgba(255,255,255,0.65)");
      // Defaults for non-light themes (dark). If user chooses the `therapist`
      // theme we override below to ensure therapist page colors are applied.
      document.documentElement.style.setProperty("--therapist-chat-bg", "#0b1220");
      document.documentElement.style.setProperty("--therapist-text", "#000000");
    }

    // 'therapist' theme removed from options. Keep per-theme variables limited to light/dark above.
  }, [theme]);

  // On mount, try to fetch global theme from the server (admin-configured)
  useEffect(() => {
    const fetchServerTheme = async () => {
      try {
        const base = process.env.REACT_APP_API_BASE || "https://sno-relax-server.onrender.com";
        const res = await axios.get(`${base}/api/admin/settings/theme`);
        if (res && res.data && res.data.ok && res.data.theme) {
          // If a global theme exists and differs from the current, apply it
          const serverTheme = res.data.theme;
          if (serverTheme && serverTheme !== theme) {
            setTheme(serverTheme);
          }
        }
      } catch (e) {
        // ignore: server may not be configured or reachable in dev
        // console.warn('Could not fetch server theme', e);
      }
    };
    fetchServerTheme();
  }, []);
  

  const toggleTheme = () => {
    // Toggle between dark and light (legacy support)
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  const setSpecificTheme = (themeName) => {
    if (themes.find(t => t.id === themeName)) {
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

