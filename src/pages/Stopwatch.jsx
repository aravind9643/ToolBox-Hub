import { useState, useEffect, useRef, useMemo } from 'react';
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

  const formatDeltaTime = (ms) => {
    if (ms === 0) return '0.00s';
    const isNegative = ms < 0;
    const absMs = Math.abs(ms);
    const sec = (absMs / 1000).toFixed(2);
    return `${isNegative ? '-' : '+'}${sec}s`;
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

  // Performance analytics selectors
  const stats = useMemo(() => {
    if (laps.length === 0) return null;
    const durations = laps.map(l => l.duration);
    const total = durations.reduce((a, b) => a + b, 0);
    const avg = total / laps.length;
    const fastest = Math.min(...durations);
    const slowest = Math.max(...durations);

    return {
      avg,
      fastest,
      slowest
    };
  }, [laps]);

  const handleExportCSV = () => {
    if (laps.length === 0) return;
    const rows = [['Lap', 'Split Time', 'Lap Duration', 'Time Offset (ms)']];
    laps.forEach(l => {
      rows.push([`Lap ${l.id}`, formatTime(l.time), formatTime(l.duration), l.duration]);
    });
    
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'stopwatch_laps_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Online Precision Stopwatch & Performance Lap Analyzer" description="High-precision stopwatch timer with millisecond resolution and split lap times tracking." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Stopwatch</span></div>
        <h1><i className="fa-solid fa-stopwatch" style={{ color: 'var(--accent-purple-light)' }}></i> Precision Stopwatch</h1>
        <p>Log accurate lap records, inspect split deltas, and export performance reports.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card" style={{ textAlign: 'center' }}>
            
            {/* Readout */}
            <div style={{ padding: '1.75rem 0' }}>
              <div style={{ fontSize: '4.8rem', fontWeight: 800, color: 'var(--accent-cyan-light)', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em', lineHeight: 1 }}>
                {formatTime(time)}
              </div>
            </div>

            {/* Actions panel */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleStartStop} 
                style={{ gap: '8px', background: running ? 'var(--accent-red)' : 'var(--accent-purple-light)', borderColor: 'transparent', minWidth: '100px' }}
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
              {laps.length > 0 && (
                <button className="btn btn-secondary" onClick={handleExportCSV} style={{ gap: '8px' }}>
                  <i className="fa-solid fa-file-csv"></i> Export CSV
                </button>
              )}
            </div>

            {/* Stats Dashboard */}
            {stats && (
              <div className="stats-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                <div className="stat-card" style={{ padding: '0.5rem' }}>
                  <div className="stat-card-value" style={{ color: 'var(--accent-green)', fontSize: '1rem' }}>{formatTime(stats.fastest)}</div>
                  <div className="stat-card-label" style={{ fontSize: '0.65rem' }}>🏆 Fastest Lap</div>
                </div>
                <div className="stat-card" style={{ padding: '0.5rem' }}>
                  <div className="stat-card-value" style={{ color: 'var(--accent-red)', fontSize: '1rem' }}>{formatTime(stats.slowest)}</div>
                  <div className="stat-card-label" style={{ fontSize: '0.65rem' }}>🐢 Slowest Lap</div>
                </div>
                <div className="stat-card" style={{ padding: '0.5rem' }}>
                  <div className="stat-card-value" style={{ color: 'var(--accent-cyan-light)', fontSize: '1rem' }}>{formatTime(stats.avg)}</div>
                  <div className="stat-card-label" style={{ fontSize: '0.65rem' }}>📊 Average Lap</div>
                </div>
              </div>
            )}

            {/* Laps List */}
            {laps.length > 0 && (
              <div style={{ width: '100%', maxWidth: '460px', margin: '0 auto', textAlign: 'left' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontWeight: 600 }}>Laps Performance Logs</h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                   {laps.map((l, index) => {
                     const isFastest = l.duration === stats.fastest;
                     const isSlowest = l.duration === stats.slowest;
                     
                     // Calculate offset against average lap
                     const deltaAvg = l.duration - stats.avg;
                     
                     return (
                       <div 
                         key={l.id} 
                         style={{ 
                           display: 'flex', 
                           justifyContent: 'space-between', 
                           padding: '0.5rem 0.75rem', 
                           background: 'var(--bg-input)', 
                           borderRadius: 'var(--radius-sm)', 
                           border: isFastest 
                             ? '1px solid var(--accent-green)' 
                             : isSlowest 
                             ? '1px solid var(--accent-red)' 
                             : '1px solid var(--border-color)',
                           fontSize: '0.8rem',
                           alignItems: 'center'
                         }}
                       >
                         <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Lap {l.id}</span>
                         <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>Duration: {formatTime(l.duration)}</span>
                         <span style={{ 
                           fontFamily: 'monospace', 
                           color: isFastest 
                             ? 'var(--accent-green)' 
                             : isSlowest 
                             ? 'var(--accent-red)' 
                             : deltaAvg < 0 
                             ? 'var(--accent-cyan-light)' 
                             : 'var(--text-muted)' 
                         }}>
                           {isFastest ? '🏆 Fastest' : isSlowest ? '🐢 Slowest' : formatDeltaTime(deltaAvg)}
                         </span>
                       </div>
                     );
                   })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
