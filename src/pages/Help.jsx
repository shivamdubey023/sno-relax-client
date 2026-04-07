import React from "react";
import BackButton from "../components/BackButton";
import Help from "../components/Help";
import "../styles/Help.css";

export default function HelpPage() {
  return (
    <div className="help-page">
      <div className="help-header">
        <BackButton to="/" variant="ghost" label="Dashboard" className="help-back-btn" />
        <h1>Help & Support</h1>
      </div>
      <Help />
    </div>
  );
}
