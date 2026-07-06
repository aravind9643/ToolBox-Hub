import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function CountdownTimer() {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [alarmSound, setAlarmSound] = useState('chime'); // 'chime' | 'digital' | 'ring'
  
  const intervalRef = useRef(null);
  const alertPlayedRef = useRef(false);

  const playAlertSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (type === 'chime') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.6);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.6);
        });
      } else if (type === 'digital') {
        [0, 0.22, 0.44].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(987.77, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.001, ctx.currentTime + delay + 0.1);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.12);
        });
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(380, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 14;
        lfoGain.gain.value = 25;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        lfo.start();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
        lfo.stop(ctx.currentTime + 1.2);
      }
    } catch (e) {
      console.warn('Audio Context failed:', e);
    }
  };

  const updateCountdown = () => {
    if (!eventDate) { setCountdown(null); return; }
    const now = new Date();
    const target = new Date(eventDate);
    const diff = target - now;
    
    if (diff <= 0) {
      setCountdown({ passed: true });
      if (!alertPlayedRef.current) {
        playAlertSound(alarmSound);
        alertPlayedRef.current = true;
      }
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setCountdown({ days, hours, minutes, seconds, passed: false });
  };

  useEffect(() => {
    alertPlayedRef.current = false;
    setStartTime(Date.now());
    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalRef.current);
  }, [eventDate]);

  // SVG parameters for progress ring
  const radius = 70;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  const targetTime = eventDate ? new Date(eventDate).getTime() : null;
  const remainingTime = targetTime ? Math.max(0, targetTime - Date.now()) : 0;
  const totalTime = targetTime && startTime ? Math.max(1, targetTime - startTime) : 1;
  const progressRatio = remainingTime / totalTime;
  const dashOffset = circumference * (1 - progressRatio);

  return (
    <div className="tool-page">
      <SEOHead title="Event Countdown Timer Suite" description="Create live countdown timers for birthdays, launches, or events with visual progress rings and custom chime alarms." />
      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Countdown Timer</span>
        </div>
        <h1>
          <i className="fa-solid fa-hourglass-half" style={{ color: 'var(--accent-purple-light)' }}></i> Event Countdown Timer
        </h1>
        <p>Keep track of upcoming deadlines with responsive circular tracking rings.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Event Name (optional)</label>
                <input className="form-input" type="text" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. Project Launch" />
              </div>
              <div className="form-group">
                <label className="form-label">Event Date & Time</label>
                <input className="form-input" type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              </div>
            </div>

            {/* Alarm Sound Preset Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Alarm Sound:</span>
              {['chime', 'digital', 'ring'].map(sound => (
                <button 
                  key={sound}
                  className={`btn btn-sm ${alarmSound === sound ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setAlarmSound(sound);
                    playAlertSound(sound);
                  }}
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', textTransform: 'capitalize' }}
                >
                  {sound}
                </button>
              ))}
            </div>

            {countdown && !countdown.passed && (
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* SVG Progress Ring */}
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--bg-input)" strokeWidth={strokeWidth} />
                    <circle 
                      cx="80" cy="80" r={radius} fill="none" stroke="var(--accent-purple-light)" strokeWidth={strokeWidth}
                      strokeDasharray={circumference} strokeDashoffset={dashOffset}
                      strokeLinecap="round" transform="rotate(-90 80 80)"
                      style={{ transition: 'stroke-dashoffset 1s linear' }} 
                    />
                  </svg>
                  
                  <div style={{ position: 'absolute', textAlign: 'center', maxWidth: '120px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-cyan-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {eventName || 'Countdown'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                      {Math.round(progressRatio * 100)}% Left
                    </div>
                  </div>
                </div>

                {/* Duration breakdown boxes */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    ['Days', countdown.days, '#3b82f6'],
                    ['Hours', countdown.hours, '#d946ef'],
                    ['Minutes', countdown.minutes, '#10b981'],
                    ['Seconds', countdown.seconds, '#f59e0b']
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ textAlign: 'center', minWidth: '85px', padding: '1rem', background: 'var(--bg-input)', borderRadius: '12px', border: `2px solid ${color}22` }}>
                      <div style={{ fontSize: '2.4rem', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                        {String(val).padStart(2, '0')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
