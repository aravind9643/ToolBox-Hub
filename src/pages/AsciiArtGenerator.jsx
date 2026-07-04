import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';

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

const RAMPS = {
  short: '@#*+=-:. ',
  long: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  blocks: '█▓▒░ '
};

export default function AsciiArtGenerator() {
  const [artMode, setArtMode] = useState('text'); // 'text' | 'image'
  const [inputText, setInputText] = useState('HELLO');
  const [style, setStyle] = useState('block');
  const [blockChar, setBlockChar] = useState('█');
  const [copied, setCopied] = useState(false);

  // Image modes states
  const [imageSrc, setImageSrc] = useState('');
  const [imageAscii, setImageAscii] = useState('');
  const [asciiWidth, setAsciiWidth] = useState(80);
  const [rampType, setRampType] = useState('short');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const convertImageToAscii = (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = asciiWidth;
    // Account for font height-to-width ratio (characters are normally ~1.8 times taller than wide)
    const height = Math.round(width * (img.height / img.width) * 0.52);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height).data;

    let ascii = '';
    const ramp = RAMPS[rampType];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4;
        const r = imgData[offset];
        const g = imgData[offset + 1];
        const b = imgData[offset + 2];
        const a = imgData[offset + 3];

        // If pixel is transparent, add space
        if (a < 128) {
          ascii += ' ';
          continue;
        }

        // Grayscale conversion
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const charIdx = Math.floor((brightness / 255) * (ramp.length - 1));
        ascii += ramp[charIdx];
      }
      ascii += '\n';
    }
    setImageAscii(ascii);
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      const img = new Image();
      img.onload = () => {
        convertImageToAscii(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Re-run image translation when settings change
  const triggerImageRebuild = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => convertImageToAscii(img);
    img.src = imageSrc;
  };

  const output = useMemo(() => {
    if (artMode === 'image') return imageAscii;
    if (!inputText.trim()) return '';
    const s = STYLES.find(s => s.id === style) || STYLES[0];
    try { return s.fn(inputText.slice(0, 15), blockChar); } catch { return ''; }
  }, [inputText, style, blockChar, artMode, imageAscii]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="tool-page">
      <SEOHead title="ASCII Art Generator" description="Convert text to banner fonts or transform photos into ASCII text art grids locally in browser." />
      
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>ASCII Art Generator</span></div>
        <h1><i className="fa-solid fa-font" style={{ color: 'var(--accent-purple-light)' }}></i> ASCII Art Generator</h1>
        <p>Convert text to large banner headers or convert photos into retro text-mode art.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          {/* Mode Selector */}
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab-btn ${artMode === 'text' ? 'active' : ''}`} onClick={() => setArtMode('text')}>
              <i className="fa-solid fa-keyboard" style={{ marginRight: '6px' }}></i> Text Banner
            </button>
            <button className={`tab-btn ${artMode === 'image' ? 'active' : ''}`} onClick={() => setArtMode('image')}>
              <i className="fa-solid fa-file-image" style={{ marginRight: '6px' }}></i> Image to ASCII
            </button>
          </div>

          <div className="glass-card">
            
            {/* TEXT MODE */}
            {artMode === 'text' && (
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
            )}

            {/* IMAGE MODE */}
            {artMode === 'image' && (
              <div style={{ marginBottom: '1.25rem' }}>
                {/* Drag zone */}
                <div 
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length > 0) handleImageUpload(e.dataTransfer.files[0]); }}
                  style={{
                    border: isDragging ? '2px dashed var(--accent-cyan-light)' : '2px dashed var(--border-color)',
                    background: isDragging ? 'var(--bg-glass-hover)' : 'none',
                    transition: 'all 0.2s',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ fontSize: '2rem', color: 'var(--accent-purple-light)', marginBottom: '0.5rem' }}>
                    <i className="fa-solid fa-file-arrow-up"></i>
                  </div>
                  <h3>Select or drag photo to render</h3>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={e => handleImageUpload(e.target.files[0])} style={{ display: 'none' }} />
                </div>

                {imageSrc && (
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-glass-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Output Columns Width ({asciiWidth} chars)</label>
                      <input type="range" min="40" max="150" step="5" value={asciiWidth} onChange={e => { setAsciiWidth(Number(e.target.value)); setTimeout(triggerImageRebuild, 50); }} style={{ width: '100%', height: '4px' }} />
                    </div>
                    <div className="form-group" style={{ margin: 0, width: '140px' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Character Density</label>
                      <select className="form-select" value={rampType} onChange={e => { setRampType(e.target.value); setTimeout(triggerImageRebuild, 50); }}>
                        <option value="short">Normal Contrast</option>
                        <option value="long">Detailed Ramp</option>
                        <option value="blocks">Retro Block Fill</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ASCII Output Display */}
            <div style={{ position: 'relative' }}>
              <pre style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: '"Courier New", Courier, monospace', fontSize: artMode === 'image' ? 'clamp(0.2rem, 0.7vw, 0.5rem)' : 'clamp(0.45rem, 1.5vw, 0.75rem)', lineHeight: 1.0, color: 'var(--accent-cyan-light)', overflowX: 'auto', whiteSpace: 'pre', userSelect: 'all', minHeight: '100px' }}>
                {output || (artMode === 'image' ? 'Upload an image above to translate into ASCII art...' : 'Type text above to generate...')}
              </pre>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={copy} disabled={!output} style={{ gap: '8px' }}>
                <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                {copied ? 'Copied Art!' : 'Copy ASCII Art'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setInputText(''); setImageAscii(''); setImageSrc(''); }} style={{ gap: '8px' }}>
                <i className="fa-solid fa-trash-can"></i> Clear
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-purple-light)', marginRight: '6px' }}></i>
              ASCII art renders best with monospace fonts. Paste into terminals, README files, or markdown document templates for retro visuals.
            </div>
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
