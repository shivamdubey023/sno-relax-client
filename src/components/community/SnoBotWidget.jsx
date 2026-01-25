import React, { useState } from "react";

/**
 * Save a reflection locally for a specific user.
 *
 * CURRENT:
 * - Uses localStorage (offline-first)
 *
 * FUTURE:
 * - Replace with API call
 * - Add encryption for sensitive content
 */
function saveReflection(userId, reflection) {
  if (!userId) return;

  const key = `sno_reflections_${userId}`;

  try {
    const existing = JSON.parse(localStorage.getItem(key) || "[]");

    // Ensure array integrity even if storage was corrupted
    const safeList = Array.isArray(existing) ? [...existing] : [];

    safeList.push(reflection);
    localStorage.setItem(key, JSON.stringify(safeList));
  } catch (err) {
    console.error("Failed to save SnoBot reflection:", err);
  }
}

/**
 * SnoBotWidget
 * ------------
 * A lightweight guided reflection widget.
 *
 * Behavior:
 * - Asks a sequence of short reflective prompts
 * - Stores only the FINAL response as one reflection
 *
 * NOTE:
 * - Earlier answers are intentionally not stored
 * - This keeps reflections concise and low-friction
 *
 * FUTURE:
 * - Store all steps as a structured reflection
 * - Sync reflections to backend
 * - Add mood selection at the end
 */
export default function SnoBotWidget({ userId }) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");

  /**
   * Guided reflection prompts
   * FUTURE:
   * - Can be personalized or fetched from API
   */
  const prompts = [
    "What's one small win from today?",
    "What's one thing you can let go of right now?",
    "One kind thing you can do for yourself this evening?",
  ];

  /**
   * Advance to next step or finish flow
   */
  const advance = () => {
    if (step < prompts.length - 1) {
      // Move to next prompt
      setStep((prev) => prev + 1);
      setAnswer("");
    } else {
      // Final step: save reflection
      const reflection = {
        id: `r_bot_${Date.now()}`,
        topicId: "sno-bot",
        topicTitle: "SnoBot reflection",
        text: answer || "",
        mood: "neutral",
        createdAt: new Date().toISOString(),
      };

      saveReflection(userId, reflection);

      // Reset widget
      setStep(0);
      setAnswer("");

      alert("SnoBot reflection saved privately."); 
      // FUTURE: replace with non-blocking toast/snackbar
    }
  };

  return (
    <div>
      <h4>SnoBot (guided)</h4>

      <div
        style={{
          background: "#f7fbff",
          padding: 12,
          borderRadius: 6,
        }}
      >
        <div style={{ marginBottom: 8, color: "#222" }}>
          {prompts[step]}
        </div>

        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your short response"
          style={{ width: "100%", padding: 8 }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 8,
          }}
        >
          <button onClick={advance}>
            {step < prompts.length - 1 ? "Next" : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
