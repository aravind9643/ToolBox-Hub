import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

export default function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setError('');
      setOutput('✅ Valid JSON');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    setInput(JSON.stringify({
      name: "ToolBox Hub",
      version: "1.0.0",
      features: ["QR Generator", "Password Generator", "Unit Converter"],
      settings: { theme: "dark", language: "en" },
      isAwesome: true
    }, null, 2));
  };

  return (
    <div className="tool-page">
      <SEOHead title="JSON Formatter & Validator" description="Format, validate, and beautify JSON data instantly. Free JSON pretty printer." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON Formatter</span></div>
        <h1>{'{ }'} JSON Formatter & Validator</h1>
        <p>Format, validate, minify, and beautify JSON data instantly.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1">
                <button className="btn btn-primary btn-sm" onClick={format}>✨ Format</button>
                <button className="btn btn-secondary btn-sm" onClick={minify}>📦 Minify</button>
                <button className="btn btn-secondary btn-sm" onClick={validate}>✅ Validate</button>
                <button className="btn btn-secondary btn-sm" onClick={loadSample}>📝 Sample</button>
              </div>
              <div className="flex items-center gap-1">
                <label className="text-xs text-muted">Indent:</label>
                <select className="form-select" value={indent} onChange={e => setIndent(Number(e.target.value))} style={{ width: 'auto', padding: '0.3rem 2rem 0.3rem 0.5rem', fontSize: '0.8rem' }}>
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={1}>Tab</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Input JSON</label>
              <textarea
                className="form-textarea"
                rows="8"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder='Paste your JSON here...'
                style={{ fontFamily: 'JetBrains Mono, Fira Code, monospace', fontSize: '0.85rem' }}
              />
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                ❌ {error}
              </div>
            )}

            {output && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label" style={{ marginBottom: 0 }}>Output</label>
                  <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>{copied ? '✓ Copied' : '📋 Copy'}</button>
                </div>
                <div className="code-block">{output}</div>
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
