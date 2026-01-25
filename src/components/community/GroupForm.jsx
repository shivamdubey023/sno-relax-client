import React, { useState } from "react";
import { API_ENDPOINTS } from "../../config/api.config";

/**
 * GroupForm Component
 * ------------------
 * Responsible for creating a new community group.
 *
 * Props:
 * - userId: ID of the currently logged-in user
 * - onGroupCreated(group): callback when group is successfully created
 * - onCancel(): callback when user cancels creation
 *
 * FUTURE ENHANCEMENTS:
 * - Add server-side validation feedback
 * - Add group privacy (public/private)
 * - Add category/tags
 */
export default function GroupForm({ userId, onGroupCreated, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Keep this as number to avoid type issues later
  const [maxMembers, setMaxMembers] = useState(50);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle form submission
   * - Validates input
   * - Sends create-group request
   * - Notifies parent on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validations (client-side)
    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    if (name.length < 3 || name.length > 50) {
      setError("Group name must be 3–50 characters");
      return;
    }

    if (maxMembers < 2 || maxMembers > 100) {
      setError("Max members must be between 2 and 100");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(API_ENDPOINTS.COMMUNITY.CREATE_GROUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || "",
          createdBy: userId, // important for ownership & moderation
          maxMembers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to create group");
      }

      const newGroup = await res.json();

      // Reset form after successful creation
      setName("");
      setDescription("");
      setMaxMembers(50);

      if (onGroupCreated) onGroupCreated(newGroup);
    } catch (err) {
      console.error("Error creating group:", err);
      setError(err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#f9f9f9",
        padding: 16,
        borderRadius: 8,
        border: "1px solid #ddd",
        marginBottom: 16,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>
        Create New Group
      </h3>

      {error && (
        <div
          style={{
            padding: 10,
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

      <form onSubmit={handleSubmit}>
        {/* Group Name */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
            Group Name *
          </label>
          <input
            type="text"
            value={name}
            required
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name (3–50 characters)"
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1px solid #ddd",
              borderRadius: 4,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
          <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
            {name.length}/50
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this group is about"
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1px solid #ddd",
              borderRadius: 4,
              fontSize: 13,
              boxSizing: "border-box",
              minHeight: 60,
              resize: "vertical",
            }}
          />
        </div>

        {/* Max Members */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
            Max Members
          </label>
          <input
            type="number"
            value={maxMembers}
            min={2}
            max={100}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1px solid #ddd",
              borderRadius: 4,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "8px 16px",
              background: "#f0f0f0",
              color: "#333",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 13,
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "8px 16px",
              background: loading ? "#ccc" : "#4a90e2",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  );
}
