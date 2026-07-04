import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

// Simple CSV Parser
function csvToJson(csv) {
  const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '[]';

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));

    headers.forEach((header, index) => {
      const val = currentline[index] || '';
      // Try to parse numbers or booleans
      if (val === 'true') obj[header] = true;
      else if (val === 'false') obj[header] = false;
      else if (!isNaN(val) && val !== '') obj[header] = Number(val);
      else obj[header] = val;
    });

    result.push(obj);
  }

  return JSON.stringify(result, null, 2);
}

// Simple JSON to CSV Converter
function jsonToCsv(json) {
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr) || arr.length === 0) return '';

    const headers = Object.keys(arr[0]);
    const csvRows = [headers.join(',')];

    for (const obj of arr) {
      const values = headers.map(header => {
        const val = obj[header] === undefined || obj[header] === null ? '' : obj[header];
        const stringified = String(val);
        // Escaping comma and double quotes
        if (stringified.includes(',') || stringified.includes('"')) {
          return `"${stringified.replace(/"/g, '""')}"`;
        }
        return stringified;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  } catch {
    throw new Error('Invalid JSON format array object');
  }
}

export default function CsvJsonConverter() {
  const [csvText, setCsvText] = useState('name,age,active\nAlice,28,true\nBob,34,false');
  const [jsonText, setJsonText] = useState('[\n  {\n    "name": "Alice",\n    "age": 28,\n    "active": true\n  },\n  {\n    "name": "Bob",\n    "age": 34,\n    "active": false\n  }\n]');
  const [copied, setCopied] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCsvToJson = () => {
    setErrorMsg('');
    try {
      const converted = csvToJson(csvText);
      setJsonText(converted);
    } catch (err) {
      setErrorMsg('Error parsing CSV: ' + err.message);
    }
  };

  const handleJsonToCsv = () => {
    setErrorMsg('');
    try {
      const converted = jsonToCsv(jsonText);
      setCsvText(converted);
    } catch (err) {
      setErrorMsg('Invalid JSON format. Expected an array of objects.');
    }
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="tool-page">
      <SEOHead title="CSV to JSON Converter" description="Convert spreadsheet CSV columns to JSON structures and back client-side. Free developer format tool." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>CSV ↔ JSON Converter</span></div>
        <h1><i className="fa-solid fa-file-csv" style={{ color: 'var(--accent-purple-light)' }}></i> CSV ↔ JSON Converter</h1>
        <p>Translate spreadsheet comma-separated CSV rows to structured JSON arrays of objects and back.</p>
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
              {/* CSV column */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">CSV Input</label>
                  <button className="copy-btn btn-sm" onClick={() => copy(csvText, 'csv')}>
                    {copied === 'csv' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <textarea className="form-textarea" rows="12" value={csvText} onChange={e => setCsvText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '240px' }} />
                <button className="btn btn-primary mt-1" onClick={handleCsvToJson} style={{ gap: '6px', justifyContent: 'center' }}>
                  Convert to JSON <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>

              {/* JSON column */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">JSON Input (Array of Objects)</label>
                  <button className="copy-btn btn-sm" onClick={() => copy(jsonText, 'json')}>
                    {copied === 'json' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <textarea className="form-textarea" rows="12" value={jsonText} onChange={e => setJsonText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '240px' }} />
                <button className="btn btn-primary mt-1" onClick={handleJsonToCsv} style={{ gap: '6px', justifyContent: 'center' }}>
                  <i className="fa-solid fa-arrow-left"></i> Convert to CSV
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="CSV to JSON Converter — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
