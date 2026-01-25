import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login"); // "login" or "register"
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setLatitude(latitude);
            setLongitude(longitude);

            const detectedCity = await fetchCityFromCoords(latitude, longitude);
            setCity(detectedCity);
          },
          () => setErrorMessage("Please allow location to continue.")
        );
      } else {
        setErrorMessage("Geolocation not supported by your browser.");
      }
    };

    getLocation();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!email || !phone) {
      setErrorMessage("Please enter email and phone number.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, phone }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Save user info
      localStorage.setItem("sno_userId", data.user.userId);
      localStorage.setItem("sno_firstName", data.user.firstName);
      localStorage.setItem("sno_lastName", data.user.lastName);
      localStorage.setItem("sno_email", data.user.email);
      localStorage.setItem("sno_phone", data.user.phone);
      localStorage.setItem("sno_city", data.user.city);
      localStorage.setItem("sno_lat", data.user.latitude);
      localStorage.setItem("sno_lon", data.user.longitude);

      // Mark as logged in
      const token = data.token || "logged-in";
      localStorage.setItem("authToken", token);
      if (onLogin) onLogin(token);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!firstName || !lastName || !email || !phone) {
      setErrorMessage("Please fill all required fields.");
      setLoading(false);
      return;
    }

    if (!city || !latitude || !longitude) {
      setErrorMessage("Waiting for location. Please allow location access.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE || "http://localhost:5000"}/api/auth/create-user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            city,
            latitude,
            longitude,
          }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Save user info
      localStorage.setItem("sno_userId", data.userId);
      localStorage.setItem("sno_firstName", firstName.trim());
      localStorage.setItem("sno_lastName", lastName.trim());
      localStorage.setItem("sno_email", email.trim());
      localStorage.setItem("sno_phone", phone.trim());
      localStorage.setItem("sno_city", city);
      localStorage.setItem("sno_lat", latitude);
      localStorage.setItem("sno_lon", longitude);

      // Mark as logged in
      const token = data.token || "logged-in";
      localStorage.setItem("authToken", token);
      if (onLogin) onLogin(token);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="site-title">🌙 SnoRelax</h1>
        <p className="city-info">📍 Your City: {city || "Detecting..."}</p>
        <p className="subtitle">Take a deep breath, let’s get you started 🌱</p>

        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
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
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {activeTab === "register" && (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading || !city || !latitude || !longitude}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {errorMessage && (
          <p className="error-message">⚠️ {errorMessage}</p>
        )}
      </div>
    </div>
  );
}
