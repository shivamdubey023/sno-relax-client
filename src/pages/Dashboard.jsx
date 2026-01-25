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
} from "lucide-react";
import StartupModal from "../components/StartupModal";
import "../styles/Dashboard.css";

export default function Dashboard({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  // ---- User + location state ----
  const [firstName, setFirstName] = useState("User");
  const [city, setCity] = useState("Unknown");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // ---- UI state ----
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [startupVisible, setStartupVisible] = useState(false);
  const [startupContent, setStartupContent] = useState("");

  const API_BASE =
    process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // ---- Fetch city from coordinates ----
  const fetchCityFromCoords = async (lat, lon) => {
    try {
      const res = await fetch(`${API_BASE}/api/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });
      const data = await res.json();
      return data.city || "Unknown";
    } catch {
      return "Unknown";
    }
  };

  // ---- Load user info + location ----
  useEffect(() => {
    setFirstName(localStorage.getItem("sno_firstName") || "User");

    const storedCity = localStorage.getItem("sno_city");
    const storedLat = localStorage.getItem("sno_lat");
    const storedLon = localStorage.getItem("sno_lon");

    if (storedCity && storedLat && storedLon) {
      setCity(storedCity);
      setLatitude(parseFloat(storedLat));
      setLongitude(parseFloat(storedLon));
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          const detectedCity = await fetchCityFromCoords(
            latitude,
            longitude
          );
          setCity(detectedCity);
          localStorage.setItem("sno_city", detectedCity);
          localStorage.setItem("sno_lat", latitude);
          localStorage.setItem("sno_lon", longitude);
        },
        () => setCity("Unknown")
      );
    } else {
      setCity("Unknown");
    }
  }, [isLoggedIn]);

  // ---- Navigation guard ----
  const requireLogin = (path) => {
    if (!isLoggedIn) navigate("/login");
    else navigate(path);
  };

  // ---- Startup popup logic ----
  useEffect(() => {
    let mounted = true;

    const fetchPopup = async () => {
      const versionKey = "admin_popup_version";
      const dismissedKey = "admin_popup_dismissed_version";
      const defaultContent =
        "<h3>Announcement</h3><p>No announcements at this time.</p>";

      const urlParams = new URLSearchParams(window.location.search);
      const forceShow =
        urlParams.get("showPopup") === "1" ||
        window.location.hostname === "localhost";

      const showIfNeeded = (contentHtml, version) => {
        const resolved =
          contentHtml && String(contentHtml).trim()
            ? contentHtml
            : defaultContent;

        const dismissed =
          localStorage.getItem(dismissedKey) || "";
        const currentVersion =
          version || localStorage.getItem(versionKey) || "1";

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
      } catch {
        // ignore and fallback
      }

      const storedContent =
        localStorage.getItem("admin_popup_content");
      const storedVersion =
        localStorage.getItem("admin_popup_version") || "1";
      showIfNeeded(storedContent || "", storedVersion);
    };

    fetchPopup();
    return () => {
      mounted = false;
    };
  }, [API_BASE]);

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <h2 className="logo">🌙 SnoRelax</h2>

        <nav>
          <button onClick={() => requireLogin("/profile")}>
            <User size={18} /> Profile
          </button>
          <button onClick={() => requireLogin("/games")}>
            <Gamepad size={18} /> Games
          </button>
          <button onClick={() => requireLogin("/mood-tracker")}>
            <BookOpen size={18} /> Mood Tracker
          </button>
          <button onClick={() => requireLogin("/therapist-notes")}>
            <Paperclip size={18} /> Therapist Notes
          </button>
          <button onClick={() => requireLogin("/community")}>
            <Users size={18} /> Community
          </button>
          <button onClick={() => requireLogin("/settings")}>
            <Settings size={18} /> Settings
          </button>
          <button onClick={() => requireLogin("/help")}>
            <HelpCircle size={18} /> Help
          </button>
        </nav>

        <div className="sidebar-footer">
          {isLoggedIn && (
            <button onClick={onLogout}>
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>
      </aside>

      <main className="main-content">
        <StartupModal
          visible={startupVisible}
          content={startupContent}
          onClose={() => {
            const version =
              localStorage.getItem("admin_popup_version") || "1";
            localStorage.setItem(
              "admin_popup_dismissed_version",
              version
            );
            setStartupVisible(false);
          }}
        />

        <div className="topbar">
          <button
            className={`hamburger ${sidebarOpen ? "active" : ""}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ boxShadow: "none" }}
          >
            <Menu size={24} />
          </button>

          <div>
            <h1>
              {isLoggedIn ? `Welcome, ${firstName}` : "Welcome, User"}
            </h1>
            <p className="city">📍 {city}</p>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={() => requireLogin("/help")}
              title="Help"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </div>

        <div className="widgets">
          <div
            className={`widget ${!isLoggedIn ? "disabled" : ""}`}
            onClick={() => requireLogin("/chatbot")}
          >
            <Bot size={28} />
            <h3>AI Chatbot</h3>
            <p>Talk with SnoBot for stress relief and support.</p>
          </div>

          <div
            className={`widget ${!isLoggedIn ? "disabled" : ""}`}
            onClick={() => requireLogin("/mood-tracker")}
          >
            <BookOpen size={28} />
            <h3>Mood Tracker</h3>
            <p>Log your daily mood & monitor changes.</p>
          </div>

          <div
            className={`widget ${!isLoggedIn ? "disabled" : ""}`}
            onClick={() => requireLogin("/ai-guide")}
          >
            <Handshake size={28} />
            <h3>AI Health Guide</h3>
            <p>AI-guided health routines & recommendations.</p>
          </div>

          <div
            className={`widget ${!isLoggedIn ? "disabled" : ""}`}
            onClick={() => requireLogin("/therapist-notes")}
          >
            <Paperclip size={28} />
            <h3>Therapist Notes</h3>
            <p>Admin recommendations & guidance.</p>
          </div>

          <div
            className={`widget ${!isLoggedIn ? "disabled" : ""}`}
            onClick={() => requireLogin("/reports")}
          >
            <Hospital size={28} />
            <h3>Hospital Reports</h3>
            <p>Store prescriptions & medical history.</p>
          </div>

          <div
            className="widget cursor-pointer"
            onClick={() =>
              window.open(
                "https://kuro-shiv.github.io/Web_Devlopment/HV/health-vault.html",
                "_blank"
              )
            }
          >
            <HeartPulse size={28} />
            <h3>HealthVault</h3>
            <p>A guideline on how to stay fit.</p>
          </div>

          <div
            className={`widget ${!isLoggedIn ? "disabled" : ""}`}
            onClick={() => requireLogin("/community")}
          >
            <Users size={28} />
            <h3>Community</h3>
            <p>Join groups & connect with others.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
