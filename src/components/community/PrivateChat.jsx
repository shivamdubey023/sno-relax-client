import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { API_BASE, SOCKET_URL } from "../../config/api.config";

/**
 * PrivateChat Component
 * --------------------
 * Handles 1-to-1 private messaging between two users.
 *
 * Data sources:
 * - REST API  -> initial load + polling fallback
 * - Socket.IO -> real-time messaging
 *
 * Props:
 * - me: current user ID
 * - otherUserId: chat partner ID
 *
 * FUTURE:
 * - Message read receipts
 * - Typing indicators
 * - End-to-end encryption
 */
export default function PrivateChat({ otherUserId, me }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const socketRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Controls scroll container height dynamically
  const [messagesMaxHeight, setMessagesMaxHeight] = useState("auto");

  /**
   * Load messages + setup socket
   */
  useEffect(() => {
    if (!otherUserId || !me) return;

    const loadInitialMessages = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/community/private/${otherUserId}/messages`,
          { params: { me }, withCredentials: true }
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load private messages:", err);
      }
    };

    loadInitialMessages();

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    // Identify current user for private routing
    socket.emit("identify", me);

    socket.on("receivePrivateMessage", (msg) => {
      // Only accept messages relevant to this conversation
      const isRelevant =
        (String(msg.senderId) === String(otherUserId) &&
          String(msg.receiverId) === String(me)) ||
        (String(msg.senderId) === String(me) &&
          String(msg.receiverId) === String(otherUserId));

      if (isRelevant) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [otherUserId, me]);

  /**
   * Polling fallback (1s)
   * WHY:
   * - Ensures sync if socket drops
   * - Works on unstable networks
   *
   * NOTE:
   * - Potential duplicate risk if backend does not deduplicate
   */
  useEffect(() => {
    if (!otherUserId || !me) return;

    let mounted = true;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/community/private/${otherUserId}/messages`,
          { params: { me }, withCredentials: true }
        );
        if (mounted) setMessages(res.data.messages || []);
      } catch {
        // ignore polling errors
      }
    };

    const id = setInterval(() => {
      const active = document.activeElement;
      if (inputRef.current && active && inputRef.current.contains(active)) return;
      fetchMessages();
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [otherUserId, me]);

  /**
   * Auto-scroll on new messages
   */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Dynamically adjust message area height
   * - Prevents keyboard/input overlap
   * - Handles window resize
   */
  useEffect(() => {
    const updateHeight = () => {
      try {
        const inputH = inputRef.current?.offsetHeight || 0;
        const available = window.innerHeight - inputH - 16;
        setMessagesMaxHeight(available > 160 ? `${available}px` : "160px");
      } catch {
        setMessagesMaxHeight("auto");
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  /**
   * Send private message
   * - Optimistic UI update
   * - Socket emit + REST persistence
   */
  const send = async () => {
    if (!text.trim()) return;

    const payload = {
      senderId: me,
      receiverId: otherUserId,
      message: text.trim(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, payload]);
    setText("");

    try {
      socketRef.current?.emit("sendPrivateMessage", payload);
      await axios.post(
        `${API_BASE}/api/community/private/message`,
        payload,
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to send private message:", err);
      // FUTURE: rollback optimistic update / show error toast
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          overflowY: "auto",
          padding: 12,
          maxHeight: messagesMaxHeight,
        }}
      >
        {messages.map((m, i) => {
          const isMe = String(m.senderId) === String(me);

          return (
            <div key={m._id || i} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>
                {isMe ? "You" : "Other"}
              </div>
              <div
                style={{
                  background: "#fff",
                  padding: 8,
                  borderRadius: 8,
                  display: "inline-block",
                }}
              >
                {m.message || m.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div
        style={{ padding: 8, borderTop: "1px solid #eee" }}
        ref={inputRef}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a private message"
            style={{ flex: 1, padding: 8 }}
          />
          <button onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
