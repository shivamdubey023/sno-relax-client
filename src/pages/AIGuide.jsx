import React, { useState, useEffect } from 'react';
import API_BASE from '../config/api.config';
import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, Activity, Wind, Heart, X, ChevronRight, RefreshCw, Coffee } from "lucide-react";
import "../styles/AIGuide.css";

export default function AIGuide() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const userId =
    localStorage.getItem('sno_userId') ||
    localStorage.getItem('userId') ||
    `guest_${Math.random().toString(36).slice(2, 7)}`;

  useEffect(() => {
    generateGuide();
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

      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      const last7 = (moods || []).filter((m) => new Date(m.date).getTime() >= sevenDaysAgo);

      if (!last7 || last7.length === 0) {
        setMessage('Start logging your mood to get personalized recommendations. Regular tracking helps us understand your patterns better.');
        setCategories(['Breathing', 'Meditation']);
        return;
      }

      const values = last7.map((m) => Number(m.mood));
      const avg = values.reduce((s, x) => s + x, 0) / values.length;

      const mid = Math.floor(values.length / 2) || 1;
      const firstAvg = values.slice(0, mid).reduce((s, x) => s + x, 0) / Math.max(1, mid);
      const lastAvg = values.slice(mid).reduce((s, x) => s + x, 0) / Math.max(1, values.length - mid);
      const trend = lastAvg - firstAvg;

      const variance = values.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / values.length;
      const stddev = Math.sqrt(variance);
      const mean = avg;

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

      let picks = [];

      if (stress || (trend < -0.3 && stddev > 0.8)) {
        picks = ['Breathing', 'Meditation'];
      } else if (fatigue) {
        picks = ['Exercise', 'Stretching'];
      } else if (sadness || trend < -0.3) {
        picks = ['Meditation', 'Breathing'];
      } else if (anger) {
        picks = ['Breathing'];
      } else if (stddev > 1.0) {
        picks = ['Breathing', 'Meditation'];
      } else {
        picks = ['Breathing'];
      }

      const lastSkipped = localStorage.getItem('aiGuide_lastSkipped');
      if (lastSkipped) {
        picks = picks.filter((p) => p !== lastSkipped);
        if (picks.length === 0) picks = ['Breathing'];
      }

      let lead = '';
      if (stress) lead = 'Your recent conversations suggest elevated stress levels.';
      else if (fatigue) lead = 'Your messages indicate feelings of low energy and fatigue.';
      else if (sadness) lead = 'There are signs of sadness or low mood in your recent entries.';
      else if (trend < -0.3) lead = 'Your mood has been trending downward this week.';
      else if (trend > 0.3) lead = 'Great news! Your mood is showing positive improvement.';
      else if (stddev > 1.0) lead = 'Your emotions have been fluctuating quite a bit lately.';
      else lead = 'Your mood has been relatively stable recently.';

      const suggestionLine = picks.length === 1
        ? `${picks[0]} exercises could be particularly helpful today.`
        : `${picks[0]} or ${picks[1]} exercises may benefit you today.`;

      setMessage(`${lead} ${suggestionLine} Choose an activity that resonates with you.`);
      setCategories(picks.slice(0, 2));
    } catch (e) {
      console.error('Failed to generate guide:', e.message || e);
      setMessage('Unable to generate personalized recommendations right now. Please try again later.');
      setCategories(['Breathing']);
    } finally {
      setLoading(false);
    }
  };

  const SESSIONS = {
    Breathing: [
      { id: 'box-breathing', title: 'Box Breathing', duration: '4 min', steps: ['Inhale for 4 seconds', 'Hold for 4 seconds', 'Exhale for 4 seconds', 'Hold for 4 seconds', 'Repeat 6 times'] },
      { id: '4-7-8', title: '4-7-8 Relaxation', duration: '5 min', steps: ['Inhale quietly through nose for 4 seconds', 'Hold breath for 7 seconds', 'Exhale completely through mouth for 8 seconds', 'Repeat 4 times'] },
    ],
    Meditation: [
      { id: 'body-scan', title: 'Body Scan', duration: '6 min', steps: ['Close eyes and relax', 'Focus attention on toes', 'Slowly move awareness up through body', 'Notice any tension and breathe into it', 'Release tension as you exhale'] },
      { id: 'mindful-breathing', title: 'Mindful Breathing', duration: '5 min', steps: ['Sit comfortably', 'Focus on natural breath', 'Notice the sensation of breathing', 'When mind wanders, gently return focus', 'End with 3 deep breaths'] },
    ],
    Exercise: [
      { id: 'quick-circuit', title: 'Quick Energy Boost', duration: '8 min', steps: ['Jumping jacks - 1 min', 'Bodyweight squats - 2 min', 'Push-ups - 2 min', 'Plank hold - 1 min', 'Cool down stretches - 2 min'] },
    ],
    Stretching: [
      { id: 'morning-stretch', title: 'Morning Stretch', duration: '6 min', steps: ['Neck rolls - 30s', 'Shoulder stretches - 1 min', 'Side stretches - 1 min', 'Forward fold - 1 min', 'Hip circles - 1 min', 'Ankle rotations - 30s'] },
    ],
  };

  const stepTimerRef = React.useRef(null);

  const parseDurationSeconds = (text) => {
    const min = text.match(/(\d+)\s*min/);
    if (min) return parseInt(min[1], 10) * 60;
    const sec = text.match(/(\d+)\s*s(ec)?/);
    if (sec) return parseInt(sec[1], 10);
    return 30;
  };

  const openRoutine = (category) => {
    const routines = SESSIONS[category] || SESSIONS['Breathing'];
    const session = routines[0];
    setCurrentRoutine(session);
    setCurrentStep(0);
    const d = parseDurationSeconds(session.steps[0]);
    setCountdown(d);
    setShowRoutineModal(true);

    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    stepTimerRef.current = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
  };

  const stopRoutine = () => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    setShowRoutineModal(false);
    setCurrentRoutine(null);
    setCurrentStep(0);
    setCountdown(0);
  };

  useEffect(() => {
    if (!currentRoutine) return;
    if (countdown === 0) {
      const next = currentStep + 1;
      if (next < (currentRoutine.steps || []).length) {
        setCurrentStep(next);
        const d = parseDurationSeconds(currentRoutine.steps[next]);
        setCountdown(d);
      } else {
        stopRoutine();
      }
    }
  }, [countdown, currentRoutine, currentStep]);

  const handleAccept = (category) => {
    localStorage.setItem('aiGuide_lastAction', 'accepted');
    localStorage.setItem('aiGuide_lastAccepted', category);
    setLastAction('accepted');
    openRoutine(category);
  };

  const handleSkip = () => {
    if (categories && categories.length) {
      localStorage.setItem('aiGuide_lastSkipped', categories[0]);
    }
    localStorage.setItem('aiGuide_lastAction', 'skipped');
    setLastAction('skipped');
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Breathing': return <Wind size={20} />;
      case 'Meditation': return <Brain size={20} />;
      case 'Exercise': return <Activity size={20} />;
      case 'Stretching': return <Heart size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  return (
    <div className="ai-guide-container">
      <div className="ai-guide-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1><Sparkles size={24} /> AI Wellness Guide</h1>
      </div>

      <div className="ai-guide-content">
        {/* Main Card */}
        <div className="guide-card">
          <div className="guide-icon">
            <Brain size={40} />
          </div>
          <h2>Your Personalized Recommendations</h2>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing your mood patterns...</p>
            </div>
          ) : (
            <>
              <p className="guide-message">{message}</p>

              {categories.length > 0 && (
                <div className="category-options">
                  <p className="options-label">Recommended activities:</p>
                  <div className="options-grid">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        className="category-btn"
                        onClick={() => handleAccept(cat)}
                      >
                        {getCategoryIcon(cat)}
                        <span>{cat}</span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="guide-actions">
                <button className="btn btn-secondary" onClick={handleSkip}>
                  Skip for now
                </button>
                <button className="btn btn-icon" onClick={generateGuide} disabled={loading}>
                  <RefreshCw size={18} />
                </button>
              </div>

              {lastAction && (
                <p className="last-action">
                  Previous action: {lastAction === 'accepted' ? 'Started activity' : 'Skipped'}
                </p>
              )}
            </>
          )}
        </div>

        {/* Quick Tips */}
        <div className="tips-section">
          <h3>Daily Wellness Tips</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <Coffee size={24} />
              <p>Take regular breaks throughout the day</p>
            </div>
            <div className="tip-card">
              <Wind size={24} />
              <p>Practice deep breathing when feeling anxious</p>
            </div>
            <div className="tip-card">
              <Heart size={24} />
              <p>Stay connected with supportive people</p>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Modal */}
      {showRoutineModal && currentRoutine && (
        <div className="routine-modal">
          <div className="routine-content">
            <button className="close-btn" onClick={stopRoutine}>
              <X size={24} />
            </button>
            
            <div className="routine-header">
              <h2>{currentRoutine.title}</h2>
              <span className="routine-duration">{currentRoutine.duration}</span>
            </div>

            <div className="routine-progress">
              <span>Step {currentStep + 1} of {currentRoutine.steps.length}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentStep + 1) / currentRoutine.steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="current-step">
              <p>{currentRoutine.steps[currentStep]}</p>
            </div>

            <div className="timer-display">
              <span className="timer-value">
                {Math.floor(countdown / 60).toString().padStart(2, '0')}:
                {String(countdown % 60).padStart(2, '0')}
              </span>
            </div>

            <div className="routine-controls">
              <button className="btn btn-primary" onClick={() => setCountdown(0)}>
                Next Step
              </button>
              <button className="btn btn-secondary" onClick={stopRoutine}>
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
