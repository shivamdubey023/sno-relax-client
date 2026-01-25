import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { API_BASE, SOCKET_URL } from "../../config/api.config";

/**
 * NoticeBoard Component
 * --------------------
 * Displays community-wide announcements.
 *
 * Data sources:
 * 1. REST API  -> loads existing announcements on mount
 * 2. Socket.IO -> receives new announcements in real time
 *
 * FUTURE ENHANCEMENTS:
 * - Pagination or lazy loading
 * - Admin-only creation UI
 * - Pin important announcements
 */
export default function NoticeBoard() {
  const [announcements, setAnnouncements] = useState([]);

  /**
   * Socket.IO connection
   * - Listens for newly created announcements
   * - Prepends them to the list for visibility
   */
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("announcementCreated", (announcement) => {
      setAnnouncements((prev) => [announcement, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /**
   * Initial load via REST API
   * - Fetches existing announcements
   * - Keeps socket updates separate
   *
   * NOTE:
   * REST load may resolve after socket event,
   * so backend should ideally avoid duplicates.
   */
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/community/announcements`,
          { withCredentials: true }
        );

        setAnnouncements(res.data?.announcements || []);
      } catch (err) {
        console.error("Failed to load announcements:", err);
      }
    };

    loadAnnouncements();
  }, []);

  return (
    <div>
      <h4>Notice Board</h4>

      {announcements.length === 0 && (
        <div style={{ color: "#666" }}>No announcements</div>
      )}

      {announcements.map((a) => (
        <div
          key={a._id}
          style={{
            padding: 12,
            borderRadius: 8,
            background: "#fff",
            marginBottom: 8,
          }}
        >
          <div style={{ fontWeight: 700 }}>{a.title}</div>
          <div style={{ color: "#444" }}>{a.description}</div>

          {a.location && (
            <div style={{ fontSize: 12, color: "#666" }}>
              📍 {a.location}
            </div>
          )}

          {a.dateTime && (
            <div style={{ fontSize: 12, color: "#666" }}>
              🗓️ {new Date(a.dateTime).toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
