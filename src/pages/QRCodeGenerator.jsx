import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

export default function QRCodeGenerator() {
  const [text, setText] = useState('https://example.com');
  const [fgColor, setFgColor] = useState('#7c3aed');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (text && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor }
      }).catch(() => {});
    }
  }, [text, fgColor, bgColor, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="tool-page">
      <SEOHead title="QR Code Generator" description="Generate QR codes for URLs, text, WiFi, and more. Free, instant, and customizable." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>QR Code Generator</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-qrcode" style={{ color: 'var(--accent-purple-light)' }}></i> QR Code Generator
        </h1>
        <p>Generate customizable QR codes instantly. Download as PNG.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            <div className="form-group">
              <label className="form-label">Content (URL, text, etc.)</label>
              <input className="form-input" type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Enter URL or text..." />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Foreground Color</label>
                <div className="flex items-center gap-1">
                  <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ width: 40, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                  <input className="form-input" type="text" value={fgColor} onChange={e => setFgColor(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Background Color</label>
                <div className="flex items-center gap-1">
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 40, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                  <input className="form-input" type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Size: {size}px</label>
              <input className="form-range" type="range" min="128" max="512" step="32" value={size} onChange={e => setSize(Number(e.target.value))} />
            </div>

            <div className="result-box text-center" style={{ padding: '2rem' }}>
              <canvas ref={canvasRef} style={{ margin: '0 auto', borderRadius: 8 }} />
            </div>

            <div className="btn-group mt-2" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={handleDownload} style={{ gap: '8px' }}>
                <i className="fa-solid fa-download"></i> Download PNG
              </button>
              <button className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(text); }} style={{ gap: '8px' }}>
                <i className="fa-solid fa-copy"></i> Copy Text
              </button>
            </div>
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
