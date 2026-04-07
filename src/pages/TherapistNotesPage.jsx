import React from "react";
import BackButton from "../components/BackButton";
import TherapistNotes from "../components/TherapistNotes";
import "../styles/therapistNotes.css";

export default function TherapistNotesPage() {
  return (
    <div className="therapist-notes-page">
      <div className="therapist-notes-header">
        <BackButton to="/" variant="ghost" label="Dashboard" className="tn-back-btn" />
        <h1>Therapist Notes</h1>
      </div>

      <div className="therapist-notes-wrapper">
        <TherapistNotes />
      </div>
    </div>
  );
}
