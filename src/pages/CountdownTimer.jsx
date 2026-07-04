import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function CountdownTimer() {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [countdown, setCountdown] = useState(null);
  const intervalRef = useRef(null);

  const updateCountdown = () => {
    if (!eventDate) { setCountdown(null); return; }
    const now = new Date();
    const target = new Date(eventDate);
    const diff = target - now;
    if (diff <= 0) { setCountdown({ passed: true }); return; }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setCountdown({ days, hours, minutes, seconds, passed: false });
  };

  useEffect(() => {
    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalRef.current);
  }, [eventDate]);

  return (
    <div className="tool-page">
      <SEOHead title="Event Countdown Timer" description="Create a live second-by-second countdown timer for birthdays, holidays, deadlines, or launch events." />
      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Countdown Timer</span>
        </div>
        <h1>
          <i className="fa-solid fa-hourglass-half" style={{ color: 'var(--accent-purple-light)' }}></i> Event Countdown Timer
        </h1>
        <p>Set a custom countdown timer for your upcoming events.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Event Name (optional)</label>
                <input className="form-input" type="text" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. New Year's Eve" />
              </div>
              <div className="form-group">
                <label className="form-label">Event Date & Time</label>
                <input className="form-input" type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              </div>
            </div>

            {countdown && !countdown.passed && (
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                {eventName && <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan-light)', marginBottom: '1.25rem' }}>⏳ {eventName}</div>}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {[
                    ['Days', countdown.days, '#3b82f6'],
                    ['Hours', countdown.hours, '#d946ef'],
                    ['Minutes', countdown.minutes, '#10b981'],
                    ['Seconds', countdown.seconds, '#f59e0b']
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ textAlign: 'center', minWidth: '100px', padding: '1.25rem', background: 'var(--bg-input)', borderRadius: '16px', border: `2px solid ${color}33`, boxShadow: 'var(--shadow-md)' }}>
                      <div style={{ fontSize: '3rem', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                        {String(val).padStart(2, '0')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {countdown?.passed && (
              <div className="result-box mt-2 text-center" style={{ padding: '2rem' }}>
                <i className="fa-solid fa-cake-candles" style={{ fontSize: '2.5rem', color: 'var(--accent-green)', marginBottom: '0.5rem', display: 'block' }}></i>
                <div style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '1.25rem' }}>
                  {eventName ? `"${eventName}" has already passed!` : 'This event has already passed!'}
                </div>
              </div>
            )}

            {!countdown && (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-hourglass" style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block' }}></i>
                Enter an event date and time above to start the countdown.
              </div>
            )}
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Live Event Countdown Timer — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
