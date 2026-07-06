import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function computeJsonDiff(o1, o2) {
  if (typeof o1 !== typeof o2 || Array.isArray(o1) !== Array.isArray(o2)) {
    return { type: 'modified', oldVal: o1, newVal: o2 };
  }
  if (o1 === null || typeof o1 !== 'object') {
    if (o1 === o2) return { type: 'unchanged', val: o1 };
    return { type: 'modified', oldVal: o1, newVal: o2 };
  }
  
  if (Array.isArray(o1)) {
    const maxLen = Math.max(o1.length, o2.length);
    const diffs = [];
    let unchanged = true;
    for (let i = 0; i < maxLen; i++) {
      if (i >= o1.length) {
        diffs.push({ type: 'added', val: o2[i] });
        unchanged = false;
      } else if (i >= o2.length) {
        diffs.push({ type: 'deleted', val: o1[i] });
        unchanged = false;
      } else {
        const sub = computeJsonDiff(o1[i], o2[i]);
        diffs.push(sub);
        if (sub.type !== 'unchanged') unchanged = false;
      }
    }
    if (unchanged) return { type: 'unchanged', val: o1 };
    return { type: 'array-diff', children: diffs };
  }
  
  const allKeys = [...new Set([...Object.keys(o1), ...Object.keys(o2)])];
  const diffs = {};
  let unchanged = true;
  allKeys.forEach(k => {
    if (!(k in o1)) {
      diffs[k] = { type: 'added', val: o2[k] };
      unchanged = false;
    } else if (!(k in o2)) {
      diffs[k] = { type: 'deleted', val: o1[k] };
      unchanged = false;
    } else {
      const sub = computeJsonDiff(o1[k], o2[k]);
      diffs[k] = sub;
      if (sub.type !== 'unchanged') unchanged = false;
    }
  });
  if (unchanged) return { type: 'unchanged', val: o1 };
  return { type: 'object-diff', children: diffs };
}

// Recursive visual diff node renderer
function DiffNode({ diff, name, depth = 0, hideUnchanged = false }) {
  if (hideUnchanged && diff.type === 'unchanged') return null;

  const pad = depth * 16;
  const lineStyle = { paddingLeft: `${pad}px`, fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.5 };

  if (diff.type === 'unchanged') {
    return (
      <div style={{ ...lineStyle, color: 'var(--text-muted)' }}>
        <span>{name ? `${name}: ` : ''}</span>
        <span>{typeof diff.val === 'object' ? JSON.stringify(diff.val) : String(diff.val)}</span>
      </div>
    );
  }

  if (diff.type === 'added') {
    return (
      <div style={{ ...lineStyle, color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', borderLeft: '3px solid #22c55e' }}>
        <span>+ {name ? `${name}: ` : ''}</span>
        <span>{JSON.stringify(diff.val)}</span>
      </div>
    );
  }

  if (diff.type === 'deleted') {
    return (
      <div style={{ ...lineStyle, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', textDecoration: 'line-through' }}>
        <span>- {name ? `${name}: ` : ''}</span>
        <span>{JSON.stringify(diff.val)}</span>
      </div>
    );
  }

  if (diff.type === 'modified') {
    return (
      <div style={{ ...lineStyle, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #f59e0b' }}>
        <span>✎ {name ? `${name}: ` : ''}</span>
        <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{JSON.stringify(diff.oldVal)}</span>
        <span style={{ margin: '0 8px' }}>➔</span>
        <span>{JSON.stringify(diff.newVal)}</span>
      </div>
    );
  }

  if (diff.type === 'array-diff') {
    return (
      <div style={{ paddingLeft: `${pad}px`, fontFamily: 'monospace', fontSize: '0.85rem' }}>
        <span style={{ fontWeight: 600 }}>{name ? `${name}: ` : ''}[</span>
        <div style={{ borderLeft: '1px dashed var(--border-color)', margin: '2px 0' }}>
          {diff.children.map((child, idx) => (
            <DiffNode key={idx} diff={child} name={String(idx)} depth={1} hideUnchanged={hideUnchanged} />
          ))}
        </div>
        <span style={{ fontWeight: 600 }}>]</span>
      </div>
    );
  }

  if (diff.type === 'object-diff') {
    return (
      <div style={{ paddingLeft: `${pad}px`, fontFamily: 'monospace', fontSize: '0.85rem' }}>
        <span style={{ fontWeight: 600 }}>{name ? `${name}: ` : ''}&#123;</span>
        <div style={{ borderLeft: '1px dashed var(--border-color)', margin: '2px 0' }}>
          {Object.keys(diff.children).map(k => (
            <DiffNode key={k} diff={diff.children[k]} name={k} depth={1} hideUnchanged={hideUnchanged} />
          ))}
        </div>
        <span style={{ fontWeight: 600 }}>&#125;</span>
      </div>
    );
  }

  return null;
}

export default function JsonDiff() {
  const [json1, setJson1] = useState('');
  const [json2, setJson2] = useState('');
  const [hideUnchanged, setHideUnchanged] = useState(false);
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

  const diffResult = useMemo(() => {
    if (!json1.trim() || !json2.trim()) return null;
    try {
      const o1 = JSON.parse(json1);
      const o2 = JSON.parse(json2);
      setError('');
      return computeJsonDiff(o1, o2);
    } catch (e) {
      setError(`JSON Parsing Error: ${e.message}`);
      return null;
    }
  }, [json1, json2]);

  return (
    <div className="tool-page">
      <SEOHead title="JSON Diff Structural Compare" description="Compare two JSON objects structurally, ignoring key sorting. Visual highlights of added, modified, or deleted attributes." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON Diff</span></div>
        <h1><i className="fa-solid fa-code-compare" style={{ color: 'var(--accent-purple-light)' }}></i> JSON Diff Checker</h1>
        <p>Visually compare two JSON payloads and inspect structural additions, changes, or deletions.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={loadSample} style={{ gap: '6px' }}>
                <i className="fa-solid fa-file-lines"></i> Load Demo JSONs
              </button>
              <button 
                className={`btn btn-sm ${hideUnchanged ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setHideUnchanged(!hideUnchanged)}
              >
                {hideUnchanged ? 'Show Unchanged' : 'Hide Unchanged'}
              </button>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">JSON Object 1 (Original)</label>
                <textarea 
                  className="form-textarea"
                  rows="8"
                  value={json1}
                  onChange={e => setJson1(e.target.value)}
                  placeholder="Paste original JSON..."
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">JSON Object 2 (Modified)</label>
                <textarea 
                  className="form-textarea"
                  rows="8"
                  value={json2}
                  onChange={e => setJson2(e.target.value)}
                  placeholder="Paste modified JSON..."
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', margin: '1rem 0', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}

            {/* Diff Result Board */}
            {diffResult && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Comparison Result</h3>
                <div style={{ padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflowX: 'auto', minHeight: '100px' }}>
                  <DiffNode diff={diffResult} hideUnchanged={hideUnchanged} />
                </div>
              </div>
            )}

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="JSON Diff Checker — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
