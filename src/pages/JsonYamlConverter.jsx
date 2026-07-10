import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as yaml from 'js-yaml';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

// Pure JS TOML Compiler/Stringifier
function jsonToToml(obj) {
  let toml = '';
  const simple = [];
  const nested = [];
  
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    if (val === null) return;
    if (typeof val === 'object' && !Array.isArray(val)) {
      nested.push({ key, val });
    } else if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === 'object') {
        nested.push({ key, val, isArray: true });
      } else {
        simple.push(`${key} = ${JSON.stringify(val)}`);
      }
    } else {
      simple.push(`${key} = ${JSON.stringify(val)}`);
    }
  });
  
  toml += simple.join('\n') + '\n';
  
  nested.forEach(item => {
    if (item.isArray) {
      item.val.forEach(sub => {
        toml += `\n[[${item.key}]]\n` + jsonToToml(sub);
      });
    } else {
      toml += `\n[${item.key}]\n` + jsonToToml(item.val);
    }
  });
  
  return toml.trim();
}

// Pure JS TOML Parser
function tomlToJson(toml) {
  const result = {};
  let current = result;
  
  const lines = toml.split('\n');
  lines.forEach(line => {
    const clean = line.trim();
    if (!clean || clean.startsWith('#')) return;
    
    if (clean.startsWith('[[') && clean.endsWith(']]')) {
      const key = clean.slice(2, -2).trim();
      if (!result[key]) result[key] = [];
      const newObj = {};
      result[key].push(newObj);
      current = newObj;
    } else if (clean.startsWith('[') && clean.endsWith(']')) {
      const key = clean.slice(1, -1).trim();
      result[key] = {};
      current = result[key];
    } else if (clean.includes('=')) {
      const idx = clean.indexOf('=');
      const key = clean.slice(0, idx).trim();
      const rawVal = clean.slice(idx + 1).trim();
      let val = rawVal;
      try {
        val = JSON.parse(rawVal);
      } catch {}
      current[key] = val;
    }
  });
  return JSON.stringify(result, null, 2);
}

export default function JsonYamlConverter() {
  const [jsonText, setJsonText] = useState('{\n  "name": "ToolBox Hub",\n  "version": "1.0.0",\n  "features": [\n    "Fast",\n    "Free",\n    "Client-side"\n  ]\n}');
  const [yamlText, setYamlText] = useState('name: ToolBox Hub\nversion: 1.0.0\nfeatures:\n  - Fast\n  - Free\n  - Client-side');
  const [tomlText, setTomlText] = useState('name = "ToolBox Hub"\nversion = "1.0.0"\nfeatures = ["Fast", "Free", "Client-side"]');
  const [copied, setCopied] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleJsonToYaml = () => {
    setErrorMsg('');
    try {
      const parsed = JSON.parse(jsonText);
      setYamlText(yaml.dump(parsed, { indent: 2 }));
      setTomlText(jsonToToml(parsed));
    } catch (err) {
      setErrorMsg('Invalid JSON format: ' + err.message);
    }
  };

  const handleYamlToOthers = () => {
    setErrorMsg('');
    try {
      const parsed = yaml.load(yamlText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setTomlText(jsonToToml(parsed));
    } catch (err) {
      setErrorMsg('Invalid YAML format: ' + err.message);
    }
  };

  const handleTomlToOthers = () => {
    setErrorMsg('');
    try {
      const parsedStr = tomlToJson(tomlText);
      const parsed = JSON.parse(parsedStr);
      setJsonText(parsedStr);
      setYamlText(yaml.dump(parsed, { indent: 2 }));
    } catch (err) {
      setErrorMsg('Invalid TOML format: ' + err.message);
    }
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="tool-page">
      <SEOHead title="JSON, YAML, & TOML Three-Way Configuration Sandbox" description="Convert configurations between JSON, YAML, and TOML format schemas securely in the browser." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Config Converter</span></div>
        <h1><i className="fa-solid fa-code" style={{ color: 'var(--accent-purple-light)' }}></i> Configuration Sandbox</h1>
        <p>Three-way secure configurations converter: JSON ⇄ YAML ⇄ TOML formats.</p>
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
            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {/* JSON Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>JSON Format</label>
                  <button className="copy-btn btn-sm" onClick={() => copy(jsonText, 'json')}>
                    {copied === 'json' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <textarea className="form-textarea" rows="12" value={jsonText} onChange={e => setJsonText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '220px' }} />
                <button className="btn btn-primary mt-1" onClick={handleJsonToYaml} style={{ gap: '6px', justifyContent: 'center' }}>
                  Convert from JSON <i className="fa-solid fa-arrows-spin"></i>
                </button>
              </div>

              {/* YAML Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>YAML Format</label>
                  <button className="copy-btn btn-sm" onClick={() => copy(yamlText, 'yaml')}>
                    {copied === 'yaml' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <textarea className="form-textarea" rows="12" value={yamlText} onChange={e => setYamlText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '220px' }} />
                <button className="btn btn-primary mt-1" onClick={handleYamlToOthers} style={{ gap: '6px', justifyContent: 'center' }}>
                  Convert from YAML <i className="fa-solid fa-arrows-spin"></i>
                </button>
              </div>

              {/* TOML Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>TOML Format</label>
                  <button className="copy-btn btn-sm" onClick={() => copy(tomlText, 'toml')}>
                    {copied === 'toml' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <textarea className="form-textarea" rows="12" value={tomlText} onChange={e => setTomlText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '220px' }} />
                <button className="btn btn-primary mt-1" onClick={handleTomlToOthers} style={{ gap: '6px', justifyContent: 'center' }}>
                  Convert from TOML <i className="fa-solid fa-arrows-spin"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
