import React, { useEffect, useRef, useState, useCallback } from "react";
import { API_ENDPOINTS, SOCKET_URL } from "../../config/api.config";
import { io } from "socket.io-client";

/**
 * GroupChat Component
 * -------------------
 * Handles group messaging with:
 * - Initial REST-based message loading
 * - Real-time updates via Socket.IO
 * - Typing indicators
 * - Optimistic UI updates
 *
 * Props:
 * - group: active group object
 * - userId: current user ID
 * - userNickname: display name (defaults to Anonymous)
 */
export default function GroupChat({ group, userId, userNickname = "Anonymous" }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /**
   * Load messages from backend (REST API)
   * FUTURE:
   * - Pagination
   * - Server-side cursors
   */
  const loadMessages = useCallback(async () => {
    if (!group) return;

    try {
      setLoading(true);
      const res = await fetch(
        API_ENDPOINTS.COMMUNITY.GET_GROUP_MESSAGES(group._id),
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to load messages");

      const data = await res.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [group]);

  /* -------- Initial message load -------- */
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  /* -------- Socket.IO setup -------- */
  useEffect(() => {
    if (!group) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    socket.emit("joinGroup", group._id);

    // Desktop notification permission (one-time)
    if (
      typeof window !== "undefined" &&
      window.Notification &&
      Notification.permission === "default"
    ) {
      try {
        Notification.requestPermission();
      } catch {
        /* ignore */
      }
    }

    socket.on("receiveGroupMessage", (message) => {
      if (String(message.groupId) === String(group._id)) {
        setMessages((prev) => [...prev, message]);

        // Notify for messages from others
        try {
          const isFromMe = String(message.senderId) === String(userId);
          if (!isFromMe && Notification.permission === "granted") {
            const n = new Notification(
              `${group.name} — ${message.senderNickname || "Anonymous"}`,
              { body: (message.message || "").slice(0, 120) }
            );
            setTimeout(() => n.close(), 5000);
          }
        } catch {
          /* ignore */
        }
      }
    });

    socket.on("messageDeleted", ({ messageId, groupId }) => {
      if (String(groupId) === String(group._id)) {
        setMessages((prev) =>
          prev.filter((m) => String(m._id) !== String(messageId))
        );
      }
    });

    socket.on("messageEdited", ({ messageId, groupId, message }) => {
      if (String(groupId) === String(group._id)) {
        setMessages((prev) =>
          prev.map((m) =>
            String(m._id) === String(messageId)
              ? { ...m, message, isEdited: true }
              : m
          )
        );
      }
    });

    socket.on("typing", ({ groupId, userId: typingUserId, isTyping }) => {
      if (String(groupId) === String(group._id) && typingUserId !== userId) {
        setTyping(isTyping);
      }
    });

    return () => {
      socket.emit("leaveGroup", group._id);
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [group, userId]);

  /**
   * Polling fallback (1s)
   * WHY THIS EXISTS:
   * - Ensures sync if socket drops
   * - Useful in unreliable networks
   *
   * FUTURE:
   * - Can be removed once socket stability is guaranteed
   */
  useEffect(() => {
    if (!group) return;

    const id = setInterval(async () => {
      const active = document.activeElement;
      if (inputRef.current && active && inputRef.current.contains(active)) return;
      await loadMessages();
    }, 1000);

    return () => clearInterval(id);
  }, [group, loadMessages]);

  /* -------- Auto-scroll -------- */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Send message with optimistic UI update
   */
  const sendMessage = async () => {
    if (!text.trim() || !group) return;

    const payload = {
      senderId: userId,
      senderNickname: userNickname,
      message: text.trim(),
    };

    const tempMessage = {
      _id: `temp_${Date.now()}`,
      ...payload,
      groupId: group._id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setText("");

    try {
      const res = await fetch(
        API_ENDPOINTS.COMMUNITY.POST_GROUP_MESSAGE(group._id),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      const saved = await res.json();
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMessage._id ? saved : m))
      );
    } catch {
      setMessages((prev) =>
        prev.filter((m) => m._id !== tempMessage._id)
      );
      alert("Failed to send message. Please try again."); // FUTURE: replace with toast
    }
  };

  /**
   * Delete a message
   */
  const deleteMessage = async (messageId) => {
    if (!confirm("Delete this message?")) return; // FUTURE: custom modal

    try {
      const res = await fetch(
        API_ENDPOINTS.COMMUNITY.DELETE_MESSAGE(messageId),
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );

      if (!res.ok) throw new Error();

      setMessages((prev) =>
        prev.filter((m) => String(m._id) !== String(messageId))
      );

      socketRef.current?.emit("deleteMessage", {
        groupId: group._id,
        messageId,
      });
    } catch {
      alert("Failed to delete message");
    }
  };

  /**
   * Emit typing indicator
   */
  const handleTyping = () => {
    socketRef.current?.emit("typing", {
      groupId: group._id,
      userId,
      isTyping: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing", {
        groupId: group._id,
        userId,
        isTyping: false,
      });
    }, 2000);
  };

  /* ------------------ UI ------------------ */

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" }}>Loading messages...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Message list */}
      <div style={{ flex: 1, overflowY: "auto", padding: 12, background: "#f5f5f5" }}>
        {error && <div style={{ color: "#c62828" }}>{error}</div>}

        {messages.map((msg) => (
          <div key={msg._id} style={{ marginBottom: 12 }}>
            <strong>{msg.senderNickname}</strong>
            <div>{msg.message}</div>
            {msg.senderId === userId && (
              <button onClick={() => deleteMessage(msg._id)}>✕</button>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {typing && <div style={{ fontSize: 12 }}>Someone is typing...</div>}

      {/* Input */}
      <div style={{ padding: 12 }}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          style={{ width: "80%" }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
