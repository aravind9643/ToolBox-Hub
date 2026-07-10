import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function optimizePath(pathD) {
  if (!pathD) return '';
  return pathD
    .replace(/\s+/g, ' ') // replace multiple spaces/tabs
    .replace(/\s*([a-df-z])\s*/gi, '$1') // remove spaces around commands
    .replace(/(\.\d{2})\d+/g, '$1') // round floats to 2 decimal places
    .trim();
}

export default function SvgPathVisualizer() {
  const [pathD, setPathD] = useState('M10 80 Q 95 10 180 80 T 360 80');
  const [fill, setFill] = useState('none');
  const [stroke, setStroke] = useState('#22c55e');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [copied, setCopied] = useState(false);

  const optimizedPath = useMemo(() => optimizePath(pathD), [pathD]);

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadSample = (presetD) => {
    setPathD(presetD);
  };

  return (
    <div className="tool-page">
      <SEOHead title="SVG Path Visualizer & Minifier Studio" description="Paste SVG path commands, render them instantly inside interactive coordinate grids, and minify path definitions." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>SVG Visualizer</span></div>
        <h1><i className="fa-solid fa-shapes" style={{ color: 'var(--accent-purple-light)' }}></i> SVG Path Visualizer</h1>
        <p>Preview raw SVG path syntax coordinates, customize shapes color styles, and optimize paths.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            {/* Presets */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => loadSample('M10 80 Q 95 10 180 80 T 360 80')}>Quadratic Curve</button>
              <button className="btn btn-secondary btn-sm" onClick={() => loadSample('M 10 10 L 90 10 L 90 90 L 10 90 Z')}>Simple Box</button>
              <button className="btn btn-secondary btn-sm" onClick={() => loadSample('M10 10 H 90 V 90 H 10 Z')}>Box via HV coords</button>
              <button className="btn btn-secondary btn-sm" onClick={() => loadSample('M12 21.35 l-1.45-1.32 C5.4 15.36 2 12.28 2 8.5 C2 5.42 4.42 3 7.5 3 c1.74 0 3.41 .81 4.5 2.09 C13.09 3.81 14.76 3 16.5 3 C19.58 3 22 5.42 22 8.5 c0 3.78-3.4 6.86-8.55 11.54 L12 21.35 z')}>Heart Shape</button>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              
              {/* Left Column: Path Inputs */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Path Data String (d)</h3>
                <textarea 
                  className="form-textarea"
                  rows="6"
                  value={pathD}
                  onChange={e => setPathD(e.target.value)}
                  placeholder="Paste d attribute value (e.g. M10 10 L90 90)..."
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '140px' }}
                />

                <h3 style={{ fontSize: '0.9rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Optimized SVG Path</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    readOnly 
                    value={optimizedPath} 
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                  <button className="btn btn-primary" onClick={handleCopy}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Controls */}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Fill Color</label>
                    <input type="text" className="form-input" value={fill} onChange={e => setFill(e.target.value)} style={{ height: '32px', fontSize: '0.75rem' }} />
                  </div>
                  <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Stroke Color</label>
                    <input type="text" className="form-input" value={stroke} onChange={e => setStroke(e.target.value)} style={{ height: '32px', fontSize: '0.75rem' }} />
                  </div>
                  <div className="form-group" style={{ margin: 0, minWidth: '80px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Stroke Width</label>
                    <input type="number" className="form-input" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} style={{ height: '32px', fontSize: '0.75rem' }} />
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Canvas */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, alignSelf: 'flex-start' }}>Render Canvas Preview</h3>
                
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  maxHeight: '300px',
                  background: 'radial-gradient(circle, var(--bg-secondary) 30%, var(--bg-input) 100%)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  overflow: 'hidden'
                }}>
                  <svg 
                    viewBox="-10 -10 120 120"
                    width="100%"
                    height="100%"
                    style={{ overflow: 'visible' }}
                  >
                    {/* Grid Guide Marks */}
                    <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    <line x1="50" y1="-10" x2="50" y2="110" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2" />
                    <line x1="-10" y1="50" x2="110" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2" />

                    <path 
                      d={pathD}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="SVG Path Visualizer — ToolBox Hub" />
          </div>

        </div>
      </div>
    </div>
  );
}
