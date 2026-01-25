// src/components/UserList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

/* --------------------------------------------------
   API CONFIG
   - Admin endpoint (can later be protected by roles)
   - Environment-based for deployment
-------------------------------------------------- */
const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api/admin";

export default function UserList({ onSelectUser }) {
  /* --------------------------------------------------
     STATE MANAGEMENT
  -------------------------------------------------- */
  const [users, setUsers] = useState([]);       // All users except self
  const [loading, setLoading] = useState(true); // Loading indicator
  const [error, setError] = useState(null);     // Error feedback

  /* --------------------------------------------------
     CURRENT USER
     - Used to exclude self from list
  -------------------------------------------------- */
  const userId = localStorage.getItem("sno_userId") || "Guest123";

  /* --------------------------------------------------
     FETCH USERS (ADMIN)
     Runs once on component mount
  -------------------------------------------------- */
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API}/users`);

      // Exclude current user from selectable list
      const filteredUsers = Array.isArray(res.data)
        ? res.data.filter((u) => u._id !== userId)
        : [];

      setUsers(filteredUsers);
    } catch (err) {
      console.error("❌ Failed to load users:", err);
      setError("Unable to load users list.");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------
     RENDER STATES
  -------------------------------------------------- */
  if (loading) {
    return <div className="user-list loading">Loading users...</div>;
  }

  if (error) {
    return <div className="user-list error">{error}</div>;
  }

  if (users.length === 0) {
    return (
      <div className="user-list empty">
        No other users available.
      </div>
    );
  }

  /* --------------------------------------------------
     USER LIST UI
  -------------------------------------------------- */
  return (
    <div className="user-list">
      {users.map((u) => (
        <div
          key={u._id}
          className="user-item"
          onClick={() => onSelectUser(u)}
          title="Click to start private chat"
        >
          {/* Prefer name, fallback to email */}
          {u.name || u.email}
        </div>
      ))}
    </div>
  );
}
