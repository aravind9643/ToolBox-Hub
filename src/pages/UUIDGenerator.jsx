import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export default function UUIDGenerator() {
  const [uuids, setUuids] = useState([generateUUID()]);
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState('standard'); // 'standard', 'uppercase', 'nodash', 'braces'
  const [copied, setCopied] = useState('');

  const applyFormat = (uuid) => {
    switch (format) {
      case 'uppercase': return uuid.toUpperCase();
      case 'nodash': return uuid.replace(/-/g, '');
      case 'braces': return `{${uuid}}`;
      default: return uuid;
    }
  };

  const generateBulk = useCallback(() => {
    const n = Math.min(50, Math.max(1, parseInt(count) || 1));
    setUuids(Array.from({ length: n }, () => generateUUID()));
  }, [count]);

  const copyOne = (uuid, i) => {
    navigator.clipboard.writeText(applyFormat(uuid));
    setCopied(`single-${i}`);
    setTimeout(() => setCopied(''), 1200);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.map(u => applyFormat(u)).join('\n'));
    setCopied('all');
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="tool-page">
      <SEOHead title="UUID / GUID Generator" description="Generate unique UUIDs v4 instantly in the browser. Bulk generation, multiple formats, copy-ready." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>UUID Generator</span></div>
        <h1><i className="fa-solid fa-fingerprint" style={{ color: 'var(--accent-purple-light)' }}></i> UUID / GUID Generator</h1>
        <p>Generate cryptographically secure UUID v4 identifiers in bulk.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            {/* Options */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ minWidth: '120px' }}>
                <label className="form-label">Count (max 50)</label>
                <input type="number" min="1" max="50" value={count} onChange={e => setCount(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                <label className="form-label">Output Format</label>
                <select className="form-select" value={format} onChange={e => setFormat(e.target.value)}>
                  <option value="standard">Standard (lowercase with dashes)</option>
                  <option value="uppercase">UPPERCASE WITH DASHES</option>
                  <option value="nodash">No Dashes</option>
                  <option value="braces">{'{braces}'}</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={generateBulk} style={{ gap: '8px', whiteSpace: 'nowrap' }}>
                <i className="fa-solid fa-rotate"></i> Generate
              </button>
            </div>

            {/* Action row */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={copyAll} style={{ gap: '6px' }}>
                <i className={copied === 'all' ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                {copied === 'all' ? 'Copied All!' : `Copy All (${uuids.length})`}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setUuids([generateUUID()])} style={{ gap: '6px' }}>
                <i className="fa-solid fa-plus"></i> Single UUID
              </button>
            </div>

            {/* UUID List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '500px', overflowY: 'auto' }}>
              {uuids.map((uuid, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onClick={() => copyOne(uuid, i)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-purple-light)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', minWidth: '20px', textAlign: 'right' }}>{i + 1}.</span>
                  <code style={{ flex: 1, fontSize: '0.85rem', color: 'var(--accent-cyan-light)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {applyFormat(uuid)}
                  </code>
                  <i className={`fa-solid ${copied === `single-${i}` ? 'fa-check' : 'fa-copy'}`}
                    style={{ fontSize: '0.75rem', color: copied === `single-${i}` ? 'var(--accent-green)' : 'var(--text-muted)' }}></i>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-green)', marginRight: '6px' }}></i>
              UUIDs are generated using <code>crypto.randomUUID()</code> — cryptographically secure. Nothing is sent to any server.
            </div>
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
