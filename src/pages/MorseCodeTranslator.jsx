import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';

// Morse code dictionary
const MORSE_MAP = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-',
  '"': '.-..-.', "'": '.----.', '@': '.--.-.', ' ': '/'
};

const REVERSE_MORSE = Object.fromEntries(Object.entries(MORSE_MAP).map(([k, v]) => [v, k]));

function textToMorse(text) {
  return text.toUpperCase().split('').map(c => MORSE_MAP[c] || '?').join(' ');
}

function morseToText(morse) {
  return morse.trim().split(' / ').map(word =>
    word.split(' ').map(code => REVERSE_MORSE[code] || '?').join('')
  ).join(' ');
}

export default function MorseCodeTranslator() {
  // Modes: 'encode' | 'decode' | 'tap'
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStrobeOn, setIsStrobeOn] = useState(false);

  // Play settings
  const [frequency, setFrequency] = useState(700);
  const [wpm, setWpm] = useState(15);

  // Telegraph key states
  const [tappedMorse, setTappedMorse] = useState('');
  const [tappedText, setTappedText] = useState('');
  const tapStartRef = useRef(null);
  const activeOscRef = useRef(null);
  const activeAudioCtxRef = useRef(null);
  const gapTimerRef = useRef(null);

  const abortControllerRef = useRef(null);

  const output = useMemo(() => {
    if (mode === 'tap') return tappedMorse;
    if (!input.trim()) return '';
    return mode === 'encode' ? textToMorse(input) : morseToText(input);
  }, [input, mode, tappedMorse]);

  const copyOutput = () => {
    const textToCopy = mode === 'tap' ? tappedMorse : output;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const stopAudio = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPlaying(false);
    setIsStrobeOn(false);
  };

  const playMorse = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    const morseStr = mode === 'tap' ? tappedMorse : output;
    if (!morseStr) return;

    setIsPlaying(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const signal = abortController.signal;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const dotDuration = 1.2 / wpm; // duration of a dot in seconds

    const sleep = (sec) => new Promise((resolve) => {
      const t = setTimeout(resolve, sec * 1000);
      signal.addEventListener('abort', () => clearTimeout(t));
    });

    try {
      for (let i = 0; i < morseStr.length; i++) {
        if (signal.aborted) break;
        const char = morseStr[i];

        if (char === '.' || char === '-') {
          const duration = char === '.' ? dotDuration : dotDuration * 3;

          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.connect(g);
          g.connect(ctx.destination);
          osc.frequency.value = frequency;
          osc.type = 'sine';

          g.gain.setValueAtTime(0.25, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

          osc.start();
          setIsStrobeOn(true);

          await sleep(duration);

          osc.stop();
          setIsStrobeOn(false);

          // Inter-element gap
          await sleep(dotDuration);
        } else if (char === ' ') {
          await sleep(dotDuration * 2);
        } else if (char === '/') {
          await sleep(dotDuration * 4);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlaying(false);
      setIsStrobeOn(false);
      ctx.close();
    }
  };

  // Telegraph Key audio beepers
  const startBeep = () => {
    try {
      if (!activeAudioCtxRef.current) {
        activeAudioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = activeAudioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = 'sine';

      g.gain.setValueAtTime(0.25, ctx.currentTime);
      osc.start();
      activeOscRef.current = { osc, g };
      setIsStrobeOn(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopBeep = () => {
    if (activeOscRef.current) {
      const { osc } = activeOscRef.current;
      try {
        osc.stop();
      } catch (err) {}
      activeOscRef.current = null;
    }
    setIsStrobeOn(false);
  };

  const handleTapStart = (e) => {
    e.preventDefault();
    if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
    tapStartRef.current = Date.now();
    startBeep();
  };

  const handleTapEnd = (e) => {
    e.preventDefault();
    if (!tapStartRef.current) return;
    stopBeep();

    const duration = Date.now() - tapStartRef.current;
    tapStartRef.current = null;

    const dotMs = (1.2 / wpm) * 1000;
    const symbol = duration < dotMs * 2.2 ? '.' : '-';

    setTappedMorse(prev => {
      const next = prev + symbol;
      setTappedText(morseToText(next));
      return next;
    });

    // Character space timer
    gapTimerRef.current = setTimeout(() => {
      setTappedMorse(prev => {
        const next = prev + ' ';
        return next;
      });
      // Word space timer
      gapTimerRef.current = setTimeout(() => {
        setTappedMorse(prev => {
          const next = prev.trim() + ' / ';
          return next;
        });
      }, dotMs * 4);
    }, dotMs * 2.5);
  };

  const clearTaps = () => {
    if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
    setTappedMorse('');
    setTappedText('');
  };

  // Keyboard spaces for telegraph key
  useEffect(() => {
    if (mode !== 'tap') return;
    const handleKeyDown = (e) => {
      if (e.key === ' ' && !tapStartRef.current && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
        tapStartRef.current = Date.now();
        startBeep();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === ' ' && tapStartRef.current) {
        e.preventDefault();
        handleTapEnd(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, wpm, frequency]);

  const swapMode = () => {
    setMode(m => m === 'encode' ? 'decode' : 'encode');
    setInput(output);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Morse Code Translator & Telegraph Tapper" description="Translate text to Morse code and back. Includes virtual telegraph key simulator, signal strobe lamp, and adjustable speed/pitch." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Morse Code Translator</span></div>
        <h1><i className="fa-solid fa-tower-broadcast" style={{ color: 'var(--accent-purple-light)' }}></i> Morse Code Translator</h1>
        <p>Encode text to Morse signals, decode inputs, or practice tapping on the virtual telegraph key.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => { stopAudio(); setMode('encode'); setInput(''); }}>
              <i className="fa-solid fa-arrow-right" style={{ marginRight: '6px' }}></i> Text → Morse
            </button>
            <button className={`tab-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => { stopAudio(); setMode('decode'); setInput(''); }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i> Morse → Text
            </button>
            <button className={`tab-btn ${mode === 'tap' ? 'active' : ''}`} onClick={() => { stopAudio(); setMode('tap'); clearTaps(); }}>
              <i className="fa-solid fa-key" style={{ marginRight: '6px' }}></i> Telegraph Key
            </button>
          </div>

          <div className="glass-card">
            
            {/* Audio Settings Panel & Strobe Lamp */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ margin: 0, width: '130px' }}>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>Tone Pitch ({frequency} Hz)</label>
                  <input type="range" min="300" max="1200" step="50" value={frequency} onChange={e => setFrequency(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ margin: 0, width: '120px' }}>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>Speed ({wpm} WPM)</label>
                  <input type="range" min="5" max="30" step="1" value={wpm} onChange={e => setWpm(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>

              {/* Glowing signal light */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Strobe Light:</span>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isStrobeOn ? '#eab308' : '#334155',
                  boxShadow: isStrobeOn ? '0 0 16px #facc15, inset 0 0 8px #fef08a' : 'inset 0 0 4px rgba(0,0,0,0.4)',
                  border: '2px solid var(--border-color)',
                  transition: 'background-color 0.05s, box-shadow 0.05s'
                }} />
              </div>
            </div>

            {mode !== 'tap' ? (
              <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
                {/* Input */}
                <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label className="form-label">
                    {mode === 'encode' ? 'Input Text' : 'Input Morse Code'}
                    {mode === 'decode' && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(Use dots, dashes, spaces, and / for word breaks)</span>}
                  </label>
                  <textarea
                    className="form-textarea"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={mode === 'encode' ? 'Type text here...' : '... --- ... / enter morse code'}
                    rows={8}
                    style={{ flex: 1, resize: 'vertical', fontFamily: mode === 'decode' ? 'monospace' : 'inherit', letterSpacing: mode === 'decode' ? '0.05em' : 'normal' }}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={() => setInput('')} style={{ gap: '6px', alignSelf: 'flex-start' }}>
                    <i className="fa-solid fa-trash-can"></i> Clear
                  </button>
                </div>

                {/* Output */}
                <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label className="form-label">
                    {mode === 'encode' ? 'Morse Code Output' : 'Decoded Text'}
                  </label>
                  <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', minHeight: '180px', overflowY: 'auto', fontFamily: mode === 'encode' ? 'monospace' : 'inherit', fontSize: mode === 'encode' ? '1.1rem' : '1rem', letterSpacing: mode === 'encode' ? '0.1em' : 'normal', lineHeight: 1.6, wordBreak: 'break-all', color: output ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                    {output || (mode === 'encode' ? '... --- ...' : 'Decoded text will appear here')}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-sm" onClick={copyOutput} disabled={!output} style={{ gap: '6px' }}>
                      <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                      {copied ? 'Copied!' : 'Copy Output'}
                    </button>
                    {mode === 'encode' && (
                      <button className="btn className btn-secondary btn-sm" onClick={playMorse} disabled={!output} style={{ gap: '6px' }}>
                        <i className={`fa-solid ${isPlaying ? 'fa-stop' : 'fa-volume-high'}`}></i>
                        {isPlaying ? 'Stop' : 'Play Audio'}
                      </button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={swapMode} disabled={!output} style={{ gap: '6px' }}>
                      <i className="fa-solid fa-arrow-right-arrow-left"></i> Swap
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TELEGRAPH TAPPER MODE */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Practice tapping Morse code. Tap the pad or press <strong>Spacebar</strong>.
                </div>

                <div 
                  onMouseDown={handleTapStart}
                  onMouseUp={handleTapEnd}
                  onTouchStart={handleTapStart}
                  onTouchEnd={handleTapEnd}
                  style={{
                    width: '100%',
                    maxWidth: '440px',
                    height: '110px',
                    borderRadius: '16px',
                    background: 'var(--bg-glass-hover)',
                    border: '3px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    boxShadow: isStrobeOn ? '0 0 12px rgba(250, 204, 21, 0.2)' : 'none',
                    transition: 'all 0.1s'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <i className="fa-solid fa-sign-hanging" style={{ fontSize: '2rem', color: isStrobeOn ? 'var(--accent-cyan-light)' : 'var(--text-secondary)', marginBottom: '0.4rem' }}></i>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {isStrobeOn ? 'TRANSMITTING...' : 'TAP HERE'}
                    </div>
                  </div>
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      Tapped Morse Code
                      <button className="btn btn-secondary btn-sm" onClick={clearTaps} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Clear Taps</button>
                    </label>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontFamily: 'monospace', minHeight: '60px', wordBreak: 'break-all', fontSize: '1.1rem' }}>
                      {tappedMorse || '... --- ...'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Translated Text</label>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', minHeight: '60px', fontSize: '1rem' }}>
                      {tappedText || 'Decoded tapping message...'}
                    </div>
                  </div>

                  <div style={{ alignSelf: 'center' }}>
                    <button className="btn btn-primary btn-sm" onClick={copyOutput} disabled={!tappedMorse} style={{ gap: '6px' }}>
                      <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                      {copied ? 'Copied Morse!' : 'Copy Morse'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reference table */}
            <details style={{ marginTop: '1.5rem' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '0.5rem', userSelect: 'none' }}>
                <i className="fa-solid fa-table" style={{ marginRight: '6px' }}></i> Morse Code Reference Table
              </summary>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.3rem', marginTop: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                {Object.entries(MORSE_MAP).filter(([k]) => k !== ' ').map(([char, code]) => (
                  <div key={char} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{char}</span>
                    <span style={{ color: 'var(--accent-cyan-light)', fontFamily: 'monospace' }}>{code}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
