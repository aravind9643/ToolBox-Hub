import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function GlassmorphismGenerator() {
  const [blur, setBlur] = useState(8);
  const [opacity, setOpacity] = useState(0.15);
  const [color, setColor] = useState('#ffffff');
  const [borderOpacity, setBorderOpacity] = useState(0.2);
  const [borderRadius, setBorderRadius] = useState(16);
  const [shadow, setShadow] = useState(16);
  const [copied, setCopied] = useState(false);

  // Preview background: 'mesh' | 'space' | 'grid' | 'photo'
  const [backdrop, setBackdrop] = useState('mesh');
  
  // Code display mode: 'css' | 'tailwind'
  const [codeMode, setCodeMode] = useState('css');

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) || 255;
    const g = parseInt(hex.slice(3, 5), 16) || 255;
    const b = parseInt(hex.slice(5, 7), 16) || 255;
    return `${r}, ${g}, ${b}`;
  };

  const rgbColor = hexToRgb(color);

  const glassStyles = {
    background: `rgba(${rgbColor}, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(${rgbColor}, ${borderOpacity})`,
    borderRadius: `${borderRadius}px`,
    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, ${shadow / 100})`
  };

  const cssCode = `background: rgba(${rgbColor}, ${opacity});\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\nborder: 1px solid rgba(${rgbColor}, ${borderOpacity});\nborder-radius: ${borderRadius}px;\nbox-shadow: 0 8px 32px 0 rgba(0, 0, 0, ${(shadow / 100).toFixed(2)});`;

  const tailwindCode = `bg-[rgba(${rgbColor},${opacity})] backdrop-blur-[${blur}px] border border-[rgba(${rgbColor},${borderOpacity})] rounded-[${borderRadius}px] shadow-[0_8px_32px_0_rgba(0,0,0,${(shadow / 100).toFixed(2)})]`;

  const getBackdropStyle = () => {
    if (backdrop === 'mesh') {
      return {
        background: 'linear-gradient(45deg, #f43f5e 0%, #3b82f6 50%, #10b981 100%)',
        backgroundSize: '200% 200%'
      };
    }
    if (backdrop === 'space') {
      return {
        background: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #4c1d95 100%)'
      };
    }
    if (backdrop === 'grid') {
      return {
        background: '#0f172a',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      };
    }
    if (backdrop === 'photo') {
      return {
        background: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=640&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    return {};
  };

  const copy = () => {
    const code = codeMode === 'css' ? cssCode : tailwindCode;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="tool-page">
      <SEOHead title="CSS Glassmorphism Generator" description="Generate stunning glassy CSS or Tailwind styles. Sliders for blur, opacity, shadow, and borders with live custom background photo backdrops." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Glassmorphism Generator</span></div>
        <h1><i className="fa-solid fa-shapes" style={{ color: 'var(--accent-purple-light)' }}></i> Glassmorphism Generator</h1>
        <p>Design modern glassmorphic CSS layers with custom backdrops and live presets.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', alignItems: 'stretch' }}>
            
            {/* Control Panel */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Design Panel</h2>
              
              <div className="form-group">
                <label className="form-label">Blur Radius ({blur}px)</label>
                <input type="range" min="0" max="24" value={blur} onChange={e => setBlur(Number(e.target.value))} style={{ width: '100%', height: '4px' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Background Opacity ({Math.round(opacity * 100)}%)</label>
                <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={e => setOpacity(Number(e.target.value))} style={{ width: '100%', height: '4px' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Border Opacity ({Math.round(borderOpacity * 100)}%)</label>
                <input type="range" min="0" max="1" step="0.05" value={borderOpacity} onChange={e => setBorderOpacity(Number(e.target.value))} style={{ width: '100%', height: '4px' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Border Radius ({borderRadius}px)</label>
                <input type="range" min="0" max="40" value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} style={{ width: '100%', height: '4px' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Shadow Strength ({shadow}%)</label>
                <input type="range" min="0" max="50" value={shadow} onChange={e => setShadow(Number(e.target.value))} style={{ width: '100%', height: '4px' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Card Tint Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 44, height: 38, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input type="text" value={color} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setColor(e.target.value); }} className="form-input" style={{ width: '120px' }} />
                </div>
              </div>
            </div>

            {/* Live Preview Panel */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Live Preview</h2>
                
                {/* Backdrop Switcher */}
                <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'mesh', label: 'Mesh', icon: 'fa-wand-magic-sparkles' },
                    { id: 'space', label: 'Space', icon: 'fa-moon' },
                    { id: 'grid', label: 'Grid', icon: 'fa-border-all' },
                    { id: 'photo', label: 'Landscape', icon: 'fa-image' }
                  ].map(b => (
                    <button 
                      key={b.id} 
                      onClick={() => setBackdrop(b.id)}
                      className={`btn btn-sm ${backdrop === b.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', gap: '4px' }}
                    >
                      <i className={`fa-solid ${b.icon}`} style={{ fontSize: '0.7rem' }}></i>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Container Preview */}
              <div style={{
                position: 'relative', width: '100%', height: '220px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', padding: '1.5rem', border: '1px solid var(--border-color)',
                ...getBackdropStyle()
              }}>
                <div style={{ ...glassStyles, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center', color: '#ffffff' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, textShadow: '0 1.5px 4px rgba(0,0,0,0.4)', color: '#ffffff' }}>Glass Card Preview</h3>
                  <p style={{ fontSize: '0.75rem', opacity: 0.9, margin: '0.35rem 0 0', textShadow: '0 1px 2px rgba(0,0,0,0.3)', color: '#ffffff' }}>Observe the transparency filter effect</p>
                </div>
              </div>

              {/* Code Display block with modes switcher */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                <div className="tabs" style={{ background: 'var(--bg-input)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button className={`tab-btn ${codeMode === 'css' ? 'active' : ''}`} onClick={() => setCodeMode('css')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>CSS Code</button>
                  <button className={`tab-btn ${codeMode === 'tailwind' ? 'active' : ''}`} onClick={() => setCodeMode('tailwind')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>Tailwind Classes</button>
                </div>

                <div style={{ position: 'relative' }}>
                  <pre style={{ padding: '0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-cyan-light)', whiteSpace: 'pre-wrap', textAlign: 'left', minHeight: '100px' }}>
                    {codeMode === 'css' ? cssCode : tailwindCode}
                  </pre>
                  <button className="btn btn-primary btn-sm w-full mt-1" onClick={copy} style={{ gap: '8px' }}>
                    <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                    {copied ? 'Copied Code!' : 'Copy Config Code'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
