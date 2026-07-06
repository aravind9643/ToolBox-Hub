import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function jsonToTypeScript(obj, name = 'Root') {
  if (obj === null) return `type ${name} = any;`;
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `type ${name} = any[];`;
    const firstType = typeof obj[0];
    if (firstType === 'object' && obj[0] !== null) {
      const childName = name.endsWith('Item') ? name : `${name}Item`;
      return `${jsonToTypeScript(obj[0], childName)}\n\ntype ${name} = ${childName}[];`;
    }
    return `type ${name} = ${firstType}[];`;
  }
  if (typeof obj === 'object') {
    let result = `interface ${name} {\n`;
    const subInterfaces = [];
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      const valType = typeof val;
      const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      if (val === null) {
        result += `  ${cleanKey}: any;\n`;
      } else if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
          const subName = key.charAt(0).toUpperCase() + key.slice(1);
          result += `  ${cleanKey}: ${subName}[];\n`;
          subInterfaces.push({ name: subName, value: val[0] });
        } else {
          const itemType = val.length > 0 ? typeof val[0] : 'any';
          result += `  ${cleanKey}: ${itemType}[];\n`;
        }
      } else if (valType === 'object') {
        const subName = key.charAt(0).toUpperCase() + key.slice(1);
        result += `  ${cleanKey}: ${subName};\n`;
        subInterfaces.push({ name: subName, value: val });
      } else {
        result += `  ${cleanKey}: ${valType};\n`;
      }
    });
    result += '}';
    if (subInterfaces.length > 0) {
      const renderedSubs = subInterfaces.map(sub => jsonToTypeScript(sub.value, sub.name)).join('\n\n');
      return `${renderedSubs}\n\n${result}`;
    }
    return result;
  }
  return `type ${name} = ${typeof obj};`;
}

export default function JsonToTypescript() {
  const [input, setInput] = useState('');
  const [rootName, setRootName] = useState('UserPayload');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const tsOutput = useMemo(() => {
    if (!input.trim()) return '';
    try {
      const parsed = JSON.parse(input);
      setError('');
      return jsonToTypeScript(parsed, rootName);
    } catch (e) {
      setError(e.message);
      return '';
    }
  }, [input, rootName]);

  const handleCopy = () => {
    if (!tsOutput) return;
    navigator.clipboard.writeText(tsOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    setInput(JSON.stringify({
      id: 101,
      username: "john_dev",
      active: true,
      roles: ["administrator", "editor"],
      profile: {
        firstName: "John",
        lastName: "Doe",
        stats: {
          postsCount: 42,
          likesReceived: 1024
        }
      },
      metadata: null
    }, null, 2));
  };

  return (
    <div className="tool-page">
      <SEOHead title="JSON to TypeScript Interface Converter" description="Convert JSON payload objects to static TypeScript interface or JSDoc model structures instantly." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON to TypeScript</span></div>
        <h1><i className="fa-solid fa-file-code" style={{ color: 'var(--accent-purple-light)' }}></i> JSON to TypeScript</h1>
        <p>Generate strongly-typed TypeScript interfaces from raw JSON payloads automatically.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'inline', marginRight: '6px' }}>Root Interface Name:</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={rootName} 
                  onChange={e => setRootName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} 
                  style={{ width: '180px', padding: '0.35rem 0.5rem', display: 'inline-block', fontSize: '0.85rem' }} 
                />
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadSample} style={{ gap: '6px' }}>
                <i className="fa-solid fa-file-lines"></i> Load Sample
              </button>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              {/* Input Area */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>JSON Input Payload</h3>
                <textarea
                  className="form-textarea"
                  rows="10"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Paste JSON object here..."
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '240px' }}
                />
                {error && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--accent-red)', fontSize: '0.8rem' }}>
                    <i className="fa-solid fa-triangle-exclamation"></i> {error}
                  </div>
                )}
              </div>

              {/* Output Area */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3>TypeScript Interfaces</h3>
                  {tsOutput && (
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '4px' }}>
                      <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '240px' }}>
                  {tsOutput || <span style={{ color: 'var(--text-muted)' }}>Output will generate automatically</span>}
                </div>
              </div>
            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="JSON to TypeScript Converter — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
