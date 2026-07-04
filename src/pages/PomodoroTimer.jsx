import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';

const MODES = { work: 'Work', short: 'Short Break', long: 'Long Break' };

export default function PomodoroTimer() {
  const [durations, setDurations] = useState({ work: 25, short: 5, long: 15 });
  const [mode, setMode] = useState('work');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const totalSeconds = durations[mode] * 60;
  const progress = secondsLeft / totalSeconds;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      [0, 0.15, 0.30].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.12);
      });
    } catch { /* AudioContext not supported */ }
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setSecondsLeft(durations[mode] * 60);
  }, [stop, durations, mode]);

  const switchMode = useCallback((newMode) => {
    stop();
    setMode(newMode);
    setSecondsLeft(durations[newMode] * 60);
  }, [stop, durations]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          playBeep();
          if (mode === 'work') setSessions(s => s + 1);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${MODES[mode]} session complete! 🎉`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, mode, playBeep]);

  // Update title
  useEffect(() => {
    document.title = running ? `${formatTime(secondsLeft)} — ${MODES[mode]}` : 'Pomodoro Timer — ToolBox Hub';
    return () => { document.title = 'ToolBox Hub'; };
  }, [secondsLeft, running, mode]);

  const requestNotifications = () => {
    if ('Notification' in window) Notification.requestPermission();
  };

  const modeColors = { work: '#3b82f6', short: '#10b981', long: '#d946ef' };

  return (
    <div className="tool-page">
      <SEOHead title="Pomodoro Focus Timer" description="Stay productive with the Pomodoro technique. Animated timer with audio alerts and session tracking." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Pomodoro Timer</span></div>
        <h1><i className="fa-solid fa-clock" style={{ color: 'var(--accent-purple-light)' }}></i> Pomodoro Focus Timer</h1>
        <p>Boost productivity with timed work and break cycles.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card" style={{ textAlign: 'center' }}>
            {/* Mode Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {Object.entries(MODES).map(([key, label]) => (
                <button key={key} onClick={() => switchMode(key)}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600, border: `2px solid ${mode === key ? modeColors[key] : 'var(--border-color)'}`, background: mode === key ? `${modeColors[key]}22` : 'var(--bg-input)', color: mode === key ? modeColors[key] : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* SVG Ring Timer */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <svg width="220" height="220" viewBox="0 0 220 220">
                <circle cx="110" cy="110" r={radius} fill="none" stroke="var(--bg-input)" strokeWidth="12" />
                <circle cx="110" cy="110" r={radius} fill="none" stroke={modeColors[mode]} strokeWidth="12"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  strokeLinecap="round" transform="rotate(-90 110 110)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s' }} />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '2.8rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)', lineHeight: 1 }}>
                  {formatTime(secondsLeft)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {MODES[mode]}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setRunning(r => !r)} style={{ minWidth: '120px', gap: '8px', fontSize: '1rem' }}>
                <i className={`fa-solid ${running ? 'fa-pause' : 'fa-play'}`}></i>
                {running ? 'Pause' : 'Start'}
              </button>
              <button className="btn btn-secondary" onClick={reset} style={{ gap: '8px' }}>
                <i className="fa-solid fa-rotate-left"></i> Reset
              </button>
              <button className="btn btn-secondary" onClick={() => setShowSettings(s => !s)} style={{ gap: '8px' }}>
                <i className="fa-solid fa-sliders"></i> Settings
              </button>
            </div>

            {/* Session counter */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Completed sessions:</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Array.from({ length: Math.max(4, sessions) }).map((_, i) => (
                  <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: i < sessions ? modeColors['work'] : 'var(--bg-input)', border: `2px solid ${i < sessions ? modeColors['work'] : 'var(--border-color)'}`, transition: 'all 0.3s' }}></div>
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sessions}</span>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div style={{ padding: '1.25rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'left', marginTop: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Timer Durations (minutes)</h3>
                <div className="grid-2" style={{ gap: '0.75rem' }}>
                  {[['work', 'Work Session'], ['short', 'Short Break'], ['long', 'Long Break']].map(([key, label]) => (
                    <div key={key} className="form-group">
                      <label className="form-label">{label}</label>
                      <input type="number" min="1" max="120" value={durations[key]}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setDurations(prev => ({ ...prev, [key]: val }));
                          if (key === mode) { stop(); setSecondsLeft(val * 60); }
                        }}
                        style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm mt-1" onClick={requestNotifications} style={{ gap: '6px' }}>
                  <i className="fa-solid fa-bell"></i> Enable Browser Notifications
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
