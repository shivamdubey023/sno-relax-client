import React, { useEffect, useRef, useState, useCallback } from "react";
import { API_ENDPOINTS, SOCKET_URL } from "../../config/api.config";
import { io } from "socket.io-client";
import { Send } from "lucide-react";
import "../../styles/ChatStyles.css";

/**
 * GroupChat Component
 * -------------------
 * Handles group messaging with:
 * - Initial REST-based message loading
 * - Real-time updates via Socket.IO
 * - Typing indicators
 * - WhatsApp-style UI
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

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!group) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    socket.emit("joinGroup", group._id);

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

  useEffect(() => {
    if (!group) return;

    const id = setInterval(async () => {
      const active = document.activeElement;
      if (inputRef.current && active && inputRef.current.contains(active)) return;
      await loadMessages();
    }, 1000);

    return () => clearInterval(id);
  }, [group, loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      alert("Failed to send message. Please try again.");
    }
  };

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

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-empty">
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {error && <div className="chat-empty"><p style={{color: '#ef4444'}}>{error}</p></div>}

        {messages.map((msg) => {
          const isOwn = String(msg.senderId) === String(userId);
          return (
            <div key={msg._id} className={`message-row ${isOwn ? 'sent' : 'received'}`}>
              <div className={`message-bubble ${isOwn ? 'sent' : 'received'}`}>
                {!isOwn && <div className="message-sender">{msg.senderNickname}</div>}
                <p className="message-text">{msg.message}</p>
                <div className="message-meta">
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isOwn && <span className="message-status">✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        
        {typing && (
          <div className="message-row received">
            <div className="typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        
        <div ref={endRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            rows={1}
          />
        </div>
        <button 
          className="chat-action-btn send" 
          onClick={sendMessage}
          disabled={!text.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
