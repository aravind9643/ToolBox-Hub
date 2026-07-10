import { useState, useCallback, useMemo } from 'react';
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

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// WCAG Contrast compliance rating calculations helper
function getContrastRatio(rgb1, rgb2) {
  const getLuminance = (rgb) => {
    const a = [rgb.r, rgb.g, rgb.b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  
  const l1 = getLuminance(rgb1) + 0.05;
  const l2 = getLuminance(rgb2) + 0.05;
  return Math.max(l1, l2) / Math.min(l1, l2);
}

export default function ColorPicker() {
  const [hex, setHex] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('#ffffff');
  const [copied, setCopied] = useState('');

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);

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

  // Generate Tints & Shades
  const palette = useMemo(() => {
    const tints = [];
    const shades = [];
    
    // Generate shades (darker)
    for (let i = 1; i <= 5; i++) {
      const targetL = Math.max(0, hsl.l - (i * 8));
      shades.push(hslToHex(hsl.h, hsl.s, targetL));
    }
    
    // Generate tints (lighter)
    for (let i = 1; i <= 5; i++) {
      const targetL = Math.min(100, hsl.l + (i * 8));
      tints.push(hslToHex(hsl.h, hsl.s, targetL));
    }

    return { tints: tints.reverse(), shades };
  }, [hsl]);

  // Contrast calculation
  const contrastRatio = useMemo(() => {
    const textRgb = hexToRgb(textColor);
    return getContrastRatio(rgb, textRgb).toFixed(2);
  }, [rgb, textColor]);

  const wacgAA = contrastRatio >= 4.5 ? 'Pass ✅' : 'Fail ❌';
  const wacgAAA = contrastRatio >= 7.0 ? 'Pass ✅' : 'Fail ❌';

  // HSL visual adjust handler
  const handleHslChange = (key, val) => {
    const nextHsl = { ...hsl, [key]: val };
    const nextHex = hslToHex(nextHsl.h, nextHsl.s, nextHsl.l);
    setHex(nextHex);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Color Picker Studio & WCAG Contrast Checker" description="Pick colors, convert formats (HEX/RGB/HSL/CMYK), inspect WCAG contrast accessibility ratios, and view tints." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Color Picker</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-eye-dropper" style={{ color: 'var(--accent-purple-light)' }}></i> Color Picker & Studio
        </h1>
        <p>Pick colors, customize HSL components, check WCAG accessibility limits, and generate shades.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Color preview and inputs */}
            <div className="glass-card">
              <div className="color-display" style={{ background: hex, height: '140px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                <input type="color" value={hex} onChange={e => setHex(e.target.value)}
                  style={{ width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>HEX Color</label>
                  <input className="form-input" type="text" value={hex} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setHex(e.target.value); }} />
                </div>
              </div>

              {/* Sliders adjusting */}
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                    <span>Hue (H)</span>
                    <strong>{hsl.h}°</strong>
                  </div>
                  <input type="range" min="0" max="360" value={hsl.h} onChange={e => handleHslChange('h', Number(e.target.value))} style={{ width: '100%', height: '4px', accentColor: 'var(--accent-purple-light)' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                    <span>Saturation (S)</span>
                    <strong>{hsl.s}%</strong>
                  </div>
                  <input type="range" min="0" max="100" value={hsl.s} onChange={e => handleHslChange('s', Number(e.target.value))} style={{ width: '100%', height: '4px', accentColor: 'var(--accent-purple-light)' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                    <span>Lightness (L)</span>
                    <strong>{hsl.l}%</strong>
                  </div>
                  <input type="range" min="0" max="100" value={hsl.l} onChange={e => handleHslChange('l', Number(e.target.value))} style={{ width: '100%', height: '4px', accentColor: 'var(--accent-purple-light)' }} />
                </div>
              </div>
            </div>

            {/* Accessibility and formats */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}><i className="fa-solid fa-universal-access"></i> WCAG Contrast Checker</h3>
              
              <div style={{ padding: '0.85rem', background: hex, color: textColor, borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                Sample Preview Text
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label className="form-label" style={{ margin: 0, fontSize: '0.75rem' }}>Forecolor:</label>
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
                <input className="form-input" type="text" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ height: '32px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '100px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ background: 'var(--bg-input)', padding: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Contrast Ratio</div>
                  <strong style={{ fontSize: '1rem', color: 'var(--accent-cyan-light)' }}>{contrastRatio} : 1</strong>
                </div>
                <div style={{ background: 'var(--bg-input)', padding: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WCAG AA (Req 4.5:1)</div>
                  <strong>{wacgAA}</strong>
                </div>
                <div style={{ background: 'var(--bg-input)', padding: '0.5rem', borderRadius: '4px', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WCAG AAA (Req 7.0:1)</div>
                  <strong>{wacgAAA}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Formats and shades */}
          <div className="glass-card mt-2">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}><i className="fa-solid fa-code"></i> Color Codes Output</h3>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
              {formats.map(f => (
                <div key={f.label} className="stat-card" style={{ cursor: 'pointer', padding: '0.65rem 0.85rem' }} onClick={() => copy(f.value, f.label)}>
                  <div className="stat-card-label" style={{ fontSize: '0.7rem' }}>{f.label}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem', wordBreak: 'break-all' }}>{f.value}</div>
                  <div style={{ fontSize: '0.62rem', color: copied === f.label ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {copied === f.label ? '✓ Copied' : 'Click to copy'}
                  </div>
                </div>
              ))}
            </div>

            {/* Shades and Tints */}
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Tints (Lighter)</h3>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {palette.tints.map(t => (
                  <div key={t} onClick={() => setHex(t)} style={{ flex: 1, minWidth: '40px', height: '40px', background: t, borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-color)' }} title={t} />
                ))}
              </div>

              <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Shades (Darker)</h3>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {palette.shades.map(s => (
                  <div key={s} onClick={() => setHex(s)} style={{ flex: 1, minWidth: '40px', height: '40px', background: s, borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-color)' }} title={s} />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
