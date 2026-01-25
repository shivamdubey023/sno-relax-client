import React, { useEffect, useState } from "react";

/**
 * CommunityPolicyPopup
 * --------------------
 * Displays community guidelines and safety policy.
 *
 * Use cases:
 * - First-time community access
 * - Re-confirmation after policy updates
 * - Legal / moderation compliance
 *
 * Props:
 * - onConfirm(): callback when user agrees to policy
 * - defaultOpen (optional): control initial visibility
 *
 * FUTURE:
 * - Can be controlled externally via props (e.g. backend flag)
 * - Can persist acceptance in localStorage or database
 */
export default function CommunityPolicyPopup({
  onConfirm,
  defaultOpen = true,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  /**
   * Handle user confirmation
   * - Closes popup
   * - Notifies parent component
   */
  const handleConfirm = () => {
    setIsOpen(false);
    if (onConfirm) onConfirm();
  };

  /**
   * Accessibility improvement:
   * - Allow closing modal using ESC key
   *
   * FUTURE:
   * - Could be extended to focus trapping
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  /* ---------------- Reusable styles ---------------- */

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    background: "white",
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
  };

  return (
    <div style={overlayStyle}>
      <div
        style={modalStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="community-policy-title"
      >
        <h2
          id="community-policy-title"
          style={{ marginTop: 0, marginBottom: 16, fontSize: 20, color: "#333" }}
        >
          ⚠️ Community Guidelines & Safety Policy
        </h2>

        <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8, marginBottom: 20 }}>
          <p>
            Welcome to our community groups! To maintain a safe and respectful
            space for everyone, please follow these guidelines:
          </p>

          <h3 style={{ marginTop: 16, marginBottom: 8, color: "#4a90e2", fontSize: 14 }}>
            ✓ DO:
          </h3>
          <ul style={{ paddingLeft: 20 }}>
            <li>Be respectful and kind to other members</li>
            <li>Support and encourage fellow community members</li>
            <li>Share positive experiences and constructive feedback</li>
            <li>Respect everyone's privacy and anonymity</li>
            <li>Report any violations to our moderation team</li>
          </ul>

          <h3 style={{ marginTop: 16, marginBottom: 8, color: "#f44336", fontSize: 14 }}>
            ✗ DON'T:
          </h3>
          <ul style={{ paddingLeft: 20 }}>
            <li><strong>Use abusive, offensive, or vulgar language</strong></li>
            <li><strong>Harass, bully, or discriminate</strong> against others</li>
            <li><strong>Share false or misleading information</strong></li>
            <li><strong>Post spam or promotional content</strong></li>
            <li><strong>Share personal information</strong> of others</li>
            <li><strong>Send inappropriate or sexual content</strong></li>
            <li><strong>Impersonate</strong> other individuals</li>
          </ul>

          <h3 style={{ marginTop: 16, marginBottom: 8, color: "#ff9800", fontSize: 14 }}>
            ⚡ Consequences:
          </h3>
          <ul style={{ paddingLeft: 20 }}>
            <li>Message deletion</li>
            <li>Temporary or permanent group ban</li>
            <li>Account suspension</li>
          </ul>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#e8f5e9",
              borderRadius: 8,
              borderLeft: "4px solid #4caf50",
            }}
          >
            <p style={{ margin: 0, fontSize: 12 }}>
              <strong>Remember:</strong> Everyone deserves a safe, supportive
              space. Help us keep this community positive. 💚
            </p>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "#4a90e2",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          I Understand & Agree
        </button>

        <p
          style={{
            marginTop: 12,
            fontSize: 11,
            color: "#999",
            textAlign: "center",
          }}
        >
          By clicking "I Understand & Agree", you commit to following these
          guidelines.
        </p>
      </div>
    </div>
  );
}
