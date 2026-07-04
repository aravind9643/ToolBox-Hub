import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  } else { s = 0; }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorPicker() {
  const [hex, setHex] = useState('#3b82f6');
  const [copied, setCopied] = useState('');

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const copy = useCallback((text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  }, []);

  const formats = [
    { label: 'HEX', value: hex.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
  ];

  return (
    <div className="tool-page">
      <SEOHead title="Color Picker & Converter" description="Pick colors and convert between HEX, RGB, HSL formats. Free color tool." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Color Picker</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-eye-dropper" style={{ color: 'var(--accent-purple-light)' }}></i> Color Picker & Converter
        </h1>
        <p>Pick colors and convert between HEX, RGB, HSL and RGBA formats.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div className="color-display" style={{ background: hex, height: '180px', borderRadius: '12px', border: '2px solid var(--border-color)', position: 'relative' }}>
              <input type="color" value={hex} onChange={e => setHex(e.target.value)}
                style={{ width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
            </div>

            <div className="form-group mt-2">
              <label className="form-label">HEX Code</label>
              <input className="form-input" type="text" value={hex} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setHex(e.target.value); }}
                style={{ fontSize: '1.1rem', fontWeight: 600 }} />
            </div>

            <div className="stats-grid">
              {formats.map(f => (
                <div key={f.label} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => copy(f.value, f.label)}>
                  <div className="stat-card-label">{f.label}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem', wordBreak: 'break-all' }}>{f.value}</div>
                  <div style={{ fontSize: '0.65rem', color: copied === f.label ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {copied === f.label ? '✓ Copied!' : 'Click to copy'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Color Picker & Converter — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
