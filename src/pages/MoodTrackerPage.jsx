import React from "react";
import { useNavigate } from "react-router-dom";
import MoodTracker from "../components/MoodTracker";
import "../styles/MoodTrackerPage.css";

const MoodTrackerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mood-tracker-page">
      <header className="mood-header">
        <h1>📊 Mood Tracker</h1>
        <p className="subtitle">
          Track your emotions and visualize your weekly & monthly mood trends.
        </p>
      </header>

      <MoodTracker />

      <button onClick={() => navigate("/dashboard")} className="btn back-btn">
        ⬅ Back to Dashboard
      </button>
    </div>
  );
};

export default MoodTrackerPage;
