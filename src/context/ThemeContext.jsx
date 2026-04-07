import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("sno_theme");
    return savedTheme || "brand";
  });

  const [customBackground, setCustomBackground] = useState(() => {
    return localStorage.getItem("sno_custom_bg") || "default";
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem("sno_accent_color") || "default";
  });

  const themes = [
    { 
      id: "brand", 
      name: "Brand (Default)", 
      hex: "#0b2740",
      gradient: "linear-gradient(135deg, #0b2740 0%, #112b46 50%, #00FF66 100%)"
    },
    { 
      id: "dark", 
      name: "Dark", 
      hex: "#0f172a",
      gradient: "linear-gradient(135deg, #000000 0%, #0b1220 50%, #00D07A 100%)"
    },
    { 
      id: "light", 
      name: "Light", 
      hex: "#f8fafc",
      gradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #00A86B 100%)"
    }
  ];

  const backgroundImages = [
    { id: "default", name: "Default", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=50", url: null },
    { id: "calm-nature", name: "Calm Nature", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=50", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80" },
    { id: "peaceful-ocean", name: "Ocean", thumbnail: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=100&q=50", url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80" },
    { id: "serene-forest", name: "Forest", thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=100&q=50", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80" },
    { id: "sunset-calm", name: "Sunset", thumbnail: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=100&q=50", url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80" },
    { id: "mountain-peace", name: "Mountains", thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=100&q=50", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80" },
    { id: "meditation", name: "Meditation", thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100&q=50", url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&q=80" },
    { id: "mindfulness", name: "Mindfulness", thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&q=50", url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80" },
  ];

  const accentColors = [
    { id: "default", name: "Green", color: "#00FF66", gradient: "linear-gradient(135deg, #00FF66, #00D07A)" },
    { id: "blue", name: "Blue", color: "#3B82F6", gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)" },
    { id: "purple", name: "Purple", color: "#8B5CF6", gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)" },
    { id: "pink", name: "Pink", color: "#EC4899", gradient: "linear-gradient(135deg, #EC4899, #DB2777)" },
    { id: "orange", name: "Orange", color: "#F97316", gradient: "linear-gradient(135deg, #F97316, #EA580C)" },
    { id: "cyan", name: "Cyan", color: "#06B6D4", gradient: "linear-gradient(135deg, #06B6D4, #0891B2)" },
  ];

  useEffect(() => {
    localStorage.setItem("sno_theme", theme);
    localStorage.setItem("sno_custom_bg", customBackground);
    localStorage.setItem("sno_accent_color", accentColor);
    document.documentElement.setAttribute("data-theme", theme);

    document.body.classList.remove(...Array.from(document.body.classList).filter(c => c.startsWith("theme-") || c.startsWith("bg-")));
    document.body.classList.add(`theme-${theme}`);
    document.body.classList.add(`bg-${customBackground}`);

    const chatbotContainer = document.querySelector(".chatbot-container");
    if (chatbotContainer) {
      chatbotContainer.setAttribute("data-theme", theme);
      chatbotContainer.classList.remove(...Array.from(chatbotContainer.classList).filter(c => c.startsWith("theme-") || c.startsWith("bg-")));
      chatbotContainer.classList.add(`theme-${theme}`);
      chatbotContainer.classList.add(`bg-${customBackground}`);
    }

    const applyTokens = (tokens, bgUrl, accent) => {
      Object.keys(tokens).forEach((k) => {
        document.documentElement.style.setProperty(k, tokens[k]);
      });

      const accentColorVal = accent?.color || tokens["--accent-primary"];

      document.documentElement.style.setProperty("--app-background", tokens["--bg-primary"]);
      document.documentElement.style.setProperty("--app-foreground", tokens["--text-primary"]);
      document.documentElement.style.setProperty("--chat-bg", tokens["--bg-secondary"]);
      document.documentElement.style.setProperty("--chat-surface", tokens["--bg-secondary"]);
      document.documentElement.style.setProperty("--chat-paper-bg", tokens["--bg-secondary"]);
      document.documentElement.style.setProperty("--chat-text", tokens["--text-primary"]);
      document.documentElement.style.setProperty("--chat-text-secondary", tokens["--text-secondary"]);
      document.documentElement.style.setProperty("--muted-text", tokens["--text-secondary"]);
      document.documentElement.style.setProperty("--chat-input-bg", tokens["--input-bg"]);
      document.documentElement.style.setProperty("--chat-input-text", tokens["--input-text"]);
      document.documentElement.style.setProperty("--chat-input-placeholder", tokens["--placeholder"]);
      document.documentElement.style.setProperty("--chat-border", tokens["--border-color"]);
      document.documentElement.style.setProperty("--chat-accent", accentColorVal);
      document.documentElement.style.setProperty("--group-hover-bg", tokens["--hover-bg"]);
      document.documentElement.style.setProperty("--group-hover-text", tokens["--hover-text"]);
      document.documentElement.style.setProperty("--group-active-bg", tokens["--hover-bg"]);
      document.documentElement.style.setProperty("--chat-title-color", tokens["--text-primary"]);
      document.documentElement.style.setProperty("--danger", "#e74c3c");

      document.documentElement.style.setProperty("--current-accent", accentColorVal);
      document.documentElement.style.setProperty("--app-gradient", `linear-gradient(135deg, ${accentColorVal} 0%, ${tokens["--mood-mid"]} 100%)`);
      document.documentElement.style.setProperty("--app-gradient-soft", `linear-gradient(135deg, ${accentColorVal}15, ${tokens["--mood-mid"]}15)`);
      document.documentElement.style.setProperty("--msg-bubble-own-bg", `linear-gradient(135deg, ${accentColorVal} 0%, ${tokens["--mood-mid"]} 100%)`);
      document.documentElement.style.setProperty("--msg-bubble-other-bg", tokens["--bg-primary"]);
      document.documentElement.style.setProperty("--divider", tokens["--divider"] || "rgba(0,0,0,0.06)");

      // WhatsApp-style message bubbles
      document.documentElement.style.setProperty("--msg-sent-bg", accentColorVal);
      document.documentElement.style.setProperty("--msg-sent-text", tokens["--bg-primary"]);
      document.documentElement.style.setProperty("--msg-received-bg", tokens["--bg-secondary"]);
      document.documentElement.style.setProperty("--msg-received-text", tokens["--text-primary"]);
      document.documentElement.style.setProperty("--typing-dot", accentColorVal);

      if (bgUrl) {
        const overlayStrength = theme === "light" ? "0.6" : "0.75";
        const bgGradient = `linear-gradient(135deg, rgba(0,0,0,${overlayStrength}) 0%, rgba(0,0,0,${parseFloat(overlayStrength) * 0.8}) 100%), url('${bgUrl}')`;
        document.documentElement.style.setProperty("--bg-image-url", `url('${bgUrl}')`);
        document.documentElement.style.setProperty("--bg-image-gradient", bgGradient);
        document.documentElement.style.setProperty("--app-background", bgGradient);
        
        document.body.classList.add("has-background-image");
        
        const appContainer = document.querySelector(".app-container") || document.querySelector(".login-container") || document.querySelector(".dashboard-container");
        if (appContainer) {
          appContainer.style.backgroundImage = bgGradient;
          appContainer.style.backgroundSize = "cover";
          appContainer.style.backgroundPosition = "center";
          appContainer.style.backgroundAttachment = "fixed";
          appContainer.style.backgroundRepeat = "no-repeat";
        }
      } else {
        document.documentElement.style.setProperty("--bg-image-url", "none");
        document.documentElement.style.setProperty("--bg-image-gradient", "none");
        document.body.classList.remove("has-background-image");
        
        const appContainer = document.querySelector(".app-container") || document.querySelector(".login-container") || document.querySelector(".dashboard-container");
        if (appContainer) {
          appContainer.style.backgroundImage = "none";
        }
      }
    };

    const currentBg = backgroundImages.find(bg => bg.id === customBackground);
    const currentAccent = accentColors.find(a => a.id === accentColor);
    const currentThemeConfig = themes.find(t => t.id === theme);

    const brandTokens = {
      "--bg-primary": "#0b2740",
      "--bg-secondary": "#112b46",
      "--bg-tertiary": "#1a3a5c",
      "--text-primary": "#FFFFFF",
      "--text-secondary": "#9FB8D0",
      "--text-muted": "#7A9BBF",
      "--border-color": "rgba(255,255,255,0.12)",
      "--accent-primary": currentAccent?.color || "#00FF66",
      "--accent-secondary": currentAccent?.color || "#00FF66",
      "--hover-bg": "#0a1f33",
      "--hover-text": "#FFFFFF",
      "--input-bg": "#062033",
      "--input-text": "#FFFFFF",
      "--placeholder": "#9CA3AF",
      "--divider": "rgba(255,255,255,0.08)",
      "--mood-high": "#22c55e",
      "--mood-mid": "#3b82f6",
      "--mood-low": "#f59e0b",
      "--mood-verylow": "#ef4444",
      "--card-bg": "rgba(11, 39, 64, 0.85)",
      "--overlay-bg": "rgba(0, 0, 0, 0.5)",
    };

    const darkTokens = {
      "--bg-primary": "#000000",
      "--bg-secondary": "#0b1220",
      "--bg-tertiary": "#111827",
      "--text-primary": "#FFFFFF",
      "--text-secondary": "#CBD5E1",
      "--text-muted": "#94A3B8",
      "--border-color": "rgba(255,255,255,0.12)",
      "--accent-primary": currentAccent?.color || "#00D07A",
      "--accent-secondary": currentAccent?.color || "#00D07A",
      "--hover-bg": "#03060a",
      "--hover-text": "#FFFFFF",
      "--input-bg": "#0b1220",
      "--input-text": "#FFFFFF",
      "--placeholder": "#9CA3AF",
      "--divider": "rgba(255,255,255,0.08)",
      "--mood-high": "#16a34a",
      "--mood-mid": "#2563eb",
      "--mood-low": "#d97706",
      "--mood-verylow": "#dc2626",
      "--card-bg": "rgba(11, 18, 32, 0.85)",
      "--overlay-bg": "rgba(0, 0, 0, 0.6)",
    };

    const lightTokens = {
      "--bg-primary": "#FFFFFF",
      "--bg-secondary": "#F8FAFC",
      "--bg-tertiary": "#F1F5F9",
      "--text-primary": "#0F172A",
      "--text-secondary": "#475569",
      "--text-muted": "#64748B",
      "--border-color": "rgba(0,0,0,0.1)",
      "--accent-primary": currentAccent?.color || "#00A86B",
      "--accent-secondary": currentAccent?.color || "#00A86B",
      "--hover-bg": "#E2E8F0",
      "--hover-text": "#0F172A",
      "--input-bg": "#FFFFFF",
      "--input-text": "#0F172A",
      "--placeholder": "#94A3B8",
      "--divider": "rgba(0,0,0,0.06)",
      "--mood-high": "#16a34a",
      "--mood-mid": "#3b82f6",
      "--mood-low": "#f59e0b",
      "--mood-verylow": "#ef4444",
      "--card-bg": "rgba(255, 255, 255, 0.9)",
      "--overlay-bg": "rgba(255, 255, 255, 0.3)",
    };

    if (theme === "brand") applyTokens(brandTokens, currentBg?.url, currentAccent);
    else if (theme === "dark") applyTokens(darkTokens, currentBg?.url, currentAccent);
    else applyTokens(lightTokens, currentBg?.url, currentAccent);

    document.documentElement.style.setProperty("--link-color", theme === "light" ? "#1f2937" : "#9FB8D0");

    if (theme === "light") {
      document.documentElement.style.setProperty("--bg-overlay-strength", "0.4");
    } else {
      document.documentElement.style.setProperty("--bg-overlay-strength", "0.75");
    }

  }, [theme, customBackground, accentColor]);

  useEffect(() => {
    const fetchServerTheme = async () => {
      try {
        const savedTheme = localStorage.getItem("sno_theme");
        if (savedTheme) return;

        const base = process.env.REACT_APP_API_BASE || "https://sno-relax-server.onrender.com";
        const res = await axios.get(`${base}/api/admin/settings/theme`);
        if (res && res.data && res.data.ok && res.data.theme) {
          const serverTheme = res.data.theme;
          if (serverTheme && serverTheme !== theme) {
            setTheme(serverTheme);
          }
        }
      } catch (e) {
        // ignore
      }
    };
    fetchServerTheme();
  }, []);

  const toggleTheme = () => {
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

  const setSpecificBackground = (bgId) => {
    localStorage.setItem("sno_custom_bg", bgId);
    setCustomBackground(bgId);
  };

  const setSpecificAccentColor = (accentId) => {
    localStorage.setItem("sno_accent_color", accentId);
    setAccentColor(accentId);
  };

  const getCurrentTheme = () => {
    return themes.find(t => t.id === theme);
  };

  const getCurrentBackground = () => {
    return backgroundImages.find(bg => bg.id === customBackground);
  };

  const getCurrentAccent = () => {
    return accentColors.find(a => a.id === accentColor);
  };

  const getThemeAccentColor = () => {
    const currentAccent = accentColors.find(a => a.id === accentColor);
    return currentAccent?.color || "#00FF66";
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      setSpecificTheme,
      setSpecificBackground,
      setSpecificAccentColor,
      customBackground,
      setCustomBackground,
      accentColor,
      setAccentColor,
      themes,
      backgroundImages,
      accentColors,
      getCurrentTheme,
      getCurrentBackground,
      getCurrentAccent,
      getThemeAccentColor
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
