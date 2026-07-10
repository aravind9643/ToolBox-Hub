import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function UrlParser() {
  const [urlInput, setUrlInput] = useState('');
  const [parsed, setParsed] = useState({ protocol: '', host: '', pathname: '', hash: '' });
  const [params, setParams] = useState([]); // Array of { id, key, val }
  const [copied, setCopied] = useState(false);

  // Parse URL
  const handleParse = () => {
    if (!urlInput.trim()) return;
    try {
      const u = new URL(urlInput);
      setParsed({
        protocol: u.protocol,
        host: u.host,
        pathname: u.pathname,
        hash: u.hash
      });
      
      const searchParams = [];
      u.searchParams.forEach((value, key) => {
        searchParams.push({ id: Math.random().toString(), key, val: value });
      });
      setParams(searchParams);
    } catch (e) {
      alert('Invalid URL string entered.');
    }
  };

  // Re-assemble and copy URL
  const assembledUrl = (() => {
    if (!parsed.host) return '';
    try {
      const u = new URL(`${parsed.protocol}//${parsed.host}${parsed.pathname}`);
      params.forEach(p => {
        if (p.key.trim()) u.searchParams.append(p.key, p.val);
      });
      u.hash = parsed.hash;
      return u.toString();
    } catch (e) {
      return '';
    }
  })();

  const handleCopy = () => {
    if (!assembledUrl) return;
    navigator.clipboard.writeText(assembledUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleAddParam = () => {
    setParams([...params, { id: Math.random().toString(), key: '', val: '' }]);
  };

  const handleUpdateParam = (id, field, value) => {
    setParams(params.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDeleteParam = (id) => {
    setParams(params.filter(p => p.id !== id));
  };

  const loadSample = () => {
    setUrlInput('https://api.example.com/v1/search?query=react+tools&limit=25&category=dev#results');
  };

  return (
    <div className="tool-page">
      <SEOHead title="URL Query Param Parser & Interactive Editor" description="Parse URL paths, breakdown protocols, and edit search query parameters in an interactive tabular grid." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>URL Parser</span></div>
        <h1><i className="fa-solid fa-link" style={{ color: 'var(--accent-purple-light)' }}></i> URL Parameter Parser</h1>
        <p>Breakdown website URLs, inspect protocols, and edit query variables dynamically.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={loadSample}>
                Load Demo URL
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Destination URL Path</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={urlInput} 
                  onChange={e => setUrlInput(e.target.value)} 
                  placeholder="Paste complete URL path starting with http/https..."
                />
                <button className="btn btn-primary" onClick={handleParse}>
                  Parse
                </button>
              </div>
            </div>

            {/* Parsed Telemetry Details */}
            {parsed.host && (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Protocol</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan-light)' }}>{parsed.protocol}</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Hostname / Port</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{parsed.host}</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Pathname</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{parsed.pathname}</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Anchor Hash</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{parsed.hash || 'None'}</div>
                  </div>
                </div>

                {/* Table of query parameters */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Query String Parameters</h3>
                    <button className="btn btn-secondary btn-sm" onClick={handleAddParam} style={{ gap: '4px' }}>
                      <i className="fa-solid fa-plus"></i> Add Variable
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {params.map(p => (
                      <div key={p.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={p.key} 
                          onChange={e => handleUpdateParam(p.id, 'key', e.target.value)} 
                          placeholder="Key" 
                          style={{ flex: 1, height: '34px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                        />
                        <input 
                          type="text" 
                          className="form-input" 
                          value={p.val} 
                          onChange={e => handleUpdateParam(p.id, 'val', e.target.value)} 
                          placeholder="Value" 
                          style={{ flex: 1, height: '34px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                        />
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteParam(p.id)} style={{ color: 'var(--accent-red)', padding: '0.4rem 0.6rem' }} title="Delete Parameter">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    ))}
                    {params.length === 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem' }}>No query parameters parsed.</div>
                    )}
                  </div>
                </div>

                {/* Assembled Output Rebuilder */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Re-assembled URL Path</h3>
                    {assembledUrl && (
                      <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '4px' }}>
                        <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied URL' : 'Copy Reassembled URL'}
                      </button>
                    )}
                  </div>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {assembledUrl}
                  </div>
                </div>

              </div>
            )}

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="URL Parameter Parser — ToolBox Hub" />
          </div>

        </div>
      </div>
    </div>
  );
}
