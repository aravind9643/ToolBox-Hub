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

  // Align rows side-by-side for GitHub style split comparisons
  const alignedRows = useMemo(() => {
    const rows = [];
    let leftLineNo = 1;
    let rightLineNo = 1;

    let i = 0;
    while (i < diffResult.length) {
      const part = diffResult[i];
      const nextPart = diffResult[i + 1];

      // Align deletion and insertion blocks side-by-side
      if (part.removed && nextPart && nextPart.added) {
        const leftLines = part.value.split('\n');
        if (leftLines[leftLines.length - 1] === '') leftLines.pop();
        const rightLines = nextPart.value.split('\n');
        if (rightLines[rightLines.length - 1] === '') rightLines.pop();

        const maxLen = Math.max(leftLines.length, rightLines.length);
        for (let j = 0; j < maxLen; j++) {
          const lText = leftLines[j];
          const rText = rightLines[j];
          rows.push({
            left: lText !== undefined ? { lineNo: leftLineNo++, text: lText, type: 'removed' } : null,
            right: rText !== undefined ? { lineNo: rightLineNo++, text: rText, type: 'added' } : null
          });
        }
        i += 2;
      } else {
        const lines = part.value.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();

        lines.forEach(line => {
          if (part.removed) {
            rows.push({
              left: { lineNo: leftLineNo++, text: line, type: 'removed' },
              right: null
            });
          } else if (part.added) {
            rows.push({
              left: null,
              right: { lineNo: rightLineNo++, text: line, type: 'added' }
            });
          } else {
            rows.push({
              left: { lineNo: leftLineNo++, text: line, type: 'neutral' },
              right: { lineNo: rightLineNo++, text: line, type: 'neutral' }
            });
          }
        });
        i++;
      }
    }
    return rows;
  }, [diffResult]);

  return (
    <div className="tool-page">
      <SEOHead title="Text Diff Checker" description="Compare two text files side by side or inline and highlight changes. Free client-side diff comparison utility." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Diff Checker</span></div>
        <h1><i className="fa-solid fa-code-compare" style={{ color: 'var(--accent-purple-light)' }}></i> Text Diff Checker</h1>
        <p>Compare two text versions side-by-side or inline to spot line changes and word modifications.</p>
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
            <h3>Comparison Output</h3>
            
            {viewMode === 'split' ? (
              /* SIDE-BY-SIDE SPLIT VIEW */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', marginTop: '1rem', background: 'var(--bg-input)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                
                {/* Left side: Original */}
                <div style={{ borderRight: '1px solid var(--border-color)', overflowX: 'auto' }}>
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)' }}>Original (Deletions)</div>
                  {alignedRows.map((row, idx) => (
                    <div key={idx} style={{ display: 'flex', background: row.left?.type === 'removed' ? 'rgba(239, 68, 68, 0.12)' : 'none', minHeight: '1.5rem', lineHeight: '1.5rem' }}>
                      <div style={{ width: '38px', minWidth: '38px', textAlign: 'right', paddingRight: '0.5rem', color: 'var(--text-muted)', borderRight: '1px solid rgba(255,255,255,0.05)', userSelect: 'none', background: 'rgba(0,0,0,0.1)' }}>
                        {row.left?.lineNo || ''}
                      </div>
                      <div style={{ paddingLeft: '0.5rem', whiteSpace: 'pre', color: row.left?.type === 'removed' ? '#f87171' : 'var(--text-primary)' }}>
                        {row.left?.text || ''}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right side: Modified */}
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)' }}>Modified (Additions)</div>
                  {alignedRows.map((row, idx) => (
                    <div key={idx} style={{ display: 'flex', background: row.right?.type === 'added' ? 'rgba(34, 197, 94, 0.12)' : 'none', minHeight: '1.5rem', lineHeight: '1.5rem' }}>
                      <div style={{ width: '38px', minWidth: '38px', textAlign: 'right', paddingRight: '0.5rem', color: 'var(--text-muted)', borderRight: '1px solid rgba(255,255,255,0.05)', userSelect: 'none', background: 'rgba(0,0,0,0.1)' }}>
                        {row.right?.lineNo || ''}
                      </div>
                      <div style={{ paddingLeft: '0.5rem', whiteSpace: 'pre', color: row.right?.type === 'added' ? '#4ade80' : 'var(--text-primary)' }}>
                        {row.right?.text || ''}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              /* INLINE VIEW */
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {diffResult.map((part, i) => {
                  const style = part.added
                    ? { background: 'rgba(34, 197, 94, 0.25)', color: '#4ade80', padding: '1px 3px', borderRadius: '4px' }
                    : part.removed
                    ? { background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', textDecoration: 'line-through', padding: '1px 3px', borderRadius: '4px' }
                    : {};
                  return <span key={i} style={style}>{part.value}</span>;
                })}
              </div>
            )}
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Text Diff Checker — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
