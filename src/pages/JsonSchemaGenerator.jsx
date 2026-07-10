import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function generateSchema(val, options = {}) {
  const { addMinMax = true, addPatterns = true, draft = 'draft-07' } = options;
  
  if (val === null) return { type: "null" };
  const t = typeof val;
  
  if (t === "string") {
    const s = { type: "string" };
    if (addPatterns && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
      s.format = "email";
    } else if (addPatterns && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      s.format = "date";
    }
    return s;
  }
  
  if (t === "number" || t === "integer") {
    const n = { type: Number.isInteger(val) ? "integer" : "number" };
    if (addMinMax) {
      n.minimum = 0; // standard default constraint suggestion
    }
    return n;
  }
  
  if (t === "boolean") return { type: "boolean" };
  
  if (Array.isArray(val)) {
    const schema = { type: "array" };
    if (val.length > 0) {
      schema.items = generateSchema(val[0], options);
    } else {
      schema.items = {};
    }
    return schema;
  }
  
  if (t === "object") {
    const schema = { type: "object", properties: {}, required: [] };
    Object.keys(val).forEach(key => {
      schema.properties[key] = generateSchema(val[key], options);
      schema.required.push(key);
    });
    return schema;
  }
  
  return {};
}

export default function JsonSchemaGenerator() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  
  // Custom builder constraints
  const [draft, setDraft] = useState('draft-07');
  const [addMinMax, setAddMinMax] = useState(true);
  const [addPatterns, setAddPatterns] = useState(true);

  const schemaOutput = useMemo(() => {
    if (!input.trim()) return '';
    try {
      const parsed = JSON.parse(input);
      setError('');
      
      const schemaHeader = draft === 'draft-07' 
        ? "http://json-schema.org/draft-07/schema#" 
        : draft === 'draft-2019-09'
        ? "https://json-schema.org/draft/2019-09/schema"
        : "https://json-schema.org/draft/2020-12/schema";

      const schema = {
        $schema: schemaHeader,
        title: "InferredSchema",
        ...generateSchema(parsed, { addMinMax, addPatterns, draft })
      };
      return JSON.stringify(schema, null, 2);
    } catch (e) {
      setError(e.message);
      return '';
    }
  }, [input, draft, addMinMax, addPatterns]);

  const handleCopy = () => {
    if (!schemaOutput) return;
    navigator.clipboard.writeText(schemaOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    setInput(JSON.stringify({
      productId: 45012,
      productName: "Logitech MX Master 3S",
      price: 99.99,
      contactEmail: "support@logitech.com",
      tags: ["hardware", "mouse", "bluetooth"],
      dimensions: {
        width: 84.3,
        height: 124.9,
        depth: 51.0
      },
      warrantyCovered: true,
      manufacturer: null
    }, null, 2));
  };

  return (
    <div className="tool-page">
      <SEOHead title="JSON Schema Generator & Custom Builder" description="Auto-generate draft JSON schemas from JSON object payloads. Free structure parsing tool." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON Schema</span></div>
        <h1><i className="fa-solid fa-file-signature" style={{ color: 'var(--accent-purple-light)' }}></i> JSON Schema Builder</h1>
        <p>Infer and customize draft-compliant JSON validation structures based on raw input payloads.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Parameters Settings Bar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={loadSample} style={{ gap: '6px' }}>
                <i className="fa-solid fa-file-lines"></i> Load Payload Demo
              </button>
              
              <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
                <select className="form-select" value={draft} onChange={e => setDraft(e.target.value)} style={{ padding: '0.4rem 0.75rem', height: '34px', fontSize: '0.8rem' }}>
                  <option value="draft-07">Draft-07 Standard</option>
                  <option value="draft-2019-09">Draft-2019-09 Standard</option>
                  <option value="draft-2020-12">Draft-2020-12 Standard</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={addMinMax} onChange={e => setAddMinMax(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                  Add Numeric Defaults
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={addPatterns} onChange={e => setAddPatterns(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                  Detect Formats (Email/Date)
                </label>
              </div>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              {/* Input */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Raw JSON Payload</h3>
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

              {/* Output Schema */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Compiled JSON Schema</h3>
                  {schemaOutput && (
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '4px' }}>
                      <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy Schema'}
                    </button>
                  )}
                </div>
                <div className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '260px', padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflowY: 'auto' }}>
                  {schemaOutput || <span style={{ color: 'var(--text-muted)' }}>Schema will render here automatically</span>}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
