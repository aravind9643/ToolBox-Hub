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

  useEffect(() => {
    return () => {
      clearTimeout(timerIdRef.current);
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
          <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', alignItems: 'stretch' }}>
            
            {/* BPM Tapper Panel */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>BPM Tempo Tapper</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                Tap the button in sync with any audio beat or song rhythm to measure the average BPM value.
              </p>

              <button 
                onClick={handleTap} 
                style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-purple-light) 0%, var(--accent-pink) 100%)',
                  border: 'none', color: 'white', fontWeight: 800, fontSize: '1.1rem',
                  boxShadow: 'var(--shadow-lg)', cursor: 'pointer', outline: 'none',
                  transition: 'transform 0.1s'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                TAP BEAT
              </button>

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: tappedBpm > 0 ? 'var(--accent-cyan-light)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {tappedBpm || '—'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '0.2rem' }}>Measured BPM</div>
              </div>

              {taps.length > 0 && (
                <button className="copy-btn btn-sm mt-1" onClick={resetTaps} style={{ border: 'none', background: 'none', color: 'var(--accent-red)' }}>
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
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: isPlaying && beat === b
                        ? (b === 0 ? 'var(--accent-pink)' : 'var(--accent-cyan-light)')
                        : 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      transition: 'background 0.1s'
                    }} 
                  />
                ))}
              </div>

              <div className="form-group w-full" style={{ maxWidth: '240px', textAlign: 'center' }}>
                <label className="form-label">Tempo: {bpm} BPM</label>
                <input 
                  type="range" min="40" max="240" value={bpm} 
                  onChange={e => setBpm(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--accent-purple-light)' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={startMetronome} style={{ gap: '8px' }}>
                  <i className={isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'}></i>
                  {isPlaying ? 'Pause Metronome' : 'Start Metronome'}
                </button>
                {tappedBpm > 0 && (
                  <button className="btn btn-secondary" onClick={() => setBpm(tappedBpm)} style={{ fontSize: '0.8rem' }}>
                    Sync Tapped BPM
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
