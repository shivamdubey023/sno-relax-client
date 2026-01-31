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
  const [listening, setListening] = useState(false);

  // Refs for scrolling & focus handling
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const inputAreaRef = useRef(null);
  const lastMessageRef = useRef(null);

  // Speech refs (to ensure one final send per session)
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const voiceActiveRef = useRef(false);
  const sentFinalRef = useRef(false);

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
    if (inputRef.current) inputRef.current.focus();
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
          inputRef.current &&
          active &&
          inputRef.current.contains &&
          inputRef.current.contains(active)
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
        inputRef.current?.focus();
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
  // keep for compatibility (not used for input element) - preserved for potential textarea fallback
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) sendMessage();
    }
  };

  // Start voice recognition (one final send per session)
  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser.');
      return;
    }

    if (voiceActiveRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en';
    recognition.interimResults = true;
    recognition.continuous = false;

    transcriptRef.current = '';
    sentFinalRef.current = false;
    voiceActiveRef.current = true;
    recognitionRef.current = recognition;

    setListening(true);

    recognition.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }

      transcriptRef.current = (final || interim).trim();

      // show interim in input for preview
      if (interim) setInput(interim);

      if (final && !sentFinalRef.current) {
        sentFinalRef.current = true;
        setListening(false);
        voiceActiveRef.current = false;
        recognitionRef.current = null;
        setInput(final.trim());
        sendMessage();
      }
    };

    recognition.onerror = (err) => {
      console.warn('Speech recognition error:', err);
      setListening(false);
      voiceActiveRef.current = false;
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListening(false);
      voiceActiveRef.current = false;
      recognitionRef.current = null;

      if (!sentFinalRef.current && transcriptRef.current.trim()) {
        sentFinalRef.current = true;
        setInput(transcriptRef.current.trim());
        sendMessage();
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Recognition failed to start:', e);
      setListening(false);
      voiceActiveRef.current = false;
      recognitionRef.current = null;
    }
  };

  return (
    <div className="chatbot-container therapist-notes">
      {/* Header (chatbot-like) */}
      <div className="chat-header">
        <div className="header-top">
          <div className="header-left" />

          <div className="header-center">
            <h3 className="chat-title">👤 Admin</h3>
            <p className="chat-subtitle">Private messages with your admin/therapist</p>
          </div>

          <div className="header-right" />
        </div>
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
          <button
            className={`voice-btn ${listening ? 'active' : ''}`}
            onClick={() => {
              if (voiceActiveRef.current && recognitionRef.current) {
                recognitionRef.current.stop();
              } else {
                startVoice();
              }
            }}
            disabled={loading}
            aria-label="Voice input"
            title="Voice input"
          >
            🎤
          </button>

          <input
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!loading && input.trim()) sendMessage();
              }
            }}
            placeholder="type message"
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
