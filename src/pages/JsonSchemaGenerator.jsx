import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function generateSchema(val) {
  if (val === null) return { type: "null" };
  const t = typeof val;
  if (t === "string") return { type: "string" };
  if (t === "number") return { type: "number" };
  if (t === "boolean") return { type: "boolean" };
  
  if (Array.isArray(val)) {
    const schema = { type: "array" };
    if (val.length > 0) {
      schema.items = generateSchema(val[0]);
    } else {
      schema.items = {};
    }
    return schema;
  }
  
  if (t === "object") {
    const schema = { type: "object", properties: {}, required: [] };
    Object.keys(val).forEach(key => {
      schema.properties[key] = generateSchema(val[key]);
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

  const schemaOutput = useMemo(() => {
    if (!input.trim()) return '';
    try {
      const parsed = JSON.parse(input);
      setError('');
      const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: "GeneratedSchema",
        ...generateSchema(parsed)
      };
      return JSON.stringify(schema, null, 2);
    } catch (e) {
      setError(e.message);
      return '';
    }
  }, [input]);

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
      <SEOHead title="JSON Schema Generator & Builder" description="Auto-generate draft JSON schemas from JSON object payloads. Free structure parsing tool." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON Schema</span></div>
        <h1><i className="fa-solid fa-file-signature" style={{ color: 'var(--accent-purple-light)' }}></i> JSON Schema Generator</h1>
        <p>Infer and compile a Draft-07 compliant JSON validation schema based on sample payloads.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            <div style={{ marginBottom: '1rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={loadSample} style={{ gap: '6px' }}>
                <i className="fa-solid fa-file-lines"></i> Load Product Payload
              </button>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              {/* Input */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>JSON Sample Payload</h3>
                <textarea 
                  className="form-textarea"
                  rows="10"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Paste JSON document..."
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '240px' }}
                />
                {error && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--accent-red)', fontSize: '0.8rem' }}>
                    <i className="fa-solid fa-triangle-exclamation"></i> {error}
                  </div>
                )}
              </div>

              {/* Output */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3>Generated JSON Schema</h3>
                  {schemaOutput && (
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '4px' }}>
                      <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '240px' }}>
                  {schemaOutput || <span style={{ color: 'var(--text-muted)' }}>Schema will generate automatically</span>}
                </div>
              </div>
            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="JSON Schema Generator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
