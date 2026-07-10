import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function CssClampCalculator() {
  const [minWidth, setMinWidth] = useState(320);
  const [maxWidth, setMaxWidth] = useState(1200);
  const [minSize, setMinSize] = useState(16);
  const [maxSize, setMaxSize] = useState(48);
  const [unit, setUnit] = useState('px');
  
  // Simulator viewport slider width
  const [previewWidth, setPreviewWidth] = useState(600);
  const [copied, setCopied] = useState(false);

  // Math calculation of fluid clamp values: clamp(MIN, VAL, MAX)
  // slope = (maxSize - minSize) / (maxWidth - minWidth)
  // intersection = (-minWidth * slope + minSize)
  const clampExpression = useMemo(() => {
    const minW = Number(minWidth);
    const maxW = Number(maxWidth);
    const minS = Number(minSize);
    const maxS = Number(maxSize);
    
    if (maxW <= minW || maxS <= minS) return 'Invalid Inputs (Max must exceed Min)';
    
    const slope = (maxS - minS) / (maxW - minW);
    const intersection = (-minW * slope) + minS;
    
    const slopeVw = (slope * 100).toFixed(4);
    const intersectionRem = (intersection / 16).toFixed(4);
    const minSrem = (minS / 16).toFixed(4);
    const maxSrem = (maxS / 16).toFixed(4);

    return `clamp(${minSrem}rem, ${intersectionRem}rem + ${slopeVw}vw, ${maxSrem}rem)`;
  }, [minWidth, maxWidth, minSize, maxSize]);

  // Calculates simulated current font size at the preview width
  const simulatedSize = useMemo(() => {
    const minW = Number(minWidth);
    const maxW = Number(maxWidth);
    const minS = Number(minSize);
    const maxS = Number(maxSize);
    
    if (previewWidth <= minW) return minS;
    if (previewWidth >= maxW) return maxS;
    
    const percent = (previewWidth - minW) / (maxW - minW);
    return Math.round(minS + percent * (maxS - minS));
  }, [minWidth, maxWidth, minSize, maxSize, previewWidth]);

  const handleCopy = () => {
    if (clampExpression.includes('Invalid')) return;
    navigator.clipboard.writeText(clampExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="tool-page">
      <SEOHead title="CSS Clamp Calculator & Fluid Typography Builder" description="Create fluid typography layouts using responsive CSS clamp parameters with interactive viewport simulators." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>CSS Clamp</span></div>
        <h1><i className="fa-solid fa-expand" style={{ color: 'var(--accent-purple-light)' }}></i> CSS Clamp Calculator</h1>
        <p>Build fluid typographic scales and calculate optimal responsive CSS clamp formulas.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Min Viewport Width (px)</label>
                <input type="number" className="form-input" value={minWidth} onChange={e => setMinWidth(Number(e.target.value))} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Max Viewport Width (px)</label>
                <input type="number" className="form-input" value={maxWidth} onChange={e => setMaxWidth(Number(e.target.value))} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Min Font Size (px)</label>
                <input type="number" className="form-input" value={minSize} onChange={e => setMinSize(Number(e.target.value))} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Max Font Size (px)</label>
                <input type="number" className="form-input" value={maxSize} onChange={e => setMaxSize(Number(e.target.value))} />
              </div>

            </div>

            {/* Calculated Output */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fluid Clamp Rule</span>
                {!clampExpression.includes('Invalid') && (
                  <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '4px' }}>
                    <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <code style={{ fontSize: '1.05rem', color: 'var(--accent-cyan-light)', fontFamily: 'monospace', display: 'block', wordBreak: 'break-all' }}>
                font-size: {clampExpression};
              </code>
            </div>

            {/* Fluid Typography Viewport Simulator */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', fontWeight: 600 }}>Fluid Viewport Simulator</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Drag the slider below to simulate screen width variations and preview the font-size scaling.</p>
              
              <div className="form-group">
                <label className="form-label">Simulated Viewport Width: {previewWidth}px</label>
                <input 
                  type="range" 
                  min="280" 
                  max="1400" 
                  value={previewWidth} 
                  onChange={e => setPreviewWidth(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--accent-purple-light)' }}
                />
              </div>

              {/* Live Preview Display Box */}
              <div style={{
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.5rem',
                textAlign: 'center',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Simulated Size: <strong style={{ color: 'var(--accent-green)' }}>{simulatedSize}px</strong>
                </div>
                <div style={{ 
                  fontSize: `${simulatedSize}px`, 
                  lineHeight: '1.2', 
                  color: 'var(--text-primary)', 
                  fontWeight: 700,
                  transition: 'font-size 0.05s ease-out'
                }}>
                  Responsive Fluid Text
                </div>
              </div>

            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="CSS Clamp Calculator — ToolBox Hub" />
          </div>

        </div>
      </div>
    </div>
  );
}
