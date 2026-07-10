import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function evaluateSimplePath(obj, path) {
  if (!path || path.trim() === '' || path === '$') return obj;
  
  // Normalize JSONPath strings (e.g. $.store.book[*].title -> store.book.*.title)
  let clean = path.replace(/^\$\.?/, '');
  // replace index bracket notation [0] with .0
  clean = clean.replace(/\[(\d+)\]/g, '.$1');
  // replace wildcard bracket notation [*] with .*
  clean = clean.replace(/\[\*\]/g, '.*');
  
  const segments = clean.split('.').filter(Boolean);
  
  let current = [obj];
  
  for (let segment of segments) {
    let next = [];
    for (let item of current) {
      if (item === null || typeof item !== 'object') continue;
      
      if (segment === '*') {
        if (Array.isArray(item)) {
          next.push(...item);
        } else {
          next.push(...Object.values(item));
        }
      } else if (segment in item) {
        next.push(item[segment]);
      }
    }
    current = next;
  }
  
  return current.length === 1 ? current[0] : current;
}

// Collapsible interactive JSON tree viewer node
function JSONTreeNode({ label, value, path, onSelectPath }) {
  const [collapsed, setCollapsed] = useState(false);
  
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  const handleClickPath = (e) => {
    e.stopPropagation();
    onSelectPath(path);
  };

  if (!isObject) {
    let displayValue = String(value);
    let valColor = 'var(--accent-cyan-light)';
    if (typeof value === 'string') {
      displayValue = `"${value}"`;
      valColor = 'var(--accent-green)';
    } else if (typeof value === 'boolean') {
      valColor = 'var(--accent-amber)';
    } else if (value === null) {
      displayValue = 'null';
      valColor = 'var(--text-muted)';
    }

    return (
      <div style={{ marginLeft: '12px', padding: '2px 0', fontFamily: 'monospace', fontSize: '0.8rem' }}>
        {label && (
          <span 
            onClick={handleClickPath}
            style={{ color: 'var(--accent-purple-light)', cursor: 'pointer', fontWeight: 600, marginRight: '4px' }}
            title="Click to copy path to query"
          >
            {label}:
          </span>
        )}
        <span style={{ color: valColor }}>{displayValue}</span>
      </div>
    );
  }

  const keys = isArray ? value : Object.keys(value);

  return (
    <div style={{ marginLeft: '12px', padding: '2px 0', fontFamily: 'monospace', fontSize: '0.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setCollapsed(!collapsed)}>
        <i className={`fa-solid ${collapsed ? 'fa-caret-right' : 'fa-caret-down'}`} style={{ width: '12px', color: 'var(--text-muted)', fontSize: '0.75rem' }} />
        {label && (
          <span 
            onClick={handleClickPath}
            style={{ color: 'var(--accent-purple-light)', fontWeight: 600, marginRight: '4px' }}
            title="Click to copy path to query"
          >
            {label}:
          </span>
        )}
        <span style={{ color: 'var(--text-muted)' }}>
          {isArray ? `Array[${keys.length}]` : 'Object'}
        </span>
      </div>
      
      {!collapsed && (
        <div style={{ borderLeft: '1px dashed var(--border-color)', marginLeft: '6px', paddingLeft: '6px' }}>
          {keys.map((k, idx) => {
            const nextLabel = isArray ? `[${idx}]` : k;
            const nextPath = isArray ? `${path}[${idx}]` : `${path}.${k}`;
            const val = isArray ? k : value[k];
            
            return (
              <JSONTreeNode 
                key={idx} 
                label={nextLabel} 
                value={val} 
                path={nextPath} 
                onSelectPath={onSelectPath} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function JsonpathEvaluator() {
  const [jsonInput, setJsonInput] = useState('');
  const [query, setQuery] = useState('$.store.books[*].title');
  const [error, setError] = useState('');

  const sampleJSON = JSON.stringify({
    store: {
      name: "Dev Books",
      books: [
        { category: "reference", author: "Nigel Rees", title: "Sayings of the Century", price: 8.95 },
        { category: "fiction", author: "Evelyn Waugh", title: "Sword of Honour", price: 12.99 },
        { category: "fiction", author: "Herman Melville", title: "Moby Dick", isbn: "0-553-21311-3", price: 8.99 }
      ],
      bicycle: { color: "red", price: 19.95 }
    }
  }, null, 2);

  const loadSample = () => {
    setJsonInput(sampleJSON);
    setQuery('$.store.books[*].author');
    setError('');
  };

  const parsedJSON = useMemo(() => {
    if (!jsonInput.trim()) return null;
    try {
      return JSON.parse(jsonInput);
    } catch {
      return null;
    }
  }, [jsonInput]);

  const queryResult = useMemo(() => {
    if (!jsonInput.trim()) return '';
    try {
      const parsed = JSON.parse(jsonInput);
      setError('');
      const val = evaluateSimplePath(parsed, query);
      return JSON.stringify(val, null, 2);
    } catch (e) {
      setError(e.message);
      return '';
    }
  }, [jsonInput, query]);

  return (
    <div className="tool-page">
      <SEOHead title="JSONPath Query Evaluator & Interactive Explorer" description="Evaluate JSONPath queries in the browser. Click keys in the parsed tree explorer to auto-build projections." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSONPath</span></div>
        <h1><i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--accent-purple-light)' }}></i> JSONPath Query Console</h1>
        <p>Extract sub-nodes from JSON documents using path query projections with interactive key selectors.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={loadSample} style={{ gap: '6px' }}>
                <i className="fa-solid fa-file-lines"></i> Load Store Sample
              </button>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['$.store.name', '$.store.books[0]', '$.store.books[*].title', '$.store.bicycle.price'].map(q => (
                  <button 
                    key={q} 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => setQuery(q)}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem', fontFamily: 'monospace' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>JSONPath Query Expression</label>
              <input 
                type="text" 
                className="form-input" 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                placeholder="e.g. $.store.books[*].author"
                style={{ fontFamily: 'monospace' }} 
              />
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              {/* Input */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>JSON Input</h3>
                <textarea 
                  className="form-textarea"
                  rows="12"
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  placeholder="Paste JSON payload here..."
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '220px' }}
                />
                {error && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--accent-red)', fontSize: '0.8rem' }}>
                    <i className="fa-solid fa-circle-exclamation"></i> {error}
                  </div>
                )}
              </div>

              {/* Output */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Evaluation Output</h3>
                <div className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '220px', padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflowY: 'auto' }}>
                  {queryResult || <span style={{ color: 'var(--text-muted)' }}>Projections result will render automatically</span>}
                </div>
              </div>
            </div>

            {/* Interactive Tree View Node */}
            {parsedJSON && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                  <i className="fa-solid fa-tree"></i> Interactive JSON Key Map Explorer
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  💡 Click on any property key below to automatically populate the JSONPath query above.
                </p>
                <div style={{ padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', maxHeight: '300px', overflowY: 'auto' }}>
                  <JSONTreeNode label="" value={parsedJSON} path="$" onSelectPath={(p) => setQuery(p)} />
                </div>
              </div>
            )}

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="JSONPath Query Evaluator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
