import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 'weak', label: 'Weak', color: 'var(--accent-red)' };
  if (score <= 2) return { level: 'fair', label: 'Fair', color: 'var(--accent-amber)' };
  if (score <= 3) return { level: 'good', label: 'Good', color: 'var(--accent-cyan)' };
  return { level: 'strong', label: 'Strong', color: 'var(--accent-green)' };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const generate = useCallback(() => {
    let charset = '';
    Object.entries(options).forEach(([key, val]) => { if (val) charset += CHARS[key]; });
    if (!charset) charset = CHARS.lowercase;
    let pw = '';
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    for (let i = 0; i < length; i++) pw += charset[arr[i] % charset.length];
    setPassword(pw);
    setCopied(false);
    setHistory(prev => [pw, ...prev].slice(0, 5));
  }, [length, options]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = password ? getStrength(password) : null;

  return (
    <div className="tool-page">
      <SEOHead title="Password Generator" description="Generate strong, secure passwords. Customize length and character types. Free and instant." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Password Generator</span></div>
        <h1>🔐 Password Generator</h1>
        <p>Generate cryptographically secure passwords with full customization.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            {password && (
              <div className="result-box" style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                <div className="flex items-center justify-between">
                  <code style={{ fontSize: '1.1rem', wordBreak: 'break-all', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', flex: 1 }}>{password}</code>
                  <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>{copied ? '✓ Copied' : '📋 Copy'}</button>
                </div>
                {strength && (
                  <>
                    <div className="strength-meter" style={{ marginTop: '0.75rem' }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`strength-bar ${i <= (strength.level === 'weak' ? 1 : strength.level === 'fair' ? 2 : strength.level === 'good' ? 3 : 4) ? `active ${strength.level}` : ''}`} />
                      ))}
                    </div>
                    <div className="strength-text" style={{ color: strength.color }}>{strength.label}</div>
                  </>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Length: {length}</label>
              <input className="form-range" type="range" min="4" max="64" value={length} onChange={e => setLength(Number(e.target.value))} />
            </div>

            <div className="grid-2">
              {Object.entries(options).map(([key, val]) => (
                <label key={key} className="form-toggle">
                  <input type="checkbox" checked={val} onChange={() => setOptions(p => ({ ...p, [key]: !p[key] }))} />
                  <span className="form-toggle-slider" />
                  {key.charAt(0).toUpperCase() + key.slice(1)} {key === 'symbols' ? '(!@#$)' : key === 'numbers' ? '(0-9)' : key === 'uppercase' ? '(A-Z)' : '(a-z)'}
                </label>
              ))}
            </div>

            <button className="btn btn-primary btn-lg w-full mt-3" onClick={generate}>⚡ Generate Password</button>

            {history.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Recent Passwords</h3>
                {history.map((pw, i) => (
                  <div key={i} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', wordBreak: 'break-all' }}
                    onClick={() => { navigator.clipboard.writeText(pw); }}>
                    {pw}
                  </div>
                ))}
              </div>
            )}
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
