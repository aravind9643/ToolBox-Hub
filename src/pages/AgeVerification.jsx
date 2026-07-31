import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

/* ── date‑parsing helpers ── */

function tryParseDate(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.replace(/[^0-9a-zA-Z\-\/]/g, ' ').trim();

  // AAMVA PDF417 DBA / DBB field format: MMDDYYYY
  const mmddyyyy = cleaned.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (mmddyyyy) {
    const d = new Date(+mmddyyyy[3], +mmddyyyy[1] - 1, +mmddyyyy[2]);
    if (!isNaN(d)) return d;
  }

  // YYYYMMDD
  const yyyymmdd = cleaned.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (yyyymmdd) {
    const d = new Date(+yyyymmdd[1], +yyyymmdd[2] - 1, +yyyymmdd[3]);
    if (!isNaN(d)) return d;
  }

  // ISO‑like YYYY-MM-DD or YYYY/MM/DD
  const iso = cleaned.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (iso) {
    const d = new Date(+iso[1], +iso[2] - 1, +iso[3]);
    if (!isNaN(d)) return d;
  }

  // MM/DD/YYYY or MM-DD-YYYY
  const mdy = cleaned.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (mdy) {
    const d = new Date(+mdy[3], +mdy[1] - 1, +mdy[2]);
    if (!isNaN(d)) return d;
  }

  // DD/MM/YYYY (European)
  const dmy = cleaned.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (dmy) {
    const d = new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
    if (!isNaN(d) && +dmy[1] <= 31) return d;
  }

  return null;
}

/** Parse AAMVA‑style PDF417 data (line‑based or single string). */
function parseAAMVA(data) {
  const result = {};
  // Look for DAQ (license number), DCS (last name), DAC/DCT (first name), DBB (DOB)
  const lines = data.split(/[\r\n]+/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DBB')) result.dob = trimmed.slice(3).trim();
    if (trimmed.startsWith('DCS')) result.lastName = trimmed.slice(3).trim();
    if (trimmed.startsWith('DAC') || trimmed.startsWith('DCT')) result.firstName = trimmed.slice(3).trim();
    if (trimmed.startsWith('DAQ')) result.licenseNumber = trimmed.slice(3).trim();
    if (trimmed.startsWith('DBA')) result.expiry = trimmed.slice(3).trim();
  }
  return result;
}

