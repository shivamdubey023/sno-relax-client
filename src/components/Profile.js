import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api.config";

/**
 * Profile Component
 * -----------------
 * Responsibilities:
 * - Display basic account information (read-only)
 * - Manage community nickname (anonymous identity)
 * - Validate nickname input for safety & consistency
 * - Sync nickname changes with backend APIs
 *
 * IMPORTANT NOTE (Future Enhancement):
 * - This component uses `userId` from localStorage.
 * - Some other modules use `sno_userId`.
 * - This should be unified later using a global AuthContext.
 */

export default function Profile() {
  /* ---------------------------------------
     USER CONTEXT (from localStorage)
  ---------------------------------------- */
  const userId = localStorage.getItem("userId") || "guest";
  const userName = localStorage.getItem("userName") || "User";

  /* ---------------------------------------
     STATE MANAGEMENT
  ---------------------------------------- */
  const [nickname, setNickname] = useState("Anonymous");
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* ---------------------------------------
     FETCH CURRENT COMMUNITY NICKNAME
     - Runs once when userId is available
  ---------------------------------------- */
  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const res = await fetch(
          API_ENDPOINTS.COMMUNITY.GET_NICKNAME(userId),
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (res.ok) {
          const data = await res.json();
          const nick = data.nickname || "Anonymous";
          setNickname(nick);
          setNewNickname(nick);
        }
      } catch (err) {
        console.error("Error fetching nickname:", err);
        // Non-blocking: user can still set nickname manually
      }
    };

    if (userId !== "guest") {
      fetchNickname();
    }
  }, [userId]);

  /* ---------------------------------------
     NICKNAME VALIDATION RULES
     - 3–20 characters
     - Letters, numbers, spaces
     - Emojis allowed (Unicode-safe)
  ---------------------------------------- */
  const validateNickname = (nick) => {
    if (!nick.trim()) {
      setError("Nickname cannot be empty");
      return false;
    }
    if (nick.length < 3) {
      setError("Nickname must be at least 3 characters");
      return false;
    }
    if (nick.length > 20) {
      setError("Nickname must be at most 20 characters");
      return false;
    }

    // Unicode regex to allow emojis safely
    if (!/^[a-zA-Z0-9\s\u{1F300}-\u{1F9FF}]+$/u.test(nick)) {
      setError(
        "Nickname can only contain letters, numbers, spaces, and emojis"
      );
      return false;
    }
    return true;
  };

  /* ---------------------------------------
     SAVE UPDATED NICKNAME
  ---------------------------------------- */
  const handleSaveNickname = async () => {
    setError(null);
    setSuccess(null);

    if (!validateNickname(newNickname)) return;

    try {
      setLoading(true);

      const res = await fetch(
        API_ENDPOINTS.COMMUNITY.UPDATE_NICKNAME(userId),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ nickname: newNickname.trim() }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update nickname");
      }

      const data = await res.json();
      setNickname(data.nickname);
      setEditingNickname(false);
      setSuccess("Nickname updated successfully!");

      // Auto-clear success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating nickname:", err);
      setError(err.message || "Failed to update nickname");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------
     CANCEL EDIT MODE
  ---------------------------------------- */
  const handleCancel = () => {
    setEditingNickname(false);
    setNewNickname(nickname);
    setError(null);
  };

  /* ---------------------------------------
     RESET NICKNAME TO DEFAULT
  ---------------------------------------- */
  const handleRemoveNickname = async () => {
    if (!confirm("Reset nickname to 'Anonymous'?")) return;

    try {
      setLoading(true);

      const res = await fetch(
        API_ENDPOINTS.COMMUNITY.UPDATE_NICKNAME(userId),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ nickname: "Anonymous" }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset nickname");
      }

      const data = await res.json();
      setNickname(data.nickname);
      setNewNickname(data.nickname);
      setSuccess("Nickname reset to Anonymous");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error resetting nickname:", err);
      setError(err.message || "Failed to reset nickname");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------
     UI RENDER
  ---------------------------------------- */
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: 24,
        background: "#f9f9f9",
        borderRadius: 12,
      }}
    >
      <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: "bold" }}>
        Profile Settings
      </h2>

      {/* ================= ACCOUNT INFO ================= */}
      <div
        style={{
          background: "white",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>
          Account Information
        </h3>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#666" }}>User ID</label>
          <div
            style={{
              padding: 10,
              background: "#f5f5f5",
              borderRadius: 4,
              fontFamily: "monospace",
              fontSize: 13,
            }}
          >
            {userId}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, color: "#666" }}>Name</label>
          <div
            style={{
              padding: 10,
              background: "#f5f5f5",
              borderRadius: 4,
              fontSize: 13,
            }}
          >
            {userName}
          </div>
        </div>
      </div>

      {/* ================= COMMUNITY NICKNAME ================= */}
      <div
        style={{
          background: "white",
          padding: 16,
          borderRadius: 8,
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>
          Community Nickname (Anonymous)
        </h3>

        <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
          Your nickname is visible in community groups and helps maintain
          privacy while enabling conversations.
        </p>

        {error && (
          <div
            style={{
              padding: 12,
              background: "#ffebee",
              color: "#c62828",
              borderRadius: 4,
              marginBottom: 12,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 12,
              background: "#e8f5e9",
              color: "#2e7d32",
              borderRadius: 4,
              marginBottom: 12,
              fontSize: 13,
            }}
          >
            ✓ {success}
          </div>
        )}

        {!editingNickname ? (
          <>
            <div
              style={{
                padding: 12,
                background: "#e8f4f8",
                borderRadius: 4,
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 12, color: "#666" }}>
                Current Nickname
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#4a90e2",
                }}
              >
                {nickname}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setEditingNickname(true);
                  setNewNickname(nickname);
                }}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "#4a90e2",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                Edit Nickname
              </button>

              <button
                onClick={handleRemoveNickname}
                disabled={loading || nickname === "Anonymous"}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background:
                    nickname === "Anonymous" ? "#ccc" : "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor:
                    nickname === "Anonymous"
                      ? "not-allowed"
                      : "pointer",
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                Reset to Anonymous
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              value={newNickname}
              onChange={(e) => {
                setNewNickname(e.target.value);
                setError(null);
              }}
              maxLength={20}
              disabled={loading}
              placeholder="Enter community nickname"
              style={{
                width: "100%",
                padding: "10px 12px",
                marginBottom: 8,
                border: "1px solid #ddd",
                borderRadius: 4,
              }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleCancel}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: 4,
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSaveNickname}
                disabled={loading || !newNickname.trim()}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background:
                    loading || !newNickname.trim()
                      ? "#ccc"
                      : "#4a90e2",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                }}
              >
                {loading ? "Saving..." : "Save Nickname"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
