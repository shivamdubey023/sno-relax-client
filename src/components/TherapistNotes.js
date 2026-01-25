import React, { useState, useEffect, useRef } from "react";
import API_BASE, { API_ENDPOINTS } from "../config/api.config";
import "../styles/Chatbot.css";

export default function TherapistNotes() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const stepTimerRef = useRef(null);
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const inputAreaRef = useRef(null);
  const lastMessageRef = useRef(null);

  const userId =
    localStorage.getItem("sno_userId") || localStorage.getItem("userId") || `guest_${Math.random().toString(36).slice(2,7)}`;

  // Fetch private messages for this user
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/private/messages?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data && data.messages) setMessages((data.messages || []).slice().sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)));
    } catch (e) {
      console.error("Failed to load private messages:", e.message);
    }
  };

  useEffect(() => {
    fetchMessages();
    // attempt to listen for socket events would be optional; left as future improvement
    // autofocus textarea
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  // Poll messages every 1s for real-time updates
  useEffect(() => {
    let mounted = true;
    const id = setInterval(async () => {
      try {
        const active = document.activeElement;
        if (textareaRef.current && active && textareaRef.current.contains(active)) return;
        if (!mounted) return;
        await fetchMessages();
      } catch (e) {
        // ignore
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // scroll to ensure the last message is visible above the fixed input area
  useEffect(() => {
    const container = messagesRef.current;
    const last = lastMessageRef.current;
    const inputArea = inputAreaRef.current;
    if (!container) return;

    // if we have a last message and an input area, compute a target scroll
    // so the last message sits above the input area with a small gap.
    if (last && inputArea) {
      const inputH = inputArea.offsetHeight || 0;
      const extraGap = 12; // one message worth of extra space

      // last.offsetTop is relative to the container
      const lastBottom = last.offsetTop + last.offsetHeight;
      // target so that lastBottom is visible just above the input area
      const target = lastBottom - container.clientHeight + inputH + extraGap;

      // Smooth scroll to make message visible. Fallback to max scrollTop.
      const final = Math.max(0, Math.min(target, container.scrollHeight - container.clientHeight));
      try {
        container.scrollTo({ top: final, behavior: 'smooth' });
      } catch (e) {
        container.scrollTop = final;
      }
      return;
    }

    // fallback: simple scroll to bottom
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const stopRoutine = () => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const payload = { senderId: userId, receiverId: "admin", message: input.trim() };
      const res = await fetch(`${API_BASE}/api/private/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setInput("");
        await fetchMessages();
        if (textareaRef.current) textareaRef.current.focus();
      } else {
        console.error("Failed to send message");
      }
    } catch (e) {
      console.error("Send message error:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) sendMessage();
    }
  };


  const formatTime = (s) => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    // add chatbot-container class so ThemeContext can find and apply theme classes/attributes
    <div className="chatbot-container therapist-notes">
      <div style={{ marginBottom: 16 }}>
        <h3>Private chat with Admin</h3>
        <p style={{ color: "#555" }}>Send a private message to the admin/therapist. They can reply from the admin panel.</p>
      </div>

  <div ref={messagesRef} className="chat-messages" style={{ marginBottom: 12 }}>
        {messages.length === 0 ? (
          <p className="empty">No messages yet. Send a message to start a conversation.</p>
        ) : (
          messages.map((m, idx) => {
            const isMine = m.senderId === userId;
            const isLast = idx === messages.length - 1;
            return (
              <div
                key={m._id || m.createdAt || Math.random()}
                ref={isLast ? lastMessageRef : null}
                className={`message-row ${isMine ? 'user' : 'bot'}`}>
                {!isMine && <div className="msg-avatar">👤</div>}
                <div className={`message-bubble ${isMine ? 'user' : 'bot'}`}>
                  <div className="msg-content">{m.message}</div>
                  <div style={{ marginTop: 6 }}><small className="msg-meta">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''} • <strong>{isMine ? 'You' : 'Admin'}</strong></small></div>
                </div>
                {isMine && <div className="msg-avatar">You</div>}
              </div>
            )
          })
        )}
      </div>

      <div className="chat-input-area" ref={inputAreaRef}>
        <div className="input-controls">
          <textarea ref={textareaRef} className="chat-input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} aria-label="Private message to admin" placeholder="Type a private message to admin..." />
          <button onClick={sendMessage} className="send-btn" disabled={loading || !input.trim()} title="Send">➤</button>
        </div>
      </div>

      
    </div>
  );
}
