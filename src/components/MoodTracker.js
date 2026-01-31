import React, { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/MoodTracker.css";
import { useTheme } from "../context/ThemeContext";

/* --------------------------------------------------
   Chart.js registration (required once globally)
-------------------------------------------------- */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/* --------------------------------------------------
   Mood scale definition
   - emoji  : UI representation
   - label  : human-readable mood
   - value  : numeric scale for analytics
-------------------------------------------------- */
const moods = [
  { emoji: "😄", label: "Happy", value: 5 },
  { emoji: "🙂", label: "Good", value: 4 },
  { emoji: "😐", label: "Neutral", value: 3 },
  { emoji: "😴", label: "Tired", value: 2 },
  { emoji: "😡", label: "Angry", value: 1 },
  { emoji: "😢", label: "Sad", value: 0 },
];

export default function MoodTracker() {
  /* --------------------------------------------------
     STATE MANAGEMENT
  -------------------------------------------------- */
  const [moodData, setMoodData] = useState([]);     // All mood entries
  const [selectedMood, setSelectedMood] = useState(null); // UI highlight
  const [loading, setLoading] = useState(true);    // Fetch state
  const [error, setError] = useState(null);         // Error feedback (future-safe)

  /* --------------------------------------------------
     USER & API CONFIG
     - userId from localStorage
     - apiBase kept configurable for deployment
  -------------------------------------------------- */
  const userId = localStorage.getItem("sno_userId") || "";
  const apiBase = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  /* --------------------------------------------------
     FETCH MOOD HISTORY
     Runs on component mount & when user changes
  -------------------------------------------------- */
  useEffect(() => {
    const fetchMoods = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${apiBase}/api/moods/${userId}`);
        if (res.data?.ok) {
          setMoodData(res.data.moods || []);
        }
      } catch (err) {
        console.error("❌ Failed to fetch moods:", err);
        setError("Unable to load mood data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMoods();
  }, [userId, apiBase]);

  /* --------------------------------------------------
     HANDLE MOOD SELECTION
     - Saves mood to backend
     - Optimistically updates UI
  -------------------------------------------------- */
  const handleMoodClick = async (mood) => {
    if (!userId) {
      alert("Please log in to track your mood!");
      return;
    }

    setSelectedMood(mood.label);

    try {
      const res = await axios.post(`${apiBase}/api/moods/${userId}`, {
        mood: mood.value,
      });

      if (res.data?.ok && res.data.entry) {
        setMoodData((prev) => [...prev, res.data.entry]);
      }
    } catch (err) {
      console.error("❌ Error saving mood:", err);
    }
  };

  /* --------------------------------------------------
     HELPERS
  -------------------------------------------------- */

  // Convert numeric mood to emoji
  const getEmojiForMood = (value) => {
    const match = moods.find((m) => m.value === value);
    return match ? match.emoji : "❓";
  };

  // Calculate average mood over N days
  const avgMood = (days) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const filtered = moodData.filter(
      (d) => new Date(d.date).getTime() >= cutoff
    );

    if (!filtered.length) return "N/A";

    const avg =
      filtered.reduce((sum, d) => sum + d.mood, 0) / filtered.length;

    if (avg >= 4.5) return "😄 Happy";
    if (avg >= 3.5) return "🙂 Good";
    if (avg >= 2.5) return "😐 Neutral";
    if (avg >= 1.5) return "😴 Tired";
    if (avg >= 0.5) return "😡 Angry";
    return "😢 Sad";
  };

  /* --------------------------------------------------
     CHART COLOR (memoized for performance)
     - Use CSS variables so theme changes propagate
  -------------------------------------------------- */
  // NOTE: Use ThemeContext so component recomputes when theme changes
  const { theme } = useTheme();

  const moodColor = useMemo(() => {
    // helper to read a CSS var from document root
    const readVar = (name, fallback) => {
      try {
        const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return val || fallback;
      } catch (e) {
        return fallback;
      }
    };

    // helper to convert hex -> rgba
    const hexToRgba = (hex, alpha = 0.18) => {
      if (!hex) return `rgba(59,130,246,${alpha})`;
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(h => h + h).join('');
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    if (!moodData.length) {
      const mid = readVar('--mood-mid', '#3b82f6');
      return { border: mid, background: hexToRgba(mid, 0.18) };
    }

    const avg =
      moodData.reduce((sum, d) => sum + d.mood, 0) / moodData.length;

    let varName = '--mood-verylow';
    if (avg >= 4) varName = '--mood-high';
    else if (avg >= 3) varName = '--mood-mid';
    else if (avg >= 2) varName = '--mood-low';
    else if (avg >= 1) varName = '--mood-low';

    const hex = readVar(varName, '#3b82f6');
    return { border: hex, background: hexToRgba(hex, 0.18) };
  }, [moodData, theme]);

  /* --------------------------------------------------
     CHART DATA
     - Uses full date to avoid weekday duplication
  -------------------------------------------------- */
  const chartData = {
    labels: moodData.map((d) =>
      new Date(d.date).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      })
    ),
    datasets: [
      {
        label: "Mood Level",
        data: moodData.map((d) => d.mood),
        borderColor: moodColor.border,
        backgroundColor: moodColor.background,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */
  return (
    <div className="mood-tracker-container">

      {/* Mood selection row */}
      <div className="emoji-row">
        {moods.map((m) => (
          <button
            key={m.label}
            className={`emoji-btn ${selectedMood === m.label ? "selected" : ""}`}
            onClick={() => handleMoodClick(m)}
            title={m.label}
          >
            {m.emoji}
          </button>
        ))}
      </div>

      {/* Chart section */}
      <div className="chart-container">
        {loading ? (
          <p>Loading mood data...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : moodData.length === 0 ? (
          <p>No moods yet. Select one to start!</p>
        ) : (
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `Mood: ${getEmojiForMood(context.parsed.y)} (${context.parsed.y}/5)`,
                  },
                },
              },
              scales: {
                y: {
                  min: 0,
                  max: 5,
                  ticks: {
                    stepSize: 1,
                    callback: (value) => getEmojiForMood(value),
                  },
                },
              },
            }}
          />
        )}
      </div>

      {/* Summary cards */}
      <div className="summary-section">
        <div className="summary-card">
          <h3>📅 Weekly</h3>
          <p>{avgMood(7)}</p>
        </div>
        <div className="summary-card">
          <h3>🗓️ Monthly</h3>
          <p>{avgMood(30)}</p>
        </div>
      </div>
    </div>
  );
}
