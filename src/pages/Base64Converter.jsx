import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

export default function Base64Converter() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = () => {
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch (e) {
      setError('Invalid input for ' + (mode === 'encode' ? 'encoding' : 'decoding'));
      setOutput('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileEncode = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setOutput(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Base64 Encoder / Decoder" description="Encode and decode text or files to/from Base64 format. Free and instant." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Base64 Converter</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-right-left" style={{ color: 'var(--accent-purple-light)' }}></i> Base64 Encoder / Decoder
        </h1>
        <p>Encode and decode text or files to/from Base64 format.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            <div className="tabs">
              <button className={`tab-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => { setMode('encode'); setInput(''); setOutput(''); setError(''); }}>Encode</button>
              <button className={`tab-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => { setMode('decode'); setInput(''); setOutput(''); setError(''); }}>Decode</button>
              <button className={`tab-btn ${mode === 'file' ? 'active' : ''}`} onClick={() => { setMode('file'); setInput(''); setOutput(''); setError(''); }}>File to Base64</button>
            </div>

            {mode !== 'file' ? (
              <>
                <div className="form-group">
                  <label className="form-label">{mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}</label>
                  <textarea
                    className="form-textarea"
                    rows="6"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                    style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}
                  />
                </div>

                <button className="btn btn-primary w-full" onClick={handleConvert} style={{ gap: '8px' }}>
                  {mode === 'encode' ? <><i className="fa-solid fa-lock"></i> Encode to Base64</> : <><i className="fa-solid fa-lock-open"></i> Decode from Base64</>}
                </button>
              </>
            ) : (
              <div
                className="drop-zone"
                onClick={() => document.getElementById('b64-file-input').click()}
              >
                <div className="drop-zone-icon">
                  <i className="fa-solid fa-file-arrow-up" style={{ color: 'var(--accent-purple-light)' }}></i>
                </div>
                <h3>Click to select a file</h3>
                <p>The file will be converted to a Base64 data URI</p>
                <input id="b64-file-input" type="file" style={{ display: 'none' }} onChange={e => handleFileEncode(e.target.files[0])} />
              </div>
            )}

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', marginTop: '1rem', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}

            {output && (
              <div style={{ marginTop: '1rem' }}>
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label" style={{ marginBottom: 0 }}>Result</label>
                  <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '6px' }}>
                    <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="code-block" style={{ maxHeight: 300 }}>{output}</div>
                <div className="flex gap-1 mt-1">
                  <span className="badge badge-purple">{output.length.toLocaleString()} characters</span>
                  <span className="badge badge-cyan">{(new Blob([output]).size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="tool-sidebar">
          <AdBanner type="sidebar" />
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
