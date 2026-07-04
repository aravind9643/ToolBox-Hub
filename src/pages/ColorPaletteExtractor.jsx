import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function ColorPaletteExtractor() {
  const [imageSrc, setImageSrc] = useState('');
  const [palette, setPalette] = useState([]);
  const [copied, setCopied] = useState('');
  const canvasRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      extractPalette(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const extractPalette = (src) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Downscale for performance
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

        // Convert to HEX
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        colors.push({ r, g, b, hex });
      }

      // Group colors using a simple quantization (bucket RGB values by 32s)
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
        const hex = '#' + [avgR, avgG, avgB].map(x => x.toString(16).padStart(2, '0')).join('');
        return hex;
      });

      setPalette(finalPalette);
    };
    img.src = src;
  };

  const copy = (hex, i) => {
    navigator.clipboard.writeText(hex);
    setCopied(`c-${i}`);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Image Color Palette Extractor" description="Upload any image and extract its dominant color palette instantly. Free client-side image tool." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Palette Extractor</span></div>
        <h1><i className="fa-solid fa-palette" style={{ color: 'var(--accent-purple-light)' }}></i> Color Palette Extractor</h1>
        <p>Upload a photo or image to extract its dominant color palette instantly.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div className="form-group">
              <label className="form-label">Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="form-input" style={{ padding: '0.5rem' }} />
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', marginTop: '1rem' }}>
              {imageSrc ? (
                <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={imageSrc} alt="Uploaded Source" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', border: '2px solid var(--border-color)', objectFit: 'contain' }} />
                </div>
              ) : (
                <div className="workspace-column" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Choose an image file to start</span>
                </div>
              )}

              <div className="workspace-column">
                <h3>Extracted Color Palette</h3>
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
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                    Dominant colors will appear here after uploading an image.
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
