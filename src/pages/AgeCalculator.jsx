import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

export default function AgeCalculator() {
  const [activeTab, setActiveTab] = useState('age');
  // Age tab
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState(null);
  // Countdown tab
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [countdown, setCountdown] = useState(null);
  const intervalRef = useRef(null);

  const calculate = () => {
    if (!dob) return;
    const birth = new Date(dob);
    const target = new Date(targetDate);
    if (birth >= target) return;
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();
    if (days < 0) { months--; const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0); days += prevMonth.getDate(); }
    if (months < 0) { years--; months += 12; }
    const totalDays = Math.floor((target - birth) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    let nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= target) nextBirthday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate());
    const daysUntilBirthday = Math.floor((nextBirthday - target) / (1000 * 60 * 60 * 24));
    const dayOfWeek = birth.toLocaleDateString('en-US', { weekday: 'long' });
    setResult({ years, months, days, totalDays, totalWeeks, totalHours, totalMinutes, daysUntilBirthday, dayOfWeek, nextBirthdayAge: years + 1 });
  };

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
    if (activeTab !== 'countdown') return;
    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalRef.current);
  }, [eventDate, activeTab]);

  return (
    <div className="tool-page">
      <SEOHead title="Age Calculator & Event Countdown" description="Calculate your exact age and create live countdowns to important events." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Age Calculator</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-cake-candles" style={{ color: 'var(--accent-purple-light)' }}></i> Age Calculator & Countdown Timer
        </h1>
        <p>Calculate your exact age and create live countdown timers for events.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab-btn ${activeTab === 'age' ? 'active' : ''}`} onClick={() => setActiveTab('age')}>
              <i className="fa-solid fa-cake-candles" style={{ marginRight: '6px' }}></i> Age Calculator
            </button>
            <button className={`tab-btn ${activeTab === 'countdown' ? 'active' : ''}`} onClick={() => setActiveTab('countdown')}>
              <i className="fa-solid fa-hourglass-half" style={{ marginRight: '6px' }}></i> Event Countdown
            </button>
          </div>

          <div className="glass-card">
            {activeTab === 'age' && (
              <>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input className="form-input" type="date" value={dob} onChange={e => setDob(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Calculate Age On</label>
                    <input className="form-input" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                  </div>
                </div>
                <button className="btn btn-primary btn-lg w-full" onClick={calculate} style={{ gap: '8px' }}>
                  <i className="fa-solid fa-cake-candles"></i> Calculate Age
                </button>
                {result && (
                  <>
                    <div className="result-box mt-2 text-center">
                      <div className="result-label">Your Age</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1rem, 5vw, 2rem)', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                        {[['Years', result.years], ['Months', result.months], ['Days', result.days]].map(([label, val]) => (
                          <div key={label}>
                            <div className="result-value">{val}</div>
                            <div className="result-sub">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="stats-grid mt-2">
                      <div className="stat-card"><div className="stat-card-value">{result.totalDays.toLocaleString()}</div><div className="stat-card-label">Total Days</div></div>
                      <div className="stat-card"><div className="stat-card-value">{result.totalWeeks.toLocaleString()}</div><div className="stat-card-label">Total Weeks</div></div>
                      <div className="stat-card"><div className="stat-card-value">{result.totalHours.toLocaleString()}</div><div className="stat-card-label">Total Hours</div></div>
                      <div className="stat-card"><div className="stat-card-value">{result.totalMinutes.toLocaleString()}</div><div className="stat-card-label">Total Minutes</div></div>
                    </div>
                    <div className="grid-2 mt-2">
                      <div className="result-box text-center" style={{ marginTop: 0 }}>
                        <div className="result-label">🎉 Next Birthday In</div>
                        <div className="result-value" style={{ color: 'var(--accent-pink)' }}>{result.daysUntilBirthday}</div>
                        <div className="result-sub">days (turning {result.nextBirthdayAge})</div>
                      </div>
                      <div className="result-box text-center" style={{ marginTop: 0 }}>
                        <div className="result-label">📅 Born On</div>
                        <div className="result-value result-value-sm" style={{ color: 'var(--accent-cyan)' }}>{result.dayOfWeek}</div>
                        <div className="result-sub">Day of the week</div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === 'countdown' && (
              <>
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
                  <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    {eventName && <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-cyan-light)', marginBottom: '1rem' }}>⏳ {eventName}</div>}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      {[['Days', countdown.days, '#3b82f6'], ['Hours', countdown.hours, '#d946ef'], ['Minutes', countdown.minutes, '#10b981'], ['Seconds', countdown.seconds, '#f59e0b']].map(([label, val, color]) => (
                        <div key={label} style={{ textAlign: 'center', minWidth: '90px', padding: '1.25rem', background: 'var(--bg-input)', borderRadius: '16px', border: `2px solid ${color}33` }}>
                          <div style={{ fontSize: '2.5rem', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{String(val).padStart(2, '0')}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {countdown?.passed && (
                  <div className="result-box mt-2 text-center">
                    <i className="fa-solid fa-party-horn" style={{ fontSize: '2rem', color: 'var(--accent-green)', marginBottom: '0.5rem', display: 'block' }}></i>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '1.1rem' }}>
                      {eventName ? `"${eventName}" has already passed!` : 'This event has already passed!'}
                    </div>
                  </div>
                )}

                {!countdown && (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-hourglass" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}></i>
                    Enter an event date above to start the countdown timer.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
