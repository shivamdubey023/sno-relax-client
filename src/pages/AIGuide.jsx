import React, { useEffect, useState, useRef } from 'react';
import API_BASE from '../config/api.config';
import '../styles/Chatbot.css';

export default function AIGuide() {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const stepTimerRef = useRef(null);
  const userId = localStorage.getItem('sno_userId') || localStorage.getItem('userId') || `guest_${Math.random().toString(36).slice(2,7)}`;

  useEffect(() => {
    fetchGuide();
  }, []);

  const fetchGuide = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/guide`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId })
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.ok) setGuide(data.guide);
    } catch (e) {
      console.error('Failed to fetch guide', e.message);
    } finally {
      setLoading(false);
    }
  };

  const parseDurationSeconds = (stepText) => {
    const mMin = stepText.match(/(\d+)\s*min/);
    if (mMin) return parseInt(mMin[1], 10) * 60;
    const mSec = stepText.match(/(\d+)\s*s(ec)?/);
    if (mSec) return parseInt(mSec[1], 10);
    const mDash = stepText.match(/-\s*(\d+)\s*min/);
    if (mDash) return parseInt(mDash[1], 10) * 60;
    return 10;
  };

  const startRoutine = (routine) => {
    stopRoutine();
    setCurrentRoutine(routine);
    setCurrentStep(0);
    const initial = parseDurationSeconds(routine.steps[0] || '');
    setCountdown(initial);
    stepTimerRef.current = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
  };

  const stopRoutine = () => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
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
        const dur = parseDurationSeconds(currentRoutine.steps[next] || '');
        setCountdown(dur);
      } else {
        stopRoutine();
      }
    }
  }, [countdown]);

  const formatTime = (s) => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>AI Therapist Guide</h1>
      {loading && <p>Generating personalized guide...</p>}
      {guide && (
        <div style={{ marginTop: 12 }}>
          <div style={{ padding: 12, borderRadius: 8, background: guide.level === 'severe' ? '#fff1f2' : '#f0f9ff', color: 'var(--app-foreground, #000)' }}>
            <p style={{ margin: 0, color: 'var(--app-foreground, #000)' }}>{guide.text || guide.summary}</p>
          </div>

          {guide.recommendations && guide.recommendations.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h3>Recommendations</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {guide.recommendations.map((r, idx) => (
                  <div key={idx} style={{ padding: 12, borderRadius: 8, background: '#fff', border: '1px solid #e6e6e6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--app-primary, #667eea)' }}>{r.title || `Routine ${idx+1}`}</strong>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => startRoutine(r)} className="btn small">Start</button>
                      </div>
                    </div>
                    {r.notes && <div style={{ marginTop: 8, color: 'var(--app-foreground, #555)' }}>{r.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentRoutine && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#f9fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Running: {currentRoutine.title || 'Routine'}</strong>
                <div>
                  <button onClick={stopRoutine} className="btn small outline">Stop</button>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 14, color: '#333' }}>Step {currentStep + 1} of {currentRoutine.steps.length}</div>
                <div style={{ marginTop: 6, padding: 10, background: '#fff', borderRadius: 6 }}>{currentRoutine.steps[currentStep]}</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontWeight: 600 }}>{formatTime(countdown)}</div>
                  <div>
                    <button onClick={() => setCountdown(0)} className="btn small">Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
