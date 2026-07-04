import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

export default function QRCodeScanner() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState('');
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
      <SEOHead title="QR Code Scanner" description="Scan QR codes using your device webcam or camera. 100% private, client-side, no upload." />
      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>QR Code Scanner</span>
        </div>
        <h1>
          <i className="fa-solid fa-camera" style={{ color: 'var(--accent-purple-light)' }}></i> QR Code Scanner
        </h1>
        <p>Scan QR codes instantly using your device's camera.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card" style={{ textAlign: 'center' }}>
            {!scanning && !scanResult && (
              <div style={{ padding: '2.5rem 0' }}>
                <i className="fa-solid fa-camera" style={{ fontSize: '3.5rem', color: 'var(--accent-purple-light)', marginBottom: '1.25rem', display: 'block' }}></i>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                  Point your desktop webcam or mobile camera at any QR code. It will decode instantly.
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
                  <div style={{ position: 'absolute', inset: 0, border: '3px solid var(--accent-purple-light)', borderRadius: '12px', pointerEvents: 'none', animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.5 }}></div>
                </div>
                <canvas ref={scanCanvasRef} style={{ display: 'none' }} />
                <p style={{ color: 'var(--accent-cyan-light)', margin: '1.25rem 0', fontSize: '0.95rem', fontWeight: 500 }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                  Align the QR code inside the camera view
                </p>
                <button className="btn btn-secondary" onClick={stopScanner} style={{ gap: '8px', margin: '0 auto' }}>
                  <i className="fa-solid fa-stop"></i> Stop Scanner
                </button>
              </div>
            )}

            {scanResult && (
              <div style={{ padding: '1.5rem 0' }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: '3rem', color: 'var(--accent-green)', marginBottom: '1.25rem', display: 'block' }}></i>
                <h3 style={{ marginBottom: '1rem' }}>Scanned Successfully!</h3>
                <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', wordBreak: 'break-all', textAlign: 'left', marginBottom: '1.5rem', fontSize: '1rem', maxWidt: '600px', margin: '0 auto 1.5rem', fontFamily: 'monospace' }}>
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
                  <button className="btn btn-secondary" onClick={() => { setScanResult(''); startScanner(); }} style={{ gap: '8px' }}>
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
