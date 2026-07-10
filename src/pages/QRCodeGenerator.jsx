import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

export default function QRCodeGenerator() {
  // Templates: 'text' | 'wifi' | 'email' | 'upi'
  const [template, setTemplate] = useState('text');
  
  // Input fields
  const [text, setText] = useState('https://example.com');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState('WPA');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // UPI fields
  const [upiAddress, setUpiAddress] = useState('');
  const [upiName, setUpiName] = useState('');
  const [upiAmount, setUpiAmount] = useState('');
  const [upiNote, setUpiNote] = useState('');

  // Styles
  const [fgColor, setFgColor] = useState('#3b82f6');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [useGradient, setUseGradient] = useState(false);
  const [gradStart, setGradStart] = useState('#3b82f6');
  const [gradEnd, setGradEnd] = useState('#ec4899');
  const [size, setSize] = useState(256);

  // Logo Overlay: 'none' | 'youtube' | 'github' | 'twitter' | 'whatsapp' | 'custom'
  const [logoType, setLogoType] = useState('none');
  const [customLogoFile, setCustomLogoFile] = useState(null);
  const [customLogoImg, setCustomLogoImg] = useState(null);

  const canvasRef = useRef(null);

  const handleCustomLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setCustomLogoImg(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
      setCustomLogoFile(file);
    }
  };

  useEffect(() => {
    // Generate QR Text based on selected template
    let qrText = text;
    if (template === 'wifi') {
      qrText = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
    } else if (template === 'email') {
      const parts = [];
      if (emailSubject) parts.push(`subject=${encodeURIComponent(emailSubject)}`);
      if (emailBody) parts.push(`body=${encodeURIComponent(emailBody)}`);
      const query = parts.length > 0 ? `?${parts.join('&')}` : '';
      qrText = `mailto:${emailTo}${query}`;
    } else if (template === 'upi') {
      const parts = [];
      if (upiAddress) parts.push(`pa=${encodeURIComponent(upiAddress)}`);
      if (upiName) parts.push(`pn=${encodeURIComponent(upiName)}`);
      if (upiAmount) parts.push(`am=${encodeURIComponent(upiAmount)}`);
      if (upiNote) parts.push(`tn=${encodeURIComponent(upiNote)}`);
      parts.push(`cu=INR`);
      qrText = `upi://pay?${parts.join('&')}`;
    }

    if (!qrText || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Create an offscreen canvas to render the base transparent QR
    const qrCanvas = document.createElement('canvas');

    QRCode.toCanvas(qrCanvas, qrText, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000FF',
        light: '#00000000' // transparent background
      }
    })
      .then(() => {
        // 1. Draw solid background color on main canvas
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // 2. Create offscreen blend canvas to apply color gradient
        const compCanvas = document.createElement('canvas');
        compCanvas.width = size;
        compCanvas.height = size;
        const compCtx = compCanvas.getContext('2d');

        // Draw transparent QR
        compCtx.drawImage(qrCanvas, 0, 0);

        // Apply gradient or solid foreground color
        compCtx.globalCompositeOperation = 'source-in';
        if (useGradient) {
          const grad = compCtx.createLinearGradient(0, 0, size, size);
          grad.addColorStop(0, gradStart);
          grad.addColorStop(1, gradEnd);
          compCtx.fillStyle = grad;
        } else {
          compCtx.fillStyle = fgColor;
        }
        compCtx.fillRect(0, 0, size, size);

        // 3. Draw colored QR to main canvas
        ctx.drawImage(compCanvas, 0, 0);

        // 4. Draw center logo overlay with a clean cutout background mask
        if (logoType !== 'none') {
          const logoSize = Math.floor(size * 0.22);
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;

          // Background cutout mask
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          ctx.roundRect(x - 3, y - 3, logoSize + 6, logoSize + 6, 8);
          ctx.fill();

          // Brand Logo rendering
          if (logoType === 'youtube') {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.roundRect(x, y, logoSize, logoSize, logoSize * 0.2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(x + logoSize * 0.38, y + logoSize * 0.28);
            ctx.lineTo(x + logoSize * 0.38, y + logoSize * 0.72);
            ctx.lineTo(x + logoSize * 0.7, y + logoSize * 0.5);
            ctx.closePath();
            ctx.fill();
          } else if (logoType === 'github') {
            ctx.fillStyle = '#24292e';
            ctx.beginPath();
            ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.floor(logoSize * 0.45)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Git', x + logoSize / 2, y + logoSize / 2);
          } else if (logoType === 'twitter') {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.roundRect(x, y, logoSize, logoSize, logoSize * 0.2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.floor(logoSize * 0.6)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('X', x + logoSize / 2, y + logoSize / 2);
          } else if (logoType === 'whatsapp') {
            ctx.fillStyle = '#25d366';
            ctx.beginPath();
            ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.floor(logoSize * 0.55)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('📞', x + logoSize / 2, y + logoSize / 2);
          } else if (logoType === 'custom' && customLogoImg) {
            ctx.drawImage(customLogoImg, x, y, logoSize, logoSize);
          }
        }
      })
      .catch((err) => {
        console.error('Error drawing QR Code:', err);
      });
  }, [text, ssid, password, encryption, emailTo, emailSubject, emailBody, upiAddress, upiName, upiAmount, upiNote, template, fgColor, bgColor, useGradient, gradStart, gradEnd, size, logoType, customLogoImg]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="tool-page">
      <SEOHead title="QR Code Generator" description="Generate customizable QR codes for links, Wi-Fi networks, or emails. Support gradients, margins, and center logos." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>QR Code Generator</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-qrcode" style={{ color: 'var(--accent-purple-light)' }}></i> QR Code Generator
        </h1>
        <p>Create QR codes dynamically for web links, Wi-Fi connectivity, or emails with color gradients and logos.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Format templates selector */}
            <div className="tabs" style={{ marginBottom: '1.5rem' }}>
              <button className={`tab-btn ${template === 'text' ? 'active' : ''}`} onClick={() => setTemplate('text')}>URL / Text</button>
              <button className={`tab-btn ${template === 'wifi' ? 'active' : ''}`} onClick={() => setTemplate('wifi')}>Wi-Fi Network</button>
              <button className={`tab-btn ${template === 'email' ? 'active' : ''}`} onClick={() => setTemplate('email')}>Email Mailto</button>
              <button className={`tab-btn ${template === 'upi' ? 'active' : ''}`} onClick={() => setTemplate('upi')}>UPI Payment</button>
            </div>

            {/* Template Fields */}
            {template === 'text' && (
              <div className="form-group">
                <label className="form-label">Content (URL or text)</label>
                <input className="form-input" type="text" value={text} onChange={e => setText(e.target.value)} placeholder="https://example.com" />
              </div>
            )}

            {template === 'wifi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Network Name (SSID)</label>
                  <input className="form-input" type="text" value={ssid} onChange={e => setSsid(e.target.value)} placeholder="Home_Wifi" />
                </div>
                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Network Security Password" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Encryption Type</label>
                    <select className="form-input" value={encryption} onChange={e => setEncryption(e.target.value)}>
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Unsecured (No password)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {template === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Recipient Email</label>
                  <input className="form-input" type="email" value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="hello@company.com" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Subject</label>
                  <input className="form-input" type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Inquiry about services" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Message Body</label>
                  <textarea className="form-textarea" rows="3" value={emailBody} onChange={e => setEmailBody(e.target.value)} placeholder="Write message details..." />
                </div>
              </div>
            )}

            {template === 'upi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">UPI ID / VPA (Virtual Payment Address)</label>
                    <input className="form-input" type="text" value={upiAddress} onChange={e => setUpiAddress(e.target.value)} placeholder="e.g. someone@upi" required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Payee Name</label>
                    <input className="form-input" type="text" value={upiName} onChange={e => setUpiName(e.target.value)} placeholder="e.g. John Doe" required />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Amount (INR, Optional)</label>
                    <input className="form-input" type="number" min="0" value={upiAmount} onChange={e => setUpiAmount(e.target.value)} placeholder="e.g. 500" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Transaction Note (Optional)</label>
                    <input className="form-input" type="text" value={upiNote} onChange={e => setUpiNote(e.target.value)} placeholder="e.g. Dinner share" />
                  </div>
                </div>
              </div>
            )}

            {/* Colors and Gradients */}
            <div className="grid-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Foreground Style
                  <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => setUseGradient(!useGradient)}>
                    <input type="checkbox" checked={useGradient} onChange={() => {}} style={{ cursor: 'pointer' }} />
                    Use Gradient
                  </span>
                </label>
                {!useGradient ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ width: 44, height: 38, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                    <input className="form-input" type="text" value={fgColor} onChange={e => setFgColor(e.target.value)} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="color" value={gradStart} onChange={e => setGradStart(e.target.value)} style={{ width: 34, height: 38, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                    <i className="fa-solid fa-arrow-right" style={{ color: 'var(--text-muted)' }}></i>
                    <input type="color" value={gradEnd} onChange={e => setGradEnd(e.target.value)} style={{ width: 34, height: 38, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Background Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 44, height: 38, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                  <input className="form-input" type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Central Logos selector */}
            <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1rem' }}>
              <label className="form-label">Embed Center Logo</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {[
                  { id: 'none', label: 'No Logo', icon: 'fa-ban' },
                  { id: 'youtube', label: 'YouTube', icon: 'fa-youtube', color: '#ff0000' },
                  { id: 'github', label: 'GitHub', icon: 'fa-github', color: '#24292e' },
                  { id: 'twitter', label: 'Twitter / X', icon: 'fa-x-twitter', color: '#000000' },
                  { id: 'whatsapp', label: 'WhatsApp', icon: 'fa-whatsapp', color: '#25d366' },
                  { id: 'custom', label: 'Custom File', icon: 'fa-file-image' }
                ].map(l => (
                  <button 
                    key={l.id} 
                    className={`btn btn-sm ${logoType === l.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setLogoType(l.id)}
                    style={{ gap: '6px', fontSize: '0.8rem' }}
                  >
                    <i className={`fa-brands ${l.icon}`} style={{ color: l.color }}></i>
                    {l.label}
                  </button>
                ))}
              </div>
              {logoType === 'custom' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <input className="form-input" type="file" accept="image/*" onChange={handleCustomLogoUpload} style={{ fontSize: '0.85rem' }} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Size: {size}px</label>
              <input className="form-range" type="range" min="128" max="512" step="32" value={size} onChange={e => setSize(Number(e.target.value))} />
            </div>

            <div className="result-box text-center" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
              <canvas ref={canvasRef} style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </div>

            <div className="btn-group mt-2" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={handleDownload} style={{ gap: '8px' }}>
                <i className="fa-solid fa-download"></i> Download PNG
              </button>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="QR Code Generator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
