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

export default function PasswordStrengthTester() {
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
    for (let i = 0; i < genLength; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
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
      <SEOHead title="Password Security & Strength Calculator" description="Check password entropy metrics and run offline password evaluations with dynamic checklists." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Password Strength</span></div>
        <h1><i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-purple-light)' }}></i> Password Security Checker</h1>
        <p>Run mathematical Shannon entropy audits and generate secure keys securely offline.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Password to Test
                <button className="btn btn-secondary btn-sm" onClick={() => setShowGenerator(!showGenerator)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '4px' }}>
                  <i className="fa-solid fa-gears"></i> {showGenerator ? 'Hide Generator' : 'Show Generator'}
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
              <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '1.25rem' }}>
                {/* Checklist */}
                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Security Requirement Checklist</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {analysis.checks.map((chk, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: chk.pass ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        <i className={chk.pass ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"} style={{ color: chk.pass ? 'var(--accent-green)' : 'var(--text-muted)' }} />
                        <span>{chk.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Scorecard */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SHANNON ENTROPY</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple-light)' }}>{analysis.entropy} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>bits</span></div>
                  </div>

                  <div style={{ padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STRENGTH RATING</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: analysis.color, marginTop: '2px' }}>{analysis.strength}</div>
                  </div>

                  <div style={{ padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>EST. CRACK TIME</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{analysis.crackTime}</div>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Password Security Evaluator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
