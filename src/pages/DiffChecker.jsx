import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as Diff from 'diff';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function DiffChecker() {
  const [originalText, setOriginalText] = useState('The quick brown fox jumps over the lazy dog.');
  const [modifiedText, setModifiedText] = useState('The fast brown fox leaps over the lazy dog!');
  const [diffMode, setDiffMode] = useState('words'); // 'lines' | 'words' | 'chars'
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'inline'

  const diffResult = useMemo(() => {
    let result = [];
    if (diffMode === 'lines') {
      result = Diff.diffLines(originalText, modifiedText);
    } else if (diffMode === 'chars') {
      result = Diff.diffChars(originalText, modifiedText);
    } else {
      result = Diff.diffWords(originalText, modifiedText);
    }
    return result;
  }, [originalText, modifiedText, diffMode]);

  return (
    <div className="tool-page">
      <SEOHead title="Text Diff Checker" description="Compare two text files side by side or inline and highlight changes. Free client-side diff comparison utility." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Diff Checker</span></div>
        <h1><i className="fa-solid fa-code-compare" style={{ color: 'var(--accent-purple-light)' }}></i> Text Diff Checker</h1>
        <p>Compare two text versions side-by-side or inline to spot formatting changes.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          {/* Inputs Section */}
          <div className="glass-card">
            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="form-label">Original Text</label>
                <textarea className="form-textarea" rows="6" value={originalText} onChange={e => setOriginalText(e.target.value)} placeholder="Enter original text..." style={{ fontSize: '0.9rem' }} />
              </div>
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="form-label">Modified Text</label>
                <textarea className="form-textarea" rows="6" value={modifiedText} onChange={e => setModifiedText(e.target.value)} placeholder="Enter modified text..." style={{ fontSize: '0.9rem' }} />
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Diff Level:</span>
                {['words', 'lines', 'chars'].map(m => (
                  <button key={m} className={`copy-btn ${diffMode === m ? 'active' : ''}`} onClick={() => setDiffMode(m)} style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                    {m}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>View:</span>
                {['split', 'inline'].map(v => (
                  <button key={v} className={`copy-btn ${viewMode === v ? 'active' : ''}`} onClick={() => setViewMode(v)} style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                    {v} View
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Comparison Output */}
          <div className="glass-card mt-2">
            <h3>Comparison Result</h3>
            {viewMode === 'split' ? (
              <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', marginTop: '1rem' }}>
                {/* Left (Deletions) */}
                <div className="workspace-column" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {diffResult.map((part, i) => {
                    if (part.added) return null;
                    const style = part.removed ? { background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', textDecoration: 'line-through' } : {};
                    return <span key={i} style={style}>{part.value}</span>;
                  })}
                </div>

                {/* Right (Additions) */}
                <div className="workspace-column" style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.03)', border: '1px solid rgba(34, 197, 94, 0.15)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {diffResult.map((part, i) => {
                    if (part.removed) return null;
                    const style = part.added ? { background: 'rgba(34, 197, 94, 0.25)', color: '#4ade80' } : {};
                    return <span key={i} style={style}>{part.value}</span>;
                  })}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {diffResult.map((part, i) => {
                  const style = part.added
                    ? { background: 'rgba(34, 197, 94, 0.25)', color: '#4ade80' }
                    : part.removed
                    ? { background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', textDecoration: 'line-through' }
                    : {};
                  return <span key={i} style={style}>{part.value}</span>;
                })}
              </div>
            )}
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Text Diff Comparison Checker — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
