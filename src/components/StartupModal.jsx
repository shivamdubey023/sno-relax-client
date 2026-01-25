// src/components/StartupModal.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Modal.css";

/**
 * StartupModal
 * --------------------------------------------------
 * A reusable startup / announcement modal.
 *
 * Purpose:
 *  - Show important announcements (admin, system, updates)
 *  - Optionally guide user to a specific page (e.g. Reports)
 *
 * Props:
 *  - visible (boolean): controls modal visibility
 *  - content (string): HTML string rendered inside modal body
 *  - onClose (function): callback when modal is dismissed
 *
 * Important:
 *  - `content` uses dangerouslySetInnerHTML
 *  - ONLY trusted / sanitized HTML should be passed here
 *
 * Persistence Logic:
 *  - Uses localStorage to remember dismissed version
 *  - Allows future version-based announcements
 *
 * Navigation:
 *  - Redirects user to `/reports` when CTA is clicked
 *
 * Future Enhancements (non-breaking):
 *  - Add secondary CTA routing
 *  - Add icon / severity type (info, warning, critical)
 *  - Add auto-dismiss timer
 */
export default function StartupModal({ visible, content, onClose }) {
  const navigate = useNavigate();

  // Do not render anything if modal is not visible
  if (!visible) return null;

  /**
   * Handle CTA button click
   * --------------------------------------------------
   * - Saves dismissed version in localStorage
   * - Closes modal
   * - Navigates to Reports page
   */
  const handleCTA = () => {
    try {
      // Store dismissed version to prevent re-showing same popup
      const version =
        localStorage.getItem("admin_popup_version") || "1";
      localStorage.setItem(
        "admin_popup_dismissed_version",
        version
      );
    } catch (e) {
      // Ignore storage errors (private mode, blocked storage)
    }

    // Close modal if callback provided
    if (onClose) onClose();

    // Navigate user to Reports page
    navigate("/reports");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card startup-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">Announcement</div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close popup"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          className="modal-body"
          /*
            SECURITY NOTE:
            - content must be sanitized before passing
            - safe for admin-controlled announcements
          */
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Dismiss
          </button>

          <button
            className="btn btn-primary"
            onClick={handleCTA}
          >
            Open Reports
          </button>
        </div>
      </div>
    </div>
  );
}
