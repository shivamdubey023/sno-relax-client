import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { API_ENDPOINTS, SOCKET_URL } from "../config/api.config"; 
// NOTE: API_ENDPOINTS intentionally kept for future REST fallback

import "../styles/Chatbot.css";

/**
 * Chatbot Component (SnoBot)
 * -------------------------
 * Responsibilities:
 * - Real-time chatbot communication (Socket.IO)
 * - Voice input (SpeechRecognition)
 * - Voice output (SpeechSynthesis)
 * - Multi-language support
 * - Mood analysis rendering
 *
 * FUTURE:
 * - Replace Google Translate with official API
 * - Persist chat history per user
 * - Add safety escalation (hotline, therapist redirect)
 */
export default function Chatbot() {
  const userId = localStorage.getItem("userId") || "guest";

  const [msgs, setMsgs] = useState([
    {
      id: `bot_${Date.now()}`,
      t: "bot",
      txt: "Hi! I'm SnoBot. I'm here to listen and support you. How are you feeling today?",
      ts: Date.now()
    }
  ]);

  const [inp, setInp] = useState("");
  const [load, setLoad] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("en");
  const [lastMessageFromVoice, setLastMessageFromVoice] = useState(false);
  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const voiceSentRef = useRef(false); // guard to ensure single send on voice

  // Helper to append a message
  const pushMsg = (m) => setMsgs((p) => [...p, m]);

  // Helper to update last user 'sending' msg to 'sent'
  const markLastUserSent = () => {
    setMsgs((prev) => {
      const copy = prev.slice();
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].t === 'user' && (copy[i].status === 'sending' || !copy[i].status)) {
          copy[i] = { ...copy[i], status: 'sent' };
          break;
        }
      }
      return copy;
    });
  };


  /* ---------------- UI SCROLL ---------------- */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // show typing indicator when load true
  useEffect(() => {
    // optional additional logic when bot typing
  }, [load]);

  /* ---------------- SOCKET CONNECTION ---------------- */
  useEffect(() => {
    /**
     * Socket is recreated when language changes.
     * This ensures server context stays in sync with user language.
     */
    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    socketRef.current.on("chatbotResponse", async (data) => {
      setLoad(false);

      if (!data?.text) return;

      let finalText = data.text;

      // Translate bot response to user's selected language
      if (lang !== "en") {
        finalText = await translate(data.text, "en", lang);
      }

      // mark last user message as sent
      markLastUserSent();

      pushMsg({ id: `bot_${Date.now()}`, t: "bot", txt: finalText, ts: Date.now() });

      // Render mood analysis if provided
      if (data.moodAnalysis) {
        try {
          const { mood = "neutral", habits = [] } = data.moodAnalysis;

          let suggestion = `Mood: ${mood}`;
          if (habits.length) {
            suggestion += "\nSuggestions:";
            habits.slice(0, 3).forEach((h, i) => {
              suggestion += `\n${i + 1}. ${h.title || "Tip"}: ${h.description || ""}`;
            });
          }

          pushMsg({ id: `bot_${Date.now()}_m`, t: "bot", txt: suggestion, ts: Date.now() });
        } catch (e) {
          console.warn("Mood analysis rendering failed:", e);
        }
      }

      // Speak response only when last message was from voice
      if (voiceSentRef.current) {
        speak(finalText, lang);
        voiceSentRef.current = false;
      }
    });

    socketRef.current.on("chatbotError", () => {
      setLoad(false);
      setMsgs((p) => [
        ...p,
        {
          t: "bot",
          txt: "🤖 Sorry, I'm facing technical issues right now. Please try again later."
        }
      ]);
    });

    return () => socketRef.current?.disconnect();
  }, [lang]);

  /* ---------------- TRANSLATION ---------------- */
  /**
   * NOTE:
   * Uses unofficial Google Translate endpoint.
   * Works for demo, but should be replaced in production.
   */
  const translate = async (text, from, to) => {
    if (from === to) return text;
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      return data?.[0]?.map((c) => c[0]).join("") || text;
    } catch {
      return text;
    }
  };

  /* ---------------- VOICE INPUT ---------------- */
  const handleVoice = () => {
    // Prevent multiple concurrent voice sends
    if (voiceSentRef.current) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    setListening(true);

    // Track whether a result was produced so we can reset guard appropriately
    let hadResult = false;
    voiceSentRef.current = true;
    recognition.start();

    recognition.onresult = (e) => {
      hadResult = true;
      setListening(false);
      send(e.results[0][0].transcript, true);
    };

    recognition.onerror = () => {
      setListening(false);
      voiceSentRef.current = false;
    };

    recognition.onend = () => {
      setListening(false);
      if (!hadResult) voiceSentRef.current = false;
    };
  };

  /* ---------------- TEXT TO SPEECH ---------------- */
  const speak = (text, language) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const send = async (msg = inp, isMic = false) => {
    if (!msg.trim()) return;

    // set message as 'sending' so UI can reflect state
    setMsgs((p) => [...p, { id: `user_${Date.now()}`, t: "user", txt: msg, status: "sending", ts: Date.now() }]);
    setInp("");
    setLoad(true);
    setLastMessageFromVoice(isMic);

    let finalMsg = msg;
    if (lang !== "en") {
      finalMsg = await translate(msg, lang, "en");
    }

    socketRef.current?.emit("chatbotMessage", {
      userId,
      message: finalMsg,
      lang
    });
  };

  /* ---------------- HELP ---------------- */
  const handleHelp = () => {
    const helpText =
      "I can help with:\n• Emotional support\n• Coping strategies\n• Mental health resources\n• Community guidance\n\nWhat do you need help with?";
    setMsgs((p) => [...p, { t: "bot", txt: helpText }]);
    speak(helpText, lang);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h3>SnoBot</h3>

        <div>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>

          <button onClick={handleHelp}>❓</button>
        </div>
      </div>

      <div className="chat-messages">
        {msgs.map((m, i) => (
          <div key={i} className={`message-row ${m.t}`}>
            <div className={`message-bubble ${m.t}`}>{m.txt}</div>
          </div>
        ))}
        {load && <div className="typing">Typing...</div>}
        <div ref={scrollRef} />
      </div>

      <div className="chat-input-area">
        <button onClick={handleVoice} disabled={load}>
          🎤
        </button>

        <input
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
        />

        <button onClick={() => send()} disabled={load}>
          ➤
        </button>
      </div>
    </div>
  );
}
