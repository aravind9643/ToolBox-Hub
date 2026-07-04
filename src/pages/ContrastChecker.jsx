import { useState, useMemo } from 'react';
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

export default function ContrastChecker() {
  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#1e293b');

  const contrastRatio = useMemo(() => getContrastRatio(fgColor, bgColor), [fgColor, bgColor]);
  const wcagAA = contrastRatio >= 4.5;
  const wcagAALarge = contrastRatio >= 3;
  const wcagAAA = contrastRatio >= 7;
  const wcagAAALarge = contrastRatio >= 4.5;

  const handleSwap = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  return (
    <div className="tool-page">
      <SEOHead title="WCAG Color Contrast Checker" description="Check contrast ratios of text and background colors to meet WCAG AA and AAA accessibility standard standards." />
      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Contrast Checker</span>
        </div>
        <h1>
          <i className="fa-solid fa-circle-half-stroke" style={{ color: 'var(--accent-purple-light)' }}></i> WCAG Contrast Checker
        </h1>
        <p>Check accessibility contrast ratios between foreground and background colors.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
            {/* Color Inputs */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Select Colors</h2>

              <div className="form-group">
                <label className="form-label">Foreground (Text) Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                    style={{ width: 46, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input className="form-input" type="text" value={fgColor}
                    onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setFgColor(e.target.value); }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button className="copy-btn btn-sm" onClick={handleSwap} style={{ gap: '6px' }}>
                  <i className="fa-solid fa-arrows-up-down"></i> Swap Colors
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Background Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    style={{ width: 46, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input className="form-input" type="text" value={bgColor}
                    onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setBgColor(e.target.value); }} />
                </div>
              </div>
            </div>

            {/* Calculations & Results */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Contrast Projections</h2>

              {/* Sample Preview Box */}
              <div style={{ padding: '1.5rem', background: bgColor, borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)' }}>
                <p style={{ color: fgColor, fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                  This is how normal text looks.
                </p>
                <p style={{ color: fgColor, fontSize: '0.85rem', margin: '0.5rem 0 0', opacity: 0.85 }}>
                  This is how smaller secondary details look.
                </p>
              </div>

              {/* Large Ratio value */}
              <div style={{ textAlign: 'center', padding: '1rem 0', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Contrast Ratio</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: wcagAAA ? 'var(--accent-green)' : wcagAA ? 'var(--accent-cyan-light)' : 'var(--accent-red)' }}>
                  {contrastRatio.toFixed(2)}:1
                </div>
              </div>

              {/* WCAG Checks grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'WCAG AA (Normal Text)', pass: wcagAA, req: '≥ 4.5:1' },
                  { label: 'WCAG AA (Large Text)', pass: wcagAALarge, req: '≥ 3:1' },
                  { label: 'WCAG AAA (Normal Text)', pass: wcagAAA, req: '≥ 7:1' },
                  { label: 'WCAG AAA (Large Text)', pass: wcagAAALarge, req: '≥ 4.5:1' },
                ].map(({ label, pass, req }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: `1px solid ${pass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}` }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      {label} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({req})</span>
                    </span>
                    <span style={{ fontWeight: 700, color: pass ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.85rem' }}>
                      {pass ? '✓ PASS' : '✗ FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="WCAG Contrast Checker — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
