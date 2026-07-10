import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

const DICTIONARY = [
  { char: '<', entity: '&lt;', name: 'Less Than' },
  { char: '>', entity: '&gt;', name: 'Greater Than' },
  { char: '&', entity: '&amp;', name: 'Ampersand' },
  { char: '"', entity: '&quot;', name: 'Double Quote' },
  { char: "'", entity: '&apos;', name: 'Single Quote (Apostrophe)' },
  { char: '©', entity: '&copy;', name: 'Copyright' },
  { char: '®', entity: '&reg;', name: 'Registered Trademark' },
  { char: '™', entity: '&trade;', name: 'Trademark' },
  { char: '€', entity: '&euro;', name: 'Euro Sign' },
  { char: '£', entity: '&pound;', name: 'Pound Sign' },
  { char: '¥', entity: '&yen;', name: 'Yen Sign' },
  { char: '¢', entity: '&cent;', name: 'Cent Sign' },
  { char: '§', entity: '&sect;', name: 'Section Sign' },
  { char: '°', entity: '&deg;', name: 'Degree Sign' },
  { char: '±', entity: '&plusmn;', name: 'Plus-Minus Sign' },
  { char: '×', entity: '&times;', name: 'Multiplication Sign' },
  { char: '÷', entity: '&divide;', name: 'Division Sign' },
  { char: 'π', entity: '&pi;', name: 'Greek Small Letter Pi' }
];

function encodeEntities(str) {
  if (!str) return '';
  return str.replace(/[\u00A0-\u9999<>&"']/g, (i) => {
    return '&#' + i.charCodeAt(0) + ';';
  });
}

function decodeEntities(str) {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

export default function HtmlEntityConverter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState('');

  const handleEncode = () => {
    setOutputText(encodeEntities(inputText));
  };

  const handleDecode = () => {
    setOutputText(decodeEntities(inputText));
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1200);
  };

  const filteredDictionary = useMemo(() => {
    return DICTIONARY.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.entity.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="tool-page">
      <SEOHead title="HTML Entity Encoder & Decoder Studio" description="Convert special characters to HTML entities or decode entity codes back into text strings easily." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>HTML Entities</span></div>
        <h1><i className="fa-solid fa-code" style={{ color: 'var(--accent-purple-light)' }}></i> HTML Entity Encoder / Decoder</h1>
        <p>Encode special symbols into secure HTML entity strings or inspect common symbol entities.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              
              {/* Input */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Raw Input Text</h3>
                <textarea 
                  className="form-textarea"
                  rows="8"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Type symbols (e.g. < > & ©) or entities (e.g. &#60; &#62;)..."
                  style={{ fontSize: '0.8rem', minHeight: '180px' }}
                />
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={handleEncode}>
                    Encode Entities
                  </button>
                  <button className="btn btn-secondary" onClick={handleDecode}>
                    Decode Entities
                  </button>
                </div>
              </div>

              {/* Output */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Result Output</h3>
                  {outputText && (
                    <button className="copy-btn" onClick={() => copy(outputText, 'out')} style={{ gap: '4px' }}>
                      <i className={copied === 'out' ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied === 'out' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <textarea 
                  className="form-textarea"
                  rows="8"
                  readOnly
                  value={outputText}
                  placeholder="Processed output will render here..."
                  style={{ fontSize: '0.8rem', background: 'var(--bg-input)', color: 'var(--accent-cyan-light)', minHeight: '180px' }}
                />
              </div>

            </div>

            {/* Entity Dictionary list */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>HTML Entity Reference Dictionary</h3>
                <input 
                  type="text" 
                  className="form-input" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search entities..." 
                  style={{ width: '200px', height: '32px', fontSize: '0.75rem' }}
                />
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.5rem 0.25rem' }}>Character</th>
                      <th style={{ padding: '0.5rem 0.25rem' }}>Named Entity</th>
                      <th style={{ padding: '0.5rem 0.25rem' }}>Entity Description</th>
                      <th style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDictionary.map(item => (
                      <tr key={item.entity} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem 0.25rem', fontSize: '1.1rem' }}>{item.char}</td>
                        <td style={{ padding: '0.5rem 0.25rem', fontFamily: 'monospace', color: 'var(--accent-cyan-light)' }}>{item.entity}</td>
                        <td style={{ padding: '0.5rem 0.25rem', color: 'var(--text-secondary)' }}>{item.name}</td>
                        <td style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => copy(item.entity, item.entity)} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                            {copied === item.entity ? '✓ Copied' : 'Copy'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="HTML Entity Encoder & Decoder — ToolBox Hub" />
          </div>

        </div>
      </div>
    </div>
  );
}
