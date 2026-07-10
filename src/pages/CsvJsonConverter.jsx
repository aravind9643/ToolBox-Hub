import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function CsvJsonConverter() {
  const [csvText, setCsvText] = useState('name,age,active,joined\nAlice,28,true,2024-03-12\nBob,34,false,2023-11-05');
  const [jsonText, setJsonText] = useState('[\n  {\n    "name": "Alice",\n    "age": 28,\n    "active": true,\n    "joined": "2024-03-12"\n  },\n  {\n    "name": "Bob",\n    "age": 34,\n    "active": false,\n    "joined": "2023-11-05"\n  }\n]');
  const [copied, setCopied] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Custom configs
  const [delimiter, setDelimiter] = useState(','); // ',', ';', '\t', '|'
  const [smartCasting, setSmartCasting] = useState(true);

  // Parse CSV helper to dynamic array rows
  const parsedGrid = useMemo(() => {
    if (!csvText.trim()) return null;
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;
    
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      rows.push(cells);
    }
    
    return { headers, rows };
  }, [csvText, delimiter]);

  const handleCsvToJson = () => {
    setErrorMsg('');
    try {
      if (!csvText.trim()) {
        setJsonText('[]');
        return;
      }
      const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        setJsonText('[]');
        return;
      }

      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      const result = [];

      for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));

        headers.forEach((header, index) => {
          const val = currentline[index] === undefined ? '' : currentline[index];
          if (smartCasting) {
            if (val === 'true') obj[header] = true;
            else if (val === 'false') obj[header] = false;
            else if (!isNaN(val) && val !== '') obj[header] = Number(val);
            else obj[header] = val;
          } else {
            obj[header] = val;
          }
        });

        result.push(obj);
      }

      setJsonText(JSON.stringify(result, null, 2));
    } catch (err) {
      setErrorMsg('Error parsing CSV: ' + err.message);
    }
  };

  const handleJsonToCsv = () => {
    setErrorMsg('');
    try {
      const arr = JSON.parse(jsonText);
      if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error('Expected a non-empty array of objects');
      }

      const headers = Object.keys(arr[0]);
      const csvRows = [headers.join(delimiter)];

      for (const obj of arr) {
        const values = headers.map(header => {
          const val = obj[header] === undefined || obj[header] === null ? '' : obj[header];
          const stringified = String(val);
          // Escape delimiter character
          if (stringified.includes(delimiter) || stringified.includes('"')) {
            return `"${stringified.replace(/"/g, '""')}"`;
          }
          return stringified;
        });
        csvRows.push(values.join(delimiter));
      }

      setCsvText(csvRows.join('\n'));
    } catch (err) {
      setErrorMsg('Invalid JSON structure: ' + err.message);
    }
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Spreadsheet CSV to JSON Conversion Suite" description="Convert spreadsheet CSV columns to JSON structures and back. Real-time HTML spreadsheet previews." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>CSV ↔ JSON</span></div>
        <h1><i className="fa-solid fa-file-csv" style={{ color: 'var(--accent-purple-light)' }}></i> CSV ↔ JSON Converter</h1>
        <p>Translate spreadsheet rows to JSON arrays and back with live structural table previews.</p>
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
            
            {/* Parameters Settings Bar */}
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
              <div className="form-group" style={{ margin: 0, minWidth: '130px' }}>
                <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>Separator Delimiter</label>
                <select className="form-select" value={delimiter} onChange={e => setDelimiter(e.target.value)} style={{ padding: '0.35rem 0.75rem', height: '34px', fontSize: '0.8rem' }}>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="&#9;">Tab (TSV)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', marginTop: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={smartCasting} onChange={e => setSmartCasting(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                  Smart Type Casting (numbers/booleans)
                </label>
              </div>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              {/* CSV column */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>CSV Payload</h3>
                  <button className="copy-btn btn-sm" onClick={() => copy(csvText, 'csv')}>
                    {copied === 'csv' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <textarea className="form-textarea" rows="12" value={csvText} onChange={e => setCsvText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '220px' }} />
                <button className="btn btn-primary mt-1" onClick={handleCsvToJson} style={{ gap: '6px', justifyContent: 'center' }}>
                  Convert to JSON <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>

              {/* JSON column */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>JSON Payload (Array)</h3>
                  <button className="copy-btn btn-sm" onClick={() => copy(jsonText, 'json')}>
                    {copied === 'json' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <textarea className="form-textarea" rows="12" value={jsonText} onChange={e => setJsonText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '220px' }} />
                <button className="btn btn-primary mt-1" onClick={handleJsonToCsv} style={{ gap: '6px', justifyContent: 'center' }}>
                  <i className="fa-solid fa-arrow-left"></i> Convert to CSV
                </button>
              </div>
            </div>

            {/* Live Spreadsheet Grid View */}
            {parsedGrid && parsedGrid.headers.length > 0 && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                  <i className="fa-solid fa-table"></i> Interactive Spreadsheet Grid Preview
                </h3>
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'sans-serif', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-glass-hover)', borderBottom: '1px solid var(--border-color)' }}>
                        {parsedGrid.headers.map((h, i) => (
                          <th key={i} style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedGrid.rows.map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-color)', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)' }}>
                          {parsedGrid.headers.map((_, cIdx) => (
                            <td key={cIdx} style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)' }}>
                              {row[cIdx] !== undefined ? row[cIdx] : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
