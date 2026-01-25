import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { API_ENDPOINTS, SOCKET_URL } from "../config/api.config";
import "../styles/Chatbot.css";

export default function Chatbot() {
  const userId = localStorage.getItem("userId") || "guest";
  const [msgs, setMsgs] = useState([
    { t: "bot", txt: "Hi! I'm SnoBot 🌱 I'm here to listen and support you. How are you feeling today?" }
  ]);
  const [inp, setInp] = useState("");
  const [load, setLoad] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("en");
  const [lastMessageFromVoice, setLastMessageFromVoice] = useState(false);
  const r = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    r.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to chatbot socket");
    });

    socketRef.current.on("chatbotResponse", (data) => {
      setLoad(false);
      if (data.text) {
        let finalText = data.text;
        // Translate response back to user's language if needed
        if (lang && lang !== "en") {
          finalText = translate(data.text, "en", lang);
        }
        setMsgs(p => [...p, { t: "bot", txt: finalText }]);
        // If server returned mood analysis, append a summary message with habit tips
        if (data.moodAnalysis) {
          try {
            const ma = data.moodAnalysis;
            const mood = ma.mood || (ma.label || 'neutral');
            const habits = Array.isArray(ma.habits) ? ma.habits : [];
            let suggestionText = `Mood: ${mood}`;
            if (habits.length) {
              suggestionText += '\nSuggestions:';
              habits.slice(0,3).forEach((h, idx) => {
                const title = h.title || h.name || `Tip ${idx+1}`;
                const desc = h.description || h.desc || '';
                suggestionText += `\n${idx+1}. ${title}: ${desc}`;
              });
            }
            setMsgs(p => [...p, { t: "bot", txt: suggestionText }]);
          } catch (e) {
            console.warn('Failed to render moodAnalysis:', e);
          }
        }

        // Speak the response if it was triggered by voice input
        if (lastMessageFromVoice) {
          speak(finalText, lang || "en");
        }
      }
    });

    socketRef.current.on("chatbotError", (error) => {
      setLoad(false);
      console.error("Chatbot API error:", error);
      setMsgs(p => [...p, { t: "bot", txt: "🤖 Sorry, I'm experiencing technical difficulties with my AI brain. Please try again later or contact support if the issue persists." }]);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from chatbot socket");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [lang]);

  const translate = async (text, from, to) => {
    if (from === to) return text;
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) return text;
      const data = await res.json();
      if (!data || !Array.isArray(data[0])) return text;
      let translated = "";
      data[0].forEach((chunk) => {
        if (chunk && chunk[0]) translated += chunk[0];
      });
      return translated || text;
    } catch (err) {
      console.warn("Translation failed:", err);
      return text;
    }
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice not supported!");

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    setListening(true);
    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      send(transcript, true);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  const speak = (text, language = "en") => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language;
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    // Prefer an American female voice when available
    const voices = speechSynthesis.getVoices() || [];
    const americanFemaleRegex = /female|woman|samantha|amy|allison|sara|sarah|gina|victoria/i;

    let selected = null;
    // 1) exact en-US female name match
    selected = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("en-us") && americanFemaleRegex.test(v.name || ""));
    // 2) any en-US voice
    if (!selected) selected = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("en-us"));
    // 3) any voice whose name looks female
    if (!selected) selected = voices.find(v => americanFemaleRegex.test(v.name || ""));
    // 4) any voice matching requested language
    if (!selected) selected = voices.find(v => v.lang && v.lang.toLowerCase().startsWith((language || "").toLowerCase()));
    // 5) fallback to first available
    if (!selected && voices.length) selected = voices[0];

    if (selected) utter.voice = selected;

    // If voices are not yet available (browser may load them asynchronously), attempt again when they load
    if (!voices.length) {
      speechSynthesis.onvoiceschanged = () => {
        const vlist = speechSynthesis.getVoices();
        let sel = vlist.find(v => v.lang && v.lang.toLowerCase().startsWith("en-us") && americanFemaleRegex.test(v.name || ""))
          || vlist.find(v => v.lang && v.lang.toLowerCase().startsWith("en-us"))
          || vlist.find(v => americanFemaleRegex.test(v.name || ""))
          || vlist.find(v => v.lang && v.lang.toLowerCase().startsWith((language || "").toLowerCase()))
          || vlist[0];
        if (sel) utter.voice = sel;
        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
      };
    } else {
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    }
  };

  const send = async (msg = inp, isMic = false) => {
    if (!msg.trim()) return;
    setMsgs(p => [...p, { t: "user", txt: msg }]);
    setInp("");
    setLoad(true);
    setLastMessageFromVoice(isMic);

    try {
      // Translate user message to English if needed
      let msgToSend = msg;
      if (lang && lang !== "en") {
        msgToSend = await translate(msg, lang, "en");
      }

      // Send message via socket
      if (socketRef.current) {
        socketRef.current.emit("chatbotMessage", {
          userId,
          message: msgToSend,
          lang
        });
      } else {
        throw new Error("Socket not connected");
      }

    } catch (err) {
      console.error("Send error:", err);
      setLoad(false);
      setMsgs(p => [...p, { t: "bot", txt: "🤖 Sorry, I'm having trouble connecting to my AI services. Please check your internet connection and try again." }]);
    }
  };

  const handleHelp = () => {
    const helpMsg = "I can help you with:\n• Mood tracking and emotional support\n• Mental health resources\n• Coping strategies\n• Community support groups\n• Professional help guidance\n\nWhat would you like help with?";
    setMsgs(p => [...p, { t: "bot", txt: helpMsg }]);
    speak(helpMsg, lang || "en");
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <div className="header-top">
          <h3 className="chat-title">SnoBot</h3>
          <div className="header-controls">
            <div className="lang-select-header">
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="lang-dropdown-header">
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
                <option value="de">DE</option>
                <option value="hi">HI</option>
                <option value="zh">ZH</option>
              </select>
            </div>
            <button 
              className="help-nav-btn"
              onClick={handleHelp}
              title="Get help"
              disabled={load}
            >
              ❓
            </button>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {msgs.map((m, i) => (
          <div key={i} className={`message-row ${m.t}`}>
            <div className={`message-bubble ${m.t}`}>
              <span className="msg-avatar">{m.t === "bot" ? "🤖" : "👤"}</span>
              <div className="msg-content">{m.txt}</div>
            </div>
          </div>
        ))}
        {load && (
          <div className="message-row bot">
            <div className="message-bubble bot">
              <span className="msg-avatar">🤖</span>
              <div className="typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={r} />
      </div>

      <div className="chat-input-area">
        <div className="input-controls">
          <button 
            className={`voice-btn ${listening ? "active" : ""}`}
            onClick={handleVoice}
            title="Voice input (🎤)"
            disabled={load}
          >
            🎤
          </button>
          
          <input 
            value={inp} 
            onChange={(e) => setInp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="chat-input"
            disabled={load}
          />
          
          <button 
            onClick={() => send()}
            disabled={load || !inp.trim()}
            className="send-btn"
            title="Send message (➤)"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
