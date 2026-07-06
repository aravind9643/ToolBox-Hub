import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';
import { faker, fakerES, fakerFR, fakerDE, fakerJA, fakerEN_IN } from '@faker-js/faker';

const keywordList = [
  { key: 'id', desc: '1, 2, 3 (incrementing index)' },
  { key: 'uuid', desc: 'Secure random unique UUID' },
  { key: 'name', desc: 'Realistic full name' },
  { key: 'email', desc: 'Real-world formatted email' },
  { key: 'phone', desc: 'Structured phone numbers' },
  { key: 'company', desc: 'Random company name' },
  { key: 'job', desc: 'Corporate job title' },
  { key: 'number', desc: 'Random number (10 to 100)' },
  { key: 'boolean', desc: 'Random true/false value' },
  { key: 'city', desc: 'Real global city' },
  { key: 'country', desc: 'Real country name' },
  { key: 'date', desc: 'Recent date string (YYYY-MM-DD)' },
  { key: 'paragraph', desc: 'Lorem ipsum sentence block' },
  { key: 'avatar', desc: 'Face avatar image URL' }
];

function getFakerInstance(locale) {
  switch (locale) {
    case 'es': return fakerES;
    case 'fr': return fakerFR;
    case 'de': return fakerDE;
    case 'ja': return fakerJA;
    case 'in': return fakerEN_IN;
    default: return faker;
  }
}

function generateFromTemplate(template, index, fk) {
  if (template === null) return null;
  
  if (Array.isArray(template)) {
    if (template.length === 0) return [];
    
    let itemTemplate = template[0];
    let size = fk.number.int({ min: 2, max: 5 });
    
    if (template.length === 2 && typeof template[1] === 'number') {
      size = template[1];
    }
    
    const result = [];
    for (let i = 0; i < size; i++) {
      result.push(generateFromTemplate(itemTemplate, i, fk));
    }
    return result;
  }
  
  if (typeof template === 'object') {
    const result = {};
    Object.keys(template).forEach(key => {
      result[key] = generateFromTemplate(template[key], index, fk);
    });
    return result;
  }
  
  if (typeof template === 'string') {
    const type = template.trim().toLowerCase();
    switch (type) {
      case 'id':
        return index + 1;
      case 'uuid':
        return fk.string.uuid();
      case 'name':
        return fk.person.fullName();
      case 'email':
        return fk.internet.email();
      case 'phone':
        return fk.phone.number();
      case 'company':
        return fk.company.name();
      case 'job':
        return fk.person.jobTitle();
      case 'number':
        return fk.number.int({ min: 10, max: 100 });
      case 'boolean':
        return fk.datatype.boolean();
      case 'city':
        return fk.location.city();
      case 'country':
        return fk.location.country();
      case 'date':
        return fk.date.recent().toISOString().split('T')[0];
      case 'paragraph':
        return fk.lorem.paragraph();
      case 'avatar':
        return fk.image.avatar();
      default:
        return template;
    }
  }
  
  return template;
}

function flattenObject(obj, prefix = '', res = {}) {
  if (obj === null) { res[prefix] = null; return res; }
  if (Array.isArray(obj)) {
    obj.forEach((val, idx) => flattenObject(val, prefix ? `${prefix}.${idx}` : String(idx), res));
    return res;
  }
  if (typeof obj === 'object') {
    Object.keys(obj).forEach(k => flattenObject(obj[k], prefix ? `${prefix}.${k}` : k, res));
    return res;
  }
  res[prefix] = obj;
  return res;
}

