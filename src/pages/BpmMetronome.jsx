import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function BpmMetronome() {
  // BPM Tapper state
  const [taps, setTaps] = useState([]);
  const [tappedBpm, setTappedBpm] = useState(0);

  // Metronome state
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);

  const audioCtxRef = useRef(null);
  const nextNoteTimeRef = useRef(0.0);
  const timerIdRef = useRef(null);
  const currentBeatRef = useRef(0);
  const bpmRef = useRef(120);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // BPM Tapper
  const handleTap = () => {
    const now = Date.now();
    const newTaps = [...taps, now].slice(-5); // keep last 5 taps
    setTaps(newTaps);

    if (newTaps.length > 1) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpmCalc = Math.round(60000 / avgInterval);
      setTappedBpm(bpmCalc);
    }
  };

  const resetTaps = () => {
    setTaps([]);
    setTappedBpm(0);
  };

  // Metronome Sound Engine
  const playClick = (time, isFirstBeat) => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Higher pitch on the first beat of a 4/4 measure
    osc.frequency.value = isFirstBeat ? 1000 : 800;
    gainNode.gain.setValueAtTime(1, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.05);
  };

  const scheduler = () => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;

    while (nextNoteTimeRef.current < audioCtx.currentTime + 0.1) {
      const isFirst = currentBeatRef.current === 0;
      playClick(nextNoteTimeRef.current, isFirst);

      // Schedule next beat
      const secondsPerBeat = 60.0 / bpmRef.current;
      nextNoteTimeRef.current += secondsPerBeat;

      // Update UI beats
      const beatVal = currentBeatRef.current;
      setBeat(beatVal);
      currentBeatRef.current = (currentBeatRef.current + 1) % 4;
    }

    timerIdRef.current = setTimeout(scheduler, 25);
  };

  const startMetronome = () => {
    if (isPlaying) {
      clearTimeout(timerIdRef.current);
      setIsPlaying(false);
      setBeat(0);
      return;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    currentBeatRef.current = 0;
    nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;
    setIsPlaying(true);
    scheduler();
  };

  const handleTapRef = useRef(null);
  handleTapRef.current = handleTap;

  const startMetronomeRef = useRef(null);
  startMetronomeRef.current = startMetronome;

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        startMetronomeRef.current();
      } else if (e.code === 'KeyT') {
        e.preventDefault();
        handleTapRef.current();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      clearTimeout(timerIdRef.current);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  return (
    <div className="tool-page">
      <SEOHead title="BPM Tapper & Metronome Clicker" description="Tap beats-per-minute tempo speed checker and run an accurate metronome audio click click track." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>BPM & Metronome</span></div>
        <h1><i className="fa-solid fa-drum" style={{ color: 'var(--accent-purple-light)' }}></i> BPM Tapper & Metronome</h1>
        <p>Measure tempo speed with a tap button, and keep perfect timing using an adjustable metronome tool.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="grid-2">
            
            {/* BPM Tapper Panel */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>BPM Tapper</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Tap the button or press <strong>[T]</strong> in beat to measure tempo</p>

              <button 
                className="btn btn-primary" 
                onClick={handleTap}
                style={{
                  width: '120px', height: '120px', borderRadius: '50%', fontSize: '1.1rem', fontWeight: 700,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, var(--accent-purple-light) 0%, var(--accent-purple) 100%)',
                  boxShadow: '0 8px 24px rgba(96, 165, 250, 0.3)', cursor: 'pointer', border: 'none', color: '#fff',
                  transition: 'transform var(--transition-fast)'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span>TAP</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '4px' }}>OR PRESS T</span>
              </button>

              <div style={{ marginTop: '1.5rem', minHeight: '60px' }}>
                {tappedBpm > 0 ? (
                  <div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-cyan-light)', lineHeight: 1 }}>{tappedBpm}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Calculated BPM</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tap at least twice to begin...</div>
                )}
              </div>

              {tappedBpm > 0 && (
                <button className="btn btn-secondary" onClick={resetTaps} style={{ fontSize: '0.75rem', marginTop: '1rem', padding: '0.35rem 0.75rem' }}>
                  Reset Taps
                </button>
              )}
            </div>

            {/* Metronome Panel */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Audio Metronome</h2>
              
              {/* Beats visual indicator bar */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[0, 1, 2, 3].map(b => (
                  <div 
                    key={b} 
                    className={`metronome-dot ${isPlaying && beat === b ? (b === 0 ? 'first-beat' : 'active') : ''}`}
                  />
                ))}
              </div>

              <div className="form-group w-full" style={{ maxWidth: '240px', textAlign: 'center' }}>
                <label className="form-label">Tempo: {bpm} BPM</label>
                <input 
                  type="range" min="40" max="240" value={bpm} 
                  onChange={e => setBpm(Number(e.target.value))} 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={startMetronome} style={{ gap: '8px' }}>
                  <i className={isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'}></i>
                  {isPlaying ? 'Pause' : 'Start'}
                </button>
                {tappedBpm > 0 && (
                  <button className="btn btn-secondary" onClick={() => setBpm(tappedBpm)} style={{ fontSize: '0.8rem' }}>
                    Sync Taps
                  </button>
                )}
              </div>

              <div style={{ marginTop: '1.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-glass-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Press <strong>[Space]</strong> to Toggle Play/Pause
              </div>
            </div>

          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
