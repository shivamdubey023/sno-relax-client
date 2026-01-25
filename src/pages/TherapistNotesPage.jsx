import React from "react";
import { useNavigate } from "react-router-dom";
import TherapistNotes from "../components/TherapistNotes";
import "../styles/therapistNotes.css"; // normal CSS import

export default function TherapistNotesPage() {
  const navigate = useNavigate();

  return (
    <div className="therapist-notes-page">
      <h1>📝 Therapist Notes</h1>

      <div className="therapist-notes-wrapper">
        <TherapistNotes />
      </div>
    </div>
  );
}
