import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { diffLines } from 'diff';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function JsonDiff() {
  const [json1, setJson1] = useState('');
  const [json2, setJson2] = useState('');
  const [error, setError] = useState('');

  const sample1 = JSON.stringify({
    name: "ToolBox Hub",
    version: "2.0.0",
    features: ["Format", "Diff", "TypeScript Converter"],
    active: true,
    meta: { releaseYear: 2026 }
  }, null, 2);

  const sample2 = JSON.stringify({
    name: "ToolBox Hub",
    version: "2.1.0",
    features: ["Format", "Diff", "TS Converter", "Schema Generator"],
    meta: { releaseYear: 2026, framework: "React" },
    license: "MIT"
  }, null, 2);

  const loadSample = () => {
    setJson1(sample1);
    setJson2(sample2);
    setError('');
  };

  // Align lines for side-by-side split visual diff
  const diffResult = useMemo(() => {
    if (!json1.trim() || !json2.trim()) return null;
    try {
      const o1 = JSON.parse(json1);
      const o2 = JSON.parse(json2);
      setError('');
      
      const str1 = JSON.stringify(o1, null, 2);
      const str2 = JSON.stringify(o2, null, 2);
      
      const diffs = diffLines(str1, str2);
      
      const leftLines = [];
      const rightLines = [];
      
      let leftNum = 1;
      let rightNum = 1;
      
      diffs.forEach(part => {
        const lines = part.value.split('\n');
        // Remove trailing empty line caused by trailing newline split
        if (lines.length > 1 && lines[lines.length - 1] === '') {
          lines.pop();
        }
        
        if (part.added) {
          lines.forEach(line => {
            rightLines.push({ type: 'added', text: line, num: rightNum++ });
            leftLines.push({ type: 'empty', text: '', num: '' });
          });
        } else if (part.removed) {
          lines.forEach(line => {
            leftLines.push({ type: 'removed', text: line, num: leftNum++ });
            rightLines.push({ type: 'empty', text: '', num: '' });
          });
        } else {
          lines.forEach(line => {
            leftLines.push({ type: 'unchanged', text: line, num: leftNum++ });
            rightLines.push({ type: 'unchanged', text: line, num: rightNum++ });
          });
        }
      });
      
      return { leftLines, rightLines };
    } catch (e) {
      setError(`JSON Parsing Error: ${e.message}`);
      return null;
    }
  }, [json1, json2]);

  return (
    <div className="tool-page">
      <SEOHead title="JSON Visual Split Diff Checker" description="Compare two JSON objects side-by-side with line matching. Visual highlights of structural additions, changes, and deletions." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON Diff</span></div>
        <h1><i className="fa-solid fa-code-compare" style={{ color: 'var(--accent-purple-light)' }}></i> Visual JSON Diff Checker</h1>
        <p>Visually compare two JSON payloads side-by-side with synchronized structural comparisons.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={loadSample} style={{ gap: '6px' }}>
                <i className="fa-solid fa-file-lines"></i> Load Demo JSONs
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setJson1(''); setJson2(''); setError(''); }} style={{ gap: '6px', color: 'var(--accent-red)' }}>
                <i className="fa-solid fa-trash-can"></i> Clear
              </button>
            </div>

            {/* Input panes */}
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Original JSON</label>
                <textarea 
                  className="form-textarea"
                  rows="10"
                  value={json1}
                  onChange={e => setJson1(e.target.value)}
                  placeholder="Paste original JSON here..."
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Modified JSON</label>
                <textarea 
                  className="form-textarea"
                  rows="10"
                  value={json2}
                  onChange={e => setJson2(e.target.value)}
                  placeholder="Paste modified JSON here..."
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', margin: '1rem 0', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}

            {/* Visual Side-by-Side Diff Board */}
            {diffResult && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                  <i className="fa-solid fa-split-screen"></i> Side-by-Side Comparison
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}>
                  {/* Left Column (Original/Removed) */}
                  <div style={{ borderRight: '1px solid var(--border-color)', overflowX: 'auto' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--bg-glass-hover)', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Original Payload
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {diffResult.leftLines.map((line, idx) => {
                        let rowBg = 'transparent';
                        let textColor = 'var(--text-primary)';
                        if (line.type === 'removed') {
                          rowBg = 'rgba(239, 68, 68, 0.15)';
                          textColor = 'var(--accent-red)';
                        } else if (line.type === 'empty') {
                          rowBg = 'rgba(0, 0, 0, 0.15)';
                        } else if (line.type === 'unchanged') {
                          textColor = 'var(--text-secondary)';
                        }
                        
                        return (
                          <div key={idx} style={{ display: 'flex', background: rowBg, fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '1.5rem', alignItems: 'center' }}>
                            <span style={{ width: '36px', textAlign: 'right', paddingRight: '8px', color: 'var(--text-muted)', borderRight: '1px solid var(--border-color)', select: 'none', userSelect: 'none', fontSize: '0.7rem' }}>
                              {line.num}
                            </span>
                            <span style={{ paddingLeft: '8px', whiteSpace: 'pre', color: textColor }}>
                              {line.type === 'removed' ? '- ' : line.type === 'unchanged' ? '  ' : '  '}{line.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column (Modified/Added) */}
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--bg-glass-hover)', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Modified Payload
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {diffResult.rightLines.map((line, idx) => {
                        let rowBg = 'transparent';
                        let textColor = 'var(--text-primary)';
                        if (line.type === 'added') {
                          rowBg = 'rgba(34, 197, 94, 0.15)';
                          textColor = 'var(--accent-green)';
                        } else if (line.type === 'empty') {
                          rowBg = 'rgba(0, 0, 0, 0.15)';
                        } else if (line.type === 'unchanged') {
                          textColor = 'var(--text-secondary)';
                        }
                        
                        return (
                          <div key={idx} style={{ display: 'flex', background: rowBg, fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '1.5rem', alignItems: 'center' }}>
                            <span style={{ width: '36px', textAlign: 'right', paddingRight: '8px', color: 'var(--text-muted)', borderRight: '1px solid var(--border-color)', select: 'none', userSelect: 'none', fontSize: '0.7rem' }}>
                              {line.num}
                            </span>
                            <span style={{ paddingLeft: '8px', whiteSpace: 'pre', color: textColor }}>
                              {line.type === 'added' ? '+ ' : line.type === 'unchanged' ? '  ' : '  '}{line.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="JSON Side-by-Side Diff Checker — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
