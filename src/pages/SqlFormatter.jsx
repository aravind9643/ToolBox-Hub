import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

const KEYWORDS = [
  'select', 'from', 'where', 'and', 'or', 'insert', 'update', 'delete', 'join', 'left', 'right', 'inner', 'outer', 'on', 'group by', 'order by', 'limit', 'set', 'into', 'values', 'having', 'create', 'table', 'drop', 'alter'
];

function formatSql(sql, options = {}) {
  const { capitalize = true, indent = '  ' } = options;
  if (!sql) return '';
  
  // Basic tokenizing and split
  let cleaned = sql.replace(/\s+/g, ' ').trim();
  
  // Format casing of key keywords
  KEYWORDS.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    cleaned = cleaned.replace(regex, (match) => {
      return capitalize ? match.toUpperCase() : match.toLowerCase();
    });
  });

  // Apply basic newline breaks on top keywords
  const breaks = capitalize 
    ? ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN', 'JOIN', 'GROUP BY', 'ORDER BY', 'LIMIT', 'SET', 'VALUES']
    : ['select', 'from', 'where', 'and', 'or', 'left join', 'inner join', 'right join', 'join', 'group by', 'order by', 'limit', 'set', 'values'];

  breaks.forEach(token => {
    // Escape spaces in token
    const tokenEsc = token.replace(/ /g, '\\s+');
    const regex = new RegExp(`\\b(${tokenEsc})\\b`, 'g');
    cleaned = cleaned.replace(regex, '\n$1');
  });

  // Indent lines starting with AND, OR, ON
  let lines = cleaned.split('\n');
  let formatted = '';
  lines.forEach(line => {
    let trimmed = line.trim();
    if (!trimmed) return;
    
    const isIndentKeyword = capitalize
      ? /^(AND|OR|ON|ON\b)/.test(trimmed)
      : /^(and|or|on|on\b)/.test(trimmed);
      
    if (isIndentKeyword) {
      formatted += indent + trimmed + '\n';
    } else {
      formatted += trimmed + '\n';
    }
  });

  return formatted.trim();
}

function minifySql(sql) {
  if (!sql) return '';
  return sql
    .replace(/\/\*[\s\S]*?\*\/|--.*?\n/g, '') // remove comments
    .replace(/\s+/g, ' ')
    .trim();
}

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [capitalize, setCapitalize] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    setOutput(formatSql(input, { capitalize }));
  };

  const handleMinify = () => {
    setOutput(minifySql(input));
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadSample = () => {
    setInput(`select id, name, email from users left join profile on users.id = profile.user_id where status = 'active' and created_at > '2023-01-01' order by created_at desc limit 10;`);
  };

  return (
    <div className="tool-page">
      <SEOHead title="SQL Query Formatter & Minifier Studio" description="Format raw SQL queries, beautify databases structures queries, or compress SQL queries offline." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>SQL Formatter</span></div>
        <h1><i className="fa-solid fa-database" style={{ color: 'var(--accent-purple-light)' }}></i> SQL Formatter</h1>
        <p>Beautify SQL code scripts with keyword highlights or compress into single line statements.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={loadSample}>
                Load SQL Demo
              </button>
              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input type="checkbox" checked={capitalize} onChange={e => setCapitalize(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                Capitalize Keywords (SELECT, FROM)
              </label>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              
              {/* Input */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Raw SQL Input</h3>
                <textarea 
                  className="form-textarea"
                  rows="10"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Paste database query here..."
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '220px' }}
                />
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={handleFormat}>
                    Format SQL
                  </button>
                  <button className="btn btn-secondary" onClick={handleMinify}>
                    Minify Query
                  </button>
                </div>
              </div>

              {/* Output */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Formatted SQL Output</h3>
                  {output && (
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '4px' }}>
                      <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                
                <textarea
                  className="form-textarea"
                  rows="10"
                  readOnly
                  value={output}
                  placeholder="Formatted output will appear here..."
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--bg-input)', color: 'var(--accent-cyan-light)', minHeight: '220px' }}
                />
              </div>

            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="SQL Query Formatter — ToolBox Hub" />
          </div>

        </div>
      </div>
    </div>
  );
}
