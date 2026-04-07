import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import MoodTracker from "../components/MoodTracker";
import BackButton from "../components/BackButton";
import "../styles/MoodTrackerPage.css";

const MoodTrackerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mood-tracker-page">
      <header className="mood-header">
        <BackButton variant="ghost" />
        <div className="mood-header-content">
          <h1><BookOpen size={24} /> Mood Tracker</h1>
          <p className="subtitle">
            Track your emotions and visualize your weekly & monthly mood trends.
          </p>
        </div>
      </header>

      <MoodTracker />
    </div>
  );
};

export default MoodTrackerPage;
