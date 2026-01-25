// src/pages/TherapistNotes.jsx
import React, { useState, useEffect, useRef } from "react";
import API_BASE from "../config/api.config";
import "../styles/Chatbot.css";

/**
 * TherapistNotes
 * --------------------------------------------------
 * Private 1-to-1 messaging page between user and Admin/Therapist.
 *
 * Key Characteristics:
 *  - Messages are private (not community visible)
 *  - Polling-based real-time updates (socket optional in future)
 *  - Uses same Chatbot UI styles for consistency
 *
 * Data Flow:
 *  - Fetch messages from `/api/private/messages`
 *  - Send messages to `/api/private/message`
 *
 * Storage:
 *  - User ID derived from localStorage
 *
 * Future Enhancements (non-breaking):
 *  - Replace polling with Socket.IO
 *  - Add read receipts
 *  - Add file attachments
 *  - Add admin typing indicator
 */
export default function TherapistNotes() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Refs for scrolling & focus handling
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const inputAreaRef = useRef(null);
  const lastMessageRef = useRef(null);

  // Stable user identity
  const userId =
    localStorage.getItem("sno_userId") ||
    localStorage.getItem("userId") ||
    `guest_${Math.random().toString(36).slice(2, 7)}`;

  /**
   * Fetch all private messages for this user
   * Sorted by creation time (ascending)
   */
  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/private/messages?userId=${encodeURIComponent(userId)}`
      );
      const data = await res.json();

      if (data && Array.isArray(data.messages)) {
        const sorted = data.messages
          .slice()
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
          );
        setMessages(sorted);
      }
    } catch (e) {
      console.error("Failed to load private messages:", e);
    }
  };

  /**
   * Initial load
   * - Fetch messages
   * - Autofocus input
   */
  useEffect(() => {
    fetchMessages();
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  /**
   * Polling mechanism (1s)
   * Skips refresh while user is typing
   */
  useEffect(() => {
    let mounted = true;

    const id = setInterval(async () => {
      try {
        const active = document.activeElement;
        if (
          textareaRef.current &&
          active &&
          textareaRef.current.contains(active)
        )
          return;

        if (!mounted) return;
        await fetchMessages();
      } catch {
        // silent fail
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  /**
   * Scroll logic
   * Ensures last message is visible above fixed input area
   */
  useEffect(() => {
    const container = messagesRef.current;
    const last = lastMessageRef.current;
    const inputArea = inputAreaRef.current;

    if (!container) return;

    if (last && inputArea) {
      const inputH = inputArea.offsetHeight || 0;
      const extraGap = 12;
      const lastBottom = last.offsetTop + last.offsetHeight;
      const target =
        lastBottom - container.clientHeight + inputH + extraGap;

      const final = Math.max(
        0,
        Math.min(target, container.scrollHeight - container.clientHeight)
      );

      try {
        container.scrollTo({ top: final, behavior: "smooth" });
      } catch {
        container.scrollTop = final;
      }
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  /**
   * Send message to admin
   */
  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);

    try {
      const payload = {
        senderId: userId,
        receiverId: "admin",
        message: input.trim(),
      };

      const res = await fetch(`${API_BASE}/api/private/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setInput("");
        await fetchMessages();
        textareaRef.current?.focus();
      } else {
        console.error("Failed to send message");
      }
    } catch (e) {
      console.error("Send message error:", e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enter-to-send (Shift+Enter for newline)
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) sendMessage();
    }
  };

  return (
    <div className="chatbot-container therapist-notes">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3>Private chat with Admin</h3>
        <p style={{ color: "#555" }}>
          Send a private message to the admin/therapist. Replies are visible only
          to you.
        </p>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="chat-messages"
        style={{ marginBottom: 12 }}
      >
        {messages.length === 0 ? (
          <p className="empty">
            No messages yet. Send a message to start a conversation.
          </p>
        ) : (
          messages.map((m, idx) => {
            const isMine = m.senderId === userId;
            const isLast = idx === messages.length - 1;

            return (
              <div
                key={m._id || m.createdAt || idx}
                ref={isLast ? lastMessageRef : null}
                className={`message-row ${isMine ? "user" : "bot"}`}
              >
                {!isMine && <div className="msg-avatar">👤</div>}

                <div
                  className={`message-bubble ${
                    isMine ? "user" : "bot"
                  }`}
                >
                  <div className="msg-content">{m.message}</div>
                  <div style={{ marginTop: 6 }}>
                    <small className="msg-meta">
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleString()
                        : ""}{" "}
                      • <strong>{isMine ? "You" : "Admin"}</strong>
                    </small>
                  </div>
                </div>

                {isMine && <div className="msg-avatar">You</div>}
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area" ref={inputAreaRef}>
        <div className="input-controls">
          <textarea
            ref={textareaRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a private message to admin..."
            aria-label="Private message to admin"
          />
          <button
            onClick={sendMessage}
            className="send-btn"
            disabled={loading || !input.trim()}
            title="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
