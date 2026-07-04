import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function cleanText(text, operations) {
  let result = text;
  if (operations.trimSpaces) result = result.replace(/[ \t]+/g, ' ').replace(/^ /gm, '').replace(/ $/gm, '');
  if (operations.removeDuplicateLines) {
    const seen = new Set();
    result = result.split('\n').filter(line => { const t = line.trim(); if (seen.has(t)) return false; seen.add(t); return true; }).join('\n');
  }
  if (operations.removeEmptyLines) result = result.split('\n').filter(l => l.trim()).join('\n');
  if (operations.tabsToSpaces) result = result.replace(/\t/g, '    ');
  if (operations.smartQuotes) result = result.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
  if (operations.urlEncode) result = encodeURIComponent(result);
  if (operations.urlDecode) { try { result = decodeURIComponent(result); } catch { /* invalid */ } }
  if (operations.reverseLines) result = result.split('\n').reverse().join('\n');
  if (operations.reverseText) result = result.split('').reverse().join('');
  if (operations.sortLines) result = result.split('\n').sort().join('\n');
  return result;
}

export default function TextCleaner() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [cleanOps, setCleanOps] = useState({
    trimSpaces: false, removeDuplicateLines: false, removeEmptyLines: false,
    tabsToSpaces: false, smartQuotes: false, urlEncode: false,
    urlDecode: false, reverseLines: false, reverseText: false, sortLines: false
  });

  const cleanedPreview = useMemo(() => cleanText(text, cleanOps), [text, cleanOps]);

  const applyClean = () => setText(cleanedPreview);

  const toggleOp = (op) => setCleanOps(prev => ({ ...prev, [op]: !prev[op] }));

  const copyText = () => {
    navigator.clipboard.writeText(cleanedPreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const cleanOperations = [
    { id: 'trimSpaces', label: 'Trim Extra Spaces', icon: 'fa-compress-alt' },
    { id: 'removeDuplicateLines', label: 'Remove Duplicate Lines', icon: 'fa-filter' },
    { id: 'removeEmptyLines', label: 'Remove Empty Lines', icon: 'fa-minus' },
    { id: 'tabsToSpaces', label: 'Tabs → Spaces (4)', icon: 'fa-arrows-left-right' },
    { id: 'smartQuotes', label: 'Fix Smart Quotes', icon: 'fa-quote-left' },
    { id: 'sortLines', label: 'Sort Lines A-Z', icon: 'fa-sort-alpha-down' },
    { id: 'reverseLines', label: 'Reverse Line Order', icon: 'fa-rotate-180' },
    { id: 'reverseText', label: 'Reverse All Characters', icon: 'fa-right-left' },
    { id: 'urlEncode', label: 'URL Encode', icon: 'fa-link' },
    { id: 'urlDecode', label: 'URL Decode', icon: 'fa-link-slash' },
  ];

  return (
    <div className="tool-page">
      <SEOHead title="Text Cleaner & Formatter" description="Clean up formatting, remove duplicate lines, convert tabs to spaces, URL encode/decode text client-side." />
      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Text Cleaner</span>
        </div>
        <h1>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--accent-purple-light)' }}></i> Text Cleaner
        </h1>
        <p>Clean formatting, fix spaces, sort lines, or encode text values instantly.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <textarea
              className="form-textarea"
              rows="8"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your text to clean here..."
              style={{ fontSize: '0.95rem', minHeight: 180 }}
            />

            <div style={{ marginTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Select Cleaning Operations</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {cleanOperations.map(({ id, label }) => (
                  <label key={id} className={`option-card ${cleanOps[id] ? 'active' : ''}`}>
                    <input type="checkbox" checked={cleanOps[id]} onChange={() => toggleOp(id)} />
                    <span style={{ fontSize: '0.85rem' }}>{label}</span>
                  </label>
                ))}
              </div>

              {text && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Preview Cleaned Output</div>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxHeight: '180px', overflowY: 'auto', fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                    {cleanedPreview || <span style={{ color: 'var(--text-muted)' }}>(empty after cleaning)</span>}
                  </div>
                </div>
              )}

              <div className="btn-group">
                <button className="btn btn-primary" onClick={applyClean} disabled={!text} style={{ gap: '8px' }}>
                  <i className="fa-solid fa-wand-magic-sparkles"></i> Apply to Editor
                </button>
                <button className="btn btn-secondary" onClick={copyText} disabled={!text} style={{ gap: '8px' }}>
                  <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                  {copied ? 'Copied!' : 'Copy Cleaned Text'}
                </button>
                <button className="btn btn-secondary" onClick={() => setText('')} disabled={!text} style={{ gap: '8px' }}>
                  <i className="fa-solid fa-trash-can"></i> Clear
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Online Text Cleaner — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
