import React, { useEffect, useState } from "react";

/**
 * Temporary challenge data
 * FUTURE:
 * - Replace with API response
 * - Can include fields like: duration, difficulty, streakReward
 */
const MOCK_CHALLENGES = [
  {
    id: "c1",
    title: "2-minute breathing",
    description: "Try a 2-minute breathing exercise today.",
  },
  {
    id: "c2",
    title: "No-screen before bed",
    description: "Avoid screens 30 minutes before sleep.",
  },
  {
    id: "c3",
    title: "Gratitude note",
    description: "Write one thing you're grateful for.",
  },
];

/**
 * ChallengeList Component
 * -----------------------
 * - Displays daily wellness challenges
 * - Tracks completion status per user
 * - Stores progress locally (per user)
 *
 * Props:
 * - userId: unique identifier for the logged-in user
 */
export default function ChallengeList({ userId }) {
  const [progress, setProgress] = useState({});

  /**
   * Generate a unique localStorage key per user
   * FUTURE:
   * - Can be reused when syncing with backend
   */
  const storageKey = userId ? `sno_challenges_${userId}` : null;

  /**
   * Read progress safely from localStorage
   */
  const readProgress = () => {
    if (!storageKey) return {};
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch {
      // In case corrupted data is stored
      return {};
    }
  };

  /**
   * Load challenge progress on mount or user change
   */
  useEffect(() => {
    setProgress(readProgress());
  }, [userId]);

  /**
   * Toggle challenge completion state
   * - Updates both localStorage and React state
   *
   * FUTURE:
   * - Can also trigger API update here
   */
  const toggleChallenge = (challengeId) => {
    if (!storageKey) return;

    const updated = {
      ...readProgress(),
      [challengeId]: !progress[challengeId],
    };

    localStorage.setItem(storageKey, JSON.stringify(updated));
    setProgress(updated);
  };

  /* ---------------- UI styles (inline, reusable) ---------------- */

  const cardStyle = {
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    background: "#fff",
  };

  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  return (
    <div>
      <h4>Challenges</h4>

      {MOCK_CHALLENGES.map((challenge) => (
        <div key={challenge.id} style={cardStyle}>
          <div style={rowStyle}>
            <div>
              <strong>{challenge.title}</strong>
              <div style={{ fontSize: 12, color: "#666" }}>
                {challenge.description}
              </div>
            </div>

            <button onClick={() => toggleChallenge(challenge.id)}>
              {progress[challenge.id] ? "Completed" : "Mark"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
