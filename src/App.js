import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

// Pages
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

/**
 * ✅ ProtectedRoute
 * - Restricts access to authenticated users only
 * - If user is not logged in, redirects to Login page
 */
const ProtectedRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

/**
 * ✅ AuthRedirect
 * - Prevents logged-in users from accessing Login page again
 */
const AuthRedirect = ({ isLoggedIn, children }) => {
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /**
   * ✅ Check authentication status on app load
   * - Token is stored in localStorage
   * - If token exists, user is considered logged in
   */
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  /**
   * ✅ Handle successful login
   * - Save token
   * - Update app state
   */
  const handleLogin = (token) => {
    localStorage.setItem("authToken", token);
    setIsLoggedIn(true);
  };

  /**
   * ✅ Handle logout
   * - Remove token
   * - Reset login state
   */
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}

          <Route
            path="/login"
            element={
              <AuthRedirect isLoggedIn={isLoggedIn}>
                <Login onLogin={handleLogin} />
              </AuthRedirect>
            }
          />

          {/* ================= PROTECTED ROUTES ================= */}

          <Route
            path="/"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Dashboard onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chatbot"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ChatbotPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mood-tracker"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <MoodTrackerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/therapist-notes"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <TherapistNotesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-guide"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <AIGuide />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/progress-report"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ProgressReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/community"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <CommunityPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/games"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <GamesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/help"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <HelpPage />
              </ProtectedRoute>
            }
          />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
