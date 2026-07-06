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
      <SEOHead title="JSONPath Query Evaluator & Filter Sandbox" description="Run queries against JSON structures in the browser. Supports array indexing, wildcard selectors, and path extraction." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSONPath Evaluator</span></div>
        <h1><i className="fa-solid fa-search" style={{ color: 'var(--accent-purple-light)' }}></i> JSONPath Evaluator</h1>
        <p>Query and extract subsets of nested JSON arrays using path projections.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={loadSample} style={{ gap: '6px' }}>
                <i className="fa-solid fa-file-lines"></i> Load Book Store Sample
              </button>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['$.store.name', '$.store.books[0]', '$.store.books[*].title', '$.store.bicycle.color'].map(q => (
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
              <label className="form-label">JSONPath Query String</label>
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
                <h3>JSON Input</h3>
                <textarea 
                  className="form-textarea"
                  rows="10"
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  placeholder="Paste JSON structure here..."
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '240px' }}
                />
                {error && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--accent-red)', fontSize: '0.8rem' }}>
                    <i className="fa-solid fa-circle-exclamation"></i> {error}
                  </div>
                )}
              </div>

              {/* Output */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>Query Output</h3>
                <div className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '240px' }}>
                  {queryResult || <span style={{ color: 'var(--text-muted)' }}>Query result will show here</span>}
                </div>
              </div>
            </div>

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
