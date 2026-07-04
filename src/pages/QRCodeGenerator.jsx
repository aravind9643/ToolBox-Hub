import { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

export default function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState('generate');
  // Generate tab state
  const [text, setText] = useState('https://example.com');
  const [fgColor, setFgColor] = useState('#3b82f6');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const canvasRef = useRef(null);
  // Scanner tab state
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState('');
  const videoRef = useRef(null);
  const scanCanvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (text && canvasRef.current && activeTab === 'generate') {
      QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor }
      }).catch(() => {});
    }
  }, [text, fgColor, bgColor, size, activeTab]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const stopScanner = useCallback(() => {
    setScanning(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    setScanResult('');
    setScanError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setScanError('Camera access denied. Please allow camera permissions and try again.');
    }
  }, []);

  useEffect(() => {
    if (!scanning) return;
    const scan = async () => {
      if (!videoRef.current || !scanCanvasRef.current) return;
      const video = videoRef.current;
      const canvas = scanCanvasRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const jsQR = (await import('jsqr')).default;
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          setScanResult(code.data);
          stopScanner();
          return;
        }
      }
      animFrameRef.current = requestAnimationFrame(scan);
    };
    animFrameRef.current = requestAnimationFrame(scan);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [scanning, stopScanner]);

  useEffect(() => { return () => stopScanner(); }, [stopScanner]);

  return (
    <div className="tool-page">
      <SEOHead title="QR Code Generator & Scanner" description="Generate custom QR codes and scan QR codes with your webcam. Free, instant, no upload." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>QR Code Generator</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-qrcode" style={{ color: 'var(--accent-purple-light)' }}></i> QR Code Generator & Scanner
        </h1>
        <p>Generate customizable QR codes and scan QR codes live with your camera.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => { setActiveTab('generate'); stopScanner(); }}>
              <i className="fa-solid fa-qrcode" style={{ marginRight: '6px' }}></i> Generate QR
            </button>
            <button className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`} onClick={() => setActiveTab('scan')}>
              <i className="fa-solid fa-camera" style={{ marginRight: '6px' }}></i> Scan QR
            </button>
          </div>

          {activeTab === 'generate' && (
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
                <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(text)} style={{ gap: '8px' }}>
                  <i className="fa-solid fa-copy"></i> Copy Text
                </button>
              </div>
            </div>
          )}

          {activeTab === 'scan' && (
            <div className="glass-card" style={{ textAlign: 'center' }}>
              {!scanning && !scanResult && (
                <div style={{ padding: '2rem 0' }}>
                  <i className="fa-solid fa-camera" style={{ fontSize: '3rem', color: 'var(--accent-purple-light)', marginBottom: '1rem', display: 'block' }}></i>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Point your camera at a QR code to decode it instantly. Works on mobile and desktop.</p>
                  <button className="btn btn-primary" onClick={startScanner} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-camera"></i> Start Camera Scanner
                  </button>
                  {scanError && <p style={{ color: 'var(--accent-red)', marginTop: '1rem', fontSize: '0.9rem' }}>{scanError}</p>}
                </div>
              )}

              {scanning && (
                <div>
                  <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--accent-purple-light)' }}>
                    <video ref={videoRef} style={{ width: '100%', display: 'block' }} playsInline muted />
                    <div style={{ position: 'absolute', inset: 0, border: '3px solid var(--accent-purple-light)', borderRadius: '12px', pointerEvents: 'none', animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.6 }}></div>
                  </div>
                  <canvas ref={scanCanvasRef} style={{ display: 'none' }} />
                  <p style={{ color: 'var(--accent-cyan-light)', margin: '1rem 0', fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i>
                    Scanning... Point the camera at a QR code
                  </p>
                  <button className="btn btn-secondary" onClick={stopScanner} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-stop"></i> Stop Scanner
                  </button>
                </div>
              )}

              {scanResult && (
                <div style={{ padding: '1rem 0' }}>
                  <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: 'var(--accent-green)', marginBottom: '1rem', display: 'block' }}></i>
                  <h3 style={{ marginBottom: '0.75rem' }}>QR Code Decoded!</h3>
                  <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', wordBreak: 'break-all', textAlign: 'left', marginBottom: '1rem', fontSize: '0.95rem' }}>
                    {scanResult}
                  </div>
                  <div className="btn-group" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(scanResult)} style={{ gap: '8px' }}>
                      <i className="fa-solid fa-copy"></i> Copy Result
                    </button>
                    {/^https?:\/\//.test(scanResult) && (
                      <a className="btn btn-secondary" href={scanResult} target="_blank" rel="noopener noreferrer" style={{ gap: '8px' }}>
                        <i className="fa-solid fa-arrow-up-right-from-square"></i> Open URL
                      </a>
                    )}
                    <button className="btn btn-secondary" onClick={() => { setScanResult(''); startScanner(); }} style={{ gap: '8px' }}>
                      <i className="fa-solid fa-rotate"></i> Scan Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
