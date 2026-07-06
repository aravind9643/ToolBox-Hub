import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function Stopwatch() {
  const [time, setTime] = useState(0); // time in milliseconds
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);

  const startTimeRef = useRef(0);
  const animationFrameRef = useRef(null);

  const formatTime = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const centi = Math.floor((ms % 1000) / 10);

    const minStr = String(min).padStart(2, '0');
    const secStr = String(sec).padStart(2, '0');
    const centiStr = String(centi).padStart(2, '0');

    return `${minStr}:${secStr}.${centiStr}`;
  };

  const updateTimer = () => {
    setTime(Date.now() - startTimeRef.current);
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  };

  const handleStartStop = () => {
    if (running) {
      cancelAnimationFrame(animationFrameRef.current);
      setRunning(false);
    } else {
      startTimeRef.current = Date.now() - time;
      setRunning(true);
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  };

  const handleReset = () => {
    cancelAnimationFrame(animationFrameRef.current);
    setRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!running) return;
    const currentLapTime = time;
    const previousLapTime = laps.length > 0 ? laps[0].time : 0;
    const duration = currentLapTime - previousLapTime;

    const newLap = {
      id: laps.length + 1,
      time: currentLapTime,
      duration: duration
    };

    setLaps([newLap, ...laps]);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const fastestLapDuration = laps.length > 0 
    ? Math.min(...laps.map(l => l.duration)) 
    : null;

  return (
    <div className="tool-page">
      <SEOHead title="Online Stopwatch & Lap Timer" description="High-precision stopwatch timer with millisecond resolution and split lap times tracking." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Stopwatch</span></div>
        <h1><i className="fa-solid fa-stopwatch" style={{ color: 'var(--accent-purple-light)' }}></i> Precision Stopwatch</h1>
        <p>Log accurate lap records, split deltas, and count time intervals down to centiseconds.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card" style={{ textAlign: 'center' }}>
            
            {/* Display Readout */}
            <div style={{ padding: '2rem 0' }}>
              <div style={{ fontSize: '4.8rem', fontWeight: 800, color: 'var(--accent-cyan-light)', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em', lineHeight: 1 }}>
                {formatTime(time)}
              </div>
            </div>

            {/* Actions panel */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleStartStop} 
                style={{ gap: '8px', background: running ? 'var(--accent-red)' : 'var(--accent-purple-light)', borderColor: 'transparent' }}
              >
                <i className={running ? 'fa-solid fa-pause' : 'fa-solid fa-play'}></i>
                {running ? 'Stop' : 'Start'}
              </button>
              <button className="btn btn-secondary" onClick={handleLap} disabled={!running} style={{ gap: '8px' }}>
                <i className="fa-solid fa-stopwatch-20"></i> Lap Split
              </button>
              <button className="btn btn-secondary" onClick={handleReset} style={{ gap: '8px' }}>
                <i className="fa-solid fa-rotate-left"></i> Reset
              </button>
            </div>

            {/* Laps List */}
            {laps.length > 0 && (
              <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Laps Split Logs</h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   {laps.map((l) => {
                     const isFastest = l.duration === fastestLapDuration;
                     const deltaMs = l.duration - fastestLapDuration;
                     return (
                       <div 
                         key={l.id} 
                         className="lap-item"
                         style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: isFastest ? '1px solid var(--accent-green)' : '1px solid var(--border-color)' }}
                       >
                         <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Lap {l.id}</span>
                         <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>Split: {formatTime(l.time)}</span>
                         <span style={{ fontFamily: 'monospace', color: isFastest ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                           {isFastest ? '🏆 Fastest' : `+${formatTime(deltaMs)}`}
                         </span>
                       </div>
                     );
                   })}
                </div>
              </div>
            )}
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Stopwatch Timer — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
