import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

export default function QRCodeScanner() {
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'file'
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const videoRef = useRef(null);
  const scanCanvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

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

  // File Upload decoding
  const handleFileScan = async (file) => {
    if (!file) return;
    setScanResult('');
    setScanError('');
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const jsQR = (await import('jsqr')).default;
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            setScanResult(code.data);
          } else {
            setScanError('Could not find any readable QR code in this image. Try another file.');
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setScanError('Failed to read image file.');
    }
  };

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
      <SEOHead title="QR Code Scanner" description="Scan QR codes using camera or by uploading local images. Free, private, client-side decoding." />
      
      <style>{`
        @keyframes scan-laser {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>

      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>QR Code Scanner</span>
        </div>
        <h1>
          <i className="fa-solid fa-camera" style={{ color: 'var(--accent-purple-light)' }}></i> QR Code Scanner
        </h1>
        <p>Decode QR codes using camera feed or upload images directly.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card" style={{ textAlign: 'center' }}>
            
            {/* Toggle Scanner Mode */}
            <div className="tabs" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
              <button className={`tab-btn ${scanMode === 'camera' ? 'active' : ''}`} onClick={() => { setScanMode('camera'); stopScanner(); setScanResult(''); setScanError(''); }}>
                <i className="fa-solid fa-camera" style={{ marginRight: '6px' }}></i> Scan Camera
              </button>
              <button className={`tab-btn ${scanMode === 'file' ? 'active' : ''}`} onClick={() => { setScanMode('file'); stopScanner(); setScanResult(''); setScanError(''); }}>
                <i className="fa-solid fa-file-arrow-up" style={{ marginRight: '6px' }}></i> Upload Image File
              </button>
            </div>

            {/* CAMERA MODE */}
            {scanMode === 'camera' && (
              <>
                {!scanning && !scanResult && (
                  <div style={{ padding: '2.5rem 0' }}>
                    <i className="fa-solid fa-camera" style={{ fontSize: '3.5rem', color: 'var(--accent-purple-light)', marginBottom: '1.25rem', display: 'block' }}></i>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                      Point your webcam or mobile camera at any QR code to scan it instantly.
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={startScanner} style={{ gap: '8px', margin: '0 auto' }}>
                      <i className="fa-solid fa-camera"></i> Start Camera Scanner
                    </button>
                    {scanError && <p style={{ color: 'var(--accent-red)', marginTop: '1.25rem', fontSize: '0.9rem' }}>{scanError}</p>}
                  </div>
                )}

                {scanning && (
                  <div style={{ padding: '1rem 0' }}>
                    <div style={{ position: 'relative', maxWidth: '440px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden', border: '3px solid var(--accent-purple-light)', boxShadow: 'var(--shadow-lg)' }}>
                      <video ref={videoRef} style={{ width: '100%', display: 'block' }} playsInline muted />
                      <div style={{ position: 'absolute', inset: '10%', border: '2px dashed rgba(255,255,255,0.7)', borderRadius: '12px', pointerEvents: 'none' }}></div>
                      
                      {/* Active glowing laser scanline */}
                      <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', background: '#06b6d4', boxShadow: '0 0 12px #06b6d4', zIndex: 5, pointerEvents: 'none', animation: 'scan-laser 2s linear infinite' }} />
                    </div>
                    <canvas ref={scanCanvasRef} style={{ display: 'none' }} />
                    <p style={{ color: 'var(--accent-cyan-light)', margin: '1.25rem 0', fontSize: '0.95rem', fontWeight: 500 }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                      Align the QR code inside the camera viewfinder
                    </p>
                    <button className="btn btn-secondary" onClick={stopScanner} style={{ gap: '8px', margin: '0 auto' }}>
                      <i className="fa-solid fa-stop"></i> Stop Scanner
                    </button>
                  </div>
                )}
              </>
            )}

            {/* FILE UPLOAD MODE */}
            {scanMode === 'file' && !scanResult && (
              <div style={{ padding: '1.5rem 0' }}>
                <div
                  className="drop-zone"
                  onClick={() => document.getElementById('qr-file-input').click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files?.length > 0) handleFileScan(e.dataTransfer.files[0]); }}
                  style={{
                    border: isDragging ? '2px dashed var(--accent-cyan-light)' : '2px dashed var(--border-color)',
                    background: isDragging ? 'var(--bg-glass-hover)' : 'none',
                    transition: 'border-color 0.2s, background 0.2s',
                    padding: '2.5rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    maxWidth: '500px',
                    margin: '0 auto'
                  }}
                >
                  <div className="drop-zone-icon" style={{ marginBottom: '1rem', fontSize: '2.5rem', color: 'var(--accent-purple-light)' }}>
                    <i className="fa-solid fa-file-arrow-up"></i>
                  </div>
                  <h3>{isDragging ? 'Drop QR image here!' : 'Select or drag QR code image'}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Upload screenshots or image files to decode instantly</p>
                  <input id="qr-file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileScan(e.target.files[0])} />
                </div>
                {scanError && (
                  <p style={{ color: 'var(--accent-red)', marginTop: '1.25rem', fontSize: '0.9rem', maxWidth: '440px', margin: '1rem auto 0' }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i>
                    {scanError}
                  </p>
                )}
              </div>
            )}

            {/* SCAN RESULTS PANEL */}
            {scanResult && (
              <div style={{ padding: '1.5rem 0' }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: '3rem', color: 'var(--accent-green)', marginBottom: '1.25rem', display: 'block' }}></i>
                <h3 style={{ marginBottom: '1rem' }}>Scanned Successfully!</h3>
                <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', wordBreak: 'break-all', textAlign: 'left', marginBottom: '1.5rem', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 1.5rem', fontFamily: 'monospace' }}>
                  {scanResult}
                </div>
                <div className="btn-group" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(scanResult)} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-copy"></i> Copy Content
                  </button>
                  {/^https?:\/\//.test(scanResult) && (
                    <a className="btn btn-secondary" href={scanResult} target="_blank" rel="noopener noreferrer" style={{ gap: '8px' }}>
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Open URL
                    </a>
                  )}
                  <button className="btn btn-secondary" onClick={() => { setScanResult(''); setScanError(''); if (scanMode === 'camera') startScanner(); }} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-rotate"></i> Scan Again
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Online QR Code Scanner — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
