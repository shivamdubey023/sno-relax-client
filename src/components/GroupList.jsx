// src/components/GroupList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * API base for community features
 * NOTE:
 * Kept local for backward compatibility.
 * Newer components use API_ENDPOINTS from config.
 */
const API =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/community";

/**
 * GroupList (Legacy / Simple)
 * ---------------------------
 * Displays community groups and allows join/leave.
 *
 * NOTE:
 * A newer GroupList implementation exists with:
 * - member count
 * - selection highlight
 * - nickname support
 *
 * This version is kept for compatibility and demo safety.
 */
export default function GroupList({ onSelectGroup }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ Anonymous fallback retained for demo users
  const userId = localStorage.getItem("userId") || "Guest123";

  useEffect(() => {
    loadGroups();
  }, []);

  /**
   * Load all groups from backend
   */
  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/groups`);

      // Support multiple backend response shapes
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : data.groups || data.data || [];

      setGroups(list);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Join a group
   */
  const handleJoin = async (groupId) => {
    try {
      await axios.post(`${API}/join/${groupId}`, { userId });
      loadGroups();
    } catch (err) {
      console.error("Failed to join group:", err);
    }
  };

  /**
   * Leave a group
   */
  const handleLeave = async (groupId) => {
    try {
      await axios.post(`${API}/leave/${groupId}`, { userId });
      loadGroups();
    } catch (err) {
      console.error("Failed to leave group:", err);
    }
  };

  if (loading) {
    return <div className="group-list">Loading groups...</div>;
  }

  return (
    <div className="group-list">
      {groups.map((g) => {
        // Safely determine membership
        const isMember = Array.isArray(g.members)
          ? g.members.some(
              (m) => m === userId || m?.userId === userId
            )
          : false;

        return (
          <div key={g.id || g._id} className="group-item">
            <h4 onClick={() => onSelectGroup && onSelectGroup(g)}>
              {g.name}
            </h4>

            <p>{g.description || "No description available"}</p>

            {isMember ? (
              <button
                onClick={() => handleLeave(g.id || g._id)}
                className="leave-btn"
              >
                Leave
              </button>
            ) : (
              <button
                onClick={() => handleJoin(g.id || g._id)}
                className="join-btn"
              >
                Join
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
