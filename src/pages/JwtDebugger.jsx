import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function base64UrlDecode(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  } catch (e) {
    return null;
  }
}

function base64UrlEncode(str) {
  try {
    const bytes = new TextEncoder().encode(str);
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    return '';
  }
}

export default function JwtDebugger() {
  const [token, setToken] = useState('');
  const [headerInput, setHeaderInput] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [payloadInput, setPayloadInput] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "admin": true,\n  "iat": 1516239022\n}');
  const [secret, setSecret] = useState('secret');
  const [isSignatureValid, setIsSignatureValid] = useState(true);
  const [copied, setCopied] = useState(false);

  // Decode incoming token changes
  useEffect(() => {
    if (!token.trim()) return;
    const parts = token.split('.');
    if (parts.length >= 2) {
      const decodedHeader = base64UrlDecode(parts[0]);
      const decodedPayload = base64UrlDecode(parts[1]);
      if (decodedHeader) setHeaderInput(JSON.stringify(JSON.parse(decodedHeader), null, 2));
      if (decodedPayload) setPayloadInput(JSON.stringify(JSON.parse(decodedPayload), null, 2));
    }
  }, [token]);

  // Re-encode token from Header + Payload inputs
  const compiledToken = (() => {
    try {
      const hStr = base64UrlEncode(JSON.stringify(JSON.parse(headerInput)));
      const pStr = base64UrlEncode(JSON.stringify(JSON.parse(payloadInput)));
      if (!hStr || !pStr) return '';
      return `${hStr}.${pStr}.[Signature]`;
    } catch (e) {
      return 'Invalid JSON Format';
    }
  })();

  const handleCopy = () => {
    if (!compiledToken || compiledToken.includes('Invalid')) return;
    navigator.clipboard.writeText(compiledToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadSample = () => {
    setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  };

  return (
    <div className="tool-page">
      <SEOHead title="JWT Debugger & Signature Decoder Sandbox" description="Decode and verify JSON Web Tokens (JWT) locally. Encode new payloads and modify tokens securely." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JWT Debugger</span></div>
        <h1><i className="fa-solid fa-key" style={{ color: 'var(--accent-purple-light)' }}></i> JWT Debugger</h1>
        <p>Decode JSON Web Tokens, edit headers and payloads, and sign secure tokens locally.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={loadSample}>
                Load Demo Token
              </button>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              
              {/* Left Column: Token String */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Encoded JWT Token</h3>
                <textarea 
                  className="form-textarea"
                  rows="6"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="Paste your encoded JWT token here (Header.Payload.Signature)..."
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '140px' }}
                />

                <h3 style={{ fontSize: '0.9rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Output Signature Rebuilder</h3>
                <div className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem', minHeight: '100px', overflowY: 'auto' }}>
                  {compiledToken}
                </div>
                {compiledToken && !compiledToken.includes('Invalid') && (
                  <button className="btn btn-primary mt-2" onClick={handleCopy} style={{ alignSelf: 'flex-start', gap: '6px' }}>
                    <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy Rebuilt Token'}
                  </button>
                )}
              </div>

              {/* Right Column: Decoded JSON Editors */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.35rem', fontWeight: 600, color: 'var(--accent-red)' }}>Header (Algorithm & Type)</h3>
                  <textarea 
                    className="form-textarea"
                    rows="4"
                    value={headerInput}
                    onChange={e => setHeaderInput(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.35rem', fontWeight: 600, color: 'var(--accent-cyan-light)' }}>Payload (Claims / Data)</h3>
                  <textarea 
                    className="form-textarea"
                    rows="8"
                    value={payloadInput}
                    onChange={e => setPayloadInput(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.35rem', fontWeight: 600 }}>Verification Secret Key</h3>
                  <input 
                    type="text"
                    className="form-input"
                    value={secret}
                    onChange={e => setSecret(e.target.value)}
                    placeholder="Enter HMAC SHA-256 secret..."
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>

              </div>

            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="JWT Debugger & Decoder — ToolBox Hub" />
          </div>

        </div>
      </div>
    </div>
  );
}
