import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, RefreshCw, Activity, Calendar, AlertTriangle, Frown } from "lucide-react";
import "../styles/ProgressReport.css";
import BackButton from "../components/BackButton";

export default function ProgressReport() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const userId = localStorage.getItem("sno_userId") || "";
  const API_URL = process.env.REACT_APP_API_BASE || "";

  const fetchInsights = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const base = API_URL || "";
      const url = `${base}/api/ai/progress/${encodeURIComponent(userId)}?days=7`;

      const res = await axios.get(url, { withCredentials: true });

      if (res.data && res.data.ok) {
        setInsights(res.data.insights || null);
      } else {
        setInsights(null);
      }
    } catch (err) {
      console.warn("Failed to fetch progress insights:", err?.message || err);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }, [API_URL, userId]);

  useEffect(() => {
    if (!userId) return;
    fetchInsights();
  }, [userId, fetchInsights]);

  const getTrendIcon = (trend) => {
    if (trend > 0.3) return <TrendingUp size={20} className="trend-up" />;
    if (trend < -0.3) return <TrendingDown size={20} className="trend-down" />;
    return <Minus size={20} className="trend-neutral" />;
  };

  const getTrendLabel = (trend) => {
    if (trend > 0.3) return "Improving";
    if (trend < -0.3) return "Worsening";
    return "Stable";
  };

  const getTrendClass = (trend) => {
    if (trend > 0.3) return "positive";
    if (trend < -0.3) return "negative";
    return "neutral";
  };

  const getMoodEmoji = (avg) => {
    if (avg >= 4) return "😄";
    if (avg >= 3) return "🙂";
    if (avg >= 2) return "😐";
    if (avg >= 1) return "😴";
    return "😢";
  };

  return (
    <div className="progress-container">
      <div className="progress-header">
        <BackButton to="/profile" label="Back" variant="ghost" className="progress-back-btn" />
        <h1>Weekly Progress</h1>
      </div>

      <div className="progress-content">
        {/* Summary Card */}
        <div className="summary-card">
          <div className="card-icon">
            <Calendar size={32} />
          </div>
          <div className="card-content">
            <h2>Weekly Health Summary</h2>
            <p className="card-subtitle">Your mood and wellness insights</p>
          </div>
          <button 
            className="refresh-btn" 
            onClick={fetchInsights} 
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? "spinning" : ""} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-card">
            <div className="spinner"></div>
            <p>Analyzing your data...</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && !insights && (
          <div className="empty-card">
            <Activity size={60} />
            <h3>No Data Available</h3>
            <p>Start logging your moods to see insights here</p>
            <button className="btn btn-primary" onClick={() => navigate("/mood-tracker")}>
              Go to Mood Tracker
            </button>
          </div>
        )}

        {/* Insights */}
        {!loading && insights && (
          <>
            {/* Mood Overview */}
            <div className="mood-overview">
              <div className="mood-score">
                <span className="emoji">{getMoodEmoji(insights.avg)}</span>
                <div className="score-details">
                  <span className="score-value">
                    {insights.avg !== null ? `${Math.round(insights.avg * 10) / 10}` : "N/A"}
                  </span>
                  <span className="score-label">out of 5</span>
                </div>
              </div>
              <div className="mood-stats">
                <div className="stat-item">
                  <span className="stat-label">Data Points</span>
                  <span className="stat-value">{insights.count || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Trend</span>
                  <span className={`stat-value trend ${getTrendClass(insights.trend)}`}>
                    {getTrendIcon(insights.trend)}
                    {getTrendLabel(insights.trend)}
                  </span>
                </div>
              </div>
            </div>

            {/* Worst Day Indicator */}
            {(insights.worstDay || insights.lowestDay) && (
              <div className="worst-day-card">
                <div className="worst-day-icon">
                  <Frown size={28} />
                </div>
                <div className="worst-day-content">
                  <h3>Toughest Day</h3>
                  <p className="worst-day-date">
                    {insights.worstDay?.date || insights.lowestDay?.date}
                  </p>
                  {insights.worstDay?.note && (
                    <p className="worst-day-note">{insights.worstDay.note}</p>
                  )}
                  {insights.lowestDay?.reason && (
                    <p className="worst-day-note">{insights.lowestDay.reason}</p>
                  )}
                </div>
                <div className="worst-day-score">
                  <span className="score">{insights.worstDay?.score !== undefined ? insights.worstDay.score : insights.lowestDay?.score}</span>
                  <span className="label">score</span>
                </div>
              </div>
            )}

            {/* Narrative */}
            {insights.narrative && (
              <div className="narrative-card">
                <h3>Insights</h3>
                {insights.narrative.headline && (
                  <p className="headline">{insights.narrative.headline}</p>
                )}
                {insights.narrative.summary && (
                  <p className="detail">{insights.narrative.summary}</p>
                )}
                {insights.narrative.detail && (
                  <p className="detail">{insights.narrative.detail}</p>
                )}
                {insights.insight && (
                  <p className="detail">{insights.insight}</p>
                )}
                {insights.summary && (
                  <p className="detail">{insights.summary}</p>
                )}
              </div>
            )}

            {/* Additional Insights */}
            {insights.bestDay && (
              <div className="best-day-card">
                <div className="best-day-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="best-day-content">
                  <h3>Best Day</h3>
                  <p className="best-day-date">{insights.bestDay.date}</p>
                  {insights.bestDay.note && (
                    <p className="best-day-note">{insights.bestDay.note}</p>
                  )}
                </div>
              </div>
            )}

            {/* Activity Summary */}
            {insights.totalEntries !== undefined && (
              <div className="activity-summary">
                <div className="activity-item">
                  <span className="activity-value">{insights.totalEntries}</span>
                  <span className="activity-label">Total Entries</span>
                </div>
                {insights.streak !== undefined && (
                  <div className="activity-item">
                    <span className="activity-value">{insights.streak}</span>
                    <span className="activity-label">Day Streak</span>
                  </div>
                )}
                {insights.completionRate !== undefined && (
                  <div className="activity-item">
                    <span className="activity-value">{insights.completionRate}%</span>
                    <span className="activity-label">Completion</span>
                  </div>
                )}
              </div>
            )}

            {/* Keywords */}
            {insights.topKeywords && insights.topKeywords.length > 0 && (
              <div className="keywords-card">
                <h3><AlertTriangle size={18} /> Top Concerns</h3>
                <div className="keywords-list">
                  {insights.topKeywords.map((t, i) => (
                    <div key={i} className="keyword-item">
                      <span className="keyword-text">{t.keyword}</span>
                      <span className="keyword-count">{t.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="recommendations-card">
                <h3>Recommended Actions</h3>
                {insights.recommendations.map((r, i) => (
                  <div key={i} className="recommendation-item">
                    <h4>{r.title}</h4>
                    <p className="reason">{r.reason}</p>
                    {r.tips && r.tips.length > 0 && (
                      <ul className="tips-list">
                        {r.tips.map((tip, ti) => (
                          <li key={ti}>{tip}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Default message if no recommendations */}
            {(!insights.recommendations || insights.recommendations.length === 0) && (
              <div className="tips-card">
                <h3>Tips for Better Wellness</h3>
                <ul>
                  <li>Log your mood daily for better insights</li>
                  <li>Try breathing exercises when feeling stressed</li>
                  <li>Connect with the community for support</li>
                  <li>Use the AI chatbot for guidance</li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
