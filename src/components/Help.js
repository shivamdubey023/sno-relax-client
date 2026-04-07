import React, { useState } from "react";
import { HelpCircle, Info, BookOpen, Phone, Mail, MessageCircle } from "lucide-react";
import "../styles/Help.css";

export default function Help() {
  const [activeTab, setActiveTab] = useState("faq");

  const faqs = [
    {
      question: "What is SnoRelax?",
      answer: "SnoRelax is a mental wellness and community platform designed to help you manage stress, track your mood, connect with others, and access mental health support through an AI chatbot."
    },
    {
      question: "How do I use the Chatbot?",
      answer: "Go to the Chat tab to talk with SnoBot. You can type messages or use voice input (click the microphone icon). The bot supports multiple languages and can answer questions about mental wellness."
    },
    {
      question: "How does Mood Tracking work?",
      answer: "Go to the Mood Tracker to log how you're feeling. You can select your current mood and optionally add notes. Your mood history is saved and helps track patterns over time."
    },
    {
      question: "How do I join a community group?",
      answer: "Go to the Community tab to see all available groups. Click 'Join' on any group that interests you. You can then participate in anonymous group chats using your community nickname."
    },
    {
      question: "What does anonymous messaging mean?",
      answer: "When you join a group, you appear with a community nickname instead of your real name. This maintains your privacy while allowing meaningful conversations."
    },
    {
      question: "Can I create my own group?",
      answer: "Yes! In the Community tab, use the 'Create New Group' form. As the admin, you can set the group name, description, and maximum members."
    },
    {
      question: "Can I delete my messages?",
      answer: "Yes. In group chats, you can delete your own messages. Group admins can delete messages that violate community guidelines."
    },
    {
      question: "Is my data private?",
      answer: "Your personal information and mood data are private. Only your community nickname is visible to others."
    }
  ];

  const features = [
    { title: "AI Chatbot", desc: "24/7 emotional support" },
    { title: "Mood Tracking", desc: "Visualize your progress" },
    { title: "Community", desc: "Connect with others" },
    { title: "Guided Exercises", desc: "AI-powered routines" },
    { title: "Voice Input", desc: "Hands-free interaction" },
    { title: "Multi-language", desc: "Supports 4+ languages" }
  ];

  const guidelines = [
    "Be respectful and supportive to all members",
    "No harassment, bullying, or hate speech",
    "Respect privacy - don't share personal information",
    "No spam or promotional content",
    "Seek professional help when needed",
    "Report violations to moderators"
  ];

  return (
    <div className="help-container">
      <div className="help-content">
        <div className="help-header">
          <h1><HelpCircle size={40} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Help & Support</h1>
          <p>Find answers to common questions and learn about our features</p>
        </div>

        <div className="help-tabs">
          <button
            className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab("faq")}
          >
            FAQ
          </button>
          <button
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>
          <button
            className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab("features")}
          >
            Features
          </button>
          <button
            className={`tab-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
            onClick={() => setActiveTab("guidelines")}
          >
            Guidelines
          </button>
        </div>

        {activeTab === "faq" && (
          <div className="help-section">
            <h3><HelpCircle size={24} /> Frequently Asked Questions</h3>
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <strong>{faq.question}</strong>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "about" && (
          <>
            <div className="help-section">
              <h3><Info size={24} /> About SnoRelax</h3>
              <p>
                SnoRelax is a mental wellness platform combining AI support, community connection, 
                and mood tracking. Our mission is to make mental health support accessible, 
                affordable, and stigma-free for everyone.
              </p>
            </div>

            <div className="help-section">
              <h3><BookOpen size={24} /> Our Mission</h3>
              <p>
                To create a safe, supportive space where people can manage their mental health, 
                connect with understanding communities, and access AI-powered tools for better well-being.
              </p>
            </div>

            <div className="help-section">
              <h3><Phone size={24} /> Privacy & Security</h3>
              <ul>
                <li>Your personal data is protected and encrypted</li>
                <li>Anonymous nicknames in community groups</li>
                <li>Your mood data remains private</li>
                <li>We never share your data with third parties</li>
                <li>Secure authentication for all users</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === "features" && (
          <div className="help-section">
            <h3><BookOpen size={24} /> Key Features</h3>
            <div className="features-grid">
              {features.map((feature, idx) => (
                <div key={idx} className="feature-card">
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "guidelines" && (
          <div className="help-section">
            <h3><MessageCircle size={24} /> Community Guidelines</h3>
            <p>Please follow these guidelines to maintain a supportive environment:</p>
            <ul>
              {guidelines.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="help-section">
          <h3><Mail size={24} /> Need More Help?</h3>
          <p>
            If you can't find the answer you're looking for, please reach out to us:
          </p>
          <div className="contact-info">
            <div className="contact-item">
              <Mail size={20} style={{ color: 'var(--accent-primary)' }} />
              <span>support@snorelax.com</span>
            </div>
            <div className="contact-item">
              <Phone size={20} style={{ color: 'var(--accent-primary)' }} />
              <span>Emergency Hotline: 988 (Suicide & Crisis Lifeline)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
