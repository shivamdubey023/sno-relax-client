// src/components/GroupChat.jsx
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL, API_ENDPOINTS } from "../config/api.config";

/**
 * GroupChat Component
 * -------------------
 * Handles real-time group messaging using:
 * - Socket.IO (live messages)
 * - REST API (initial message load / fallback)
 *
 * NOTE:
 * This version is kept for compatibility & future refactors.
 * A newer GroupChat implementation exists with richer features.
 */
export default function GroupChat({ group }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ⚠️ Keep anonymous fallback for demo / guest users
  const userId = localStorage.getItem("userId") || "Guest123";

  const socketRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const [messagesMaxHeight, setMessagesMaxHeight] = useState("auto");

  /* ---------------- INITIAL LOAD + SOCKET SETUP ---------------- */
  useEffect(() => {
    if (!group?.id) return;

    // Create isolated socket per component instance
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socketRef.current = socket;

    // Join group room
    socket.emit("joinGroup", group.id);

    // Listen for incoming messages
    socket.on("newMessage", (msg) => {
      // Prevent duplicate messages from optimistic UI
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    });

    // Load existing messages via REST (fallback / initial)
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          API_ENDPOINTS.COMMUNITY.GET_GROUP_MESSAGES(group.id),
          { credentials: "include" }
        );
        if (!mounted || !res.ok) return;

        const data = await res.json();
        setMessages(data.messages || data || []);
      } catch (e) {
        console.warn("Failed to load group messages:", e);
      }
    })();

    return () => {
      mounted = false;
      socket.emit("leaveGroup", group.id);
      socket.disconnect();
    };
  }, [group?.id]);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = () => {
    if (!text.trim() || !socketRef.current) return;

    const message = {
      _id: `temp_${Date.now()}`, // temp ID for UI
      userId,
      text: text.trim(),
      groupId: group.id,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, message]);
    setText("");

    socketRef.current.emit("sendMessage", {
      groupId: group.id,
      message,
    });
  };

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- RESPONSIVE HEIGHT ---------------- */
  useEffect(() => {
    const updateHeight = () => {
      try {
        const inputH = inputRef.current?.offsetHeight || 0;
        const newH = window.innerHeight - inputH - 16;
        setMessagesMaxHeight(newH > 160 ? `${newH}px` : "160px");
      } catch {
        setMessagesMaxHeight("auto");
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div className="chat-window">
      <div
        className="messages"
        style={{ maxHeight: messagesMaxHeight, overflowY: "auto" }}
      >
        {messages.map((m, idx) => {
          const isSelf = m.userId === userId;
          return (
            <div
              key={m._id || idx}
              className={`chat-bubble ${isSelf ? "self" : "other"}`}
            >
              {!isSelf && <span className="sender">{m.userId}</span>}
              <p>{m.text}</p>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="chat-input" ref={inputRef}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
