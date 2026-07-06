import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

// Recursive tree node renderer
function JSONNode({ data, name, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(depth > 1); // Auto-collapse deeper layers for readability
  
  if (data === null) {
    return (
      <div style={{ paddingLeft: '1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <span style={{ color: 'var(--text-muted)' }}>{name}:</span> <span style={{ color: '#ef4444' }}>null</span>
      </div>
    );
  }
  
  if (typeof data === 'object') {
    const isArray = Array.isArray(data);
    const keys = Object.keys(data);
    const braces = isArray ? ['[', ']'] : ['{', '}'];
    
    return (
      <div style={{ paddingLeft: '1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <span 
          style={{ cursor: 'pointer', userSelect: 'none', color: 'var(--accent-purple-light)', fontWeight: 600 }} 
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '▶' : '▼'} {name ? <span style={{ color: 'var(--text-primary)' }}>{name}: </span> : ''}{braces[0]} 
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 400, marginLeft: '4px' }}>
            {keys.length} {keys.length === 1 ? 'item' : 'items'}
          </span>
        </span>
        
        {!collapsed && (
          <div style={{ borderLeft: '1px dashed var(--border-color)', marginLeft: '6px', paddingTop: '2px', paddingBottom: '2px' }}>
            {keys.map(k => (
              <JSONNode key={k} data={data[k]} name={k} depth={depth + 1} />
            ))}
          </div>
        )}
        <div style={{ color: 'var(--accent-purple-light)', fontWeight: 600, paddingLeft: '0.75rem' }}>{braces[1]}</div>
      </div>
    );
  }
  
  let valColor = '#3b82f6'; // number (blue)
  if (typeof data === 'string') valColor = '#10b981'; // string (green)
  if (typeof data === 'boolean') valColor = '#f59e0b'; // boolean (orange)
  
  return (
    <div style={{ paddingLeft: '1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.5 }}>
      <span style={{ color: 'var(--text-muted)' }}>{name}:</span>{' '}
      <span style={{ color: valColor, wordBreak: 'break-all' }}>
        {typeof data === 'string' ? `"${data}"` : String(data)}
      </span>
    </div>
  );
}

export default function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('raw'); // 'raw' | 'tree'
  const [parsedObject, setParsedObject] = useState(null);

  const stats = useMemo(() => {
    if (!input) return null;
    try {
      const parsed = JSON.parse(input);
      let keysCount = 0;
      let maxDepth = 0;
      
      const traverse = (obj, currentDepth) => {
        if (obj && typeof obj === 'object') {
          const keys = Object.keys(obj);
          keysCount += keys.length;
          maxDepth = Math.max(maxDepth, currentDepth);
          keys.forEach(k => traverse(obj[k], currentDepth + 1));
        }
      };
      traverse(parsed, 1);
      
      return {
        keysCount,
        maxDepth,
        sizeKb: (new Blob([input]).size / 1024).toFixed(2)
      };
    } catch (e) {
      return null;
    }
  }, [input]);

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setParsedObject(parsed);
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
      setParsedObject(null);
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setParsedObject(parsed);
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
      setParsedObject(null);
    }
  };

  const validate = () => {
    try {
      const parsed = JSON.parse(input);
      setError('');
      setOutput('✅ Valid JSON');
      setParsedObject(parsed);
    } catch (e) {
      setError(e.message);
      setOutput('');
      setParsedObject(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    const sample = JSON.stringify({
      name: "ToolBox Hub",
      version: "2.1.0",
      features: ["Format & Minify", "Interactive Tree Viewer", "Structural Stats"],
      infrastructure: { 
        builtWith: "React", 
        routing: "React Router",
        telemetry: {
          metricsCollected: false,
          fullyClientSide: true
        }
      },
      active: true,
      license: null
    }, null, 2);
    setInput(sample);
    try {
      const parsed = JSON.parse(sample);
      setParsedObject(parsed);
      setOutput(JSON.stringify(parsed, null, indent));
    } catch {}
  };

  return (
    <div className="tool-page">
      <SEOHead title="JSON Formatter & Validator" description="Format, validate, and minify JSON strings. Analyze structural metrics and browse deep nodes interactively." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON Formatter</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-code" style={{ color: 'var(--accent-purple-light)' }}></i> JSON Formatter & Validator
        </h1>
        <p>Format, validate, and minify JSON data, with interactive collapsible node tree explorers.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '3fr 1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={format} style={{ gap: '6px' }}><i className="fa-solid fa-wand-magic-sparkles"></i> Format</button>
                <button className="btn btn-secondary btn-sm" onClick={minify} style={{ gap: '6px' }}><i className="fa-solid fa-compress"></i> Minify</button>
                <button className="btn btn-secondary btn-sm" onClick={validate} style={{ gap: '6px' }}><i className="fa-solid fa-square-check"></i> Validate</button>
                <button className="btn btn-secondary btn-sm" onClick={loadSample} style={{ gap: '6px' }}><i className="fa-solid fa-file-lines"></i> Sample</button>
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
                placeholder="Paste your raw JSON text string here..."
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}

            {output && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={`btn btn-sm ${viewMode === 'raw' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('raw')}>
                      Plain Text View
                    </button>
                    <button className={`btn btn-sm ${viewMode === 'tree' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => {
                      if (parsedObject) setViewMode('tree');
                    }} disabled={!parsedObject}>
                      Collapsible Tree View
                    </button>
                  </div>
                  {viewMode === 'raw' && (
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '6px' }}>
                      <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>

                {viewMode === 'tree' && parsedObject ? (
                  <div style={{ padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', minHeight: '140px', overflowY: 'auto' }}>
                    <JSONNode data={parsedObject} />
                  </div>
                ) : (
                  <div className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>{output}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Structural Statistics */}
        <div className="tool-sidebar">
          {stats ? (
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                <i className="fa-solid fa-chart-simple" style={{ color: 'var(--accent-green)', marginRight: '6px' }}></i> JSON Telemetry
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div style={{ background: 'var(--bg-input)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Object Key Count</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{stats.keysCount} keys</div>
                </div>
                <div style={{ background: 'var(--bg-input)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Maximum Depth</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{stats.maxDepth} levels</div>
                </div>
                <div style={{ background: 'var(--bg-input)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-muted)' }}>File Size</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{stats.sizeKb} KB</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Input valid JSON to see structure telemetry.
            </div>
          )}
          <AdBanner type="sidebar" />
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
