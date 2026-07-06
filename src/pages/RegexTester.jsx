import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

export default function RegexTester() {
  const [regex, setRegex] = useState('[a-zA-Z]+');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('Hello World! Regex is awesome 123.');

  const cheatSheet = [
    { token: '\\d', desc: 'Any digit (0-9)', category: 'Characters' },
    { token: '\\w', desc: 'Alphanumeric & underscore', category: 'Characters' },
    { token: '\\s', desc: 'Any whitespace', category: 'Characters' },
    { token: '.', desc: 'Any character except newline', category: 'Characters' },
    { token: '[a-z]', desc: 'Lowercase letters range', category: 'Sets' },
    { token: '[0-9]', desc: 'Numbers range', category: 'Sets' },
    { token: '[^abc]', desc: 'Not a, b, or c', category: 'Sets' },
    { token: '^', desc: 'Start of line/string', category: 'Anchors' },
    { token: '$', desc: 'End of line/string', category: 'Anchors' },
    { token: '\\b', desc: 'Word boundary', category: 'Anchors' },
    { token: '*', desc: '0 or more times', category: 'Quantifiers' },
    { token: '+', desc: '1 or more times', category: 'Quantifiers' },
    { token: '?', desc: '0 or 1 time (optional)', category: 'Quantifiers' },
    { token: '{3}', desc: 'Exactly 3 times', category: 'Quantifiers' },
    { token: '(x)', desc: 'Capture group x', category: 'Groups' },
    { token: '(?:x)', desc: 'Non-capturing group x', category: 'Groups' },
  ];

  const results = useMemo(() => {
    if (!regex) return { matches: [], error: '' };
    try {
      const re = new RegExp(regex, flags);
      const matches = [];
      let match;
      
      if (flags.includes('g')) {
        while ((match = re.exec(text)) !== null) {
          if (match[0] === '') {
            re.lastIndex++; // Prevent infinite loops
            continue;
          }
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1) // Capture groups list
          });
        }
      } else {
        match = text.match(re);
        if (match) {
          matches.push({
            value: match[0],
            index: match.index || 0,
            groups: match.slice(1)
          });
        }
      }

      return { matches, error: '' };
    } catch (e) {
      return { matches: [], error: e.message };
    }
  }, [regex, flags, text]);

  // Generate highlighted JSX representation
  const highlightedText = useMemo(() => {
    if (!regex || results.error || results.matches.length === 0) return text;
    try {
      const re = new RegExp(`(${regex})`, flags);
      const parts = text.split(re);
      return parts.map((part, i) => {
        const isMatch = i % 2 === 1; // Split groups match odd indices
        return (
          <span
            key={i}
            style={isMatch ? { background: 'rgba(139, 92, 246, 0.25)', borderRadius: '2px', padding: '0 2px', border: '1px solid rgba(139, 92, 246, 0.45)', color: 'var(--text-primary)' } : {}}
          >
            {part}
          </span>
        );
      });
    } catch (e) {
      return text;
    }
  }, [regex, flags, text, results]);

  const insertToken = (token) => {
    setRegex(prev => prev + token);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Regex Tester & Debugger" description="Test regular expressions in real-time. Cheat sheet library helper and capture groups match tables." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Regex Tester</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--accent-purple-light)' }}></i> Regex Tester & Debugger
        </h1>
        <p>Test and debug regular expressions with real-time match visualizer highlighting.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '3fr 1.2fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Regular Expression</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '1.2rem' }}>/</span>
                  <input className="form-input" type="text" value={regex} onChange={e => setRegex(e.target.value)} placeholder="e.g. [a-z]+" style={{ fontFamily: 'monospace', fontSize: '1rem' }} />
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '1.2rem' }}>/</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Flags</label>
                <input className="form-input" type="text" value={flags} onChange={e => setFlags(e.target.value)} placeholder="g, i, m" style={{ fontFamily: 'monospace', maxWidth: 100 }} />
              </div>
            </div>

            {results.error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i> {results.error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Test String</label>
              <textarea
                className="form-textarea"
                rows="5"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter string to match against..."
                style={{ fontSize: '0.9rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Match Highlighting Preview</label>
              <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', minHeight: 80, border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: 1.6, fontFamily: 'monospace' }}>
                {highlightedText}
              </div>
            </div>

            {/* Match capture groups table */}
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Match Tables ({results.matches.length})
              </div>

              {results.matches.length > 0 ? (
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-glass-hover)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>Index</th>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>Match Value</th>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>Capture Groups</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.matches.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: idx < results.matches.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                          <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{m.index}</td>
                          <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-purple-light)' }}>"{m.value}"</td>
                          <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>
                            {m.groups.length > 0 ? (
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {m.groups.map((g, gIdx) => (
                                  <span key={gIdx} style={{ background: 'var(--bg-input)', padding: '0.1rem 0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem' }}>
                                    gp{gIdx + 1}: "{g || 'n/a'}"
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No matches captured.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Sidebar: Cheat Sheet */}
        <div className="tool-sidebar">
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--accent-cyan-light)', marginRight: '6px' }}></i> Regex Cheat Sheet
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Click any element below to append it to your active regex string.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
              {cheatSheet.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => insertToken(item.token)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-purple-light)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-cyan-light)', fontSize: '0.8rem' }}>{item.token}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '2px' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
          
          <AdBanner type="sidebar" />
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
