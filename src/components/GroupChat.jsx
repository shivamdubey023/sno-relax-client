// src/components/GroupChat.jsx
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/api.config";
let socket;

export default function GroupChat({ group }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const userId = localStorage.getItem("sno_userId") || "Guest123";
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const [messagesMaxHeight, setMessagesMaxHeight] = useState("auto");

  useEffect(() => {
    socket = io(SOCKET_URL);

    socket.emit("joinGroup", group.id);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // initial load of messages for this group
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.COMMUNITY.GET_GROUP_MESSAGES(group.id), { credentials: "include" });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || data || []);
        }
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      socket.emit("leaveGroup", group.id);
      socket.disconnect();
      mounted = false;
    };
  }, [group.id]);

  // Poll messages every 2s for this group (focus-safe)
  useEffect(() => {
    if (!group || !group.id) return;
    let mounted = true;

    const loadMessages = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.COMMUNITY.GET_GROUP_MESSAGES(group.id), { credentials: "include" });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || data || []);
        }
      } catch (e) {
        // ignore
      }
    };

    const id = setInterval(async () => {
      try {
        const active = document.activeElement;
        if (inputRef.current && active && inputRef.current.contains(active)) return;
        if (!mounted) return;
        await loadMessages();
      } catch (e) {}
    }, 1000);

    return () => { mounted = false; clearInterval(id); };
  }, [group]);

  const handleSend = () => {
    if (!text.trim()) return;
    const message = { userId, text, groupId: group.id, date: new Date() };
    socket.emit("sendMessage", { groupId: group.id, message });
    setMessages((prev) => [...prev, message]);
    setText("");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const updateHeight = () => {
      try {
        const inputH = inputRef.current ? inputRef.current.offsetHeight : 0;
        const newH = window.innerHeight - inputH - 16;
        setMessagesMaxHeight(newH > 160 ? `${newH}px` : "160px");
      } catch (e) {
        setMessagesMaxHeight("auto");
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div className="chat-window">
      <div className="messages" style={{ maxHeight: messagesMaxHeight, overflowY: 'auto' }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${m.userId === userId ? "self" : "other"}`}
          >
            {!m.self && <span className="sender">{m.userId}</span>}
            <p>{m.text}</p>
          </div>
        ))}
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
