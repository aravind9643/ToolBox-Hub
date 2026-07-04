import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
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

function generateHarmony(hex, type) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  switch (type) {
    case 'complementary':
      return [hex, hslToHex((h + 180) % 360, s, l)];
    case 'triadic':
      return [hex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
    case 'analogous':
      return [hslToHex((h - 30 + 360) % 360, s, l), hex, hslToHex((h + 30) % 360, s, l)];
    case 'split-complementary':
      return [hex, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)];
    case 'tetradic':
      return [hex, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)];
    case 'shades':
      return [20, 35, 50, 65, 80].map(lightness => hslToHex(h, s, lightness));
    default:
      return [hex];
  }
}

export default function ColorPaletteGenerator() {
  const [hex, setHex] = useState('#3b82f6');
  const [harmonyType, setHarmonyType] = useState('complementary');
  const [copied, setCopied] = useState('');

  const copy = useCallback((text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  }, []);

  const harmonyColors = useMemo(() => generateHarmony(hex, harmonyType), [hex, harmonyType]);

  const harmonyTypes = ['complementary', 'triadic', 'analogous', 'split-complementary', 'tetradic', 'shades'];

  return (
    <div className="tool-page">
      <SEOHead title="Color Palette Generator" description="Generate stunning color palettes based on color theory harmonies (Complementary, Triadic, Analogous)." />
      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Color Palette Generator</span>
        </div>
        <h1>
          <i className="fa-solid fa-palette" style={{ color: 'var(--accent-purple-light)' }}></i> Color Palette Generator
        </h1>
        <p>Create harmonious color schemes using color theory rule sets.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Base Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="color" value={hex} onChange={e => setHex(e.target.value)}
                    style={{ width: 48, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input className="form-input" type="text" value={hex} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setHex(e.target.value); }}
                    style={{ width: '120px', fontWeight: 600 }} />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Harmony Type</label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {harmonyTypes.map(t => (
                    <button key={t} onClick={() => setHarmonyType(t)}
                      className="copy-btn"
                      style={{
                        padding: '0.35rem 0.75rem', fontSize: '0.8rem', justifyContent: 'center', textTransform: 'capitalize',
                        borderColor: harmonyType === t ? 'var(--accent-purple-light)' : 'var(--border-color)',
                        background: harmonyType === t ? 'rgba(96,165,250,0.15)' : 'var(--bg-glass)'
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {harmonyColors.map((c, i) => (
                <div key={i} style={{ flex: '1', minWidth: '100px', cursor: 'pointer' }} onClick={() => copy(c, `harm-${i}`)}>
                  <div style={{ height: '120px', borderRadius: '12px', background: c, border: '2px solid var(--border-color)', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.toUpperCase()}</div>
                  <div style={{ textAlign: 'center', fontSize: '0.7rem', color: copied === `harm-${i}` ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {copied === `harm-${i}` ? '✓ Copied!' : 'Click to copy'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Copy as CSS variables</div>
              <code style={{ fontSize: '0.8rem', color: 'var(--accent-cyan-light)', cursor: 'pointer', wordBreak: 'break-all' }}
                onClick={() => copy(harmonyColors.map((c, i) => `--color-${i + 1}: ${c};`).join('\n'), 'css')}>
                {harmonyColors.map((c, i) => `--color-${i + 1}: ${c};`).join(' ')}
                {copied === 'css' && <span style={{ color: 'var(--accent-green)', marginLeft: '0.5rem' }}>✓</span>}
              </code>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Color Palette Generator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
