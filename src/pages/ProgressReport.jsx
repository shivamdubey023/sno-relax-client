import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * ProgressReport
 * ---------------
 * Displays AI-generated weekly health & mood insights for the logged-in user.
 * Data is fetched from the backend based on userId and last 7 days.
 */
export default function ProgressReport() {
  const navigate = useNavigate();

  // UI state
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  // User + API configuration
  const userId = localStorage.getItem("sno_userId") || "";
  const API_URL = process.env.REACT_APP_API_BASE || "";

  /**
   * Fetch weekly progress insights from server
   */
  const fetchInsights = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const base = API_URL || "";
      const url = `${base}/api/ai/progress/${encodeURIComponent(userId)}?days=7`;

      const res = await axios.get(url, {
        withCredentials: true,
      });

      if (res.data && res.data.ok) {
        setInsights(res.data.insights || null);
      } else {
        setInsights(null);
      }
    } catch (err) {
      console.warn(
        "Failed to fetch progress insights:",
        err?.message || err
      );
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }, [API_URL, userId]);

  /**
   * Fetch insights on mount or when userId changes
   */
  useEffect(() => {
    if (!userId) return;
    fetchInsights();
  }, [userId, fetchInsights]);

  /**
   * Generate readable summary text from insights
   */
  const summaryText = () => {
    if (!insights) return "No mood records for the week.";

    const { avg, trend, narrative, topKeywords } = insights;

    if (avg === null) {
      return narrative?.detail || "No mood entries for this period.";
    }

    const trendLabel =
      trend > 0.3
        ? "improving"
        : trend < -0.3
        ? "worsening"
        : "stable";

    const keywords =
      topKeywords && topKeywords.length
        ? topKeywords.map((t) => t.keyword).join(", ")
        : "None detected";

    return `${narrative?.headline || ""} — ${
      narrative?.detail || ""
    } Overall trend is ${trendLabel}. Top issues: ${keywords}.`;
  };

  return (
    <div className="profile-container">
      {/* Top Bar */}
      <div className="profile-topbar">
        <button
          className="back-btn"
          onClick={() => navigate("/profile")}
          aria-label="Back to Profile"
        >
          ← Back
        </button>
        <span className="profile-app-title">
          Weekly Progress Report
        </span>
      </div>

      {/* Main Card */}
      <div className="profile-card">
        <h3>Weekly Health Summary</h3>

        {loading && <p>Loading insights...</p>}

        {!loading && !insights && (
          <p>
            No mood records available. Try logging moods using
            the chatbot or mood tracker.
          </p>
        )}

        {!loading && insights && (
          <div>
            <p style={{ fontWeight: 600 }}>{summaryText()}</p>

            {/* Key Metrics */}
            <h4 style={{ marginTop: 12 }}>Key Insights</h4>
            <p>
              <strong>Average mood:</strong>{" "}
              {insights.avg !== null
                ? `${Math.round(insights.avg * 10) / 10} / 5`
                : "N/A"}
            </p>
            <p>
              <strong>Data points:</strong> {insights.count}
            </p>
            <p>
              <strong>Trend:</strong>{" "}
              {insights.trend > 0.3
                ? "Improving"
                : insights.trend < -0.3
                ? "Worsening"
                : "Stable"}
            </p>

            {/* Keywords */}
            <h4 style={{ marginTop: 12 }}>
              Top Reported Concerns (from chat)
            </h4>
            {insights.topKeywords && insights.topKeywords.length ? (
              <ul>
                {insights.topKeywords.map((t, i) => (
                  <li key={i}>
                    {t.keyword} (mentioned {t.count} time
                    {t.count > 1 ? "s" : ""})
                  </li>
                ))}
              </ul>
            ) : (
              <p>None detected.</p>
            )}

            {/* Recommendations */}
            <h4 style={{ marginTop: 12 }}>Recommended Actions</h4>
            {insights.recommendations &&
            insights.recommendations.length ? (
              <div>
                {insights.recommendations.map((r, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <p style={{ margin: 0 }}>
                      <strong>{r.title}</strong> — {r.reason}
                    </p>
                    <ul>
                      {r.tips.map((tip, ti) => (
                        <li key={ti}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p>
                Keep monitoring and log more entries for
                better suggestions.
              </p>
            )}
          </div>
        )}

        {/* Refresh */}
        <div style={{ marginTop: 12 }}>
          <button
            className="upload-btn"
            onClick={fetchInsights}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
