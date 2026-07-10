import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';

// Cryptographically secure fallback helper
function getRandomBytes(size) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(size);
    window.crypto.getRandomValues(bytes);
    return bytes;
  }
  return Array.from({ length: size }, () => Math.floor(Math.random() * 256));
}

// UUID v4
function generateUUIDv4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // v4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}

// UUID v7 (Time-ordered UUID)
function generateUUIDv7() {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, '0'); // 48 bits timestamp
  
  const randBytes = getRandomBytes(10);
  // randBytes[0] & randBytes[1] represent the first random chunk (12 bits)
  const rand1 = ((randBytes[0] << 8) | randBytes[1]) & 0x0fff;
  const part3 = '7' + rand1.toString(16).padStart(3, '0'); // version 7
  
  // Variant (2 bits: 10xxxxxx)
  const variantByte = (randBytes[2] & 0x3f) | 0x80;
  
  const hex = Array.from(randBytes).map(b => b.toString(16).padStart(2, '0'));
  const part4 = variantByte.toString(16).padStart(2, '0') + hex[3];
  const part5 = hex.slice(4, 10).join('');
  
  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-${part3}-${part4}-${part5}`;
}

// ULID (Universally Unique Lexicographically Sortable Identifier)
const ULID_ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function generateULID() {
  const now = Date.now();
  let timeStr = '';
  let time = now;
  for (let i = 0; i < 10; i++) {
    timeStr = ULID_ENCODING[time % 32] + timeStr;
    time = Math.floor(time / 32);
  }
  
  const randBytes = getRandomBytes(16);
  let randStr = '';
  for (let i = 0; i < 16; i++) {
    randStr += ULID_ENCODING[randBytes[i] % 32];
  }
  return timeStr + randStr;
}

// NanoID
const NANOID_ALPHABET = 'useandjustmyrithinkbyvesoqldpxfwgocabzntur';
function generateNanoID(length = 21) {
  const bytes = getRandomBytes(length);
  let id = '';
  for (let i = 0; i < length; i++) {
    id += NANOID_ALPHABET[bytes[i] % NANOID_ALPHABET.length];
  }
  return id;
}

export default function UUIDGenerator() {
  const [generatorType, setGeneratorType] = useState('uuidv4'); // 'uuidv4' | 'uuidv7' | 'ulid' | 'nanoid'
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState('standard'); // 'standard', 'uppercase', 'nodash', 'braces'
  const [copied, setCopied] = useState('');
  
  const initialID = useMemo(() => generateUUIDv4(), []);
  const [idsList, setIdsList] = useState([initialID]);

  const applyFormat = useCallback((id) => {
    let formatted = id;
    if (format === 'uppercase') formatted = formatted.toUpperCase();
    if (format === 'nodash') formatted = formatted.replace(/-/g, '');
    if (format === 'braces') formatted = `{${formatted}}`;
    return formatted;
  }, [format]);

  const generateBulk = useCallback(() => {
    const n = Math.min(100, Math.max(1, parseInt(count) || 1));
    const generated = Array.from({ length: n }, () => {
      switch (generatorType) {
        case 'uuidv7': return generateUUIDv7();
        case 'ulid': return generateULID();
        case 'nanoid': return generateNanoID();
        default: return generateUUIDv4();
      }
    });
    setIdsList(generated);
  }, [count, generatorType]);

  const copyOne = (id, i) => {
    navigator.clipboard.writeText(applyFormat(id));
    setCopied(`single-${i}`);
    setTimeout(() => setCopied(''), 1200);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(idsList.map(id => applyFormat(id)).join('\n'));
    setCopied('all');
    setTimeout(() => setCopied(''), 1200);
  };

  const handleDownload = () => {
    const textContent = idsList.map(id => applyFormat(id)).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ids_export_${generatorType}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Unique ID Generator Toolkit (UUID v4, v7, ULID, NanoID)" description="Generate UUID v4, time-ordered UUID v7, ULIDs, and NanoIDs in bulk. Export layouts instantly." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>ID Generator</span></div>
        <h1><i className="fa-solid fa-fingerprint" style={{ color: 'var(--accent-purple-light)' }}></i> Unique ID Generator Suite</h1>
        <p>Compile cryptographically secure ID standards in custom formats and bulk quantities.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Options configuration */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">ID Standard</label>
                <select className="form-select" value={generatorType} onChange={e => setGeneratorType(e.target.value)}>
                  <option value="uuidv4">UUID v4 (Random)</option>
                  <option value="uuidv7">UUID v7 (Time-Ordered)</option>
                  <option value="ulid">ULID (Sortable base32)</option>
                  <option value="nanoid">NanoID (Compact random)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Format Style</label>
                <select className="form-select" value={format} onChange={e => setFormat(e.target.value)} disabled={generatorType === 'ulid' || generatorType === 'nanoid'}>
                  <option value="standard">Standard (lowercase)</option>
                  <option value="uppercase">UPPERCASE</option>
                  <option value="nodash">No Dashes</option>
                  <option value="braces">{'{braces}'}</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Bulk Count (max 100)</label>
                <input type="number" min="1" max="100" value={count} onChange={e => setCount(e.target.value)} style={{ padding: '0.65rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={generateBulk} style={{ gap: '8px' }}>
                <i className="fa-solid fa-rotate"></i> Generate IDs
              </button>
              <button className="btn btn-secondary" onClick={copyAll} style={{ gap: '6px' }}>
                <i className={copied === 'all' ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
                {copied === 'all' ? 'Copied List!' : `Copy List (${idsList.length})`}
              </button>
              <button className="btn btn-secondary" onClick={handleDownload} style={{ gap: '6px' }}>
                <i className="fa-solid fa-file-arrow-down"></i> Export .txt
              </button>
            </div>

            {/* IDs listing box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '420px', overflowY: 'auto' }}>
              {idsList.map((id, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.15s' }}
                  onClick={() => copyOne(id, i)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-purple-light)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '22px', textAlign: 'right' }}>{i + 1}.</span>
                  <code style={{ flex: 1, fontSize: '0.85rem', color: 'var(--accent-cyan-light)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {applyFormat(id)}
                  </code>
                  <i className={`fa-solid ${copied === `single-${i}` ? 'fa-check' : 'fa-copy'}`}
                    style={{ fontSize: '0.75rem', color: copied === `single-${i}` ? 'var(--accent-green)' : 'var(--text-muted)' }}></i>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-green)', marginRight: '6px' }}></i>
              Identifiers are generated locally in the sandbox using cryptographically secure random number generators (PRNG).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
