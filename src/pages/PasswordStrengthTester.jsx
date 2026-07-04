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
  const guessesPerSecond = 1e10; // 10 billion guesses/sec (modern GPU)
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

  const analysis = useMemo(() => {
    if (!password) return null;
    const entropy = calcEntropy(password);
    const crackTime = estimateCrackTime(entropy);
    const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());

    const checks = [
      { label: 'At least 8 characters', pass: password.length >= 8 },
      { label: 'At least 12 characters', pass: password.length >= 12 },
      { label: 'Lowercase letters (a–z)', pass: /[a-z]/.test(password) },
      { label: 'Uppercase letters (A–Z)', pass: /[A-Z]/.test(password) },
      { label: 'Numbers (0–9)', pass: /[0-9]/.test(password) },
      { label: 'Special symbols (!@#$...)', pass: /[^a-zA-Z0-9]/.test(password) },
      { label: 'Not a common password', pass: !isCommon },
      { label: 'No repeated characters (aaa...)', pass: !/(.)\1{2,}/.test(password) },
    ];

    const passedCount = checks.filter(c => c.pass).length;
    let strength, color, level;
    if (isCommon || entropy < 28) { strength = 'Very Weak'; color = '#ef4444'; level = 1; }
    else if (entropy < 40) { strength = 'Weak'; color = '#f97316'; level = 2; }
    else if (entropy < 55) { strength = 'Fair'; color = '#f59e0b'; level = 3; }
    else if (entropy < 70) { strength = 'Strong'; color = '#22c55e'; level = 4; }
    else { strength = 'Excellent'; color = '#3b82f6'; level = 5; }

    return { entropy: entropy.toFixed(1), crackTime, strength, color, level, checks, passedCount };
  }, [password]);

  return (
    <div className="tool-page">
      <SEOHead title="Password Strength Tester" description="Analyze password strength, entropy, and estimated crack time. 100% private, offline." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Password Strength Tester</span></div>
        <h1><i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-purple-light)' }}></i> Password Strength Tester</h1>
        <p>Analyze how strong your password is. Nothing is stored or sent anywhere.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div className="form-group">
              <label className="form-label">Enter Password to Test</label>
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

                <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <i className="fa-solid fa-lock" style={{ color: 'var(--accent-green)', marginRight: '6px' }}></i>
                  Your password is analyzed entirely in your browser. It is never sent to any server.
                </div>
              </>
            )}

            {!analysis && (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-shield" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}></i>
                Start typing to analyze your password's strength instantly.
              </div>
            )}
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
