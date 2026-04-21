import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  BookOpen,
  Handshake,
  Users,
  HelpCircle,
  Settings,
  Bot,
  HeartPulse,
  Hospital,
  Menu,
  LogOut,
  Paperclip,
  Gamepad,
  MapPin,
} from "lucide-react";
import StartupModal from "../components/StartupModal";
import "../styles/Dashboard.css";
import { API_BASE, STORAGE_KEYS } from "../constants";

const NAV_ITEMS = [
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/games", icon: Gamepad, label: "Games" },
  { path: "/mood-tracker", icon: BookOpen, label: "Mood Tracker" },
  { path: "/therapist-notes", icon: Paperclip, label: "Therapist Notes" },
  { path: "/community", icon: Users, label: "Community" },
  { path: "/settings", icon: Settings, label: "Settings" },
  { path: "/help", icon: HelpCircle, label: "Help" },
];

const WIDGETS = [
  { path: "/chatbot", icon: Bot, title: "AI Chatbot", desc: "Talk with SnoBot for stress relief and support." },
  { path: "/mood-tracker", icon: BookOpen, title: "Mood Tracker", desc: "Log your daily mood & monitor changes." },
  { path: "/ai-guide", icon: Handshake, title: "AI Health Guide", desc: "AI-guided health routines & recommendations." },
  { path: "/therapist-notes", icon: Paperclip, title: "Therapist Notes", desc: "Admin recommendations & guidance." },
  { path: "/reports", icon: Hospital, title: "Hospital Reports", desc: "Store prescriptions & medical history." },
  { 
    path: "https://shivamdubey023.github.io/Web_Devlopment/HV/health-vault.html",
    icon: HeartPulse, 
    title: "HealthVault", 
    desc: "A guideline on how to stay fit.",
    external: true,
  },
  { path: "/community", icon: Users, title: "Community", desc: "Join groups & connect with others." },
];

export default function Dashboard({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("User");
  const [city, setCity] = useState("Unknown");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [startupVisible, setStartupVisible] = useState(false);
  const [startupContent, setStartupContent] = useState("");

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setFirstName(localStorage.getItem(STORAGE_KEYS.FIRST_NAME) || "User");
    const storedCity = localStorage.getItem(STORAGE_KEYS.CITY);
    if (storedCity) {
      setCity(storedCity);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(`${API_BASE}/api/location`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ latitude, longitude }),
            });
            const data = await res.json();
            setCity(data.city || "Unknown");
            localStorage.setItem(STORAGE_KEYS.CITY, data.city || "Unknown");
          } catch {
            setCity("Unknown");
          }
        },
        () => setCity("Unknown")
      );
    }
  }, [isLoggedIn]);

  const requireLogin = (path) => {
    const logged = isLoggedIn || !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!logged) navigate("/login");
    else navigate(path);
  };

  const handleWidgetClick = (widget) => {
    if (widget.external) {
      window.open(widget.path, "_blank");
    } else {
      requireLogin(widget.path);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchPopup = async () => {
      const versionKey = STORAGE_KEYS.ADMIN_POPUP_VERSION;
      const dismissedKey = STORAGE_KEYS.ADMIN_POPUP_DISMISSED;
      const defaultContent = "<h3>Welcome!</h3><p>We're glad to have you here.</p>";

      const urlParams = new URLSearchParams(window.location.search);
      const forceShow = urlParams.get("showPopup") === "1" || window.location.hostname === "localhost";

      const showIfNeeded = (contentHtml, version) => {
        const resolved = contentHtml?.trim() ? contentHtml : defaultContent;
        const dismissed = localStorage.getItem(dismissedKey) || "";
        const currentVersion = version || localStorage.getItem(versionKey) || "1";

        if (!forceShow && dismissed === currentVersion) return;
        localStorage.setItem(versionKey, currentVersion);

        if (mounted) {
          setStartupContent(resolved);
          setStartupVisible(true);
        }
      };

      try {
        const res = await fetch(`${API_BASE}/api/admin/popup`);
        if (res.ok) {
          const data = await res.json();
          showIfNeeded(data.content || "", data.version || "1");
          return;
        }
      } catch {}

      const storedContent = localStorage.getItem(STORAGE_KEYS.ADMIN_POPUP_CONTENT);
      const storedVersion = localStorage.getItem(STORAGE_KEYS.ADMIN_POPUP_VERSION) || "1";
      showIfNeeded(storedContent || "", storedVersion);
    };

    fetchPopup();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="dashboard-container">
      {window.innerWidth <= 1024 && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <h2 className="logo">SnoRelax</h2>

        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className="nav-item"
              onClick={() => requireLogin(item.path)}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {isLoggedIn && (
            <button
              className="logout-btn"
              onClick={() => {
                onLogout();
                navigate("/login");
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      </aside>

      <main className="dashboard-main">
        <StartupModal
          visible={startupVisible}
          content={startupContent}
          onClose={() => {
            const version = localStorage.getItem(STORAGE_KEYS.ADMIN_POPUP_VERSION) || "1";
            localStorage.setItem(STORAGE_KEYS.ADMIN_POPUP_DISMISSED, version);
            setStartupVisible(false);
          }}
        />

        <div className="dashboard-topbar">
          <button
            className={`hamburger ${sidebarOpen ? "active" : ""}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>

          <div className="welcome-section">
            <h1 className="welcome-title">
              {isLoggedIn ? `Welcome, ${firstName}` : "Welcome"}
            </h1>
            <span className="location-badge">
              <MapPin size={14} />
              {city}
            </span>
          </div>

          <button
            className="help-icon"
            onClick={() => requireLogin("/help")}
            title="Help"
          >
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="dashboard-widgets">
          {WIDGETS.map((widget, i) => (
            <div
              key={i}
              className={`dashboard-widget ${!isLoggedIn && !widget.external ? "disabled" : ""}`}
              onClick={() => handleWidgetClick(widget)}
            >
              <widget.icon size={28} className="widget-icon" />
              <h3 className="widget-title">{widget.title}</h3>
              <p className="widget-desc">{widget.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
