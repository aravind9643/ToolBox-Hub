import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function flattenObject(obj, prefix = '', res = {}) {
  if (obj === null) {
    res[prefix] = null;
    return res;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      res[prefix] = [];
    } else {
      obj.forEach((val, idx) => {
        flattenObject(val, prefix ? `${prefix}.${idx}` : String(idx), res);
      });
    }
    return res;
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      res[prefix] = {};
    } else {
      keys.forEach(k => {
        flattenObject(obj[k], prefix ? `${prefix}.${k}` : k, res);
      });
    }
    return res;
  }
  res[prefix] = obj;
  return res;
}

function unflattenObject(obj) {
  const result = {};
  Object.keys(obj).forEach(key => {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isNextNum = i < parts.length - 1 && !isNaN(parts[i + 1]);
      
      if (!(part in current)) {
        current[part] = isNextNum ? [] : {};
      }
      
      if (i === parts.length - 1) {
        current[part] = obj[key];
      } else {
        current = current[part];
      }
    }
  });
  return result;
}

export default function JsonFlattener() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('flatten'); // 'flatten' | 'unflatten'
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const output = useMemo(() => {
    if (!input.trim()) return '';
    try {
      const parsed = JSON.parse(input);
      setError('');
      if (mode === 'flatten') {
        const flat = flattenObject(parsed);
        return JSON.stringify(flat, null, 2);
      } else {
        const unflat = unflattenObject(parsed);
        return JSON.stringify(unflat, null, 2);
      }
    } catch (e) {
      setError(e.message);
      return '';
    }
  }, [input, mode]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    if (mode === 'flatten') {
      setInput(JSON.stringify({
        user: {
          name: "Alice",
          contact: {
            email: "alice@gmail.com",
            phone: "+12345678"
          },
          preferences: ["dark-theme", "email-notifications"]
        }
      }, null, 2));
    } else {
      setInput(JSON.stringify({
        "user.name": "Alice",
        "user.contact.email": "alice@gmail.com",
        "user.contact.phone": "+12345678",
        "user.preferences.0": "dark-theme",
        "user.preferences.1": "email-notifications"
      }, null, 2));
    }
  };

  return (
    <div className="tool-page">
      <SEOHead title="JSON Flattener & Unflattener" description="Flatten nested JSON object paths into single-level dot keys, or inflate flattened key value stores." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON Flattener</span></div>
        <h1><i className="fa-solid fa-minimize" style={{ color: 'var(--accent-purple-light)' }}></i> JSON Flattener & Unflattener</h1>
        <p>Flatten complex nested object properties into flat key structures, or restore them.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button 
                className={`btn btn-sm ${mode === 'flatten' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => { setMode('flatten'); setInput(''); }}
              >
                Flatten Mode
              </button>
              <button 
                className={`btn btn-sm ${mode === 'unflatten' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => { setMode('unflatten'); setInput(''); }}
              >
                Unflatten Mode
              </button>
              <button className="btn btn-secondary btn-sm" onClick={loadSample} style={{ gap: '6px' }}>
                <i className="fa-solid fa-file-lines"></i> Load Demo JSON
              </button>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              {/* Input */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>JSON Input</h3>
                <textarea 
                  className="form-textarea"
                  rows="10"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={mode === 'flatten' ? "Paste nested JSON object..." : "Paste flattened JSON object..."}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3>Processed Output</h3>
                  {output && (
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '4px' }}>
                      <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '240px' }}>
                  {output || <span style={{ color: 'var(--text-muted)' }}>Output will generate automatically</span>}
                </div>
              </div>
            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="JSON Flattener & Unflattener — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
