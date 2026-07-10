import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

// Key casing transformer
function transformCase(str, type) {
  if (type === 'preserve') return str;
  
  // Split key string by spaces, dashes, dots, or underscores
  const words = str.split(/[\s\-._]+/).filter(Boolean);
  if (words.length === 0) return str;
  
  switch (type) {
    case 'camel':
      return words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'snake':
      return words.map(w => w.toLowerCase()).join('_');
    case 'constant':
      return words.map(w => w.toUpperCase()).join('_');
    case 'kebab':
      return words.map(w => w.toLowerCase()).join('-');
    default:
      return str;
  }
}

// Flat recurse helper
function flattenObject(obj, prefix = '', res = {}, separator = '.', casing = 'preserve', keyPrefix = '', keySuffix = '') {
  if (obj === null) {
    const formattedKey = transformCase(prefix, casing);
    const finalKey = (keyPrefix ? keyPrefix + formattedKey : formattedKey) + keySuffix;
    res[finalKey] = null;
    return res;
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      const formattedKey = transformCase(prefix, casing);
      const finalKey = (keyPrefix ? keyPrefix + formattedKey : formattedKey) + keySuffix;
      res[finalKey] = [];
    } else {
      obj.forEach((val, idx) => {
        flattenObject(val, prefix ? `${prefix}${separator}${idx}` : String(idx), res, separator, casing, keyPrefix, keySuffix);
      });
    }
    return res;
  }
  
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      const formattedKey = transformCase(prefix, casing);
      const finalKey = (keyPrefix ? keyPrefix + formattedKey : formattedKey) + keySuffix;
      res[finalKey] = {};
    } else {
      keys.forEach(k => {
        flattenObject(obj[k], prefix ? `${prefix}${separator}${k}` : k, res, separator, casing, keyPrefix, keySuffix);
      });
    }
    return res;
  }
  
  const formattedKey = transformCase(prefix, casing);
  const finalKey = (keyPrefix ? keyPrefix + formattedKey : formattedKey) + keySuffix;
  res[finalKey] = obj;
  return res;
}

function unflattenObject(obj, separator = '.') {
  const result = {};
  Object.keys(obj).forEach(key => {
    const parts = key.split(separator);
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
  
  // Custom transformations parameters
  const [separator, setSeparator] = useState('.'); // '.', '/', '_', '-'
  const [keyCasing, setKeyCasing] = useState('preserve'); // 'preserve', 'camel', 'snake', 'constant', 'kebab'
  const [keyPrefix, setKeyPrefix] = useState('');
  const [keySuffix, setKeySuffix] = useState('');

  const output = useMemo(() => {
    if (!input.trim()) return '';
    try {
      const parsed = JSON.parse(input);
      setError('');
      if (mode === 'flatten') {
        const flat = flattenObject(parsed, '', {}, separator, keyCasing, keyPrefix, keySuffix);
        return JSON.stringify(flat, null, 2);
      } else {
        const unflat = unflattenObject(parsed, separator);
        return JSON.stringify(unflat, null, 2);
      }
    } catch (e) {
      setError(e.message);
      return '';
    }
  }, [input, mode, separator, keyCasing, keyPrefix, keySuffix]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    if (mode === 'flatten') {
      setInput(JSON.stringify({
        user_info: {
          first_name: "Alice",
          contact_details: {
            personal_email: "alice@gmail.com",
            mobile_phone: "+12345678"
          },
          user_preferences: ["dark-theme", "email-notifications"]
        }
      }, null, 2));
    } else {
      setInput(JSON.stringify({
        "user_info.first_name": "Alice",
        "user_info.contact_details.personal_email": "alice@gmail.com",
        "user_info.contact_details.mobile_phone": "+12345678",
        "user_info.user_preferences.0": "dark-theme",
        "user_info.user_preferences.1": "email-notifications"
      }, null, 2));
    }
  };

  return (
    <div className="tool-page">
      <SEOHead title="JSON Flattener & Key Casing Transformer" description="Flatten nested JSON object paths into single-level separator keys, or convert casings to camelCase/snake_case." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON Flattener</span></div>
        <h1><i className="fa-solid fa-minimize" style={{ color: 'var(--accent-purple-light)' }}></i> JSON Case & Flattener Suite</h1>
        <p>Flatten complex nested object properties, modify casing standards, or inflate structures back.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Mode and controls */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-input)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <button className={`tab-btn btn-sm ${mode === 'flatten' ? 'active' : ''}`} style={{ border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => { setMode('flatten'); setInput(''); }}>Flatten</button>
                <button className={`tab-btn btn-sm ${mode === 'unflatten' ? 'active' : ''}`} style={{ border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => { setMode('unflatten'); setInput(''); }}>Unflatten</button>
              </div>

              <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
                <select className="form-select" value={separator} onChange={e => setSeparator(e.target.value)} style={{ padding: '0.35rem 0.5rem', height: '34px', fontSize: '0.8rem' }} title="Key path separator">
                  <option value=".">Dot (.) separator</option>
                  <option value="/">Slash (/) separator</option>
                  <option value="_">Underscore (_) separator</option>
                  <option value="-">Dash (-) separator</option>
                </select>
              </div>

              {mode === 'flatten' && (
                <>
                  <div className="form-group" style={{ margin: 0, minWidth: '110px' }}>
                    <select className="form-select" value={keyCasing} onChange={e => setKeyCasing(e.target.value)} style={{ padding: '0.35rem 0.5rem', height: '34px', fontSize: '0.8rem' }} title="Key Casing">
                      <option value="preserve">Preserve Casing</option>
                      <option value="camel">camelCase</option>
                      <option value="snake">snake_case</option>
                      <option value="constant">CONSTANT_CASE</option>
                      <option value="kebab">kebab-case</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <input type="text" className="form-input" placeholder="prefix_" value={keyPrefix} onChange={e => setKeyPrefix(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} style={{ width: '80px', padding: '0.35rem 0.5rem', fontSize: '0.8rem', height: '34px' }} title="Key Prefix" />
                    <input type="text" className="form-input" placeholder="_suffix" value={keySuffix} onChange={e => setKeySuffix(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} style={{ width: '80px', padding: '0.35rem 0.5rem', fontSize: '0.8rem', height: '34px' }} title="Key Suffix" />
                  </div>
                </>
              )}

              <button className="btn btn-secondary btn-sm" onClick={loadSample} style={{ gap: '6px' }}>
                <i className="fa-solid fa-file-lines"></i> Load Sample
              </button>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              {/* Input */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>JSON Input</h3>
                <textarea 
                  className="form-textarea"
                  rows="12"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={mode === 'flatten' ? "Paste nested JSON object here..." : "Paste flattened JSON object here..."}
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '260px' }}
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
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Processed Output</h3>
                  {output && (
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '4px' }}>
                      <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '260px', padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflowY: 'auto' }}>
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