function calcAge(dob) {
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();
  if (days < 0) {
    months--;
    const prev = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

/* ── main component ── */

export default function AgeVerification() {
  const [mode, setMode] = useState('camera'); // camera | file | manual
  const [minAge, setMinAge] = useState(18);
  const [scanning, setScanning] = useState(false);
  const [rawData, setRawData] = useState('');
  const [result, setResult] = useState(null); // { verified, age, dob, raw, aamva }
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [manualDob, setManualDob] = useState('');
  const [showResult, setShowResult] = useState(false); // for animation

  const scannerRef = useRef(null);
  const quaggaRef = useRef(null);

  /* ── cleanup ── */
  const stopScanner = useCallback(async () => {
    setScanning(false);
    if (quaggaRef.current) {
      try { quaggaRef.current.stop(); } catch {}
      quaggaRef.current = null;
    }
  }, []);

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  /* ── process barcode data ── */
  const processBarcode = useCallback((data) => {
    setRawData(data);
    // Try AAMVA parse first
    const aamva = parseAAMVA(data);
    let dob = null;
    if (aamva.dob) {
      dob = tryParseDate(aamva.dob);
    }
    // If no AAMVA DOB found, try direct date parse on full data
    if (!dob) {
      dob = tryParseDate(data);
    }
    // Also try scanning the data for any 8‑digit sequence that looks like a date
    if (!dob) {
      const datePatterns = data.match(/\d{8}/g);
      if (datePatterns) {
        for (const p of datePatterns) {
          dob = tryParseDate(p);
          if (dob && dob.getFullYear() > 1900 && dob.getFullYear() < new Date().getFullYear()) break;
          dob = null;
        }
      }
    }

    if (!dob) {
      setError('Could not extract a date of birth from the scanned barcode. Try manual entry instead.');
      return;
    }

    const age = calcAge(dob);
    const verified = age.years >= minAge;
    setResult({ verified, age, dob, raw: data, aamva: aamva.dob ? aamva : null });
    // Trigger animation
    setTimeout(() => setShowResult(true), 50);
  }, [minAge]);

  /* ── start camera scanner ── */
  const startScanner = useCallback(async () => {
    setResult(null);
    setError('');
    setRawData('');
    setShowResult(false);
    setScanning(true);

    // Wait for the next frame so the scanner container is visible in the DOM
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const Quagga = (await import('@ericblade/quagga2')).default;

      await new Promise((resolve, reject) => {
        Quagga.init({
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          },
          locator: {
            patchSize: 'medium',
            halfSample: true
          },
          numOfWorkers: navigator.hardwareConcurrency || 4,
          decoder: {
            readers: [
              'code_128_reader',
              'ean_reader',
              'ean_8_reader',
              'code_39_reader',
              'code_39_vin_reader',
              'codabar_reader',
              'upc_reader',
              'upc_e_reader',
              'i2of5_reader',
              '2of5_reader',
              'code_93_reader'
            ]
          },
          locate: true,
          frequency: 10
        }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      quaggaRef.current = Quagga;
      Quagga.start();

      Quagga.onDetected((result) => {
        if (result?.codeResult?.code) {
          const code = result.codeResult.code;
          Quagga.stop();
          quaggaRef.current = null;
          setScanning(false);
          processBarcode(code);
        }
      });
    } catch (err) {
      console.error('Scanner init error:', err);
      setScanning(false);
      setError('Camera access denied or unavailable. Please allow camera permissions and try again.');
    }
  }, [processBarcode]);

  /* ── file upload decoding ── */
  const handleFileUpload = async (file) => {
    if (!file) return;
    setResult(null);
    setError('');
    setRawData('');
    setShowResult(false);

    try {
      const Quagga = (await import('@ericblade/quagga2')).default;
      const reader = new FileReader();
      reader.onload = (e) => {
        Quagga.decodeSingle({
          decoder: {
            readers: [
              'code_128_reader',
              'ean_reader',
              'ean_8_reader',
              'code_39_reader',
              'code_39_vin_reader',
              'codabar_reader',
              'upc_reader',
              'upc_e_reader',
              'i2of5_reader',
              '2of5_reader',
              'code_93_reader'
            ]
          },
          locate: true,
          src: e.target.result
        }, (result) => {
          if (result && result.codeResult && result.codeResult.code) {
            processBarcode(result.codeResult.code);
          } else {
            setError('Could not detect a barcode in this image. Try a clearer photo or manual entry.');
          }
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process the image file.');
    }
  };

  /* ── manual DOB verification ── */
  const handleManualVerify = () => {
    if (!manualDob) return;
    setResult(null);
    setError('');
    setShowResult(false);
    const dob = new Date(manualDob);
    if (isNaN(dob)) {
      setError('Invalid date. Please enter a valid date of birth.');
      return;
    }
    const age = calcAge(dob);
    const verified = age.years >= minAge;
    setResult({ verified, age, dob, raw: null, aamva: null });
    setTimeout(() => setShowResult(true), 50);
  };

  /* ── reset ── */
  const reset = () => {
    stopScanner();
    setResult(null);
    setError('');
    setRawData('');
    setShowResult(false);
  };

  const formatDate = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="tool-page">
      <SEOHead
        title="Age Verification — ToolBox Hub"
        description="Verify age via barcode scanning or manual date entry. 100% client-side, private, and instant."
      />

      <style>{`
        @keyframes av-scan-laser {
          0% { top: 5%; }
          50% { top: 90%; }
          100% { top: 5%; }
        }
        @keyframes av-pulse-green {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
        }
        @keyframes av-pulse-red {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
        }
        @keyframes av-scale-in {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes av-badge-glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }
        @keyframes av-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .av-result-enter {
          animation: av-scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .av-scanner-container .viewport {
          position: relative !important;
          width: 100% !important;
          overflow: hidden;
          border-radius: 12px;
        }
        .av-scanner-container .viewport video {
          position: relative !important;
          width: 100% !important;
          height: auto !important;
          display: block !important;
          border-radius: 12px;
        }
        .av-scanner-container .viewport canvas.drawingBuffer {
          display: none !important;
        }
        .av-age-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
          outline: none;
          opacity: 0.9;
          transition: opacity 0.2s;
        }
        .av-age-slider:hover { opacity: 1; }
        .av-age-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--accent-purple-light);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(96, 165, 250, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .av-age-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 16px rgba(96, 165, 250, 0.7);
        }
        .av-age-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--accent-purple-light);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(96, 165, 250, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .av-privacy-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: var(--accent-green);
          animation: av-float 3s ease-in-out infinite;
        }
        .av-mode-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(59, 130, 246, 0.06);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: var(--radius-md);
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
        }
        .av-mode-info i {
          color: var(--accent-cyan-light);
          font-size: 0.9rem;
        }
      `}</style>

      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Age Verification</span>
        </div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-id-card" style={{ color: 'var(--accent-green)' }}></i>
          Age Verification
        </h1>
        <p>Verify age instantly via barcode scanning or manual date entry.</p>
        <div style={{ marginTop: '0.75rem' }}>
          <span className="av-privacy-badge">
            <i className="fa-solid fa-shield-halved"></i>
            100% Client-Side — No Data Sent
          </span>
        </div>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">

          {/* ── Age Threshold Setting ── */}
          <div className="glass-card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>Minimum Age Requirement</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Set the minimum age to verify against</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '200px', flex: '1', maxWidth: '320px' }}>
                <input
                  type="range"
                  className="av-age-slider"
                  min="13"
                  max="25"
                  value={minAge}
                  onChange={e => setMinAge(+e.target.value)}
                />
                <div style={{
                  minWidth: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-glass-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: 'var(--accent-purple-light)',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {minAge}
                </div>
              </div>
            </div>
          </div>

          {/* ── Mode Tabs ── */}
          <div className="glass-card">
            <div className="tabs" style={{ marginBottom: '1.25rem', justifyContent: 'center' }}>
              <button
                className={`tab-btn ${mode === 'camera' ? 'active' : ''}`}
                onClick={() => { setMode('camera'); reset(); }}
              >
                <i className="fa-solid fa-camera" style={{ marginRight: '6px' }}></i> Scan Barcode
              </button>
              <button
                className={`tab-btn ${mode === 'file' ? 'active' : ''}`}
                onClick={() => { setMode('file'); reset(); }}
              >
                <i className="fa-solid fa-file-arrow-up" style={{ marginRight: '6px' }}></i> Upload Image
              </button>
              <button
                className={`tab-btn ${mode === 'manual' ? 'active' : ''}`}
                onClick={() => { setMode('manual'); reset(); }}
              >
                <i className="fa-solid fa-calendar-days" style={{ marginRight: '6px' }}></i> Manual Entry
              </button>
            </div>

            {/* ── CAMERA MODE ── */}
            {mode === 'camera' && !result && (
              <>
                <div className="av-mode-info">
                  <i className="fa-solid fa-circle-info"></i>
                  <span>Point your camera at a 1D barcode (Code 128, EAN, UPC, Code 39, etc.) on an ID or document.</span>
                </div>

                {!scanning && (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <i className="fa-solid fa-barcode" style={{ fontSize: '2rem', color: 'var(--accent-green)' }}></i>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                      Scan the barcode on an ID card, driver's license, or any document containing a date of birth.
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={startScanner} style={{ gap: '8px', margin: '0 auto' }}>
                      <i className="fa-solid fa-camera"></i> Start Camera Scanner
                    </button>
                  </div>
                )}

                {/* Scanner container — always in DOM so ref is available for Quagga.init */}
                <div style={{ padding: '0.5rem 0', display: scanning ? 'block' : 'none' }}>
                  <div
                    ref={scannerRef}
                    className="av-scanner-container"
                    style={{
                      position: 'relative',
                      maxWidth: '480px',
                      margin: '0 auto',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '3px solid var(--accent-green)',
                      boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)'
                    }}
                  >
                    {/* Scan laser */}
                    {scanning && <div style={{
                      position: 'absolute',
                      left: '5%',
                      right: '5%',
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, #10b981, #06b6d4, #10b981, transparent)',
                      boxShadow: '0 0 15px #10b981',
                      zIndex: 10,
                      pointerEvents: 'none',
                      animation: 'av-scan-laser 2.5s ease-in-out infinite',
                      borderRadius: '2px'
                    }} />}
                    {/* Corner markers */}
                    {scanning && [
                      { top: '8%', left: '8%', borderTop: '3px solid rgba(255,255,255,0.7)', borderLeft: '3px solid rgba(255,255,255,0.7)' },
                      { top: '8%', right: '8%', borderTop: '3px solid rgba(255,255,255,0.7)', borderRight: '3px solid rgba(255,255,255,0.7)' },
                      { bottom: '8%', left: '8%', borderBottom: '3px solid rgba(255,255,255,0.7)', borderLeft: '3px solid rgba(255,255,255,0.7)' },
                      { bottom: '8%', right: '8%', borderBottom: '3px solid rgba(255,255,255,0.7)', borderRight: '3px solid rgba(255,255,255,0.7)' }
                    ].map((style, i) => (
                      <div key={i} style={{ position: 'absolute', width: '24px', height: '24px', borderRadius: '4px', pointerEvents: 'none', zIndex: 10, ...style }} />
                    ))}
                  </div>
                  {scanning && (
                    <>
                      <p style={{ textAlign: 'center', color: 'var(--accent-green)', margin: '1.25rem 0 0.75rem', fontSize: '0.95rem', fontWeight: 500 }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                        Searching for barcode…
                      </p>
                      <div style={{ textAlign: 'center' }}>
                        <button className="btn btn-secondary" onClick={stopScanner} style={{ gap: '8px', margin: '0 auto' }}>
                          <i className="fa-solid fa-stop"></i> Stop Scanner
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* ── FILE UPLOAD MODE ── */}
            {mode === 'file' && !result && (
              <div style={{ padding: '1rem 0' }}>
                <div className="av-mode-info">
                  <i className="fa-solid fa-circle-info"></i>
                  <span>Upload a photo or screenshot of a barcode for offline verification.</span>
                </div>
                <div
                  className="drop-zone"
                  onClick={() => document.getElementById('av-file-input').click()}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                  onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                  onDrop={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files?.length > 0) handleFileUpload(e.dataTransfer.files[0]); }}
                  style={{
                    border: isDragging ? '2px dashed var(--accent-green)' : '2px dashed var(--border-color)',
                    background: isDragging ? 'rgba(16, 185, 129, 0.05)' : 'none',
                    transition: 'border-color 0.2s, background 0.2s',
                    padding: '2.5rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    maxWidth: '500px',
                    margin: '0 auto'
                  }}
                >
                  <div style={{ marginBottom: '1rem', fontSize: '2.5rem', color: 'var(--accent-green)' }}>
                    <i className="fa-solid fa-barcode"></i>
                  </div>
                  <h3>{isDragging ? 'Drop barcode image here!' : 'Select or drag a barcode image'}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Upload a photo of an ID barcode or any barcode containing date information
                  </p>
                  <input id="av-file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e.target.files[0])} />
                </div>
              </div>
            )}

            {/* ── MANUAL ENTRY MODE ── */}
            {mode === 'manual' && !result && (
              <div style={{ padding: '1rem 0' }}>
                <div className="av-mode-info">
                  <i className="fa-solid fa-circle-info"></i>
                  <span>Enter the date of birth manually for quick verification.</span>
                </div>
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      className="form-input"
                      type="date"
                      value={manualDob}
                      onChange={e => setManualDob(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      style={{ fontSize: '1rem' }}
                    />
                  </div>
                  <button
                    className="btn btn-primary btn-lg w-full"
                    onClick={handleManualVerify}
                    disabled={!manualDob}
                    style={{ gap: '8px', marginTop: '0.5rem' }}
                  >
                    <i className="fa-solid fa-shield-halved"></i> Verify Age
                  </button>
                </div>
              </div>
            )}

            {/* ── ERROR DISPLAY ── */}
            {error && (
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-red)',
                fontSize: '0.9rem',
                maxWidth: '500px',
                margin: '1.25rem auto 0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginTop: '2px', flexShrink: 0 }}></i>
                <span>{error}</span>
              </div>
            )}

            {/* ── RESULT DISPLAY ── */}
            {result && (
              <div className={showResult ? 'av-result-enter' : ''} style={{ padding: '1rem 0', opacity: showResult ? 1 : 0 }}>
                {/* Verification badge */}
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${result.verified ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  background: result.verified
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.05))'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(217, 70, 239, 0.05))',
                  animation: result.verified ? 'av-pulse-green 2s ease-in-out infinite' : 'av-pulse-red 2s ease-in-out infinite',
                  maxWidth: '480px',
                  margin: '0 auto'
                }}>
                  {/* Icon */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: result.verified
                      ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                      : 'linear-gradient(135deg, #ef4444, #d946ef)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    boxShadow: result.verified
                      ? '0 8px 30px rgba(16, 185, 129, 0.35)'
                      : '0 8px 30px rgba(239, 68, 68, 0.35)',
                    animation: 'av-badge-glow 2s ease-in-out infinite'
                  }}>
                    <i className={`fa-solid ${result.verified ? 'fa-check' : 'fa-xmark'}`}
                       style={{ fontSize: '2.2rem', color: '#fff' }}></i>
                  </div>

                  <h2 style={{
                    marginBottom: '0.5rem',
                    fontSize: '1.5rem',
                    background: result.verified
                      ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                      : 'linear-gradient(135deg, #ef4444, #d946ef)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {result.verified ? 'AGE VERIFIED' : 'NOT VERIFIED'}
                  </h2>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                    {result.verified
                      ? `Person is ${result.age.years} years old — meets the minimum age of ${minAge}`
                      : `Person is ${result.age.years} years old — does not meet the minimum age of ${minAge}`
                    }
                  </p>
                </div>

                {/* Age breakdown */}
                <div className="stats-grid mt-2" style={{ maxWidth: '480px', margin: '1.5rem auto 0' }}>
                  <div className="stat-card">
                    <div className="stat-card-value" style={{ color: 'var(--accent-purple-light)' }}>{result.age.years}</div>
                    <div className="stat-card-label">Years</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value" style={{ color: 'var(--accent-cyan-light)' }}>{result.age.months}</div>
                    <div className="stat-card-label">Months</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>{result.age.days}</div>
                    <div className="stat-card-label">Days</div>
                  </div>
                </div>

                {/* DOB & details */}
                <div style={{
                  maxWidth: '480px',
                  margin: '1.25rem auto 0',
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-glass-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of Birth</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatDate(result.dob)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age in Days</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {Math.floor((new Date() - result.dob) / (1000 * 60 * 60 * 24)).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification</span>
                    <span style={{
                      fontWeight: 700,
                      color: result.verified ? 'var(--accent-green)' : 'var(--accent-red)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <i className={`fa-solid ${result.verified ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                      {result.verified ? 'Passed' : 'Failed'} (min. {minAge})
                    </span>
                  </div>
                </div>

                {/* AAMVA details */}
                {result.aamva && (
                  <div style={{
                    maxWidth: '480px',
                    margin: '1rem auto 0',
                    padding: '1rem 1.25rem',
                    background: 'rgba(59, 130, 246, 0.06)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-purple-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                      <i className="fa-solid fa-id-badge" style={{ marginRight: '6px' }}></i>
                      AAMVA License Data Detected
                    </div>
                    {result.aamva.firstName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Name</span>
                        <span style={{ fontWeight: 600 }}>{result.aamva.firstName} {result.aamva.lastName || ''}</span>
                      </div>
                    )}
                    {result.aamva.licenseNumber && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>License #</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{result.aamva.licenseNumber}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw data (collapsible) */}
                {result.raw && (
                  <details style={{
                    maxWidth: '480px',
                    margin: '1rem auto 0',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}>
                    <summary style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
                      <i className="fa-solid fa-code" style={{ marginRight: '6px' }}></i>
                      View Raw Barcode Data
                    </summary>
                    <pre style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      overflowX: 'auto',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all'
                    }}>
                      {result.raw}
                    </pre>
                  </details>
                )}

                {/* Actions */}
                <div className="btn-group" style={{ justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={reset} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-rotate"></i> Verify Another
                  </button>
                  <button className="btn btn-secondary" onClick={() => {
                    const text = `Age Verification Result\n` +
                      `Status: ${result.verified ? 'VERIFIED' : 'NOT VERIFIED'}\n` +
                      `Age: ${result.age.years}y ${result.age.months}m ${result.age.days}d\n` +
                      `DOB: ${formatDate(result.dob)}\n` +
                      `Minimum Age: ${minAge}`;
                    navigator.clipboard.writeText(text);
                  }} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-copy"></i> Copy Result
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Supported Formats Card ── */}
          <div className="glass-card mt-2">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-barcode" style={{ color: 'var(--accent-cyan-light)' }}></i>
              Supported Barcode Formats
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '0.75rem'
            }}>
              {[
                { name: 'Code 128', desc: 'Shipping, IDs' },
                { name: 'Code 39', desc: 'Automotive, defense' },
                { name: 'EAN-13', desc: 'International products' },
                { name: 'EAN-8', desc: 'Small products' },
                { name: 'UPC-A', desc: 'US/Canadian retail' },
                { name: 'UPC-E', desc: 'Small packages' },
                { name: 'Codabar', desc: 'Libraries, labs' },
                { name: 'ITF', desc: 'Logistics' },
                { name: 'Code 93', desc: 'Postal, logistics' }
              ].map(fmt => (
                <div key={fmt.name} style={{
                  padding: '0.75rem',
                  background: 'var(--bg-glass-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  transition: 'border-color 0.2s, transform 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan-light)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.25rem' }}>{fmt.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{fmt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── How It Works ── */}
          <div className="glass-card mt-2">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-circle-question" style={{ color: 'var(--accent-amber)' }}></i>
              How It Works
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { icon: 'fa-barcode', color: 'var(--accent-green)', title: 'Scan or Upload', desc: 'Use your camera to scan a barcode or upload an image of one.' },
                { icon: 'fa-magnifying-glass', color: 'var(--accent-cyan-light)', title: 'Extract Date', desc: 'The tool parses the barcode data to find a date of birth.' },
                { icon: 'fa-shield-halved', color: 'var(--accent-purple-light)', title: 'Verify Age', desc: 'Age is calculated and compared against your minimum threshold.' }
              ].map((step, i) => (
                <div key={i} style={{
                  padding: '1.25rem',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: `${step.color}15`,
                    border: `1px solid ${step.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem'
                  }}>
                    <i className={`fa-solid ${step.icon}`} style={{ color: step.color, fontSize: '1.1rem' }}></i>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>{i + 1}.</span>
                    {step.title}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Age Verification — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
