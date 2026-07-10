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
  const [textColorTheme, setTextColorTheme] = useState('default'); // 'default', 'green', 'cyber', 'gold'

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

        if (a < 128) {
          ascii += ' ';
          continue;
        }

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

  // Get text color styles based on selected theme
  const getPreColorStyle = () => {
    switch (textColorTheme) {
      case 'green':
        return {
          color: '#22c55e',
          textShadow: '0 0 4px rgba(34, 197, 94, 0.4)',
          background: '#090d16'
        };
      case 'cyber':
        return {
          backgroundImage: 'linear-gradient(90deg, #ec4899, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          background: '#090d16'
        };
      case 'gold':
        return {
          backgroundImage: 'linear-gradient(90deg, #f59e0b, #eab308)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          background: '#090d16'
        };
      default:
        return {
          color: 'var(--text-primary)',
          background: 'var(--bg-input)'
        };
    }
  };

  return (
    <div className="tool-page">
      <SEOHead title="ASCII Art Font Canvas & Image Converter" description="Convert text to large banner headers or convert photos into retro text-mode art with colors." />
      
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>ASCII Art</span></div>
        <h1><i className="fa-solid fa-font" style={{ color: 'var(--accent-purple-light)' }}></i> ASCII Art Suite</h1>
        <p>Convert text to large banner headers or convert photos into retro text-mode art.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab-btn ${artMode === 'text' ? 'active' : ''}`} onClick={() => setArtMode('text')}>
              <i className="fa-solid fa-keyboard" style={{ marginRight: '6px' }}></i> Text Banner
            </button>
            <button className={`tab-btn ${artMode === 'image' ? 'active' : ''}`} onClick={() => setArtMode('image')}>
              <i className="fa-solid fa-file-image" style={{ marginRight: '6px' }}></i> Image to ASCII
            </button>
          </div>

          <div className="glass-card">
            {artMode === 'text' ? (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
                  <label className="form-label">Banner Text</label>
                  <input className="form-input" type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Type text..." />
                </div>
                
                <div className="form-group" style={{ margin: 0, minWidth: '120px' }}>
                  <label className="form-label">Font Character</label>
                  <select className="form-select" value={blockChar} onChange={e => setBlockChar(e.target.value)}>
                    {BLOCK_CHARS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0, minWidth: '120px' }}>
                  <label className="form-label">Font Style</label>
                  <select className="form-select" value={style} onChange={e => setStyle(e.target.value)}>
                    {STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0, minWidth: '120px' }}>
                  <label className="form-label">Color Theme</label>
                  <select className="form-select" value={textColorTheme} onChange={e => setTextColorTheme(e.target.value)}>
                    <option value="default">Default Theme</option>
                    <option value="green">Green Terminal</option>
                    <option value="cyber">Cyber Neon</option>
                    <option value="gold">Gold Rush</option>
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
                <div
                  className="drop-zone"
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length > 0) handleImageUpload(e.dataTransfer.files[0]); }}
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    border: isDragging ? '2px dashed var(--accent-cyan-light)' : '2px dashed var(--border-color)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-cloud-arrow-up" style={{ color: 'var(--accent-purple-light)', marginBottom: '0.4rem', fontSize: '1.25rem' }}></i>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Drag photo here or browse</div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e.target.files[0])} />
                </div>

                <div className="form-group" style={{ margin: 0, width: '130px' }}>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>Width ({asciiWidth} chars)</label>
                  <input type="range" min="30" max="150" value={asciiWidth} onChange={e => { setAsciiWidth(Number(e.target.value)); triggerImageRebuild(); }} style={{ width: '100%' }} />
                </div>

                <div className="form-group" style={{ margin: 0, minWidth: '120px' }}>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>Characters Set</label>
                  <select className="form-select" value={rampType} onChange={e => { setRampType(e.target.value); triggerImageRebuild(); }} style={{ fontSize: '0.8rem' }}>
                    <option value="short">Short (Default)</option>
                    <option value="long">Long (Extended)</option>
                    <option value="blocks">Blocks (Solid)</option>
                  </select>
                </div>
              </div>
            )}

            {output && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Generated ASCII Output</span>
                  <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
                    <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                
                <pre style={{
                  padding: '1rem',
                  fontFamily: 'monospace',
                  fontSize: '0.62rem',
                  lineHeight: '1.2',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  overflowX: 'auto',
                  whiteSpace: 'pre',
                  ...getPreColorStyle()
                }}>
                  {output}
                </pre>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
