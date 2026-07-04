import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

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

export default function WordCounter() {
  const [activeTab, setActiveTab] = useState('counter');
  const [text, setText] = useState('');
  const [cleanOps, setCleanOps] = useState({
    trimSpaces: false, removeDuplicateLines: false, removeEmptyLines: false,
    tabsToSpaces: false, smartQuotes: false, urlEncode: false,
    urlDecode: false, reverseLines: false, reverseText: false, sortLines: false
  });

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || (words > 0 ? 1 : 0) : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 130);
    const lines = text ? text.split('\n').length : 0;
    const freq = {};
    const letters = text.toLowerCase().replace(/[^a-z]/g, '');
    for (const ch of letters) freq[ch] = (freq[ch] || 0) + 1;
    const topLetters = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
    // Top words
    const wordFreq = {};
    const ws = text.toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/).filter(Boolean);
    for (const w of ws) wordFreq[w] = (wordFreq[w] || 0) + 1;
    const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { chars, charsNoSpaces, words, sentences, paragraphs, readingTime, speakingTime, lines, topLetters, topWords };
  }, [text]);

  const cleanedPreview = useMemo(() => cleanText(text, cleanOps), [text, cleanOps]);

  const applyClean = () => setText(cleanedPreview);

  const toggleOp = (op) => setCleanOps(prev => ({ ...prev, [op]: !prev[op] }));

  const cleanOperations = [
    { id: 'trimSpaces', label: 'Trim Extra Spaces', icon: 'fa-compress-alt' },
    { id: 'removeDuplicateLines', label: 'Remove Duplicate Lines', icon: 'fa-filter' },
    { id: 'removeEmptyLines', label: 'Remove Empty Lines', icon: 'fa-minus' },
    { id: 'tabsToSpaces', label: 'Tabs → Spaces', icon: 'fa-arrows-left-right' },
    { id: 'smartQuotes', label: 'Fix Smart Quotes', icon: 'fa-quote-left' },
    { id: 'sortLines', label: 'Sort Lines A-Z', icon: 'fa-sort-alpha-down' },
    { id: 'reverseLines', label: 'Reverse Line Order', icon: 'fa-rotate-180' },
    { id: 'reverseText', label: 'Reverse All Text', icon: 'fa-right-left' },
    { id: 'urlEncode', label: 'URL Encode', icon: 'fa-link' },
    { id: 'urlDecode', label: 'URL Decode', icon: 'fa-link-slash' },
  ];

  return (
    <div className="tool-page">
      <SEOHead title="Word Counter & Text Cleaner" description="Count words, characters, sentences, and clean/format text instantly. Free text analysis tool." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Word Counter</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-paragraph" style={{ color: 'var(--accent-purple-light)' }}></i> Word Counter & Text Cleaner
        </h1>
        <p>Analyze text stats and clean/format your text with one-click operations.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab-btn ${activeTab === 'counter' ? 'active' : ''}`} onClick={() => setActiveTab('counter')}>
              <i className="fa-solid fa-chart-bar" style={{ marginRight: '6px' }}></i> Counter & Analysis
            </button>
            <button className={`tab-btn ${activeTab === 'cleaner' ? 'active' : ''}`} onClick={() => setActiveTab('cleaner')}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: '6px' }}></i> Text Cleaner
            </button>
          </div>

          <div className="glass-card">
            <textarea
              className="form-textarea"
              rows="10"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Start typing or paste your text here..."
              style={{ fontSize: '0.95rem', minHeight: 200 }}
            />

            {activeTab === 'counter' && (
              <>
                <div className="stats-grid mt-2">
                  {[
                    { val: stats.words, label: 'Words', color: 'var(--accent-purple-light)' },
                    { val: stats.chars, label: 'Characters', color: 'var(--accent-cyan)' },
                    { val: stats.charsNoSpaces, label: 'Without Spaces', color: 'var(--accent-green)' },
                    { val: stats.sentences, label: 'Sentences', color: 'var(--accent-pink)' },
                    { val: stats.paragraphs, label: 'Paragraphs', color: 'var(--accent-amber)' },
                    { val: stats.lines, label: 'Lines', color: 'var(--accent-cyan-light)' },
                  ].map(({ val, label, color }) => (
                    <div key={label} className="stat-card">
                      <div className="stat-card-value" style={{ color }}>{val}</div>
                      <div className="stat-card-label">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid-2 mt-2">
                  <div className="result-box" style={{ marginTop: 0 }}>
                    <div className="result-label">📖 Reading Time</div>
                    <div className="result-value result-value-sm">{stats.readingTime} min</div>
                    <div className="result-sub">Based on 200 WPM</div>
                  </div>
                  <div className="result-box" style={{ marginTop: 0 }}>
                    <div className="result-label">🎤 Speaking Time</div>
                    <div className="result-value result-value-sm">{stats.speakingTime} min</div>
                    <div className="result-sub">Based on 130 WPM</div>
                  </div>
                </div>

                {stats.topWords.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Top Words</h3>
                    <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                      {stats.topWords.map(([word, count]) => (
                        <span key={word} className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                          {word}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-1 mt-2" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setText(text.toUpperCase())}>UPPERCASE</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setText(text.toLowerCase())}>lowercase</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setText(text.replace(/\b\w/g, c => c.toUpperCase()))}>Title Case</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setText(text.replace(/(^\w|\.\s+\w)/gm, c => c.toUpperCase()))}>Sentence Case</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setText('')} style={{ gap: '6px' }}><i className="fa-solid fa-trash-can"></i> Clear</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(text)} style={{ gap: '6px' }}><i className="fa-solid fa-copy"></i> Copy</button>
                </div>
              </>
            )}

            {activeTab === 'cleaner' && (
              <div style={{ marginTop: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Select Cleaning Operations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {cleanOperations.map(({ id, label }) => (
                    <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 0.75rem', background: cleanOps[id] ? 'rgba(96,165,250,0.1)' : 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: `1px solid ${cleanOps[id] ? 'var(--accent-purple-light)' : 'var(--border-color)'}`, transition: 'all 0.2s' }}>
                      <input type="checkbox" checked={cleanOps[id]} onChange={() => toggleOp(id)} style={{ accentColor: 'var(--accent-purple-light)' }} />
                      <span style={{ fontSize: '0.85rem' }}>{label}</span>
                    </label>
                  ))}
                </div>

                {text && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Preview</div>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxHeight: '150px', overflowY: 'auto', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {cleanedPreview || <span style={{ color: 'var(--text-muted)' }}>(empty after cleaning)</span>}
                    </div>
                  </div>
                )}

                <div className="btn-group">
                  <button className="btn btn-primary" onClick={applyClean} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-wand-magic-sparkles"></i> Apply Cleaning
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(cleanedPreview)} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-copy"></i> Copy Cleaned
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
