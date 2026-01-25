import React from "react";

/**
 * Static list of topics.
 *
 * CURRENT:
 * - Hardcoded for simplicity and offline use
 *
 * FUTURE:
 * - Replace with API-driven topics
 * - Personalize based on user progress
 * - Add categories or difficulty levels
 */
const MOCK_TOPICS = [
  {
    id: "t1",
    title: "Mindfulness & Breathwork",
    description: "Short guided breathing exercises and grounding prompts.",
  },
  {
    id: "t2",
    title: "Sleep Hygiene",
    description: "Practical tips and reflections for better sleep.",
  },
  {
    id: "t3",
    title: "Managing Stress",
    description: "Micro-practices to reduce stress in the moment.",
  },
];

/**
 * TopicList Component
 * ------------------
 * Displays selectable mental-health topics.
 *
 * Props:
 * - onSelect(topic): callback when a topic is selected
 * - selected: currently selected topic object
 *
 * NOTE:
 * - This component is intentionally stateless
 * - Selection state is controlled by the parent
 */
export default function TopicList({ onSelect, selected }) {
  return (
    <div>
      {MOCK_TOPICS.map((topic) => {
        const isSelected = selected?.id === topic.id;

        return (
          <div
            key={topic.id}
            onClick={() => onSelect && onSelect(topic)}
            style={{
              padding: 10,
              borderRadius: 6,
              cursor: "pointer",
              background: isSelected ? "#f0f8ff" : "transparent",
              marginBottom: 8,
            }}
          >
            <strong>{topic.title}</strong>
            <div style={{ fontSize: 13, color: "#555" }}>
              {topic.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}