function jsonToCsv(jsonArray) {
  const arr = Array.isArray(jsonArray) ? jsonArray : [jsonArray];
  if (arr.length === 0) return '';
  const flatRows = arr.map(item => flattenObject(item));
  const allHeaders = [...new Set(flatRows.flatMap(row => Object.keys(row)))];
  
  const headerRow = allHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(',');
  const dataRows = flatRows.map(row => 
    allHeaders.map(h => {
      const val = row[h] === undefined || row[h] === null ? '' : String(row[h]);
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
}

function jsonToYaml(obj, depth = 0) {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`;
    return String(obj);
  }
  const indent = '  '.repeat(depth);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => `\n${indent}- ${jsonToYaml(item, depth + 1)}`).join('');
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) return '{}';
  return keys.map(k => `\n${indent}${k}: ${jsonToYaml(obj[k], depth + 1)}`).join('');
}

// Collapsible Tree Preview Node Component
function TreeNode({ name, value, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(true);
  const pad = depth * 16;
  
  if (value === null) {
    return <div style={{ paddingLeft: `${pad}px`, fontFamily: 'monospace', fontSize: '0.85rem' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{name}: </span>
      <span style={{ color: 'var(--text-muted)' }}>null</span>
    </div>;
  }
  
  if (typeof value !== 'object') {
    let valStr = String(value);
    let color = 'var(--text-primary)';
    if (typeof value === 'string') { valStr = `"${value}"`; color = 'var(--accent-green)'; }
    else if (typeof value === 'number') color = 'var(--accent-cyan-light)';
    else if (typeof value === 'boolean') color = 'var(--accent-amber-light)';
    
    return <div style={{ paddingLeft: `${pad}px`, fontFamily: 'monospace', fontSize: '0.85rem' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{name}: </span>
      <span style={{ color }}>{valStr}</span>
    </div>;
  }
  
  const isArr = Array.isArray(value);
  const bracketOpen = isArr ? '[' : '{';
  const bracketClose = isArr ? ']' : '}';
  const keys = Object.keys(value);
  
  return (
    <div style={{ paddingLeft: `${pad}px`, fontFamily: 'monospace', fontSize: '0.85rem' }}>
      <span 
        onClick={() => setCollapsed(!collapsed)} 
        style={{ cursor: 'pointer', userSelect: 'none', marginRight: '4px', color: 'var(--text-muted)' }}
      >
        {collapsed ? '▶' : '▼'}
      </span>
      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{name}: </span>
      <span style={{ color: 'var(--text-muted)' }}>{bracketOpen}</span>
      {!collapsed && (
        <div style={{ borderLeft: '1px dashed var(--border-color)', margin: '2px 0' }}>
          {keys.map(k => (
            <TreeNode key={k} name={k} value={value[k]} depth={1} />
          ))}
        </div>
      )}
      {collapsed && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 4px' }}>... {keys.length} items</span>}
      <span style={{ color: 'var(--text-muted)' }}>{bracketClose}</span>
    </div>
  );
}

export default function JsonGenerator() {
  const [templateInput, setTemplateInput] = useState(JSON.stringify({
    id: "id",
    name: "name",
    email: "email",
    profile: {
      avatar: "avatar",
      location: {
        city: "city",
        country: "country"
      }
    },
    skills: ["job", 3]
  }, null, 2));

  const [rowCount, setRowCount] = useState(5);
  const [outputFormat, setOutputFormat] = useState('array');
  const [exportFormat, setExportFormat] = useState('json'); // 'json' | 'csv' | 'yaml'
  const [locale, setLocale] = useState('en'); // 'en' | 'es' | 'fr' | 'de' | 'ja' | 'hi'
  const [generatedJson, setGeneratedJson] = useState('');
  const [rawDataset, setRawDataset] = useState(null); // Keep parsed representation for tree view
  const [schemaError, setSchemaError] = useState('');
  const [isValidSchema, setIsValidSchema] = useState(true);
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState('text'); // 'text' | 'tree'
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(0);

  // Validate on load
  useEffect(() => {
    try {
      JSON.parse(templateInput);
      setSchemaError('');
      setIsValidSchema(true);
    } catch (e) {
      setSchemaError(e.message);
      setIsValidSchema(false);
    }
  }, [templateInput]);

  useEffect(() => {
    if (exportFormat !== 'json') {
      setPreviewTab('text');
    }
  }, [exportFormat]);

  const handleTextareaChange = (e) => {
    const val = e.target.value;
    setTemplateInput(val);
    
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.substring(0, cursor);
    
    const match = textBeforeCursor.match(/"([^"]*)$/);
    if (match) {
      const prefix = match[1].toLowerCase();
      if (prefix.trim() !== '') {
        const filtered = keywordList.filter(kw => kw.key.startsWith(prefix) && kw.key !== prefix);
        if (filtered.length > 0) {
          setSuggestions(filtered);
          setFocusedSuggestionIndex(0);
          setShowSuggestions(true);
          return;
        }
      }
    }
    setShowSuggestions(false);
  };

  const selectSuggestion = (key) => {
    const textarea = document.getElementById('template-textarea');
    if (!textarea) return;
    
    const cursor = textarea.selectionStart;
    const val = templateInput;
    const textBeforeCursor = val.substring(0, cursor);
    const textAfterCursor = val.substring(cursor);
    
    const lastQuoteIndex = textBeforeCursor.lastIndexOf('"');
    if (lastQuoteIndex !== -1) {
      const completedText = val.substring(0, lastQuoteIndex + 1) + key + '"' + textAfterCursor;
      setTemplateInput(completedText);
      setShowSuggestions(false);
      
      setTimeout(() => {
        textarea.focus();
        const nextCursorPos = lastQuoteIndex + 1 + key.length + 1;
        textarea.setSelectionRange(nextCursorPos, nextCursorPos);
      }, 50);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      selectSuggestion(suggestions[focusedSuggestionIndex].key);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
    }
  };

  const handleFormatTemplate = () => {
    try {
      const parsed = JSON.parse(templateInput);
      setTemplateInput(JSON.stringify(parsed, null, 2));
      setSchemaError('');
      setIsValidSchema(true);
    } catch (e) {
      setSchemaError(`Format failed: ${e.message}`);
    }
  };

  const handleGenerate = () => {
    try {
      const template = JSON.parse(templateInput);
      setSchemaError('');
      const fk = getFakerInstance(locale);
      
      let dataset = null;
      if (outputFormat === 'object') {
        dataset = generateFromTemplate(template, 0, fk);
      } else {
        dataset = [];
        for (let i = 0; i < rowCount; i++) {
          dataset.push(generateFromTemplate(template, i, fk));
        }
      }
      
      setRawDataset(dataset);
      renderOutput(dataset, exportFormat);
    } catch (e) {
      setSchemaError(`JSON Template Error: ${e.message}`);
    }
  };

  const renderOutput = (dataset, format) => {
    if (!dataset) return;
    if (format === 'csv') {
      setGeneratedJson(jsonToCsv(dataset));
    } else if (format === 'yaml') {
      setGeneratedJson(jsonToYaml(dataset));
    } else {
      setGeneratedJson(JSON.stringify(dataset, null, 2));
    }
  };

  // Keep output updated if format changes
  useEffect(() => {
    if (rawDataset) {
      renderOutput(rawDataset, exportFormat);
    }
  }, [exportFormat, rawDataset]);

  const handleCopy = () => {
    if (!generatedJson) return;
    navigator.clipboard.writeText(generatedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedJson) return;
    const extension = exportFormat === 'csv' ? 'csv' : exportFormat === 'yaml' ? 'yaml' : 'json';
    const blob = new Blob([generatedJson], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mock_dataset.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadPreset = (type) => {
    let preset = {};
    if (type === 'flat') {
      setOutputFormat('array');
      preset = {
        id: "id",
        fullName: "name",
        emailAddress: "email",
        phoneNo: "phone",
        isActive: "boolean"
      };
    } else if (type === 'nested') {
      setOutputFormat('object');
      preset = {
        id: "uuid",
        user: {
          username: "name",
          job: "job",
          companyDetails: {
            name: "company",
            city: "city"
          }
        }
      };
    } else if (type === 'lists') {
      setOutputFormat('object');
      preset = {
        id: "id",
        name: "name",
        email: "email",
        hobbies: ["paragraph", 4],
        recentJobs: [
          {
            title: "job",
            company: "company"
          },
          2
        ]
      };
    }
    setTemplateInput(JSON.stringify(preset, null, 2));
    setSchemaError('');
    setShowSuggestions(false);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Faker JSON Template Generator" description="Generate realistic mock JSON objects and arrays using raw JSON schemas templates. Powered by Faker.js." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>JSON Generator</span></div>
        <h1><i className="fa-solid fa-gears" style={{ color: 'var(--accent-purple-light)' }}></i> JSON Data Generator</h1>
        <p>Write or paste a JSON object template with keyword strings to compile fake mock datasets.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            {/* Presets Row */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Presets:</span>
                <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('flat')}>Flat List []</button>
                <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('nested')}>Nested User Details {"{}"}</button>
                <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('lists')}>Array of Job Objects</button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* Locale Dropdown */}
                <select 
                  className="form-select"
                  value={locale} 
                  onChange={e => setLocale(e.target.value)}
                  style={{ width: '175px', padding: '0.35rem 1.75rem 0.35rem 0.5rem', fontSize: '0.8rem', height: '34px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="es">🇪🇸 Spanish</option>
                  <option value="fr">🇫🇷 French</option>
                  <option value="de">🇩🇪 German</option>
                  <option value="ja">🇯🇵 Japanese</option>
                  <option value="in">🇮🇳 India (English)</option>
                </select>

                <button className="btn btn-secondary btn-sm" onClick={handleFormatTemplate} style={{ gap: '6px', height: '34px' }}>
                  <i className="fa-solid fa-align-left"></i> Format
                </button>
              </div>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              
              {/* Field Schema Customizer */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>JSON Schema Template</h3>
                  {isValidSchema ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                      <i className="fa-solid fa-circle-check"></i> Valid JSON structure
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: 600 }}>
                      <i className="fa-solid fa-triangle-exclamation"></i> Invalid JSON
                    </span>
                  )}
                </div>
                
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <textarea 
                    id="template-textarea"
                    className="form-textarea"
                    rows="14"
                    value={templateInput}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Define your JSON structure..."
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '300px' }}
                  />
                  
                  {/* Autocomplete Suggestions Box */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: '50px',
                      left: '10px',
                      zIndex: 100,
                      background: 'var(--bg-glass)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-lg)',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      width: '240px'
                    }}>
                      <div style={{ padding: '6px 8px', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
                        Use Arrow Keys + Enter / Tab:
                      </div>
                      {suggestions.map((s, idx) => (
                        <div 
                          key={s.key} 
                          onClick={() => selectSuggestion(s.key)}
                          style={{
                            padding: '6px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontFamily: 'monospace',
                            background: idx === focusedSuggestionIndex ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                            borderLeft: idx === focusedSuggestionIndex ? '3px solid var(--accent-purple-light)' : '3px solid transparent'
                          }}
                        >
                          <span style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>{s.key}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{s.desc.split(' ')[0]}...</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {schemaError && (
                  <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--accent-red)', fontSize: '0.8rem' }}>
                    <i className="fa-solid fa-triangle-exclamation"></i> {schemaError}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: 'inline', marginRight: '6px' }}>Format:</label>
                      <select 
                        className="form-select" 
                        value={outputFormat} 
                        onChange={e => setOutputFormat(e.target.value)}
                        style={{ width: '150px', padding: '0.25rem', display: 'inline-block', fontSize: '0.85rem', height: '32px' }}
                      >
                        <option value="array">Array of Objects []</option>
                        <option value="object">Single Object {"{}"}</option>
                      </select>
                    </div>

                    {outputFormat === 'array' && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ display: 'inline', marginRight: '6px' }}>Records:</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={rowCount} 
                          onChange={e => setRowCount(Math.max(1, Math.min(200, Number(e.target.value))))} 
                          style={{ width: '70px', padding: '0.3rem', display: 'inline-block', fontSize: '0.85rem' }} 
                        />
                      </div>
                    )}
                  </div>

                  <button className="btn btn-primary" onClick={handleGenerate} style={{ width: '100%' }}>
                    <i className="fa-solid fa-gears" style={{ marginRight: '6px' }}></i> Generate JSON Dataset
                  </button>
                </div>
              </div>

              {/* Code Display Area */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3>Compiled Output</h3>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {rawDataset && exportFormat === 'json' && (
                      <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', height: '30px', background: 'var(--bg-input)' }}>
                        <button 
                          onClick={() => setPreviewTab('text')}
                          style={{
                            padding: '0 10px',
                            fontSize: '0.75rem',
                            background: previewTab === 'text' ? 'var(--accent-purple-light)' : 'transparent',
                            color: previewTab === 'text' ? '#fff' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            height: '100%',
                            transition: 'all 0.2s'
                          }}
                        >
                          JSON
                        </button>
                        <button 
                          onClick={() => setPreviewTab('tree')}
                          style={{
                            padding: '0 10px',
                            fontSize: '0.75rem',
                            background: previewTab === 'tree' ? 'var(--accent-purple-light)' : 'transparent',
                            color: previewTab === 'tree' ? '#fff' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            height: '100%',
                            borderLeft: '1px solid var(--border-color)',
                            transition: 'all 0.2s'
                          }}
                        >
                          Tree View
                        </button>
                      </div>
                    )}

                    {generatedJson && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {/* Export format Selector */}
                        <select 
                          className="form-select"
                          value={exportFormat}
                          onChange={e => setExportFormat(e.target.value)}
                          style={{ width: '90px', padding: '0.2rem 1.5rem 0.2rem 0.4rem', fontSize: '0.75rem', height: '30px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                        >
                          <option value="json">JSON</option>
                          <option value="csv">CSV</option>
                          <option value="yaml">YAML</option>
                        </select>

                        <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ padding: '6px 10px', fontSize: '0.75rem', height: '30px' }}>
                          <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
                        </button>
                        <button className="copy-btn" onClick={handleDownload} style={{ padding: '6px 10px', fontSize: '0.75rem', height: '30px' }}>
                          <i className="fa-solid fa-download"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, minHeight: '340px', overflowY: 'auto' }}>
                  {generatedJson ? (
                    previewTab === 'tree' ? (
                      <TreeNode name="dataset" value={rawDataset} />
                    ) : (
                      generatedJson
                    )
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Configure schema template and click Generate to see output</span>
                  )}
                </div>
              </div>

            </div>

            {/* Hint & Instructions */}
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-lightbulb" style={{ color: 'var(--accent-amber-light)', marginRight: '6px' }}></i>
              <strong>Tip (Autocomplete):</strong> Type an opening double quote followed by a few letters (e.g. <code>"na</code> or <code>"em</code>) inside your template to trigger suggestions. Navigate using <kbd style={{ background: '#333', padding: '2px 4px', borderRadius: '3px', color: '#fff' }}>↑</kbd> <kbd style={{ background: '#333', padding: '2px 4px', borderRadius: '3px', color: '#fff' }}>↓</kbd> keys and press <kbd style={{ background: '#333', padding: '2px 4px', borderRadius: '3px', color: '#fff' }}>Enter</kbd> or <kbd style={{ background: '#333', padding: '2px 4px', borderRadius: '3px', color: '#fff' }}>Tab</kbd> to select!
            </div>

            {/* Keyword Cheat Sheet */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>💡 Generator Keywords (Use these in your JSON strings)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                {keywordList.map(kw => (
                  <div key={kw.key} style={{ fontSize: '0.75rem', background: 'var(--bg-input)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <code style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>"{kw.key}"</code>: <span style={{ color: 'var(--text-secondary)' }}>{kw.desc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="JSON Data Generator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
