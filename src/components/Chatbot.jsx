import React, { useState, useRef, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api.config";
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
  const r = useRef(null);

  useEffect(() => {
    r.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

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
    try {
      // Translate user message to English if needed
      let msgToSend = msg;
      if (lang && lang !== "en") {
        msgToSend = await translate(msg, lang, "en");
      }

      const res = await fetch(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, message: msgToSend, lang })
      });
      const d = await res.json();
      if (d.text) {
        let finalText = d.text;
        // Translate response back to user's language if needed
        if (lang && lang !== "en") {
          finalText = await translate(d.text, "en", lang);
        }
        setMsgs(p => [...p, { t: "bot", txt: finalText }]);
        // If server returned mood analysis, append a summary message with habit tips
        if (d.moodAnalysis) {
          try {
            const ma = d.moodAnalysis;
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
        
        if (isMic) {
          speak(finalText, lang || "en");
        }
      }
    } catch (err) {
      console.error("Send error:", err);
      setMsgs(p => [...p, { t: "bot", txt: "⚠️ Connection error. Try again!" }]);
    }
    setLoad(false);
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
