import React, { useState, useEffect } from 'react';
import API_BASE from '../config/api.config';
import { useNavigate } from 'react-router-dom';
import '../styles/Chatbot.css';

/**
 * AI Mood Guide
 * - Uses last 7 days of mood entries and recent chat messages
 * - Generates a concise, calm suggestion recommending ONE or TWO wellness categories
 * - Records simple accept/skip actions in localStorage to adapt next time
 */
export default function AIGuide() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]); // e.g. ['Breathing','Meditation']
  const [lastAction, setLastAction] = useState(null);
  const navigate = useNavigate();

  const userId =
    localStorage.getItem('sno_userId') ||
    localStorage.getItem('userId') ||
    `guest_${Math.random().toString(36).slice(2, 7)}`;

  useEffect(() => {
    generateGuide();
    // read lastAction
    const la = localStorage.getItem('aiGuide_lastAction');
    if (la) setLastAction(la);
  }, []);

  const fetchMoods = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mood/${encodeURIComponent(userId)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.moods || [];
    } catch (e) {
      console.warn('Failed to fetch moods', e.message);
      return null;
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/private/messages?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch (e) {
      console.warn('Failed to fetch messages', e.message);
      return [];
    }
  };

  const generateGuide = async () => {
    setLoading(true);
    try {
      const [moods, messages] = await Promise.all([fetchMoods(), fetchMessages()]);

      // keep only last 7 days' mood entries
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      const last7 = (moods || []).filter((m) => new Date(m.date).getTime() >= sevenDaysAgo);

      if (!last7 || last7.length === 0) {
        setMessage('No mood records found for the past week. Try logging moods for clearer guidance.');
        setCategories(['Breathing']);
        return;
      }

      const values = last7.map((m) => Number(m.mood));
      const avg = values.reduce((s, x) => s + x, 0) / values.length;

      // simple trend: compare average first half vs second half
      const mid = Math.floor(values.length / 2) || 1;
      const firstAvg = values.slice(0, mid).reduce((s, x) => s + x, 0) / Math.max(1, mid);
      const lastAvg = values.slice(mid).reduce((s, x) => s + x, 0) / Math.max(1, values.length - mid);
      const trend = lastAvg - firstAvg; // positive = improving

      // fluctuation (std dev)
      const mean = avg;
      const variance = values.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / values.length;
      const stddev = Math.sqrt(variance);

      // detect keywords in recent messages
      const text = messages.map((m) => (m.message || '')).join(' ').toLowerCase();
      const has = (arr) => arr.some((k) => text.includes(k));
      const stressKeywords = ['stress', 'stressed', 'anxiety', 'anxious', 'overwhelm'];
      const sadnessKeywords = ['sad', 'down', 'depressed', 'hopeless'];
      const angerKeywords = ['angry', 'mad', 'frustrat', 'irritat'];
      const fatigueKeywords = ['tired', 'exhaust', 'fatigue', 'sleep'];

      const stress = has(stressKeywords);
      const sadness = has(sadnessKeywords);
      const anger = has(angerKeywords);
      const fatigue = has(fatigueKeywords);

      // decide suggestion categories (max 2)
      let picks = [];

      if (stress || (trend < -0.3 && stddev > 0.8)) {
        picks = ['Breathing', 'Meditation'];
      } else if (fatigue) {
        picks = ['Stretching', 'Exercise'];
      } else if (sadness || trend < -0.3) {
        picks = ['Meditation', 'Breathing'];
      } else if (anger) {
        picks = ['Breathing'];
      } else if (stddev > 1.0) {
        picks = ['Breathing', 'Meditation'];
      } else {
        // stable or improving
        picks = ['Breathing'];
      }

      // adapt based on lastAction (if user repeatedly skips a category, deprioritize)
      const lastSkipped = localStorage.getItem('aiGuide_lastSkipped');
      if (lastSkipped) {
        picks = picks.filter((p) => p !== lastSkipped);
        if (picks.length === 0) picks = ['Breathing'];
      }

      // build short message
      let lead = '';
      if (stress) lead = 'Your stress-related messages and recent entries suggest higher stress this week.';
      else if (fatigue) lead = 'Recent messages and mood entries suggest low energy.';
      else if (sadness) lead = 'Recent entries show some sadness or low mood.';
      else if (trend < -0.3) lead = 'Your mood trend has been slightly worse this week.';
      else if (trend > 0.3) lead = 'Your mood trend appears to be improving.';
      else if (stddev > 1.0) lead = 'There has been emotional fluctuation over the past week.';
      else lead = 'Your mood has been fairly stable recently.';

      const suggestionLine = picks.length === 1
        ? `${picks[0]} sessions may help today.`
        : `${picks[0]} or ${picks[1]} sessions may help today.`;

      setMessage(`${lead} ${suggestionLine} You can choose any activity you prefer.`);
      setCategories(picks.slice(0, 2));
    } catch (e) {
      console.error('Failed to generate guide:', e.message || e);
      setMessage('Unable to generate a guide right now. Try again later.');
      setCategories(['Breathing']);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (category) => {
    // record acceptance so future suggestions can adapt
    localStorage.setItem('aiGuide_lastAction', 'accepted');
    localStorage.setItem('aiGuide_lastAccepted', category);
    setLastAction('accepted');
    // navigate to the Health Vault where fixed sessions exist
    navigate(`/health-vault?category=${encodeURIComponent(category)}`);
  };

  const handleSkip = () => {
    // record last skipped category
    if (categories && categories.length) {
      localStorage.setItem('aiGuide_lastSkipped', categories[0]);
    }
    localStorage.setItem('aiGuide_lastAction', 'skipped');
    setLastAction('skipped');
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>AI Mood Guide</h1>

      {loading && <p>Checking your recent mood data...</p>}

      {!loading && (
        <div style={{ padding: 12, background: '#f7fbfc', borderRadius: 8 }}>
          <p style={{ margin: 0 }}>{message}</p>

          {categories && categories.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {categories.map((c) => (
                <button
                  key={c}
                  style={{ marginRight: 8 }}
                  onClick={() => handleAccept(c)}
                >
                  Try {c}
                </button>
              ))}

              <button onClick={handleSkip} style={{ marginLeft: 6 }}>
                Skip for now
              </button>
            </div>
          )}

          {lastAction && (
            <p style={{ marginTop: 8, fontSize: 13, color: '#555' }}>
              Last action recorded: {lastAction}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
