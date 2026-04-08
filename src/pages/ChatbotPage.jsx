// src/pages/ChatbotPage.jsx
import React from "react";
import Chatbot from "../components/Chatbot";
import BackButton from "../components/BackButton";
import "../styles/Chatbot.css";


export default function ChatbotPage() {
  return (
    <div className="chat-fullscreen">
      <BackButton variant="floating" label="Back" className="chat-back-btn" />
       
      <Chatbot />
    </div>
  );
}
