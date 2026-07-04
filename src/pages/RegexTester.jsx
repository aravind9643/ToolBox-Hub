import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

export default function RegexTester() {
  const [regex, setRegex] = useState('[a-zA-Z]+');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('Hello World! Regex is awesome 123.');

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
            index: match.index
          });
        }
      } else {
        match = text.match(re);
        if (match) {
          matches.push({
            value: match[0],
            index: match.index || 0
          });
        }
      }

      return { matches, error: '' };
    } catch (e) {
      return { matches: [], error: e.message };
    }
  }, [regex, flags, text]);

  // Generate highlighted text
  const highlightedText = useMemo(() => {
    if (!regex || results.error || results.matches.length === 0) return text;
    try {
      const re = new RegExp(`(${regex})`, flags);
      // Replace with styled elements
      let idx = 0;
      const parts = text.split(re);
      return parts.map((part, i) => {
        const isMatch = i % 2 === 1; // Split groups match odd indices
        return (
          <span
            key={i}
            style={isMatch ? { background: 'rgba(124, 58, 237, 0.4)', borderRadius: 2, padding: '0 2px', border: '1px solid var(--accent-purple)' } : {}}
          >
            {part}
          </span>
        );
      });
    } catch (e) {
      return text;
    }
  }, [regex, flags, text, results]);

  return (
    <div className="tool-page">
      <SEOHead title="Regex Tester & Debugger" description="Test regular expressions in real-time. View matches and capture groups instantly." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Regex Tester</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--accent-purple-light)' }}></i> Regex Tester & Debugger
        </h1>
        <p>Test and debug regular expressions with real-time match highlighting.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Regular Expression</label>
                <div className="flex items-center gap-1">
                  <span style={{ color: 'var(--text-muted)' }}>/</span>
                  <input className="form-input" type="text" value={regex} onChange={e => setRegex(e.target.value)} placeholder="e.g. [a-z]+" style={{ fontFamily: 'monospace' }} />
                  <span style={{ color: 'var(--text-muted)' }}>/</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Flags</label>
                <input className="form-input" type="text" value={flags} onChange={e => setFlags(e.target.value)} placeholder="g, i, m" style={{ fontFamily: 'monospace', maxWidth: 100 }} />
              </div>
            </div>

            {results.error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                ❌ {results.error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Test String</label>
              <textarea
                className="form-textarea"
                rows="6"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter string to match against..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Match Highlighting</label>
              <div style={{ padding: '1rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 'var(--radius-md)', minHeight: 80, border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {highlightedText}
              </div>
            </div>

            <div className="result-box mt-2">
              <div className="result-label">Matches Found ({results.matches.length})</div>
              <div className="flex gap-1" style={{ flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {results.matches.length > 0 ? (
                  results.matches.map((m, i) => (
                    <span key={i} className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                      "{m.value}" <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>({m.index})</span>
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No matches found</span>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Live Regex Tester — ToolBox Hub" />
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
