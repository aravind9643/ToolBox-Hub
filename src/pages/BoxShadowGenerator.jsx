import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';

const defaultLayer = { x: 4, y: 4, blur: 10, spread: 0, color: '#000000', opacity: 30, inset: false };

function shadowCSS(layers) {
  return layers.map(l => {
    const hex = l.color;
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `${l.inset ? 'inset ' : ''}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px rgba(${r},${g},${b},${(l.opacity / 100).toFixed(2)})`;
  }).join(',\n  ');
}

export default function BoxShadowGenerator() {
  const [layers, setLayers] = useState([{ ...defaultLayer }]);
  const [activeLayer, setActiveLayer] = useState(0);
  const [bgColor, setBgColor] = useState('#1e293b');
  const [boxColor, setBoxColor] = useState('#3b82f6');
  const [copied, setCopied] = useState(false);

  // Preview modes: 'single' | 'stack'
  const [previewMode, setPreviewMode] = useState('single');

  const cssValue = useMemo(() => shadowCSS(layers), [layers]);
  const fullCSS = `box-shadow: ${cssValue};`;

  const updateLayer = (field, value) => {
    setLayers(prev => prev.map((l, i) => i === activeLayer ? { ...l, [field]: value } : l));
  };

  const addLayer = () => {
    setLayers(prev => [...prev, { ...defaultLayer }]);
    setActiveLayer(layers.length);
  };

  const removeLayer = (i) => {
    if (layers.length === 1) return;
    setLayers(prev => prev.filter((_, idx) => idx !== i));
    setActiveLayer(Math.max(0, activeLayer - 1));
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(fullCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Josh W. Comeau style ambient smooth shadow presets
  const applySmoothShadow = (diffusion) => {
    const newLayers = [];
    // Calculate exponential coordinates for natural light diffusion
    for (let i = 1; i <= diffusion; i++) {
      const weight = i / diffusion;
      newLayers.push({
        x: Math.round(weight * 8),
        y: Math.round(weight * 16),
        blur: Math.round(weight * 32),
        spread: 0,
        color: '#000000',
        opacity: Math.round((1 - weight) * 20 + 2),
        inset: false
      });
    }
    setLayers(newLayers);
    setActiveLayer(0);
  };

  const applyGlassShadow = () => {
    setLayers([
      { x: 0, y: 8, blur: 32, spread: 0, color: '#000000', opacity: 15, inset: false },
      { x: 0, y: 1, blur: 0, spread: 0, color: '#ffffff', opacity: 15, inset: true }
    ]);
    setActiveLayer(0);
  };

  const layer = layers[activeLayer];

  const sliders = [
    { label: 'Horizontal Offset (X)', field: 'x', min: -100, max: 100, unit: 'px' },
    { label: 'Vertical Offset (Y)', field: 'y', min: -100, max: 100, unit: 'px' },
    { label: 'Blur Radius', field: 'blur', min: 0, max: 100, unit: 'px' },
    { label: 'Spread Radius', field: 'spread', min: -50, max: 50, unit: 'px' },
    { label: 'Opacity', field: 'opacity', min: 0, max: 100, unit: '%' },
  ];

  return (
    <div className="tool-page">
      <SEOHead title="CSS Box Shadow Generator" description="Visually design smooth layered CSS box shadows, stack mockups, and Josh Comeau style soft shadow presets." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Box Shadow Generator</span></div>
        <h1><i className="fa-solid fa-layer-group" style={{ color: 'var(--accent-purple-light)' }}></i> CSS Box Shadow Generator</h1>
        <p>Design smooth multi-layered box shadows with custom ambient presets and stack card mockups.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', alignItems: 'stretch' }}>
            
            {/* Controls */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.1rem' }}>Shadow Layers</h2>
                <button className="btn btn-primary btn-sm" onClick={addLayer} style={{ gap: '6px' }}>
                  <i className="fa-solid fa-plus"></i> Add Layer
                </button>
              </div>

              {/* Layer tabs */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {layers.map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <button onClick={() => setActiveLayer(i)}
                      style={{ padding: '0.3rem 0.65rem', borderRadius: '6px 0 0 6px', fontSize: '0.8rem', border: `1px solid ${activeLayer === i ? 'var(--accent-purple-light)' : 'var(--border-color)'}`, background: activeLayer === i ? 'rgba(96,165,250,0.15)' : 'var(--bg-input)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Layer {i + 1}
                    </button>
                    {layers.length > 1 && (
                      <button onClick={() => removeLayer(i)}
                        style={{ padding: '0.3rem 0.45rem', borderRadius: '0 6px 6px 0', fontSize: '0.7rem', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--accent-red)', cursor: 'pointer', borderLeft: 'none' }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Smooth Shadow Presets */}
              <div style={{ padding: '0.75rem', background: 'var(--bg-glass-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>⚡ Smooth Shadow Synthesizers:</span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => applySmoothShadow(3)} style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem' }}>Soft Ambient (3 layers)</button>
                  <button className="btn className btn-secondary btn-sm" onClick={() => applySmoothShadow(5)} style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem' }}>Smooth Depth (5 layers)</button>
                  <button className="btn btn-secondary btn-sm" onClick={applyGlassShadow} style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem' }}>Glossy Glassmorphic</button>
                </div>
              </div>

              {/* Sliders */}
              {sliders.map(({ label, field, min, max, unit }) => (
                <div key={field}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{layer[field]}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} value={layer[field]} onChange={e => updateLayer(field, Number(e.target.value))} style={{ width: '100%', height: '4px' }} />
                </div>
              ))}

              {/* Color */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Shadow Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="color" value={layer.color} onChange={e => updateLayer('color', e.target.value)}
                    style={{ width: 42, height: 38, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                  <input className="form-input" type="text" value={layer.color} onChange={e => updateLayer('color', e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>

              {/* Inset toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={layer.inset} onChange={e => updateLayer('inset', e.target.checked)} style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: '0.85rem' }}>Inset Shadow</span>
              </label>

              {/* Background colors */}
              <div className="grid-2" style={{ marginTop: '0.5rem' }}>
                {[['Background', bgColor, setBgColor], ['Box Color', boxColor, setBoxColor]].map(([label, val, set]) => (
                  <div key={label}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>{label}</label>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <input type="color" value={val} onChange={e => set(e.target.value)} style={{ width: 36, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                      <input className="form-input" type="text" value={val} onChange={e => set(e.target.value)} style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview + Output */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Visual Preview</h2>
                <div className="tabs" style={{ background: 'var(--bg-input)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)', margin: 0 }}>
                  <button className={`tab-btn ${previewMode === 'single' ? 'active' : ''}`} onClick={() => setPreviewMode('single')} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>Single Card</button>
                  <button className={`tab-btn ${previewMode === 'stack' ? 'active' : ''}`} onClick={() => setPreviewMode('stack')} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>3D Stack</button>
                </div>
              </div>

              {/* Preview box */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', background: bgColor, borderRadius: 'var(--radius-md)', minHeight: '220px', transition: 'background 0.3s' }}>
                {previewMode === 'single' ? (
                  <div style={{ width: '130px', height: '130px', background: boxColor, borderRadius: '16px', boxShadow: cssValue, transition: 'box-shadow 0.2s' }}></div>
                ) : (
                  <div style={{ position: 'relative', width: '190px', height: '190px' }}>
                    <div style={{ position: 'absolute', top: '0', left: '0', width: '100px', height: '100px', background: boxColor, borderRadius: '12px', boxShadow: cssValue, zIndex: 1 }} />
                    <div style={{ position: 'absolute', top: '35px', left: '35px', width: '100px', height: '100px', background: boxColor, borderRadius: '12px', boxShadow: cssValue, zIndex: 2 }} />
                    <div style={{ position: 'absolute', top: '70px', left: '70px', width: '100px', height: '100px', background: boxColor, borderRadius: '12px', boxShadow: cssValue, zIndex: 3 }} />
                  </div>
                )}
              </div>

              {/* CSS Output */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Generated CSS</div>
                <div style={{ padding: '0.85rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-cyan-light)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '140px', overflowY: 'auto' }}>
                  {`box-shadow:\n  ${cssValue};`}
                </div>
              </div>

              <button className="btn btn-primary" onClick={copyCSS} style={{ gap: '8px', width: '100%', justifyContent: 'center' }}>
                <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                {copied ? 'Copied!' : 'Copy CSS'}
              </button>
            </div>

          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
