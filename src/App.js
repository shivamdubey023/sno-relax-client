import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChatbotPage from "./pages/ChatbotPage";
import Profile from "./pages/Profile";
import MoodTrackerPage from "./pages/MoodTrackerPage";
import TherapistNotesPage from "./pages/TherapistNotesPage";
import AIGuide from "./pages/AIGuide";
import CommunityPage from "./pages/CommunityPage";
import Reports from "./pages/Reports";
import ProgressReport from "./pages/ProgressReport";
import Settings from "./pages/Settings";
import HelpPage from "./pages/Help";
import GamesPage from "./pages/GamesPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Check login state on app load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsLoggedIn(true);
  }, []);

  // ✅ Handle login
  const handleLogin = (token) => {
    localStorage.setItem("authToken", token);
    setIsLoggedIn(true);
  };

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Default page is Dashboard */}
          <Route
            path="/"
            element={<Dashboard isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
          />

          {/* Login page */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Protected routes */}
          <Route
            path="/chatbot"
            element={isLoggedIn ? <ChatbotPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/mood-tracker"
            element={isLoggedIn ? <MoodTrackerPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/therapist-notes"
            element={isLoggedIn ? <TherapistNotesPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/ai-guide"
            element={isLoggedIn ? <AIGuide /> : <Navigate to="/login" />}
          />
          <Route
            path="/reports"
            element={isLoggedIn ? <Reports /> : <Navigate to="/login" />}
          />
          <Route
            path="/progress-report"
            element={isLoggedIn ? <ProgressReport /> : <Navigate to="/login" />}
          />
          <Route
            path="/community"
            element={isLoggedIn ? <CommunityPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/games"
            element={isLoggedIn ? <GamesPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={isLoggedIn ? <Settings /> : <Navigate to="/login" />}
          />
          <Route
            path="/help"
            element={isLoggedIn ? <HelpPage /> : <Navigate to="/login" />}
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
