import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

const COMMON_PASSWORDS = ['password', '123456', 'qwerty', 'abc123', 'password1', 'admin', 'letmein', 'welcome', 'monkey', 'dragon'];

function calcEntropy(password) {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;
  return password.length * Math.log2(charsetSize || 1);
}

function estimateCrackTime(entropy) {
  const guessesPerSecond = 1e10; // 10 billion guesses/sec
  const combinations = Math.pow(2, entropy);
  const seconds = combinations / 2 / guessesPerSecond;
  if (seconds < 1) return 'Instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 1000) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1e6) return `${(seconds / 31536000).toExponential(1)} years`;
  return 'Centuries+';
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [showGenerator, setShowGenerator] = useState(true);
  const [copied, setCopied] = useState(false);

  // Generator states
  const [genLength, setGenLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(true);

  const generatePassword = () => {
    let lowercase = 'abcdefghijklmnopqrstuvwxyz';
    let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (avoidAmbiguous) {
      lowercase = lowercase.replace(/[lo]/g, '');
      uppercase = uppercase.replace(/[IO]/g, '');
      numbers = numbers.replace(/[01]/g, '');
      symbols = symbols.replace(/[|]/g, '');
    }

    let chars = '';
    if (includeLower) chars += lowercase;
    if (includeUpper) chars += uppercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (!chars) return;
    let generated = '';
    const arr = new Uint32Array(genLength);
    crypto.getRandomValues(arr);
    for (let i = 0; i < genLength; i++) {
      generated += chars.charAt(arr[i] % chars.length);
    }
    setPassword(generated);
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const analysis = useMemo(() => {
    if (!password) return null;
    const entropy = calcEntropy(password);
    const crackTime = estimateCrackTime(entropy);
    const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());

    const checks = [
      { label: 'Minimum 12 characters length', pass: password.length >= 12 },
      { label: 'Includes lowercase letter (a–z)', pass: /[a-z]/.test(password) },
      { label: 'Includes uppercase letter (A–Z)', pass: /[A-Z]/.test(password) },
      { label: 'Includes numeral digit (0–9)', pass: /[0-9]/.test(password) },
      { label: 'Includes special symbol (!@#$... )', pass: /[^a-zA-Z0-9]/.test(password) },
      { label: 'Not found in common dictionary', pass: !isCommon },
      { label: 'No long repetitions (e.g. aaa...)', pass: !/(.)\1{2,}/.test(password) },
    ];

    const passedCount = checks.filter(c => c.pass).length;
    
    let strength, color, level;
    if (isCommon || entropy < 36) { strength = 'Critical Danger / Weak'; color = 'var(--accent-red)'; level = 1; }
    else if (entropy < 50) { strength = 'Poor / Weak'; color = 'var(--accent-amber)'; level = 2; }
    else if (entropy < 65) { strength = 'Moderate / Fair'; color = 'var(--accent-cyan-light)'; level = 3; }
    else if (entropy < 80) { strength = 'Highly Secure / Strong'; color = 'var(--accent-green)'; level = 4; }
    else { strength = 'Military-Grade / Excellent'; color = '#00ffaa'; level = 5; }

    return { entropy: entropy.toFixed(1), crackTime, strength, color, level, checks, passedCount };
  }, [password]);

  return (
    <div className="tool-page">
      <SEOHead title="Password Studio — Generator & Entropy Auditor" description="Generate secure passwords and calculate Shannon entropy strength. Check common passwords and estimated crack times." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Password Studio</span></div>
        <h1><i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-purple-light)' }}></i> Password Generator & Strength Tester</h1>
        <p>Design cryptographically secure passwords and audit entropy levels locally.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Password to Test / Generate
                <button className="btn btn-secondary btn-sm" onClick={() => setShowGenerator(!showGenerator)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '4px' }}>
                  <i className="fa-solid fa-gears"></i> {showGenerator ? 'Hide Generator Options' : 'Show Generator Options'}
                </button>
              </label>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type={show ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Type or generate password..."
                    autoComplete="off"
                    style={{ fontSize: '1.05rem', paddingRight: '2.5rem', fontFamily: 'monospace' }}
                  />
                  <button onClick={() => setShow(s => !s)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <i className={`fa-solid ${show ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                
                <button className="btn btn-primary" onClick={handleCopy} disabled={!password} title="Copy Password" style={{ padding: '0 1rem' }}>
                  <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
                </button>
              </div>
            </div>

            {/* Configurable Generator Card */}
            {showGenerator && (
              <div style={{
                padding: '1rem', 
                background: 'var(--bg-glass-hover)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Generator Parameters</span>
                  <button className="btn btn-primary btn-sm" onClick={generatePassword} style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                    Generate & Populate
                  </button>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Length ({genLength} characters)</label>
                  <input type="range" min="8" max="64" value={genLength} onChange={e => setGenLength(Number(e.target.value))} style={{ width: '100%', height: '4px', accentColor: 'var(--accent-purple-light)' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { state: includeLower, set: setIncludeLower, label: 'a-z (lowercase)' },
                    { state: includeUpper, set: setIncludeUpper, label: 'A-Z (uppercase)' },
                    { state: includeNumbers, set: setIncludeNumbers, label: '0-9 (numbers)' },
                    { state: includeSymbols, set: setIncludeSymbols, label: '!@#$ (symbols)' }
                  ].map(item => (
                    <label key={item.label} style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={item.state} onChange={() => item.set(!item.state)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                      {item.label}
                    </label>
                  ))}
                  <label style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginLeft: 'auto' }}>
                    <input type="checkbox" checked={avoidAmbiguous} onChange={() => setAvoidAmbiguous(!avoidAmbiguous)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                    <span style={{ color: 'var(--accent-cyan-light)' }}>Avoid Ambiguous (1, l, o, 0)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Analysis details */}
            {analysis && (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Level Meter */}
                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span>Security Rating:</span>
                    <strong style={{ color: analysis.color }}>{analysis.strength}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    {[1, 2, 3, 4, 5].map(step => (
                      <div key={step} style={{ flex: 1, background: step <= analysis.level ? analysis.color : 'transparent', transition: 'background-color 0.2s' }} />
                    ))}
                  </div>
                </div>

                {/* Telemetry info */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                  <div className="stat-card" style={{ padding: '0.75rem' }}>
                    <div className="stat-card-value" style={{ color: 'var(--accent-cyan-light)', fontSize: '1.15rem' }}>{analysis.entropy} bits</div>
                    <div className="stat-card-label" style={{ fontSize: '0.68rem' }}>Shannon Entropy</div>
                  </div>
                  <div className="stat-card" style={{ padding: '0.75rem' }}>
                    <div className="stat-card-value" style={{ color: 'var(--accent-cyan-light)', fontSize: '1.15rem' }}>{analysis.crackTime}</div>
                    <div className="stat-card-label" style={{ fontSize: '0.68rem' }}>Time to Crack (10B/sec)</div>
                  </div>
                </div>

                {/* Audit checklist */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Security Audit Checklist ({analysis.passedCount} / {analysis.checks.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {analysis.checks.map((check, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        <i className={`fa-solid ${check.pass ? 'fa-circle-check text-success' : 'fa-circle-xmark text-danger'}`}
                          style={{ color: check.pass ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                        <span style={{ color: check.pass ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Password Studio — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
