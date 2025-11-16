import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Activity, BookOpen, Handshake, Users, HelpCircle,
  Settings, Bot, HeartPulse, Hospital, Menu, LogOut,
  Paperclip,
  GamepadIcon
} from "lucide-react";
import "../styles/Dashboard.css";

export default function Dashboard({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("User");
  const [city, setCity] = useState("Unknown");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // Fetch city from coordinates
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

  // Update user info and city
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
          const detectedCity = await fetchCityFromCoords(latitude, longitude);
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

  const requireLogin = (path) => {
    if (!isLoggedIn) navigate("/login");
    else navigate(path);
  };

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <h2 className="logo">🌙 SnoRelax</h2>
        <nav>
          <button onClick={() => requireLogin("/profile")}><User size={18} /> Profile</button>
          <button onClick={() => requireLogin("/games")}><GamepadIcon size={18} /> Games</button>
          <button onClick={() => requireLogin("/mood-tracker")}><BookOpen size={18} /> Mood Tracker</button>
          <button onClick={() => requireLogin("/therapist-notes")}><Paperclip size={18} /> Therapist Notes</button>
          <button onClick={() => requireLogin("/community")}><Users size={18} /> Community</button>
          <button onClick={() => requireLogin("/settings")}><Settings size={18} /> Settings</button>
          <button onClick={() => requireLogin("/help")}><HelpCircle size={18} /> Help</button>
        </nav>
        <div className="sidebar-footer">
          {isLoggedIn && <button onClick={onLogout}><LogOut size={18} /> Logout</button>}
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <button
            className={`hamburger ${sidebarOpen ? "active" : ""}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ boxShadow: "none" }}
          >
            <Menu size={24} />
          </button>
          <div>
            <h1>{isLoggedIn ? `Welcome, ${firstName}` : "Welcome, User"}</h1>
            <p className="city">📍 {city}</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => requireLogin("/help")} title="Help" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
              <HelpCircle size={20} />
            </button>
          </div>
        </div>

          <div className="widgets">
          <div className={`widget ${!isLoggedIn ? "disabled" : ""}`} onClick={() => requireLogin("/chatbot")}><Bot size={28} /><h3>AI Chatbot</h3><p>Talk with SnoBot for stress relief and support.</p></div>
          <div className={`widget ${!isLoggedIn ? "disabled" : ""}`} onClick={() => requireLogin("/mood-tracker")}><BookOpen size={28} /><h3>Mood Tracker</h3><p>Log your daily mood & monitor changes.</p></div>
          <div className={`widget ${!isLoggedIn ? "disabled" : ""}`} onClick={() => requireLogin("/ai-guide")}><Handshake size={28} /><h3>AI Health Guide</h3><p>AI-guided Health Assistant recommendations and routines.</p></div>
          <div className={`widget ${!isLoggedIn ? "disabled" : ""}`} onClick={() => requireLogin("/ai-guide")}><Paperclip size={28} /><h3>Therapist Notes</h3><p>Admin recommendations Guide.</p></div>
          <div className={`widget ${!isLoggedIn ? "disabled" : ""}`}><Hospital size={28} /><h3>Hospital Reports</h3><p>Store prescriptions & medical history.</p></div>

          {/* HealthVault always active */}
          <div className="widget cursor-pointer" onClick={() => window.open("https://kuro-shiv.github.io/Web_Devlopment/HV/health-vault.html", "_blank")}>
            <HeartPulse size={28} />
            <h3>HealthVault</h3>
            <p>A guideline how to be fit.</p>
          </div>

          <div className={`widget ${!isLoggedIn ? "disabled" : ""}`} onClick={() => requireLogin("/community")}><Users size={28} /><h3>Community</h3><p>Join groups & connect with others.</p></div>
        </div>
      </main>
    </div>
  );
}
