import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as yaml from 'js-yaml';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function JsonYamlConverter() {
  const [jsonText, setJsonText] = useState('{\n  "name": "ToolBox Hub",\n  "version": "1.0.0",\n  "features": [\n    "Fast",\n    "Free",\n    "Client-side"\n  ]\n}');
  const [yamlText, setYamlText] = useState('name: ToolBox Hub\nversion: 1.0.0\nfeatures:\n  - Fast\n  - Free\n  - Client-side');
  const [copied, setCopied] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleJsonToYaml = () => {
    setErrorMsg('');
    try {
      const parsed = JSON.parse(jsonText);
      const converted = yaml.dump(parsed, { indent: 2 });
      setYamlText(converted);
    } catch (err) {
      setErrorMsg('Invalid JSON format: ' + err.message);
    }
  };

  const handleYamlToJson = () => {
    setErrorMsg('');
    try {
      const parsed = yaml.load(yamlText);
      const converted = JSON.stringify(parsed, null, 2);
      setJsonText(converted);
    } catch (err) {
      setErrorMsg('Invalid YAML format: ' + err.message);
    }
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="tool-page">
      <SEOHead title="JSON to YAML Converter" description="Convert JSON format configuration files to YAML format and vice-versa. 100% secure client-side conversion." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON to YAML</span></div>
        <h1><i className="fa-solid fa-code" style={{ color: 'var(--accent-purple-light)' }}></i> JSON ↔ YAML Converter</h1>
        <p>Convert structured JSON data to human-friendly YAML and vice-versa.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          {errorMsg && (
            <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
              {errorMsg}
            </div>
          )}

          <div className="glass-card">
            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              {/* JSON Box */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">JSON Input</label>
                  <button className="copy-btn btn-sm" onClick={() => copy(jsonText, 'json')}>
                    {copied === 'json' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <textarea className="form-textarea" rows="12" value={jsonText} onChange={e => setJsonText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '240px' }} />
                <button className="btn btn-primary mt-1" onClick={handleJsonToYaml} style={{ gap: '6px', justifyContent: 'center' }}>
                  Convert to YAML <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>

              {/* YAML Box */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">YAML Input</label>
                  <button className="copy-btn btn-sm" onClick={() => copy(yamlText, 'yaml')}>
                    {copied === 'yaml' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <textarea className="form-textarea" rows="12" value={yamlText} onChange={e => setYamlText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '240px' }} />
                <button className="btn btn-primary mt-1" onClick={handleYamlToJson} style={{ gap: '6px', justifyContent: 'center' }}>
                  <i className="fa-solid fa-arrow-left"></i> Convert to JSON
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="JSON to YAML Converter — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
