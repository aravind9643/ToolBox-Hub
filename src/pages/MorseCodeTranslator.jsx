import { useState, useMemo } from 'react';
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
  const [mode, setMode] = useState('encode'); // 'encode' | 'decode'
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const output = useMemo(() => {
    if (!input.trim()) return '';
    return mode === 'encode' ? textToMorse(input) : morseToText(input);
  }, [input, mode]);

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const playMorse = async () => {
    if (isPlaying || mode !== 'encode') return;
    setIsPlaying(true);
    const morseStr = textToMorse(input);
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const dotDuration = 0.08; // seconds
    let time = ctx.currentTime + 0.1;

    for (const char of morseStr) {
      if (char === '.') {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.frequency.value = 700; osc.type = 'sine';
        g.gain.setValueAtTime(0.3, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + dotDuration);
        osc.start(time); osc.stop(time + dotDuration);
        time += dotDuration * 1.5;
      } else if (char === '-') {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.frequency.value = 700; osc.type = 'sine';
        g.gain.setValueAtTime(0.3, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + dotDuration * 3);
        osc.start(time); osc.stop(time + dotDuration * 3);
        time += dotDuration * 4;
      } else if (char === ' ') {
        time += dotDuration * 2;
      } else if (char === '/') {
        time += dotDuration * 4;
      }
    }

    setTimeout(() => setIsPlaying(false), (time - ctx.currentTime) * 1000 + 200);
  };

  const swapMode = () => {
    setMode(m => m === 'encode' ? 'decode' : 'encode');
    setInput(output);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Morse Code Translator" description="Translate text to Morse code and back. Includes audio playback of Morse signals." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Morse Code Translator</span></div>
        <h1><i className="fa-solid fa-tower-broadcast" style={{ color: 'var(--accent-purple-light)' }}></i> Morse Code Translator</h1>
        <p>Encode text to Morse code or decode Morse back to text. Play audio signals.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => { setMode('encode'); setInput(''); }}>
              <i className="fa-solid fa-arrow-right" style={{ marginRight: '6px' }}></i> Text → Morse
            </button>
            <button className={`tab-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => { setMode('decode'); setInput(''); }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i> Morse → Text
            </button>
          </div>

          <div className="glass-card">
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
                {/* Morse visual display for encode mode */}
                {mode === 'encode' && output && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    {output.split('').map((char, i) => {
                      if (char === '.') return <span key={i} style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan-light)', marginTop: '2px' }}></span>;
                      if (char === '-') return <span key={i} style={{ display: 'inline-block', width: '20px', height: '8px', borderRadius: '4px', background: 'var(--accent-purple-light)', marginTop: '2px' }}></span>;
                      if (char === ' ') return <span key={i} style={{ display: 'inline-block', width: '6px' }}></span>;
                      if (char === '/') return <span key={i} style={{ display: 'inline-block', width: '16px', height: '8px', background: 'transparent', marginTop: '2px', borderBottom: '2px dashed var(--border-color)' }}></span>;
                      return null;
                    })}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-sm" onClick={copyOutput} style={{ gap: '6px' }}>
                    <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                    {copied ? 'Copied!' : 'Copy Output'}
                  </button>
                  {mode === 'encode' && (
                    <button className="btn btn-secondary btn-sm" onClick={playMorse} disabled={isPlaying || !output} style={{ gap: '6px' }}>
                      <i className={`fa-solid ${isPlaying ? 'fa-spinner fa-spin' : 'fa-volume-high'}`}></i>
                      {isPlaying ? 'Playing...' : 'Play Audio'}
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={swapMode} disabled={!output} style={{ gap: '6px' }}>
                    <i className="fa-solid fa-arrow-right-arrow-left"></i> Swap
                  </button>
                </div>
              </div>
            </div>

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
