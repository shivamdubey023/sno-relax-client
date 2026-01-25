import React, { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../config/api.config";

/**
 * GroupList Component
 * ------------------
 * Displays a list of community groups and allows:
 * - Selecting a group
 * - Joining a group (if not already a member)
 *
 * Props:
 * - onSelect(group): callback when a group is selected
 * - selected: currently selected group object
 * - onJoin(group): callback when user joins a group
 *
 * FUTURE:
 * - Accept userId as a prop instead of localStorage
 * - Add search / filter / pagination
 */
export default function GroupList({ onSelect, selected, onJoin }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Tracks groups the user is already a member of.
   * Using Set for O(1) lookup.
   */
  const [userGroups, setUserGroups] = useState(new Set());

  /**
   * TEMPORARY:
   * userId is read from localStorage.
   * FUTURE:
   * - Should come from auth context or App.js
   */
  const userId = localStorage.getItem("userId") || "guest";

  /**
   * Load all groups from backend
   */
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);

        const res = await fetch(API_ENDPOINTS.COMMUNITY.GET_GROUPS, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch groups");

        const data = await res.json();
        const groupsArray = Array.isArray(data) ? data : data.groups || [];

        setGroups(groupsArray);

        /**
         * Determine which groups the user is already part of.
         * Expected backend shape:
         * group.members = [{ userId: string, nickname?: string }]
         */
        const memberGroups = new Set(
          groupsArray
            .filter(
              (g) =>
                Array.isArray(g.members) &&
                g.members.some((m) => String(m.userId) === String(userId))
            )
            .map((g) => g._id)
        );

        setUserGroups(memberGroups);
        setError(null);
      } catch (err) {
        console.error("Error loading groups:", err);
        setError("Failed to load groups");
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [userId]);

  /**
   * Join a group
   * - Stops click propagation to avoid auto-select
   * - Updates local state optimistically
   */
  const handleJoin = async (groupId, e) => {
    e.stopPropagation();

    try {
      const nickname =
        localStorage.getItem("communityNickname") || "Anonymous";

      const res = await fetch(API_ENDPOINTS.COMMUNITY.JOIN_GROUP(groupId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, nickname }),
      });

      if (!res.ok) throw new Error("Failed to join group");

      const updatedGroup = await res.json();
      const groupData = updatedGroup.group || updatedGroup;

      // Update group list with latest data
      setGroups((prev) =>
        prev.map((g) => (g._id === groupId ? groupData : g))
      );

      // Update membership Set safely
      setUserGroups((prev) => new Set([...prev, groupId]));

      if (onJoin) onJoin(groupData);
    } catch (err) {
      console.error("Error joining group:", err);
      alert(`Failed to join group: ${err.message}`); // FUTURE: replace with toast
    }
  };

  /* ------------------ UI STATES ------------------ */

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Loading groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "red", textAlign: "center" }}>
        <p>{error}</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
        <p>No groups available</p>
      </div>
    );
  }

  /* ------------------ GROUP LIST ------------------ */

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {groups.map((g) => {
        const isMember = userGroups.has(g._id);

        return (
          <div
            key={g._id}
            onClick={() => onSelect(g)}
            style={{
              padding: 12,
              borderRadius: 8,
              cursor: "pointer",
              background:
                selected?._id === g._id ? "#e8f4f8" : "#f9f9f9",
              border:
                selected?._id === g._id
                  ? "2px solid #4a90e2"
                  : "1px solid #ddd",
              transition: "all 0.2s ease",
            }}
            className="group-list-item"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14 }}>{g.name}</strong>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  {g.description || "No description"}
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
                  👥 {g.memberCount || g.members?.length || 0} members
                </div>
              </div>

              {!isMember && (
                <button
                  onClick={(e) => handleJoin(g._id, e)}
                  style={{
                    padding: "6px 12px",
                    background: "#4a90e2",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 12,
                    marginLeft: 10,
                  }}
                >
                  Join
                </button>
              )}

              {isMember && (
                <span
                  style={{
                    padding: "6px 12px",
                    background: "#e8f4f8",
                    color: "#4a90e2",
                    borderRadius: 4,
                    fontSize: 12,
                    marginLeft: 10,
                    fontWeight: "bold",
                  }}
                >
                  ✓ Member
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
