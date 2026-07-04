import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';

const STANDARD_RATIOS = [
  { label: '16:9', w: 16, h: 9, desc: 'HD/4K Video, YouTube, TV' },
  { label: '4:3', w: 4, h: 3, desc: 'Old TV, Photos' },
  { label: '1:1', w: 1, h: 1, desc: 'Instagram Square, Profile Photos' },
  { label: '9:16', w: 9, h: 16, desc: 'TikTok, Reels, Stories' },
  { label: '4:5', w: 4, h: 5, desc: 'Instagram Portrait' },
  { label: '2:1', w: 2, h: 1, desc: 'Panoramic, Twitter Header' },
  { label: '21:9', w: 21, h: 9, desc: 'Ultra-wide Cinema' },
  { label: '3:2', w: 3, h: 2, desc: 'DSLR Photo, 35mm Film' },
  { label: '5:4', w: 5, h: 4, desc: 'Print, Large Format' },
  { label: '2.39:1', w: 239, h: 100, desc: 'Anamorphic Cinema' },
  { label: '1.85:1', w: 185, h: 100, desc: 'US Theater Standard' },
  { label: '4:6', w: 4, h: 6, desc: '4×6 Photo Print' },
];

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function getSimplifiedRatio(w, h) {
  const d = gcd(Math.round(w), Math.round(h));
  return { w: Math.round(w) / d, h: Math.round(h) / d };
}

function findClosestRatio(w, h) {
  const inputRatio = w / h;
  let closest = null, minDiff = Infinity;
  for (const r of STANDARD_RATIOS) {
    const diff = Math.abs(r.w / r.h - inputRatio);
    if (diff < minDiff) { minDiff = diff; closest = r; }
  }
  return { ratio: closest, exactMatch: minDiff < 0.01 };
}

