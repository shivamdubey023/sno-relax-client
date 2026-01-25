import React, { useEffect, useState } from "react";

/**
 * Convert mood value into a user-friendly label.
 *
 * FUTURE:
 * - Move this to a shared utils file
 * - Add localization (i18n)
 */
function moodLabel(mood) {
  switch (mood) {
    case "very_happy":
      return "😊 Very happy";
    case "happy":
      return "🙂 Happy";
    case "neutral":
      return "😐 Neutral";
    case "sad":
      return "😔 Sad";
    case "stressed":
      return "😣 Stressed";
    default:
      // Fallback for unknown or future moods
      return mood || "Unknown";
  }
}

/**
 * MyProgress Component
 * -------------------
 * Displays a summary of user's recent activity:
 * - Latest reflections
 * - Number of completed challenges
 *
 * Props:
 * - userId: unique identifier for the current user
 *
 * DATA SOURCE (current):
 * - localStorage
 *
 * FUTURE:
 * - Replace with backend API
 * - Add charts / analytics
 * - Add date filtering
 */
export default function MyProgress({ userId }) {
  const [reflections, setReflections] = useState([]);
  const [challenges, setChallenges] = useState({});

  /**
   * Load progress data from localStorage
   * - Uses user-specific keys
   * - Safe parsing to avoid crashes
   */
  useEffect(() => {
    if (!userId) return;

    const reflectionsKey = `sno_reflections_${userId}`;
    const challengesKey = `sno_challenges_${userId}`;

    try {
      const storedReflections = JSON.parse(
        localStorage.getItem(reflectionsKey) || "[]"
      );

      const storedChallenges = JSON.parse(
        localStorage.getItem(challengesKey) || "{}"
      );

      /**
       * IMPORTANT:
       * - Clone before reversing to avoid mutating original array
       * - Show only the 10 most recent reflections
       */
      const recentReflections = [...storedReflections]
        .reverse()
        .slice(0, 10);

      setReflections(recentReflections);
      setChallenges(storedChallenges);
    } catch (err) {
      console.error("Failed to load progress data:", err);
      setReflections([]);
      setChallenges({});
    }
  }, [userId]);

  /**
   * Count completed challenges
   * - challenges object shape: { [challengeId]: boolean }
   */
  const completedChallengesCount = Object.keys(challenges).filter(
    (key) => challenges[key]
  ).length;

  return (
    <div>
      <h4>Your progress</h4>

      {/* ---------------- Recent Reflections ---------------- */}
      <div style={{ marginBottom: 12 }}>
        <strong>Recent reflections</strong>

        {reflections.length === 0 && (
          <div style={{ color: "#666", marginTop: 6 }}>
            No reflections yet
          </div>
        )}

        {reflections.map((r) => (
          <div
            key={r.id}
            style={{
              padding: 8,
              borderRadius: 6,
              background: "#fff",
              marginTop: 8,
            }}
          >
            <div style={{ fontSize: 13 }}>
              {r.topicTitle || "Reflection"}
            </div>

            <div style={{ fontSize: 12, color: "#333" }}>
              {r.text?.slice(0, 120)}
              {r.text && r.text.length > 120 ? "..." : ""}
            </div>

            <div style={{ fontSize: 12, color: "#666" }}>
              {moodLabel(r.mood)} ·{" "}
              {r.createdAt
                ? new Date(r.createdAt).toLocaleString()
                : "Unknown date"}
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- Challenges Summary ---------------- */}
      <div>
        <strong>Challenges completed</strong>
        <div style={{ fontSize: 13, color: "#333", marginTop: 8 }}>
          {completedChallengesCount} completed
        </div>
      </div>
    </div>
  );
}
