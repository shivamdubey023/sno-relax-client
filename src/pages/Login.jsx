import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { API_BASE, STORAGE_KEYS } from "../constants";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("loading");

  useEffect(() => {
    const fetchCityFromCoords = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await res.json();
        return (
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "Unknown"
        );
      } catch {
        return "Unknown";
      }
    };

    const getLocation = () => {
      if (!navigator.geolocation) {
        setLocationStatus("unsupported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          const detectedCity = await fetchCityFromCoords(latitude, longitude);
          setCity(detectedCity);
          setLocationStatus("ready");
        },
        () => {
          setLocationStatus("denied");
        },
        { timeout: 10000, maximumAge: 300000 }
      );
    };

    getLocation();
  }, []);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[\d\s\-+()]{10,}$/.test(phone.replace(/\s/g, ""));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !phone) {
      setErrorMessage("Please enter email and phone number.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Login failed");
        return;
      }

      localStorage.setItem(STORAGE_KEYS.USER_ID, data.user.userId);
      localStorage.setItem(STORAGE_KEYS.FIRST_NAME, data.user.firstName);
      localStorage.setItem(STORAGE_KEYS.LAST_NAME, data.user.lastName);
      localStorage.setItem(STORAGE_KEYS.EMAIL, data.user.email);
      localStorage.setItem(STORAGE_KEYS.PHONE, data.user.phone);
      localStorage.setItem(STORAGE_KEYS.CITY, data.user.city);
      localStorage.setItem(STORAGE_KEYS.LATITUDE, data.user.latitude);
      localStorage.setItem(STORAGE_KEYS.LONGITUDE, data.user.longitude);

      const token = data.token || "logged-in";
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      if (onLogin) onLogin(token);

      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!firstName || !lastName || !email || !phone) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage("Please enter a valid phone number (10+ digits).");
      return;
    }

    if (locationStatus !== "ready") {
      setErrorMessage("Waiting for location. Please allow location access.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city,
          latitude,
          longitude,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Registration failed");
        return;
      }

      localStorage.setItem(STORAGE_KEYS.USER_ID, data.userId);
      localStorage.setItem(STORAGE_KEYS.FIRST_NAME, firstName.trim());
      localStorage.setItem(STORAGE_KEYS.LAST_NAME, lastName.trim());
      localStorage.setItem(STORAGE_KEYS.EMAIL, email.trim());
      localStorage.setItem(STORAGE_KEYS.PHONE, phone.trim());
      localStorage.setItem(STORAGE_KEYS.CITY, city);
      localStorage.setItem(STORAGE_KEYS.LATITUDE, latitude);
      localStorage.setItem(STORAGE_KEYS.LONGITUDE, longitude);

      const token = data.token || "logged-in";
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      if (onLogin) onLogin(token);

      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="site-title">SnoRelax</h1>
        <p className="city-info">
          {locationStatus === "loading"
            ? "Detecting location..."
            : locationStatus === "denied"
            ? "Location unavailable"
            : `Location: ${city}`}
        </p>
        <p className="subtitle">Your mental wellness companion</p>

        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Sign In
          </button>
          <button
            className={`tab-button ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        {activeTab === "login" && (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : "Sign In"}
            </button>
          </form>
        )}

        {activeTab === "register" && (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || locationStatus !== "ready"}
            >
              {loading ? <span className="loading-spinner" /> : "Create Account"}
            </button>
          </form>
        )}

        {errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
