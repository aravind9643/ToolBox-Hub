import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
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

function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
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

export default function ColorPicker() {
  const [activeTab, setActiveTab] = useState('pick');
  const [hex, setHex] = useState('#3b82f6');
  const [harmonyType, setHarmonyType] = useState('complementary');
  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColorContrast, setBgColorContrast] = useState('#1e293b');
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

  const harmonyColors = useMemo(() => generateHarmony(hex, harmonyType), [hex, harmonyType]);

  const contrastRatio = useMemo(() => getContrastRatio(fgColor, bgColorContrast), [fgColor, bgColorContrast]);
  const wcagAA = contrastRatio >= 4.5;
  const wcagAALarge = contrastRatio >= 3;
  const wcagAAA = contrastRatio >= 7;

  const harmonyTypes = ['complementary', 'triadic', 'analogous', 'split-complementary', 'tetradic', 'shades'];

  return (
    <div className="tool-page">
      <SEOHead title="Color Picker, Palette & Contrast Checker" description="Pick colors, generate harmonious palettes, and check WCAG contrast ratios. Free color tool." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Color Picker</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-eye-dropper" style={{ color: 'var(--accent-purple-light)' }}></i> Color Picker & Palette
        </h1>
        <p>Pick colors, generate harmonious palettes, and check WCAG accessibility contrast ratios.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            {[['pick', 'fa-eye-dropper', 'Pick & Convert'], ['harmony', 'fa-palette', 'Palette Harmony'], ['contrast', 'fa-circle-half-stroke', 'Contrast Checker']].map(([id, icon, label]) => (
              <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
                <i className={`fa-solid ${icon}`} style={{ marginRight: '6px' }}></i>{label}
              </button>
            ))}
          </div>

          {activeTab === 'pick' && (
            <div className="glass-card">
              <div className="color-display" style={{ background: hex }}>
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
          )}

          {activeTab === 'harmony' && (
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
                          padding: '0.3rem 0.65rem', fontSize: '0.75rem', justifyContent: 'center', textTransform: 'capitalize',
                          borderColor: harmonyType === t ? 'var(--accent-purple-light)' : 'var(--border-color)',
                          background: harmonyType === t ? 'rgba(96,165,250,0.15)' : 'var(--bg-glass)'
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {harmonyColors.map((c, i) => (
                  <div key={i} style={{ flex: '1', minWidth: '100px', cursor: 'pointer' }} onClick={() => copy(c, `harm-${i}`)}>
                    <div style={{ height: '120px', borderRadius: '12px', background: c, border: '2px solid var(--border-color)', transition: 'transform 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.toUpperCase()}</div>
                    <div style={{ textAlign: 'center', fontSize: '0.65rem', color: copied === `harm-${i}` ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {copied === `harm-${i}` ? '✓ Copied!' : 'Click to copy'}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Copy as CSS variables</div>
                <code style={{ fontSize: '0.8rem', color: 'var(--accent-cyan-light)', cursor: 'pointer', wordBreak: 'break-all' }}
                  onClick={() => copy(harmonyColors.map((c, i) => `--color-${i + 1}: ${c};`).join('\n'), 'css')}>
                  {harmonyColors.map((c, i) => `--color-${i + 1}: ${c};`).join(' ')}
                  {copied === 'css' && <span style={{ color: 'var(--accent-green)', marginLeft: '0.5rem' }}>✓</span>}
                </code>
              </div>
            </div>
          )}

          {activeTab === 'contrast' && (
            <div className="glass-card">
              <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
                <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>Colors</h3>
                  {[
                    { label: 'Foreground (Text) Color', val: fgColor, set: setFgColor },
                    { label: 'Background Color', val: bgColorContrast, set: setBgColorContrast }
                  ].map(({ label, val, set }) => (
                    <div key={label} className="form-group">
                      <label className="form-label">{label}</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="color" value={val} onChange={e => set(e.target.value)}
                          style={{ width: 42, height: 38, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                        <input className="form-input" type="text" value={val}
                          onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) set(e.target.value); }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>Results</h3>

                  {/* Preview */}
                  <div style={{ padding: '1.5rem', background: bgColorContrast, borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)' }}>
                    <p style={{ color: fgColor, fontSize: '1rem', fontWeight: 600, margin: 0 }}>The quick brown fox jumps over the lazy dog.</p>
                    <p style={{ color: fgColor, fontSize: '0.75rem', margin: '0.5rem 0 0' }}>Small text (14px) — harder to read at low contrast</p>
                  </div>

                  {/* Ratio */}
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Contrast Ratio</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: wcagAAA ? 'var(--accent-green)' : wcagAA ? 'var(--accent-cyan-light)' : 'var(--accent-red)' }}>
                      {contrastRatio.toFixed(2)}:1
                    </div>
                  </div>

                  {/* WCAG Results */}
                  {[
                    { label: 'WCAG AA (Normal Text)', pass: wcagAA, req: '≥ 4.5:1' },
                    { label: 'WCAG AA (Large Text)', pass: wcagAALarge, req: '≥ 3:1' },
                    { label: 'WCAG AAA (Normal Text)', pass: wcagAAA, req: '≥ 7:1' },
                  ].map(({ label, pass, req }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: `1px solid ${pass ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                      <span style={{ fontSize: '0.85rem' }}>{label} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({req})</span></span>
                      <span style={{ fontWeight: 700, color: pass ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.85rem' }}>
                        {pass ? '✓ PASS' : '✗ FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
