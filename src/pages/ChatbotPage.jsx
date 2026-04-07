// src/pages/ChatbotPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Chatbot from "../components/Chatbot";
import "../styles/Chatbot.css";

export default function ChatbotPage() {
  const navigate = useNavigate();

  return (
    <div className="chat-fullscreen">
      <button className="chat-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
        <ArrowLeft size={20} />
      </button>
      <Chatbot />
    </div>
  );
}
