import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function TextToSpeech() {
  const [text, setText] = useState('Welcome to ToolBox Hub. This text-to-speech reader runs entirely inside your browser.');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1); // speed rate
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');

  const synthRef = useRef(null);
  const canvasRef = useRef(null);

  const loadVoices = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      if (list.length > 0 && !selectedVoice) {
        // Prefer English or system default
        const defaultVoice = list.find(v => v.lang.startsWith('en')) || list[0];
        setSelectedVoice(defaultVoice.name);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Filtered voice list
  const filteredVoices = useMemo(() => {
    if (!voiceQuery.trim()) return voices;
    const q = voiceQuery.toLowerCase();
    return voices.filter(v => 
      v.name.toLowerCase().includes(q) || v.lang.toLowerCase().includes(q)
    );
  }, [voices, voiceQuery]);

  // Sine wave animation effect loop
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (speaking && !paused) {
        phase += 0.12 * rate; // speed up wave with playback speed rate
        ctx.lineWidth = 2;
        
        // Draw 3 layers of glowing waves
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          const opacity = 0.2 + i * 0.25;
          ctx.strokeStyle = i === 0 ? `rgba(96, 165, 250, ${opacity})` : i === 1 ? `rgba(236, 72, 153, ${opacity})` : `rgba(168, 85, 247, ${opacity})`;
          
          const amp = (12 + i * 6) * pitch * volume; // amplitude scales with pitch/volume
          
          for (let x = 0; x < canvas.width; x++) {
            const y = canvas.height / 2 + Math.sin(x * 0.02 + phase + i * 1.5) * amp * Math.sin(x * Math.PI / canvas.width);
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      } else {
        // Draw flat line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
      
      animId = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(animId);
  }, [speaking, paused, rate, pitch, volume]);

  const speak = () => {
    if (!synthRef.current) return;

    if (speaking) {
      synthRef.current.cancel();
    }

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voiceObj = voices.find(v => v.name === selectedVoice);
    if (voiceObj) utterance.voice = voiceObj;

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };

    setSpeaking(true);
    setPaused(false);
    synthRef.current.speak(utterance);
  };

  const pausePlay = () => {
    if (!synthRef.current) return;
    if (speaking && !paused) {
      synthRef.current.pause();
      setPaused(true);
    } else if (speaking && paused) {
      synthRef.current.resume();
      setPaused(false);
    }
  };

  const stop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Interactive Text to Speech Voice Reader" description="Convert text to speech locally in your browser. Choose system voice configurations, rate, pitch, and volume." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Text to Speech</span></div>
        <h1><i className="fa-solid fa-volume-high" style={{ color: 'var(--accent-purple-light)' }}></i> Text to Speech Engine</h1>
        <p>Read text aloud using your browser's speech synthesis engine with visual wave tracking.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Live Waveform Canvas */}
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <canvas ref={canvasRef} width="600" height="80" style={{ width: '100%', height: '80px', display: 'block' }} />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Input Text</label>
              <textarea className="form-textarea" rows="6" value={text} onChange={e => setText(e.target.value)} placeholder="Type or paste text here to read..." />
            </div>

            <div className="grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Voice Filter</label>
                <input type="text" className="form-input" placeholder="Search voices by name/lang..." value={voiceQuery} onChange={e => setVoiceQuery(e.target.value)} style={{ marginBottom: '0.5rem' }} />
                
                <select className="form-select" value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}>
                  {filteredVoices.map(v => (
                    <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                  ))}
                  {filteredVoices.length === 0 && <option>No matching voices found</option>}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={speak} style={{ gap: '8px', flex: 1, minHeight: '46px' }}>
                  <i className="fa-solid fa-play"></i> Speak Text
                </button>
                {speaking && (
                  <>
                    <button className="btn btn-secondary" onClick={pausePlay} style={{ gap: '6px', minHeight: '46px' }}>
                      <i className={paused ? 'fa-solid fa-play' : 'fa-solid fa-pause'}></i>
                      {paused ? 'Resume' : 'Pause'}
                    </button>
                    <button className="btn btn-secondary" onClick={stop} style={{ gap: '6px', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)', minHeight: '46px' }}>
                      <i className="fa-solid fa-stop"></i> Stop
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Synthesizer Parameter Settings */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '130px', margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Speed Rate ({rate}x)</label>
                <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-purple-light)' }} />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '130px', margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Pitch Scale ({pitch})</label>
                <input type="range" min="0.5" max="1.5" step="0.1" value={pitch} onChange={e => setPitch(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-purple-light)' }} />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '130px', margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Volume ({Math.round(volume * 100)}%)</label>
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => setVolume(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-purple-light)' }} />
              </div>
            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Text to Speech Voice Reader — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
