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

function hexToHsl(hex) {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function findCompliantColor(fgHex, bgHex, targetRatio = 4.5) {
  let ratio = getContrastRatio(fgHex, bgHex);
  if (ratio >= targetRatio) return fgHex;

  const fgHsl = hexToHsl(fgHex);
  const bgLuminance = getLuminance(bgHex);
  const isBgDark = bgLuminance < 0.5;
  
  let bestHex = fgHex;
  if (isBgDark) {
    for (let l = fgHsl.l; l <= 100; l += 1) {
      const testHex = hslToHex(fgHsl.h, fgHsl.s, l);
      if (getContrastRatio(testHex, bgHex) >= targetRatio) {
        bestHex = testHex;
        break;
      }
    }
  } else {
    for (let l = fgHsl.l; l >= 0; l -= 1) {
      const testHex = hslToHex(fgHsl.h, fgHsl.s, l);
      if (getContrastRatio(testHex, bgHex) >= targetRatio) {
        bestHex = testHex;
        break;
      }
    }
  }
  return bestHex;
}

// Color blindness simulation matrix logic
function simulateColorBlindness(hex, type) {
  const { r, g, b } = hexToRgb(hex);
  let rSim = r, gSim = g, bSim = b;
  
  if (type === 'deuteranopia') {
    rSim = r * 0.625 + g * 0.375;
    gSim = r * 0.70 + g * 0.30;
    bSim = g * 0.30 + b * 0.70;
  } else if (type === 'protanopia') {
    rSim = r * 0.567 + g * 0.433;
    gSim = r * 0.558 + g * 0.442;
    bSim = g * 0.242 + b * 0.758;
  } else if (type === 'tritanopia') {
    rSim = r * 0.95 + g * 0.05;
    gSim = g * 0.433 + b * 0.567;
    bSim = g * 0.475 + b * 0.525;
  }

  const clamp = (val) => Math.max(0, Math.min(255, Math.round(val)));
  const f = (val) => clamp(val).toString(16).padStart(2, '0');
  return `#${f(rSim)}${f(gSim)}${f(bSim)}`;
}

export default function ContrastChecker() {
  const [fgColor, setFgColor] = useState('#60a5fa');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [colorBlindnessType, setColorBlindnessType] = useState('normal');

  const contrastRatio = useMemo(() => getContrastRatio(fgColor, bgColor), [fgColor, bgColor]);
  const suggestedFg = useMemo(() => findCompliantColor(fgColor, bgColor, 4.5), [fgColor, bgColor]);
  
  const wcagAA = contrastRatio >= 4.5;
  const wcagAALarge = contrastRatio >= 3;
  const wcagAAA = contrastRatio >= 7;
  const wcagAAALarge = contrastRatio >= 4.5;

  const handleSwap = () => {
    setFgColor(bgColor);
    setBgColor(fgColor);
  };

  // Live Lightness slider updater
  const handleLightnessChange = (target, val) => {
    if (target === 'fg') {
      const hsl = hexToHsl(fgColor);
      setFgColor(hslToHex(hsl.h, hsl.s, val));
    } else {
      const hsl = hexToHsl(bgColor);
      setBgColor(hslToHex(hsl.h, hsl.s, val));
    }
  };

  const fgHsl = useMemo(() => hexToHsl(fgColor), [fgColor]);
  const bgHsl = useMemo(() => hexToHsl(bgColor), [bgColor]);

  const simulatedFg = useMemo(() => simulateColorBlindness(fgColor, colorBlindnessType), [fgColor, colorBlindnessType]);
  const simulatedBg = useMemo(() => simulateColorBlindness(bgColor, colorBlindnessType), [bgColor, colorBlindnessType]);

  return (
    <div className="tool-page">
      <SEOHead title="WCAG Contrast Checker & Color Simulator" description="Verify WCAG contrast compliance ratios, simulate Deuteranopia/Protanopia color blindness modes, and auto-fix color pairs." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Contrast Checker</span></div>
        <h1><i className="fa-solid fa-circle-half-stroke" style={{ color: 'var(--accent-purple-light)' }}></i> Color Contrast Accessibility Suite</h1>
        <p>Analyze foreground/background contrast compliance with WCAG AA/AAA parameters and live simulators.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
            
            {/* Left Column: Select Colors & Adjusters */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Color Palette Setup</h2>

              <div className="form-group">
                <label className="form-label">Foreground (Text) Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ width: 46, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input className="form-input" type="text" value={fgColor} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setFgColor(e.target.value); }} />
                </div>
                {/* Lightness Slider */}
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Adjust Lightness: {fgHsl.l}%</span>
                  <input type="range" min="0" max="100" value={fgHsl.l} onChange={e => handleLightnessChange('fg', Number(e.target.value))} style={{ width: '100%', height: '4px', accentColor: 'var(--accent-purple-light)' }} />
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
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 46, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input className="form-input" type="text" value={bgColor} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setBgColor(e.target.value); }} />
                </div>
                {/* Lightness Slider */}
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Adjust Lightness: {bgHsl.l}%</span>
                  <input type="range" min="0" max="100" value={bgHsl.l} onChange={e => handleLightnessChange('bg', Number(e.target.value))} style={{ width: '100%', height: '4px', accentColor: 'var(--accent-purple-light)' }} />
                </div>
              </div>

              {suggestedFg !== fgColor && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    💡 Compliant alternative: <strong style={{ color: suggestedFg }}>{suggestedFg}</strong> (Satisfies WCAG AA contrast ratio).
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setFgColor(suggestedFg)} style={{ width: 'fit-content', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    Apply Fix Suggestion
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Calculations, Simulators, WCAG Ratings */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Contrast Projections & Ratings</h2>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-purple-light)' }}>
                  Ratio: {contrastRatio.toFixed(2)} : 1
                </div>
              </div>

              {/* Sample Preview Box */}
              <div style={{ padding: '1.25rem', background: simulatedBg, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ color: simulatedFg, fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                  This is how normal text looks.
                </p>
                <p style={{ color: simulatedFg, fontSize: '0.85rem', margin: 0, opacity: 0.85 }}>
                  This is how smaller secondary details look.
                </p>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: simulatedFg, color: simulatedBg, border: 'none' }}>
                    Solid Button
                  </button>
                  <button style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: 'none', color: simulatedFg, border: `2px solid ${simulatedFg}` }}>
                    Outline Button
                  </button>
                </div>
              </div>

              {/* Simulator Options Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Color Blindness Filter:</span>
                <select className="form-select text-xs" value={colorBlindnessType} onChange={e => setColorBlindnessType(e.target.value)} style={{ width: '130px', padding: '0.25rem 0.5rem', height: '28px', fontSize: '0.75rem' }}>
                  <option value="normal">Normal Vision</option>
                  <option value="deuteranopia">Deuteranopia (Green)</option>
                  <option value="protanopia">Protanopia (Red)</option>
                  <option value="tritanopia">Tritanopia (Blue)</option>
                </select>
              </div>

              {/* WCAG Compliance Badges Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WCAG AA (Normal Text)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={wcagAA ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"} style={{ color: wcagAA ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{wcagAA ? 'PASSED' : 'FAILED'}</span>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WCAG AA (Large Text)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={wcagAALarge ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"} style={{ color: wcagAALarge ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{wcagAALarge ? 'PASSED' : 'FAILED'}</span>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WCAG AAA (Normal Text)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={wcagAAA ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"} style={{ color: wcagAAA ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{wcagAAA ? 'PASSED' : 'FAILED'}</span>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WCAG AAA (Large Text)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={wcagAAALarge ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"} style={{ color: wcagAAALarge ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{wcagAAALarge ? 'PASSED' : 'FAILED'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Accessibility Contrast Checker — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
