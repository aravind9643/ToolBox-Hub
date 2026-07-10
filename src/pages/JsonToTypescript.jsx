import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function jsonToTypeScript(obj, name = 'Root', options = {}) {
  const {
    useTypeAlias = false,
    useSemicolons = true,
    indentSpaces = 2,
    markOptional = false,
    addReadonly = false,
    splitNested = true
  } = options;

  const indent = ' '.repeat(indentSpaces);
  const endChar = useSemicolons ? ';' : ',';

  if (obj === null) {
    return useTypeAlias 
      ? `type ${name} = any${endChar}`
      : `interface ${name} {\n${indent}[key: string]: any${endChar}\n}`;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return useTypeAlias 
        ? `type ${name} = any[]${endChar}`
        : `interface ${name} {\n${indent}items: any[]${endChar}\n}`;
    }
    const firstType = typeof obj[0];
    if (firstType === 'object' && obj[0] !== null) {
      const childName = name.endsWith('Item') ? name : `${name}Item`;
      const childDecl = jsonToTypeScript(obj[0], childName, options);
      const mainDecl = useTypeAlias
        ? `type ${name} = ${childName}[]${endChar}`
        : `type ${name} = ${childName}[]${endChar}`; // interfaces cannot directly extend arrays, type alias is correct
      return splitNested ? `${childDecl}\n\n${mainDecl}` : mainDecl;
    }
    const arrayType = useTypeAlias ? `type ${name} = ${firstType}[]${endChar}` : `type ${name} = ${firstType}[]${endChar}`;
    return arrayType;
  }

  if (typeof obj === 'object') {
    const subInterfaces = [];
    let result = useTypeAlias ? `type ${name} = {\n` : `interface ${name} {\n`;
    
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      const valType = typeof val;
      const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      
      const optSign = markOptional ? '?' : '';
      const rdSign = addReadonly ? 'readonly ' : '';

      if (val === null) {
        result += `${indent}${rdSign}${cleanKey}${optSign}: any${endChar}\n`;
      } else if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
          const subName = key.charAt(0).toUpperCase() + key.slice(1);
          result += `${indent}${rdSign}${cleanKey}${optSign}: ${subName}[]${endChar}\n`;
          subInterfaces.push({ name: subName, value: val[0] });
        } else {
          const itemType = val.length > 0 ? typeof val[0] : 'any';
          result += `${indent}${rdSign}${cleanKey}${optSign}: ${itemType}[]${endChar}\n`;
        }
      } else if (valType === 'object') {
        const subName = key.charAt(0).toUpperCase() + key.slice(1);
        if (splitNested) {
          result += `${indent}${rdSign}${cleanKey}${optSign}: ${subName}${endChar}\n`;
          subInterfaces.push({ name: subName, value: val });
        } else {
          // Render inline nested type structure
          const inlineDecl = jsonToTypeScriptInline(val, options, indentSpaces * 2);
          result += `${indent}${rdSign}${cleanKey}${optSign}: ${inlineDecl}${endChar}\n`;
        }
      } else {
        result += `${indent}${rdSign}${cleanKey}${optSign}: ${valType}${endChar}\n`;
      }
    });

    result += useTypeAlias ? '};' : '}';
    
    if (splitNested && subInterfaces.length > 0) {
      const renderedSubs = subInterfaces.map(sub => jsonToTypeScript(sub.value, sub.name, options)).join('\n\n');
      return `${renderedSubs}\n\n${result}`;
    }
    return result;
  }

  return `type ${name} = ${typeof obj}${endChar}`;
}

