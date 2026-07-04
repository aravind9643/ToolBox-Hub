import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

export default function GradientGenerator() {
  const [color1, setColor1] = useState('#3b82f6');
  const [color2, setColor2] = useState('#0ea5e9');
  const [type, setType] = useState('linear');
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);

  const gradientCSS = type === 'linear'
    ? `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`
    : `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`background: ${gradientCSS};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tool-page">
      <SEOHead title="CSS Gradient Generator" description="Generate beautiful linear and radial CSS gradients. Copy ready-to-use CSS code instantly." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Gradient Generator</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-palette" style={{ color: 'var(--accent-purple-light)' }}></i> CSS Gradient Generator
        </h1>
        <p>Create modern, vibrant CSS gradients and export the CSS code.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            {/* Live Preview */}
            <div style={{
              width: '100%',
              height: '220px',
              borderRadius: 'var(--radius-lg)',
              background: gradientCSS,
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-md)'
            }} />

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Gradient Type</label>
                <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
              </div>
              {type === 'linear' && (
                <div className="form-group">
                  <label className="form-label">Angle: {angle}°</label>
                  <input className="form-range" type="range" min="0" max="360" value={angle} onChange={e => setAngle(Number(e.target.value))} />
                </div>
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Color Stop 1</label>
                <div className="flex items-center gap-1">
                  <input type="color" value={color1} onChange={e => setColor1(e.target.value)} style={{ width: 40, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                  <input className="form-input" type="text" value={color1} onChange={e => setColor1(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Color Stop 2</label>
                <div className="flex items-center gap-1">
                  <input type="color" value={color2} onChange={e => setColor2(e.target.value)} style={{ width: 40, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                  <input className="form-input" type="text" value={color2} onChange={e => setColor2(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-group mt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="form-label" style={{ marginBottom: 0 }}>CSS Output</label>
                <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '6px' }}>
                  <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy CSS'}
                </button>
              </div>
              <div className="code-block" style={{ fontSize: '0.8rem' }}>
                {`background: ${color1};\nbackground: ${gradientCSS};`}
              </div>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Vibrant CSS Gradient Generator — ToolBox Hub" />
          </div>
        </div>
        <div className="tool-sidebar">
          <AdBanner type="sidebar" />
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
