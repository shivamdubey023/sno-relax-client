import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { API_BASE, SOCKET_URL } from "../../config/api.config";
import { Send } from "lucide-react";
import "../../styles/ChatStyles.css";

/**
 * PrivateChat Component
 * --------------------
 * Handles 1-to-1 private messaging between two users.
 * WhatsApp-style UI
 */
export default function PrivateChat({ otherUserId, me }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const socketRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

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

    socket.emit("identify", me);

    socket.on("receivePrivateMessage", (msg) => {
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;

    const payload = {
      senderId: me,
      receiverId: otherUserId,
      message: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, payload]);
    setText("");

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("sendPrivateMessage", payload);
      await axios.post(
        `${API_BASE}/api/community/private/message`,
        payload,
        { withCredentials: true }
      );
    }
    } catch (err) {
      console.error("Failed to send private message:", err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, i) => {
          const isMe = String(m.senderId) === String(me);

          return (
            <div key={m._id || i} className={`message-row ${isMe ? 'sent' : 'received'}`}>
              <div className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                <p className="message-text">{m.message || m.text}</p>
                <div className="message-meta">
                  <span className="message-time">
                    {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {isMe && <span className="message-status">✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message..."
            rows={1}
          />
        </div>
        <button 
          className="chat-action-btn send" 
          onClick={send}
          disabled={!text.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
