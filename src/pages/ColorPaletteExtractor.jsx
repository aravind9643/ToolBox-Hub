import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function ColorPaletteExtractor() {
  const [imageSrc, setImageSrc] = useState('');
  const [palette, setPalette] = useState([]);
  const [copied, setCopied] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      extractPalette(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    processFile(e.target.files[0]);
  };

  const extractPalette = (src) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);

      const imgData = ctx.getImageData(0, 0, 100, 100).data;
      const colors = [];

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];
        if (a < 128) continue; // skip transparent
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        colors.push({ r, g, b, hex });
      }

      const buckets = {};
      colors.forEach(c => {
        const k = `${Math.floor(c.r / 40)},${Math.floor(c.g / 40)},${Math.floor(c.b / 40)}`;
        if (!buckets[k]) buckets[k] = { count: 0, r: 0, g: 0, b: 0 };
        buckets[k].count++;
        buckets[k].r += c.r;
        buckets[k].g += c.g;
        buckets[k].b += c.b;
      });

      const sortedBuckets = Object.values(buckets)
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      const finalPalette = sortedBuckets.map(b => {
        const avgR = Math.round(b.r / b.count);
        const avgG = Math.round(b.g / b.count);
        const avgB = Math.round(b.b / b.count);
        return '#' + [avgR, avgG, avgB].map(x => x.toString(16).padStart(2, '0')).join('');
      });

      setPalette(finalPalette);
    };
    img.src = src;
  };

  const handleImageClick = (e) => {
    const imgEl = e.target;
    const rect = imgEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const scaleX = imgEl.naturalWidth / rect.width;
    const scaleY = imgEl.naturalHeight / rect.height;

    const x = Math.floor(clickX * scaleX);
    const y = Math.floor(clickY * scaleY);

    const canvas = document.createElement('canvas');
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');

    setPalette(prev => {
      if (prev.includes(hex)) return prev;
      return [hex, ...prev.slice(0, 7)];
    });
  };

  const copy = (hex, i) => {
    navigator.clipboard.writeText(hex);
    setCopied(`c-${i}`);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Image Color Palette Extractor" description="Extract color palettes from images or pick custom pixel colors. Free client-side image tool." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Palette Extractor</span></div>
        <h1><i className="fa-solid fa-palette" style={{ color: 'var(--accent-purple-light)' }}></i> Color Palette Extractor</h1>
        <p>Upload a photo to extract its dominant color palette, or click any pixel to pick custom colors.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Drag and drop area */}
            <div 
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length > 0) processFile(e.dataTransfer.files[0]); }}
              style={{
                border: isDragging ? '2px dashed var(--accent-cyan-light)' : '2px dashed var(--border-color)',
                background: isDragging ? 'var(--bg-glass-hover)' : 'none',
                transition: 'all 0.2s',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: 'var(--accent-purple-light)' }}>
                <i className="fa-solid fa-file-image"></i>
              </div>
              <h3>{isDragging ? 'Drop photo here!' : 'Select or drag an image'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Extract dominant hues and click pixel targets</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', marginTop: '1rem' }}>
              {imageSrc ? (
                <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label className="form-label" style={{ marginBottom: '0.5rem' }}>💡 Click on the image to pick custom pixel colors:</label>
                  <img 
                    src={imageSrc} 
                    alt="Uploaded Source" 
                    onClick={handleImageClick}
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', border: '2px solid var(--border-color)', objectFit: 'contain', cursor: 'crosshair' }} 
                  />
                </div>
              ) : (
                <div className="workspace-column" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Choose an image file to start</span>
                </div>
              )}

              <div className="workspace-column">
                <h3>Palette Output</h3>
                {palette.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {palette.map((color, i) => (
                      <div key={i} onClick={() => copy(color, i)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.65rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-purple-light)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: color, border: '1px solid rgba(255,255,255,0.15)' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{color.toUpperCase()}</div>
                          <div style={{ fontSize: '0.75rem', color: copied === `c-${i}` ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                            {copied === `c-${i}` ? '✓ Copied!' : 'Click to copy HEX'}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="btn btn-secondary btn-sm" onClick={() => setPalette([])} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                      <i className="fa-solid fa-trash-can"></i> Clear Palette
                    </button>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                    Dominant colors will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Image Color Palette Extractor — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
