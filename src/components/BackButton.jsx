import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/BackButton.css";

/**
 * BackButton Component
 * Global back navigation component for all pages
 * 
 * Usage:
 * - Place at top of any page
 * - Automatically navigates to previous route
 * - Consistent styling across all pages
 */
export default function BackButton({ 
  to = null, 
  label = "Back", 
  className = "",
  showIcon = true,
  variant = "default"
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button 
      className={`back-btn ${variant} ${className}`}
      onClick={handleBack}
      aria-label={label}
      title={label}
    >
      {showIcon && <ArrowLeft size={18} />}
      <span className="back-btn-text">{label}</span>
    </button>
  );
}
