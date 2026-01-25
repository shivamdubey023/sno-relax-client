import React, { useState } from "react";

/**
 * Help Component
 * --------------
 * This page provides:
 * 1. FAQ (How to use the application modules)
 * 2. About section (App purpose, mission, privacy, guidelines)
 *
 * NOTE:
 * - This is a static informational component
 * - No backend/API dependency (safe for demo & offline use)
 * - Designed for clarity and accessibility
 */
export default function Help() {
  /**
   * activeTab controls which section is visible:
   * - "faq"   → Frequently Asked Questions
   * - "about" → About the application
   */
  const [activeTab, setActiveTab] = useState("faq");

  /**
   * FAQ content
   * -----------
   * Stored as an array to allow:
   * - Easy future updates
   * - Potential dynamic rendering from backend later
   */
  const faqs = [
    {
      question: "What is SnoRelax?",
      answer:
        "SnoRelax is a mental wellness and community platform designed to help you manage stress, track your mood, connect with others, and access mental health support through an AI chatbot.",
    },
    {
      question: "How do I use the Chatbot?",
      answer:
        "Go to the Chat tab to talk with SnoBot. You can type messages or use voice input (click the microphone icon). The bot supports multiple languages and can answer questions about mental wellness.",
    },
    {
      question: "How does Mood Tracking work?",
      answer:
        "Go to the Mood Tracker to log how you're feeling. You can select your current mood and optionally add notes. Your mood history is saved and helps track patterns over time.",
    },
    {
      question: "How do I join a community group?",
      answer:
        "Go to the Community tab to see all available groups. Click 'Join' on any group that interests you. You can then participate in anonymous group chats using your community nickname.",
    },
    {
      question: "What does anonymous messaging mean?",
      answer:
        "When you join a group, you appear with a community nickname instead of your real name. This maintains your privacy while allowing meaningful conversations.",
    },
    {
      question: "Can I create my own group?",
      answer:
        "Yes! In the Community tab, use the 'Create New Group' form. As the admin, you can set the group name, description, and maximum members.",
    },
    {
      question: "Can I delete my messages?",
      answer:
        "Yes. In group chats, you can delete your own messages. Group admins can delete messages that violate community guidelines.",
    },
    {
      question: "Is my data private?",
      answer:
        "Your personal information and mood data are private. Only your community nickname is visible to others.",
    },
  ];

  /**
   * About section content
   * ---------------------
   * Uses pre-formatted text (whiteSpace: pre-wrap)
   * so bullet points render cleanly without HTML lists.
   */
  const aboutSections = [
    {
      title: "About SnoRelax",
      content:
        "SnoRelax is a mental wellness platform combining AI support, community connection, and mood tracking.",
    },
    {
      title: "Our Mission",
      content:
        "To make mental health support accessible, affordable, and stigma-free for everyone.",
    },
    {
      title: "Key Features",
      content: `
• AI Chatbot (SnoBot)
• Mood Tracking
• Community Groups
• Multi-language Support
• Voice Input
• Real-time Messaging
      `,
    },
    {
      title: "Community Guidelines",
      content: `
• Be respectful
• No harassment or abuse
• Respect privacy
• No spam
• Seek professional help when needed
      `,
    },
    {
      title: "Privacy & Security",
      content: `
• Personal data is protected
• Anonymous nicknames in communities
• Mood data is private
• No third-party data sharing
      `,
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>
        Help & Support
      </h1>

      {/* Tab Navigation */}
      <div style={{ display: "flex", borderBottom: "2px solid #ddd" }}>
        <button onClick={() => setActiveTab("faq")}>
          FAQ
        </button>
        <button onClick={() => setActiveTab("about")}>
          About
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: 20 }}>
        {activeTab === "faq" ? (
          <>
            {faqs.map((faq, idx) => (
              <div key={idx}>
                <strong>{faq.question}</strong>
                <p>{faq.answer}</p>
              </div>
            ))}
          </>
        ) : (
          <>
            {aboutSections.map((section, idx) => (
              <div key={idx}>
                <h3>{section.title}</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {section.content}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
