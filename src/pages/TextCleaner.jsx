import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';
import { diffWords } from 'diff';

function cleanText(text, operations, findPattern, replaceString, regexFlags) {
  let result = text;
  
  if (findPattern) {
    try {
      const re = new RegExp(findPattern, regexFlags);
      result = result.replace(re, replaceString);
    } catch (e) {
      // invalid regex ignored
    }
  }

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
  const [findPattern, setFindPattern] = useState('');
  const [replaceString, setReplaceString] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [showDiff, setShowDiff] = useState(false);

  const [cleanOps, setCleanOps] = useState({
    trimSpaces: false, removeDuplicateLines: false, removeEmptyLines: false,
    tabsToSpaces: false, smartQuotes: false, urlEncode: false,
    urlDecode: false, reverseLines: false, reverseText: false, sortLines: false
  });

  const cleanedPreview = useMemo(() => {
    return cleanText(text, cleanOps, findPattern, replaceString, regexFlags);
  }, [text, cleanOps, findPattern, replaceString, regexFlags]);

  // One-click quick presets/macros
  const applyMacro = (preset) => {
    if (!text) return;
    let newText = text;
    if (preset === 'html') {
      newText = newText.replace(/<\/?[^>]+(>|$)/g, "");
    } else if (preset === 'emoji') {
      newText = newText.replace(/[\u2000-\u3300\ud83c-\ud83d\ud83e\udc00-\udfff]/g, "");
    } else if (preset === 'whitespace') {
      newText = newText.replace(/\s+/g, " ").trim();
    } else if (preset === 'email') {
      const match = newText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
      newText = match ? match.join('\n') : '(no emails found)';
    }
    setText(newText);
  };

  const applyClean = () => setText(cleanedPreview);

  const toggleOp = (op) => setCleanOps(prev => ({ ...prev, [op]: !prev[op] }));

  const copyText = () => {
    navigator.clipboard.writeText(cleanedPreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // Diff rendering logic
  const diffElements = useMemo(() => {
    if (!text || !cleanedPreview) return [];
    try {
      return diffWords(text, cleanedPreview);
    } catch (e) {
      return [];
    }
  }, [text, cleanedPreview]);

  const cleanOperations = [
    { id: 'trimSpaces', label: 'Trim Extra Spaces' },
    { id: 'removeDuplicateLines', label: 'Remove Duplicate Lines' },
    { id: 'removeEmptyLines', label: 'Remove Empty Lines' },
    { id: 'tabsToSpaces', label: 'Tabs → Spaces (4)' },
    { id: 'smartQuotes', label: 'Fix Smart Quotes' },
    { id: 'sortLines', label: 'Sort Lines A-Z' },
    { id: 'reverseLines', label: 'Reverse Line Order' },
    { id: 'reverseText', label: 'Reverse Characters' },
    { id: 'urlEncode', label: 'URL Encode' },
    { id: 'urlDecode', label: 'URL Decode' },
  ];

  return (
    <div className="tool-page">
      <SEOHead title="Text Cleaner & Formatter" description="Clean formatting anomalies, remove duplicate lines, convert tabs to spaces, regex replace, and check text diff comparisons." />
      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Text Cleaner</span>
        </div>
        <h1>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--accent-purple-light)' }}></i> Text Cleaner
        </h1>
        <p>Clean formatting, normalize text spaces, regex search/replace, and view comparison diffs.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          {/* Quick Macros/Actions Bar */}
          <div className="glass-card mb-2" style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}><i className="fa-solid fa-bolt" style={{ color: 'var(--accent-amber)', marginRight: '4px' }}></i> Quick Macros:</span>
            <button className="btn btn-secondary btn-sm" onClick={() => applyMacro('html')} disabled={!text} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
              Strip HTML Tags
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => applyMacro('emoji')} disabled={!text} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
              Strip Emojis
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => applyMacro('whitespace')} disabled={!text} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
              Collapse All Spaces
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => applyMacro('email')} disabled={!text} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
              Extract Emails
            </button>
          </div>

          <div className="glass-card">
            
            {/* Input textarea */}
            <textarea
              className="form-textarea"
              rows="7"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste or type raw text content to start formatting..."
              style={{ fontSize: '0.95rem', minHeight: 150 }}
            />

            {/* Regex Find and Replace Module */}
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-magnifying-glass-plus" style={{ color: 'var(--accent-cyan-light)' }}></i> Regex Find & Replace
              </div>
              <div className="grid-2" style={{ gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Find Pattern (e.g. \d+ or text)</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input className="form-input" style={{ padding: '0.4rem', fontSize: '0.85rem' }} value={findPattern} onChange={e => setFindPattern(e.target.value)} placeholder="Regex find pattern..." />
                    <select className="form-select" style={{ width: '65px', padding: '0.2rem', height: '34px', fontSize: '0.75rem' }} value={regexFlags} onChange={e => setRegexFlags(e.target.value)}>
                      <option value="g">g</option>
                      <option value="gi">g i</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Replace String</label>
                  <input className="form-input" style={{ padding: '0.4rem', fontSize: '0.85rem' }} value={replaceString} onChange={e => setReplaceString(e.target.value)} placeholder="Replacement value..." />
                </div>
              </div>
            </div>

            {/* Operations Checklist */}
            <div style={{ marginTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Cleaning Flags</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {cleanOperations.map(({ id, label }) => (
                  <label key={id} className={`option-card ${cleanOps[id] ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: cleanOps[id] ? 'var(--bg-glass-hover)' : 'transparent' }}>
                    <input type="checkbox" checked={cleanOps[id]} onChange={() => toggleOp(id)} style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.8rem' }}>{label}</span>
                  </label>
                ))}
              </div>

              {text && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Output Preview Panel</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowDiff(!showDiff)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', gap: '4px' }}>
                      <i className="fa-solid fa-code-compare"></i> {showDiff ? 'Show Clean Plain' : 'Show Diff Changes'}
                    </button>
                  </div>

                  {showDiff ? (
                    /* Comparative Diff Renderer */
                    <div style={{ padding: '0.75rem', background: '#1e293b', color: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxHeight: '180px', overflowY: 'auto', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {diffElements.length > 0 ? (
                        diffElements.map((part, index) => {
                          const color = part.added ? '#86efac' : part.removed ? '#fca5a5' : '#f8fafc';
                          const decoration = part.removed ? 'line-through' : 'none';
                          const bg = part.added ? 'rgba(34, 197, 94, 0.2)' : part.removed ? 'rgba(239, 68, 68, 0.2)' : 'transparent';
                          return (
                            <span key={index} style={{ color, textDecoration: decoration, backgroundColor: bg, padding: '0 2px', borderRadius: '2px' }}>
                              {part.value}
                            </span>
                          );
                        })
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>No differences found.</span>
                      )}
                    </div>
                  ) : (
                    /* Plain Cleaned Preview */
                    <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxHeight: '180px', overflowY: 'auto', fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                      {cleanedPreview || <span style={{ color: 'var(--text-muted)' }}>(empty after cleaning)</span>}
                    </div>
                  )}
                </div>
              )}

              <div className="btn-group" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={applyClean} disabled={!text} style={{ gap: '8px' }}>
                  <i className="fa-solid fa-wand-magic-sparkles"></i> Apply to Editor
                </button>
                <button className="btn btn-secondary" onClick={copyText} disabled={!text} style={{ gap: '8px' }}>
                  <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                  {copied ? 'Copied!' : 'Copy Cleaned Text'}
                </button>
                <button className="btn btn-secondary" onClick={() => setText('')} disabled={!text} style={{ gap: '8px', color: 'var(--accent-red)' }}>
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
