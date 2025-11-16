import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ProgressReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const userId = localStorage.getItem('sno_userId') || '';
  const API_URL = process.env.REACT_APP_API_BASE || '';

  useEffect(() => {
    if (!userId) return;
    fetchInsights();
    // eslint-disable-next-line
  }, [userId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const base = API_URL || '';
      const url = `${base}/api/ai/progress/${encodeURIComponent(userId)}?days=7`;
      const res = await axios.get(url, { withCredentials: true });
      if (res.data && res.data.ok) {
        setInsights(res.data.insights || null);
      } else {
        setInsights(null);
      }
    } catch (err) {
      console.warn('Failed to fetch progress insights:', err.message || err);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  const summaryText = () => {
    if (!insights) return 'No mood records for the week.';
    const { avg, count, trend, narrative } = insights;
    if (avg === null) return narrative?.detail || 'No mood entries for this period.';
    const avgRounded = Math.round(avg * 10) / 10;
    const trendLabel = trend > 0.3 ? 'improving' : (trend < -0.3 ? 'worsening' : 'stable');
    return `${narrative?.headline || ''} — ${narrative?.detail || ''} Top issues: ${insights.topKeywords && insights.topKeywords.length ? insights.topKeywords.map(t=>t.keyword).join(', ') : 'None detected.'}`;
  };

  return (
    <div className="profile-container">
      <div className="profile-topbar">
        <button className="back-btn" onClick={() => navigate('/profile')}>← Back</button>
        <span className="profile-app-title">Weekly Progress Report</span>
      </div>

      <div className="profile-card">
        <h3>Weekly Health Summary</h3>
        {loading && <p>Loading...</p>}
        {!loading && !insights && <p>No mood records available. Try logging moods during chat or using the mood tracker.</p>}
        {!loading && insights && (
          <div>
            <p style={{ fontWeight: 600 }}>{summaryText()}</p>

            <h4 style={{ marginTop: 12 }}>Key Insights</h4>
            <p><strong>Average mood:</strong> {insights.avg !== null ? (Math.round(insights.avg*10)/10) + ' / 5' : 'N/A'}</p>
            <p><strong>Data points:</strong> {insights.count}</p>
            <p><strong>Trend:</strong> {insights.trend > 0.3 ? 'Improving' : (insights.trend < -0.3 ? 'Worsening' : 'Stable')}</p>

            <h4 style={{ marginTop: 12 }}>Top Reported Concerns (from chat)</h4>
            {insights.topKeywords && insights.topKeywords.length ? (
              <ul>
                {insights.topKeywords.map((t, i) => (
                  <li key={i}>{t.keyword} (mentioned {t.count} time{t.count>1?'s':''})</li>
                ))}
              </ul>
            ) : <p>None detected.</p>}

            <h4 style={{ marginTop: 12 }}>Recommended Actions</h4>
            {insights.recommendations && insights.recommendations.length ? (
              <div>
                {insights.recommendations.map((r, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <p style={{ margin: 0 }}><strong>{r.title}</strong> — {r.reason}</p>
                    <ul>
                      {r.tips.map((tip, ti) => <li key={ti}>{tip}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            ) : <p>Keep monitoring and log more entries for better suggestions.</p>}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button className="upload-btn" onClick={fetchInsights}>Refresh</button>
        </div>
      </div>
    </div>
  );
}
