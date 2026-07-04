import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';

// Embedded minimal figlet-style ASCII art using a simple block font
// Using a compact pixel font map for letters/digits (5x5 grid, 0=space, 1=block)
const BLOCK = {
  A: ['  #  ','  #  ',' # # ','#####','#   #'],
  B: ['#### ','#   #','#### ','#   #','#### '],
  C: [' ### ','#   #','#    ','#   #',' ### '],
  D: ['#### ','#   #','#   #','#   #','#### '],
  E: ['#####','#    ','#### ','#    ','#####'],
  F: ['#####','#    ','#### ','#    ','#    '],
  G: [' ### ','#    ','# ## ','#   #',' ### '],
  H: ['#   #','#   #','#####','#   #','#   #'],
  I: ['#####','  #  ','  #  ','  #  ','#####'],
  J: ['#####','   # ','   # ','#  # ',' ##  '],
  K: ['#   #','#  # ','###  ','#  # ','#   #'],
  L: ['#    ','#    ','#    ','#    ','#####'],
  M: ['#   #','## ##','# # #','#   #','#   #'],
  N: ['#   #','##  #','# # #','#  ##','#   #'],
  O: [' ### ','#   #','#   #','#   #',' ### '],
  P: ['#### ','#   #','#### ','#    ','#    '],
  Q: [' ### ','#   #','# # #','#  ##',' ####'],
  R: ['#### ','#   #','#### ','# #  ','#  ##'],
  S: [' ####','#    ',' ### ','    #','#### '],
  T: ['#####','  #  ','  #  ','  #  ','  #  '],
  U: ['#   #','#   #','#   #','#   #',' ### '],
  V: ['#   #','#   #',' # # ',' # # ','  #  '],
  W: ['#   #','#   #','# # #','## ##','#   #'],
  X: ['#   #',' # # ','  #  ',' # # ','#   #'],
  Y: ['#   #',' # # ','  #  ','  #  ','  #  '],
  Z: ['#####','   # ','  #  ',' #   ','#####'],
  '0':[' ### ','#  ##','# # #','##  #',' ### '],
  '1':['  #  ',' ##  ','  #  ','  #  ','#####'],
  '2':[' ### ','#   #','  ## ',' #   ','#####'],
  '3':['#### ','    #',' ### ','    #','#### '],
  '4':['#  # ','#  # ','#####','   # ','   # '],
  '5':['#####','#    ','#### ','    #','#### '],
  '6':[' ### ','#    ','#### ','#   #',' ### '],
  '7':['#####','   # ','  #  ',' #   ','#    '],
  '8':[' ### ','#   #',' ### ','#   #',' ### '],
  '9':[' ### ','#   #',' ####','    #',' ### '],
  ' ':['     ','     ','     ','     ','     '],
  '!':['  #  ','  #  ','  #  ','     ','  #  '],
  '?':[' ### ','#   #','  ## ','     ','  #  '],
  '.':['     ','     ','     ','     ','  #  '],
  ',':['     ','     ','     ','  #  ',' #   '],
  '-':['     ','     ','#####','     ','     '],
};

function renderAscii(text, char = '█') {
  const rows = [[], [], [], [], []];
  for (const letter of text.toUpperCase()) {
    const pattern = BLOCK[letter] || BLOCK[' '];
    for (let r = 0; r < 5; r++) {
      rows[r].push(pattern[r].replace(/#/g, char).replace(/ /g, ' '));
      rows[r].push(' ');
    }
  }
  return rows.map(r => r.join('')).join('\n');
}

const BLOCK_CHARS = ['█', '#', '*', '@', '■', '▓', '░', '♦', '+', 'X', '0'];

const STYLES = [
  { id: 'block', label: 'Block █', fn: (text, char) => renderAscii(text, char) },
  { id: 'thin', label: 'Thin #', fn: (text) => renderAscii(text, '#') },
  { id: 'dots', label: 'Dots .', fn: (text) => renderAscii(text, '•') },
  { id: 'stars', label: 'Stars ★', fn: (text) => renderAscii(text, '*') },
  { id: 'border', label: 'Boxed', fn: (text) => {
    const art = renderAscii(text, '#');
    const lines = art.split('\n');
    const w = Math.max(...lines.map(l => l.length)) + 4;
    const border = '═'.repeat(w);
    return `╔${border}╗\n${lines.map(l => `║  ${l.padEnd(w - 2, ' ')}║`).join('\n')}\n╚${border}╝`;
  }},
];

export default function AsciiArtGenerator() {
  const [inputText, setInputText] = useState('HELLO');
  const [style, setStyle] = useState('block');
  const [blockChar, setBlockChar] = useState('█');
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!inputText.trim()) return '';
    const s = STYLES.find(s => s.id === style) || STYLES[0];
    try { return s.fn(inputText.slice(0, 15), blockChar); } catch { return ''; }
  }, [inputText, style, blockChar]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="tool-page">
      <SEOHead title="ASCII Art Generator" description="Convert text to ASCII art banners using block characters. Copy-ready output, multiple styles." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>ASCII Art Generator</span></div>
        <h1><i className="fa-solid fa-font" style={{ color: 'var(--accent-purple-light)' }}></i> Text to ASCII Art</h1>
        <p>Convert text into large ASCII art banners with multiple styles.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
                <label className="form-label">Text (max 15 chars)</label>
                <input className="form-input" type="text" value={inputText} onChange={e => setInputText(e.target.value.slice(0, 15))}
                  placeholder="HELLO WORLD" style={{ fontSize: '1.1rem', fontWeight: 600 }} />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                <label className="form-label">Style</label>
                <select className="form-select" value={style} onChange={e => setStyle(e.target.value)}>
                  {STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              {style === 'block' && (
                <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                  <label className="form-label">Block Character</label>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {BLOCK_CHARS.map(c => (
                      <button key={c} onClick={() => setBlockChar(c)}
                        style={{ width: '34px', height: '34px', border: `2px solid ${blockChar === c ? 'var(--accent-purple-light)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-sm)', background: blockChar === c ? 'rgba(96,165,250,0.1)' : 'var(--bg-input)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ASCII output */}
            <div style={{ position: 'relative' }}>
              <pre style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: '"Courier New", Courier, monospace', fontSize: 'clamp(0.45rem, 1.5vw, 0.75rem)', lineHeight: 1.15, color: 'var(--accent-cyan-light)', overflowX: 'auto', whiteSpace: 'pre', userSelect: 'all', minHeight: '100px' }}>
                {output || 'Type something above to generate ASCII art...'}
              </pre>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={copy} style={{ gap: '8px' }}>
                <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                {copied ? 'Copied!' : 'Copy ASCII Art'}
              </button>
              <button className="btn btn-secondary" onClick={() => setInputText('')} style={{ gap: '8px' }}>
                <i className="fa-solid fa-trash-can"></i> Clear
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-purple-light)', marginRight: '6px' }}></i>
              Supports A-Z, 0-9, and basic punctuation. ASCII art renders best with monospace fonts. Paste into terminals, README files, or Discord for best results.
            </div>
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
