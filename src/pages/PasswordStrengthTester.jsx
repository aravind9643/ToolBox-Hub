import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';

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

export default function PasswordStrengthTester() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  // Generator states
  const [genLength, setGenLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const generatePassword = () => {
    let chars = '';
    if (includeLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) return;
    let generated = '';
    for (let i = 0; i < genLength; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  const analysis = useMemo(() => {
    if (!password) return null;
    const entropy = calcEntropy(password);
    const crackTime = estimateCrackTime(entropy);
    const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());

    const checks = [
      { label: 'Length: At least 8 characters', pass: password.length >= 8 },
      { label: 'Length: At least 12 characters', pass: password.length >= 12 },
      { label: 'Lowercase letters (a–z)', pass: /[a-z]/.test(password) },
      { label: 'Uppercase letters (A–Z)', pass: /[A-Z]/.test(password) },
      { label: 'Numbers (0–9)', pass: /[0-9]/.test(password) },
      { label: 'Special symbols (!@#$...)', pass: /[^a-zA-Z0-9]/.test(password) },
      { label: 'Unique from common dictionary list', pass: !isCommon },
      { label: 'No long repetitions (aaa...)', pass: !/(.)\1{2,}/.test(password) },
    ];

    const passedCount = checks.filter(c => c.pass).length;
    let strength, color, level;
    if (isCommon || entropy < 28) { strength = 'Very Weak'; color = '#ef4444'; level = 1; }
    else if (entropy < 40) { strength = 'Weak'; color = '#f97316'; level = 2; }
    else if (entropy < 55) { strength = 'Fair'; color = '#f59e0b'; level = 3; }
    else if (entropy < 70) { strength = 'Strong'; color = '#10b981'; level = 4; }
    else { strength = 'Excellent'; color = '#3b82f6'; level = 5; }

    const failedChecks = checks.filter(c => !c.pass);

    return { entropy: entropy.toFixed(1), crackTime, strength, color, level, checks, passedCount, failedChecks };
  }, [password]);

  return (
    <div className="tool-page">
      <SEOHead title="Password Strength Tester" description="Analyze password strength, entropy, and estimated crack time. Generate strong custom passwords offline." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Password Strength Tester</span></div>
        <h1><i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-purple-light)' }}></i> Password Strength Tester</h1>
        <p>Analyze how strong your password is. Test and generate keys safely completely offline.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Input and Toggle */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Enter Password to Test
                <span 
                  onClick={() => setShowGenerator(!showGenerator)} 
                  style={{ fontSize: '0.75rem', color: 'var(--accent-cyan-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <i className={`fa-solid ${showGenerator ? 'fa-angle-up' : 'fa-wand-magic-sparkles'}`}></i>
                  {showGenerator ? 'Hide Generator' : 'Generate Strong Password'}
                </span>
              </label>
              
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Type your password here..."
                  autoComplete="off"
                  style={{ fontSize: '1.1rem', paddingRight: '2.5rem' }}
                />
                <button onClick={() => setShow(s => !s)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <i className={`fa-solid ${show ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Generator Panel */}
            {showGenerator && (
              <div style={{ padding: '1rem', background: 'var(--bg-glass-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Configure Password Generator</span>
                  <button className="btn btn-primary btn-sm" onClick={generatePassword} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    Generate & Autofill
                  </button>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>Length ({genLength} characters)</label>
                  <input type="range" min="6" max="32" value={genLength} onChange={e => setGenLength(Number(e.target.value))} style={{ width: '100%', height: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    { state: includeLower, set: setIncludeLower, label: 'a-z' },
                    { state: includeUpper, set: setIncludeUpper, label: 'A-Z' },
                    { state: includeNumbers, set: setIncludeNumbers, label: '0-9' },
                    { state: includeSymbols, set: setIncludeSymbols, label: '!@#$' }
                  ].map(item => (
                    <label key={item.label} style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={item.state} onChange={() => item.set(!item.state)} style={{ cursor: 'pointer' }} />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Strength Meter */}
            {analysis && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Password Strength</span>
                    <span style={{ fontWeight: 700, color: analysis.color }}>{analysis.strength}</span>
                  </div>
                  <div style={{ height: '10px', background: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div style={{
                      height: '100%', borderRadius: '9999px', background: analysis.color,
                      width: `${(analysis.level / 5) * 100}%`, transition: 'width 0.5s ease, background 0.3s'
                    }}></div>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="stat-card">
                    <div className="stat-card-value" style={{ color: analysis.color }}>{analysis.strength}</div>
                    <div className="stat-card-label">Strength Rating</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value" style={{ color: 'var(--accent-cyan-light)' }}>{analysis.entropy}</div>
                    <div className="stat-card-label">Bits of Entropy</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{password.length}</div>
                    <div className="stat-card-label">Characters</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value" style={{ fontSize: '0.85rem', color: analysis.level >= 4 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {analysis.crackTime}
                    </div>
                    <div className="stat-card-label">Est. Crack Time</div>
                  </div>
                </div>

                {/* Checklist */}
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Security Checklist ({analysis.passedCount}/{analysis.checks.length} passed)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.4rem' }}>
                  {analysis.checks.map(({ label, pass }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: pass ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.06)', border: `1px solid ${pass ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}` }}>
                      <i className={`fa-solid ${pass ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ color: pass ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.9rem' }}></i>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Fixing Tips */}
                {analysis.failedChecks.length > 0 && (
                  <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.82rem', color: 'var(--accent-red)', margin: '0 0 0.5rem 0', fontWeight: 600 }}>💡 How to Improve Your Password:</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
                      {analysis.failedChecks.map(c => (
                        <li key={c.label}>To increase safety, satisfy: <strong>{c.label}</strong></li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <i className="fa-solid fa-lock" style={{ color: 'var(--accent-green)', marginRight: '6px' }}></i>
                  Your password is analyzed entirely in your browser. It is never sent to any server.
                </div>
              </>
            )}

            {!analysis && (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-shield" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}></i>
                Start typing or use the generator to analyze your password's strength instantly.
              </div>
            )}
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