export default function AspectRatioCalculator() {
  const [mode, setMode] = useState('find'); // 'find' | 'scale'
  // Find mode
  const [widthF, setWidthF] = useState('1920');
  const [heightF, setHeightF] = useState('1080');
  // Scale mode
  const [ratioW, setRatioW] = useState('16');
  const [ratioH, setRatioH] = useState('9');
  const [targetDim, setTargetDim] = useState('width');
  const [targetVal, setTargetVal] = useState('1280');
  const [copied, setCopied] = useState('');

  const findResult = useMemo(() => {
    const w = parseFloat(widthF);
    const h = parseFloat(heightF);
    if (!w || !h || w <= 0 || h <= 0) return null;
    const simplified = getSimplifiedRatio(w, h);
    const { ratio, exactMatch } = findClosestRatio(w, h);
    return { simplified, ratio, exactMatch, megapixels: (w * h / 1e6).toFixed(2), diagonal: Math.sqrt(w * w + h * h).toFixed(0) };
  }, [widthF, heightF]);

  const scaleResult = useMemo(() => {
    const rw = parseFloat(ratioW);
    const rh = parseFloat(ratioH);
    const val = parseFloat(targetVal);
    if (!rw || !rh || !val || rw <= 0 || rh <= 0 || val <= 0) return null;
    const scaledW = targetDim === 'width' ? val : (val * rw / rh);
    const scaledH = targetDim === 'height' ? val : (val * rh / rw);
    return { w: Math.round(scaledW), h: Math.round(scaledH) };
  }, [ratioW, ratioH, targetDim, targetVal]);

  // Preset scaling to common sizes
  const presets = useMemo(() => {
    const rw = parseFloat(ratioW);
    const rh = parseFloat(ratioH);
    if (!rw || !rh) return [];
    const baseHeights = [360, 480, 720, 1080, 1440, 2160];
    return baseHeights.map(h => ({ label: `${h}p`, w: Math.round(h * rw / rh), h }));
  }, [ratioW, ratioH]);

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Aspect Ratio Calculator" description="Find aspect ratios from dimensions and scale to any size. Social media presets for YouTube, TikTok, Instagram." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Aspect Ratio Calculator</span></div>
        <h1><i className="fa-solid fa-expand" style={{ color: 'var(--accent-purple-light)' }}></i> Aspect Ratio Calculator</h1>
        <p>Find aspect ratios, scale to target sizes, and explore platform presets.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab-btn ${mode === 'find' ? 'active' : ''}`} onClick={() => setMode('find')}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginRight: '6px' }}></i> Find Ratio
            </button>
            <button className={`tab-btn ${mode === 'scale' ? 'active' : ''}`} onClick={() => setMode('scale')}>
              <i className="fa-solid fa-arrows-up-down-left-right" style={{ marginRight: '6px' }}></i> Scale Dimensions
            </button>
          </div>

          <div className="glass-card">
            {mode === 'find' && (
              <>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="find-width">Width (px)</label>
                    <input id="find-width" type="number" min="1" value={widthF} onChange={e => setWidthF(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="find-height">Height (px)</label>
                    <input id="find-height" type="number" min="1" value={heightF} onChange={e => setHeightF(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
                  </div>
                </div>

                {findResult && (
                  <>
                    <div className="stats-grid mt-2">
                      <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => copy(`${findResult.simplified.w}:${findResult.simplified.h}`, 'ratio')}>
                        <div className="stat-card-value" style={{ color: 'var(--accent-purple-light)' }}>{findResult.simplified.w}:{findResult.simplified.h}</div>
                        <div className="stat-card-label">Simplified Ratio {copied === 'ratio' && '✓'}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-card-value" style={{ color: 'var(--accent-cyan-light)' }}>{(parseFloat(widthF) / parseFloat(heightF)).toFixed(4)}</div>
                        <div className="stat-card-label">Decimal Ratio</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-card-value" style={{ color: 'var(--accent-green)', fontSize: '1rem' }}>{findResult.megapixels} MP</div>
                        <div className="stat-card-label">Megapixels</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-card-value" style={{ fontSize: '1rem' }}>{findResult.diagonal}px</div>
                        <div className="stat-card-label">Diagonal</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Closest Standard Ratio</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: findResult.exactMatch ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                          {findResult.ratio.label}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{findResult.ratio.desc}</div>
                          {findResult.exactMatch
                            ? <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)' }}>✓ Exact match</span>
                            : <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Approximate match</span>}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {mode === 'scale' && (
              <>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                    <label className="form-label">Ratio Width</label>
                    <input type="number" min="1" value={ratioW} onChange={e => setRatioW(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '1rem' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)' }}>:</div>
                  <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                    <label className="form-label">Ratio Height</label>
                    <input type="number" min="1" value={ratioH} onChange={e => setRatioH(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '1rem' }} />
                  </div>
                </div>

                {/* Quick ratio presets */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {STANDARD_RATIOS.slice(0, 8).map(r => (
                    <button key={r.label} onClick={() => { setRatioW(String(r.w)); setRatioH(String(r.h)); }}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: (String(r.w) === ratioW && String(r.h) === ratioH) ? 'rgba(96,165,250,0.15)' : 'var(--bg-input)', color: 'var(--text-primary)', cursor: 'pointer', borderColor: (String(r.w) === ratioW && String(r.h) === ratioH) ? 'var(--accent-purple-light)' : 'var(--border-color)' }}>
                      {r.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Lock Dimension</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {['width', 'height'].map(d => (
                        <button key={d} onClick={() => setTargetDim(d)}
                          style={{ flex: 1, padding: '0.5rem', textTransform: 'capitalize', borderRadius: 'var(--radius-sm)', border: `1px solid ${targetDim === d ? 'var(--accent-purple-light)' : 'var(--border-color)'}`, background: targetDim === d ? 'rgba(96,165,250,0.1)' : 'var(--bg-input)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Target {targetDim.charAt(0).toUpperCase() + targetDim.slice(1)} (px)</label>
                    <input type="number" min="1" value={targetVal} onChange={e => setTargetVal(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '1rem' }} />
                  </div>
                </div>

                {scaleResult && (
                  <div className="result-box text-center" style={{ marginBottom: '1.5rem' }}>
                    <div className="result-label">Scaled Dimensions</div>
                    <div className="result-value" style={{ color: 'var(--accent-purple-light)', cursor: 'pointer' }} onClick={() => copy(`${scaleResult.w} × ${scaleResult.h}`, 'scaled')}>
                      {scaleResult.w} × {scaleResult.h}
                      {copied === 'scaled' && <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', marginLeft: '0.5rem' }}>✓</span>}
                    </div>
                    <div className="result-sub">{ratioW}:{ratioH} ratio at {targetVal}px {targetDim}</div>
                  </div>
                )}

                {/* Standard sizes for this ratio */}
                {presets.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Common Sizes at {ratioW}:{ratioH}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.4rem' }}>
                      {presets.map(p => (
                        <div key={p.label} className="stat-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => copy(`${p.w} × ${p.h}`, p.label)}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{p.w} × {p.h}</div>
                          <div style={{ fontSize: '0.7rem', color: copied === p.label ? 'var(--accent-green)' : 'var(--text-muted)' }}>{copied === p.label ? '✓ Copied' : p.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