// Inline nested object structures compiler helper
function jsonToTypeScriptInline(obj, options, currentIndentSize) {
  const { useSemicolons = true, indentSpaces = 2 } = options;
  const indent = ' '.repeat(currentIndentSize);
  const parentIndent = ' '.repeat(Math.max(0, currentIndentSize - indentSpaces));
  const endChar = useSemicolons ? ';' : ',';

  if (obj === null) return 'any';
  
  let result = '{\n';
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    const valType = typeof val;
    const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
    const optSign = options.markOptional ? '?' : '';
    const rdSign = options.addReadonly ? 'readonly ' : '';

    if (val === null) {
      result += `${indent}${rdSign}${cleanKey}${optSign}: any${endChar}\n`;
    } else if (Array.isArray(val)) {
      const itemType = val.length > 0 ? typeof val[0] : 'any';
      result += `${indent}${rdSign}${cleanKey}${optSign}: ${itemType}[]${endChar}\n`;
    } else if (valType === 'object') {
      const sub = jsonToTypeScriptInline(val, options, currentIndentSize + indentSpaces);
      result += `${indent}${rdSign}${cleanKey}${optSign}: ${sub}${endChar}\n`;
    } else {
      result += `${indent}${rdSign}${cleanKey}${optSign}: ${valType}${endChar}\n`;
    }
  });
  result += `${parentIndent}}`;
  return result;
}

export default function JsonToTypescript() {
  const [input, setInput] = useState('');
  const [rootName, setRootName] = useState('UserPayload');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Settings
  const [useTypeAlias, setUseTypeAlias] = useState(false);
  const [useSemicolons, setUseSemicolons] = useState(true);
  const [indentSpaces, setIndentSpaces] = useState(2);
  const [markOptional, setMarkOptional] = useState(false);
  const [addReadonly, setAddReadonly] = useState(false);
  const [splitNested, setSplitNested] = useState(true);

  const tsOutput = useMemo(() => {
    if (!input.trim()) return '';
    try {
      const parsed = JSON.parse(input);
      setError('');
      return jsonToTypeScript(parsed, rootName, {
        useTypeAlias,
        useSemicolons,
        indentSpaces,
        markOptional,
        addReadonly,
        splitNested
      });
    } catch (e) {
      setError(e.message);
      return '';
    }
  }, [input, rootName, useTypeAlias, useSemicolons, indentSpaces, markOptional, addReadonly, splitNested]);

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
      <SEOHead title="JSON to TypeScript Interface Playground" description="Convert JSON payload objects to static TypeScript interface structures with options." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON to TypeScript</span></div>
        <h1><i className="fa-solid fa-file-code" style={{ color: 'var(--accent-purple-light)' }}></i> JSON to TypeScript Interface Builder</h1>
        <p>Compile type structures from raw JSON documents with optional custom formatting options.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Parameters Settings Bar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'inline', marginRight: '6px' }}>Root Interface Name:</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={rootName} 
                  onChange={e => setRootName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} 
                  style={{ width: '150px', padding: '0.35rem 0.5rem', display: 'inline-block', fontSize: '0.85rem' }} 
                />
              </div>

              <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
                <select className="form-select" value={indentSpaces} onChange={e => setIndentSpaces(Number(e.target.value))} style={{ padding: '0.35rem 0.5rem', height: '34px', fontSize: '0.8rem' }}>
                  <option value="2">2 Spaces</option>
                  <option value="4">4 Spaces</option>
                </select>
              </div>

              <button className="btn btn-secondary btn-sm" onClick={loadSample} style={{ gap: '6px' }}>
                <i className="fa-solid fa-file-lines"></i> Load Payload Demo
              </button>

              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={useTypeAlias} onChange={e => setUseTypeAlias(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                  Type Alias
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={useSemicolons} onChange={e => setUseSemicolons(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                  Semi-colons
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={markOptional} onChange={e => setMarkOptional(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                  Optional Fields (?)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={addReadonly} onChange={e => setAddReadonly(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                  Readonly Fields
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={splitNested} onChange={e => setSplitNested(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                  Split Nested Objects
                </label>
              </div>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              {/* Input Area */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>JSON Input Payload</h3>
                <textarea
                  className="form-textarea"
                  rows="12"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Paste JSON object here..."
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '260px' }}
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
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>TypeScript Interface</h3>
                  {tsOutput && (
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '4px' }}>
                      <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '260px', padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflowY: 'auto' }}>
                  {tsOutput || <span style={{ color: 'var(--text-muted)' }}>Interfaces will output automatically</span>}
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
