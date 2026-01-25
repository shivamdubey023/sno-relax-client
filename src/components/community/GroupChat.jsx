import React, { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS, SOCKET_URL } from "../../config/api.config";
import { io } from "socket.io-client";

export default function GroupChat({ group, userId, userNickname = "Anonymous" }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const endRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load initial messages
  useEffect(() => {
    if (!group) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.COMMUNITY.GET_GROUP_MESSAGES(group._id), {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

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
    };

    loadMessages();
  }, [group]);

  // Setup Socket.IO
  useEffect(() => {
    if (!group) return;

    try {
      const socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      // Join group
      socket.emit("joinGroup", { groupId: group._id, userId });

      // Request notification permission once
      if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'default') {
        try { Notification.requestPermission(); } catch (e) { /* ignore */ }
      }

      // Listen for new messages
      socket.on("receiveGroupMessage", (message) => {
        if (String(message.groupId) === String(group._id)) {
          setMessages((prev) => [...prev, message]);

          // show desktop notification for messages not from current user
          try {
            const isFromMe = String(message.senderId) === String(userId);
            if (!isFromMe && typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
              const title = `${group.name} — ${message.senderNickname || 'Anonymous'}`;
              const body = (message.message || '').slice(0, 120);
              const n = new Notification(title, { body });
              // close after a few seconds
              setTimeout(() => n.close(), 5000);
            }
          } catch (e) {
            // ignore notification errors
          }
        }
      });

      // Listen for deleted messages
      socket.on("messageDeleted", ({ messageId, groupId }) => {
        if (String(groupId) === String(group._id)) {
          setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));
        }
      });

      // Listen for edited messages
      socket.on("messageEdited", ({ messageId, groupId, message: updatedMessage }) => {
        if (String(groupId) === String(group._id)) {
          setMessages((prev) =>
            prev.map((m) =>
              String(m._id) === String(messageId)
                ? { ...m, message: updatedMessage, isEdited: true }
                : m
            )
          );
        }
      });

      // Listen for typing indicators
      socket.on("typing", ({ groupId, userId: typingUserId, isTyping }) => {
        if (String(groupId) === String(group._id) && typingUserId !== userId) {
          setTyping(isTyping);
        }
      });

      return () => {
        socket.emit("leaveGroup", { groupId: group._id, userId });
        socket.disconnect();
      };
    } catch (err) {
      console.error("Socket.IO connection error:", err);
    }
  }, [group, userId]);

  // Poll messages every 1s for real-time updates
  useEffect(() => {
    if (!group) return;

    let mounted = true;
    const id = setInterval(async () => {
      try {
        const active = document.activeElement;
        if (inputRef.current && active && inputRef.current.contains(active)) return;
        if (!mounted) return;
        await loadMessages();
      } catch (e) {
        // ignore
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [group]);

  // Auto scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !group) return;

    const messageData = {
      senderId: userId,
      senderNickname: userNickname,
      message: text.trim(),
    };

    // Optimistic UI update
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      ...messageData,
      groupId: group._id,
      createdAt: new Date().toISOString(),
      isEdited: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setText("");

    try {
      // Send via REST API
      const res = await fetch(API_ENDPOINTS.COMMUNITY.POST_GROUP_MESSAGE(group._id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(messageData),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const newMessage = await res.json();

      // Replace temp message with actual message
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMessage._id ? newMessage : m))
      );

      // Emit via Socket.IO for real-time delivery to others
      if (socketRef.current) {
        socketRef.current.emit("sendGroupMessage", {
          groupId: group._id,
          ...newMessage,
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
      alert("Failed to send message. Please try again.");
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm("Delete this message?")) return;

    try {
      const res = await fetch(API_ENDPOINTS.COMMUNITY.DELETE_MESSAGE(messageId), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("Failed to delete message");

      setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));

      if (socketRef.current) {
        socketRef.current.emit("deleteMessage", {
          groupId: group._id,
          messageId,
        });
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Failed to delete message");
    }
  };

  const handleTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit("typing", {
        groupId: group._id,
        userId,
        isTyping: true,
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("typing", {
          groupId: group._id,
          userId,
          isTyping: false,
        });
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 12, background: "#f5f5f5" }}>
        {error && (
          <div style={{ padding: 10, background: "#ffebee", color: "#c62828", borderRadius: 4 }}>
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#999", padding: 20 }}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: 12,
                      color: msg.isAdmin ? '#a16207' : (msg.senderId === userId ? "#4a90e2" : "#666"),
                    }}
                  >
                    {msg.senderNickname || "Anonymous"}
                    {msg.senderId === userId && " (You)"}
                    {msg.isAdmin && (
                      <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px', background: '#fef3c7', borderRadius: 6, color: '#92400e', fontWeight: 700 }}>
                        Official
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      background: msg.isAdmin ? '#fffbe6' : (msg.senderId === userId ? "#e8f4f8" : "#fff"),
                      padding: "8px 12px",
                      borderRadius: 8,
                      display: "inline-block",
                      marginTop: 4,
                      maxWidth: "80%",
                      wordWrap: "break-word",
                    }}
                  >
                    {msg.message}
                    {msg.isEdited && (
                      <span style={{ fontSize: 10, color: "#999", marginLeft: 8 }}>(edited)</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                {/* Delete button for sender */}
                {msg.senderId === userId && (
                  <button
                    onClick={() => deleteMessage(msg._id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#999",
                      cursor: "pointer",
                      fontSize: 14,
                      marginLeft: 8,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        <div ref={endRef} />
      </div>

      {/* Typing indicator */}
      {typing && (
        <div style={{ padding: "8px 12px", fontSize: 12, color: "#999", fontStyle: "italic" }}>
          Someone is typing...
        </div>
      )}

      {/* Input area */}
      <div style={{ padding: 12, borderTop: "1px solid #ddd", background: "#fff" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Type a message (anonymous)..."
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 4,
              fontSize: 14,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            style={{
              padding: "8px 16px",
              background: text.trim() ? "#4a90e2" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: text.trim() ? "pointer" : "not-allowed",
              fontSize: 14,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
