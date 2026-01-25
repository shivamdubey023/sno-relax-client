import React, { useState, useEffect, useRef } from 'react';
import API_BASE from '../config/api.config';
import '../styles/Chatbot.css';

export default function AIGuide() {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const stepTimerRef = useRef(null);

  const userId =
    localStorage.getItem('sno_userId') ||
    localStorage.getItem('userId') ||
    `guest_${Math.random().toString(36).slice(2, 7)}`;

  useEffect(() => {
    fetchGuide();
  }, []);

  const fetchGuide = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
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

  const parseDurationSeconds = (text) => {
    const min = text.match(/(\d+)\s*min/);
    if (min) return parseInt(min[1], 10) * 60;

    const sec = text.match(/(\d+)\s*s(ec)?/);
    if (sec) return parseInt(sec[1], 10);

    return 10;
  };

  const startRoutine = (routine) => {
    stopRoutine();
    setCurrentRoutine(routine);
    setCurrentStep(0);

    const duration = parseDurationSeconds(routine.steps[0] || '');
    setCountdown(duration);

    stepTimerRef.current = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
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
      const nextStep = currentStep + 1;

      if (nextStep < currentRoutine.steps.length) {
        setCurrentStep(nextStep);
        setCountdown(parseDurationSeconds(currentRoutine.steps[nextStep]));
      } else {
        stopRoutine();
      }
    }
  }, [countdown, currentRoutine, currentStep]);

  const formatTime = (s) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>AI Therapist Guide</h1>

      {loading && <p>Generating personalized guide...</p>}

      {guide && (
        <>
          <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8 }}>
            <p>{guide.text || guide.summary}</p>
          </div>

          {guide.recommendations?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h3>Recommendations</h3>
              {guide.recommendations.map((r, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <strong>{r.title}</strong>
                  <p>{r.notes}</p>
                  <button onClick={() => startRoutine(r)}>Start</button>
                </div>
              ))}
            </div>
          )}

          {currentRoutine && (
            <div style={{ marginTop: 12 }}>
              <h4>{currentRoutine.title}</h4>
              <p>
                Step {currentStep + 1} / {currentRoutine.steps.length}
              </p>
              <p>{currentRoutine.steps[currentStep]}</p>
              <strong>{formatTime(countdown)}</strong>
              <div>
                <button onClick={() => setCountdown(0)}>Next</button>
                <button onClick={stopRoutine}>Stop</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
