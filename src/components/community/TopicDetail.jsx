import React, { useState } from "react";

/**
 * Save a topic-based reflection locally.
 *
 * CURRENT:
 * - Stored in localStorage (user-specific)
 *
 * FUTURE:
 * - Replace with backend API
 * - Add encryption / privacy controls
 */
function saveReflection(userId, reflection) {
  if (!userId) return;

  const key = `sno_reflections_${userId}`;

  try {
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const safeList = Array.isArray(existing) ? [...existing] : [];

    safeList.push(reflection);
    localStorage.setItem(key, JSON.stringify(safeList));
  } catch (err) {
    console.error("Failed to save topic reflection:", err);
  }
}

/**
 * TopicDetail Component
 * --------------------
 * Displays a topic with a guided exercise
 * and allows the user to save a private reflection.
 *
 * Props:
 * - topic: { id, title, description }
 * - userId: current user ID
 *
 * FUTURE:
 * - Add multiple guided exercises
 * - Add audio/video resources
 * - Sync reflections to backend
 */
export default function TopicDetail({ topic, userId }) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState("neutral");

  /**
   * Save the reflection for this topic
   */
  const handleSave = () => {
    if (!text.trim() || !topic || !userId) return;

    const reflection = {
      id: `r_${Date.now()}`,
      topicId: topic.id,
      topicTitle: topic.title,
      text: text.trim(),
      mood,
      createdAt: new Date().toISOString(),
    };

    saveReflection(userId, reflection);
    setText("");

    alert("Reflection saved privately."); 
    // FUTURE: replace with toast/snackbar
  };

  // Safety guard: avoid crashes if topic not loaded yet
  if (!topic) {
    return (
      <div style={{ color: "#666" }}>
        Loading topic…
      </div>
    );
  }

  return (
    <div>
      <h2>{topic.title}</h2>
      <p style={{ color: "#555" }}>{topic.description}</p>

      {/* ---------------- Guided Resource ---------------- */}
      <section style={{ marginTop: 16 }}>
        <h4>Guided Resource</h4>
        <div
          style={{
            background: "#fafafa",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <p>
            Short exercise: Close your eyes and breathe in for 4,
            hold for 4, exhale for 6. Repeat 5 times.
            When ready, write a short reflection below.
          </p>
        </div>
      </section>

      {/* ---------------- Reflection Input ---------------- */}
      <section style={{ marginTop: 16 }}>
        <h4>Your private reflection</h4>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          style={{ width: "100%", padding: 8 }}
          placeholder="How was that for you? Any sensations, thoughts or feelings?"
        />

        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <label>Mood:</label>

          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            <option value="very_happy">Very happy</option>
            <option value="happy">Happy</option>
            <option value="neutral">Neutral</option>
            <option value="sad">Sad</option>
            <option value="stressed">Stressed</option>
          </select>

          <button onClick={handleSave} style={{ marginLeft: "auto" }}>
            Save reflection
          </button>
        </div>
      </section>
    </div>
  );
}
