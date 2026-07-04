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

  const synthRef = useRef(null);

  const loadVoices = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      if (list.length > 0 && !selectedVoice) {
        setSelectedVoice(list[0].name);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      loadVoices();
      // Chrome/Safari load voices asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

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
      <SEOHead title="Text to Speech Voice Reader" description="Convert text to speech locally in your browser. Choose system voice configurations, rate, pitch, and volume." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Text to Speech</span></div>
        <h1><i className="fa-solid fa-volume-high" style={{ color: 'var(--accent-purple-light)' }}></i> Text to Speech Reader</h1>
        <p>Read text aloud using your system's synthesizer speech voices engine.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div className="form-group">
              <label className="form-label">Input Text</label>
              <textarea className="form-textarea" rows="6" value={text} onChange={e => setText(e.target.value)} placeholder="Type or paste text here to read..." />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Voice Accent</label>
                <select className="form-select" value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}>
                  {voices.map(v => (
                    <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                  ))}
                  {voices.length === 0 && <option>No speech voices detected</option>}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <button className="btn btn-primary w-full" onClick={speak} style={{ gap: '8px' }}>
                  <i className="fa-solid fa-play"></i> Speak Text
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '130px' }}>
                <label className="form-label">Speed Rate ({rate}x)</label>
                <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '130px' }}>
                <label className="form-label">Pitch Scale ({pitch})</label>
                <input type="range" min="0.5" max="1.5" step="0.1" value={pitch} onChange={e => setPitch(Number(e.target.value))} />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '130px' }}>
                <label className="form-label">Volume ({Math.round(volume * 100)}%)</label>
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => setVolume(Number(e.target.value))} />
              </div>
            </div>

            {speaking && (
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button className="btn btn-secondary" onClick={pausePlay} style={{ gap: '8px' }}>
                  <i className={paused ? 'fa-solid fa-play' : 'fa-solid fa-pause'}></i>
                  {paused ? 'Resume' : 'Pause'}
                </button>
                <button className="btn btn-secondary" onClick={stop} style={{ gap: '8px', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <i className="fa-solid fa-stop"></i> Stop
                </button>
              </div>
            )}
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
