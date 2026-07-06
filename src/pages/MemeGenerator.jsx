import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function MemeGenerator() {
  const [imageSrc, setImageSrc] = useState('');
  
  // Custom Draggable Text Layers
  const [textLayers, setTextLayers] = useState([
    { id: '1', text: 'TOP TEXT', x: 150, y: 40, color: '#ffffff', strokeColor: '#000000', fontSize: 28, fontFamily: 'Impact' },
    { id: '2', text: 'BOTTOM TEXT', x: 150, y: 260, color: '#ffffff', strokeColor: '#000000', fontSize: 28, fontFamily: 'Impact' }
  ]);

  // Draggable Emoji Stickers
  const [stickers, setStickers] = useState([]); // Array of { id, emoji, x, y, size }

  const [activeDrag, setActiveDrag] = useState(null); // { type: 'text' | 'sticker', id: string } | null
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (!imageSrc) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'var(--bg-input)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Choose or upload a template photo to start generating', canvas.width / 2, canvas.height / 2);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw template background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Render Text Layers
      textLayers.forEach(layer => {
        ctx.fillStyle = layer.color;
        ctx.strokeStyle = layer.strokeColor;
        ctx.lineWidth = 5;
        ctx.textAlign = 'center';
        ctx.font = `900 ${layer.fontSize}px ${layer.fontFamily}, sans-serif`;

        ctx.strokeText(layer.text.toUpperCase(), layer.x, layer.y);
        ctx.fillText(layer.text.toUpperCase(), layer.x, layer.y);
      });

      // Render Emoji Stickers
      stickers.forEach(sticker => {
        ctx.font = `${sticker.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.emoji, sticker.x, sticker.y);
      });
    };
    img.src = imageSrc;
  };

  useEffect(() => {
    drawMeme();
  }, [imageSrc, textLayers, stickers]);

  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check hit on stickers first (as they render on top)
    for (let s of stickers) {
      const dist = Math.hypot(mouseX - s.x, mouseY - s.y);
      if (dist < s.size / 2 + 10) {
        setActiveDrag({ type: 'sticker', id: s.id });
        return;
      }
    }

    // Check hit on text layers
    for (let layer of textLayers) {
      const dist = Math.hypot(mouseX - layer.x, mouseY - layer.y);
      if (dist < 40) {
        setActiveDrag({ type: 'text', id: layer.id });
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!activeDrag || !imageSrc) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = Math.round(e.clientX - rect.left);
    const mouseY = Math.round(e.clientY - rect.top);

    if (activeDrag.type === 'text') {
      setTextLayers(prev => prev.map(l => l.id === activeDrag.id ? { ...l, x: mouseX, y: mouseY } : l));
    } else if (activeDrag.type === 'sticker') {
      setStickers(prev => prev.map(s => s.id === activeDrag.id ? { ...s, x: mouseX, y: mouseY } : s));
    }
  };

  const handleMouseUp = () => {
    setActiveDrag(null);
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Layers management macros
  const addTextLayer = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setTextLayers(prev => [
      ...prev,
      { id, text: 'EXTRA CAPTION', x: 150, y: 150, color: '#ffffff', strokeColor: '#000000', fontSize: 24, fontFamily: 'Impact' }
    ]);
  };

  const removeTextLayer = (id) => {
    setTextLayers(prev => prev.filter(l => l.id !== id));
  };

  const updateTextLayer = (id, field, value) => {
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const addSticker = (emoji) => {
    const id = Math.random().toString(36).substr(2, 9);
    setStickers(prev => [...prev, { id, emoji, x: 150, y: 150, size: 40 }]);
  };

  const removeSticker = (id) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  const updateStickerSize = (id, size) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, size } : s));
  };

  return (
    <div className="tool-page">
      <SEOHead title="Meme Generator Sandbox" description="Upload layouts, place multiple draggable text caption layers, adjust fonts, and insert fun emojis." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Meme Generator</span></div>
        <h1><i className="fa-solid fa-face-laugh-squint" style={{ color: 'var(--accent-purple-light)' }}></i> Meme Generator</h1>
        <p>Compose custom meme templates with multi-layered draggable captions and stickers.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            {/* Upload template choices */}
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Upload Image Template</label>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="form-input" style={{ padding: '0.5rem' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Or Pick Presets</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Drake', url: 'https://api.memegen.link/images/drake.png' },
                    { label: 'Doge', url: 'https://api.memegen.link/images/doge.png' },
                    { label: 'Disaster', url: 'https://api.memegen.link/images/disastergirl.png' },
                    { label: 'Distracted', url: 'https://api.memegen.link/images/db.png' }
                  ].map(tpl => (
                    <button 
                      key={tpl.label} 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.5rem', fontSize: '0.72rem', flex: '1 1 40%', minWidth: '80px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                      onClick={() => {
                        setImageSrc(tpl.url);
                        // Reset defaults
                        setTextLayers([
                          { id: '1', text: 'TOP TEXT', x: 150, y: 40, color: '#ffffff', strokeColor: '#000000', fontSize: 28, fontFamily: 'Impact' },
                          { id: '2', text: 'BOTTOM TEXT', x: 150, y: 260, color: '#ffffff', strokeColor: '#000000', fontSize: 28, fontFamily: 'Impact' }
                        ]);
                        setStickers([]);
                      }}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Interactive Canvas Box */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
              <div style={{ position: 'relative', width: '300px', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
                <canvas 
                  ref={canvasRef} 
                  width="300" 
                  height="300" 
                  style={{ display: 'block', cursor: activeDrag ? 'grabbing' : 'grab' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
            </div>

            {/* Sticker Add Menu */}
            {imageSrc && (
              <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}><i className="fa-solid fa-face-smile" style={{ color: 'var(--accent-amber)', marginRight: '4px' }}></i> Add Emoji Overlay</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['😎', '🔥', '💀', '🤡', '👑', '💯', '💥', '👀', '🍕', '💩'].map(emoji => (
                    <button 
                      key={emoji} 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => addSticker(emoji)}
                      style={{ fontSize: '1.25rem', padding: '0.2rem 0.5rem' }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Layers Configuration List */}
            {imageSrc && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Customize Layers</span>
                  <button className="btn btn-primary btn-sm" onClick={addTextLayer} style={{ fontSize: '0.75rem' }}>
                    + Add Text Layer
                  </button>
                </div>

                {/* Text layers editing configs */}
                {textLayers.map((layer, idx) => (
                  <div key={layer.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Caption #{idx + 1}:</span>
                      <input 
                        type="text" 
                        value={layer.text} 
                        onChange={e => updateTextLayer(layer.id, 'text', e.target.value)} 
                        className="form-input" 
                        style={{ flex: 1, padding: '0.3rem', fontSize: '0.85rem' }} 
                      />
                      {textLayers.length > 1 && (
                        <button className="btn btn-secondary btn-sm" onClick={() => removeTextLayer(layer.id)} style={{ color: 'var(--accent-red)', padding: '0.3rem 0.5rem' }}>
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      )}
                    </div>
                    
                    {/* Font & Color configurations */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <div className="form-group">
                        <label>Font Size</label>
                        <input type="range" min="14" max="50" value={layer.fontSize} onChange={e => updateTextLayer(layer.id, 'fontSize', Number(e.target.value))} />
                      </div>
                      <div className="form-group">
                        <label>Font Family</label>
                        <select className="form-select" value={layer.fontFamily} onChange={e => updateTextLayer(layer.id, 'fontFamily', e.target.value)} style={{ padding: '0.2rem', height: '28px', fontSize: '0.75rem' }}>
                          <option value="Impact">Impact</option>
                          <option value="Arial">Arial</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Comic Sans MS">Comic Sans</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.65rem' }}>Fill</label>
                          <input type="color" value={layer.color} onChange={e => updateTextLayer(layer.id, 'color', e.target.value)} style={{ padding: 0, width: '28px', height: '24px', cursor: 'pointer' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.65rem' }}>Stroke</label>
                          <input type="color" value={layer.strokeColor} onChange={e => updateTextLayer(layer.id, 'strokeColor', e.target.value)} style={{ padding: 0, width: '28px', height: '24px', cursor: 'pointer' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Stickers resize configs */}
                {stickers.map((s, idx) => (
                  <div key={s.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-input)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                    <span>Sticker #{idx + 1}: <strong style={{ fontSize: '1.1rem' }}>{s.emoji}</strong></span>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Size:</label>
                    <input type="range" min="20" max="80" value={s.size} onChange={e => updateStickerSize(s.id, Number(e.target.value))} style={{ width: '100px' }} />
                    <button className="btn btn-secondary btn-sm" onClick={() => removeSticker(s.id)} style={{ color: 'var(--accent-red)', padding: '0.2rem 0.4rem', marginLeft: 'auto' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="btn-group" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={handleDownload} disabled={!imageSrc} style={{ gap: '8px' }}>
                <i className="fa-solid fa-download"></i> Download Meme
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setImageSrc('');
                setTextLayers([
                  { id: '1', text: 'TOP TEXT', x: 150, y: 40, color: '#ffffff', strokeColor: '#000000', fontSize: 28, fontFamily: 'Impact' },
                  { id: '2', text: 'BOTTOM TEXT', x: 150, y: 260, color: '#ffffff', strokeColor: '#000000', fontSize: 28, fontFamily: 'Impact' }
                ]);
                setStickers([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }} disabled={!imageSrc} style={{ gap: '8px', color: 'var(--accent-red)' }}>
                <i className="fa-solid fa-trash-can"></i> Reset Canvas
              </button>
            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Meme Generator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
