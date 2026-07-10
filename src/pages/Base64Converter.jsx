import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

export default function Base64Converter() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);

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
    if (!file) return;
    setFileInfo({ name: file.name, size: file.size, type: file.type });
    const reader = new FileReader();
    reader.onload = () => {
      setOutput(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Determine media type for rendering visual/audio players
  const mediaPreviewElement = useMemo(() => {
    if (!output) return null;
    
    // Check if it's a data URI
    if (output.startsWith('data:')) {
      const matchType = output.match(/^data:([^;]+);base64,/);
      if (matchType) {
        const mime = matchType[1];
        if (mime.startsWith('image/')) {
          return (
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Image Preview</div>
              <img src={output} alt="Decoded base64 visual preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
            </div>
          );
        }
        if (mime.startsWith('audio/')) {
          return (
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Audio Playback Preview</div>
              <audio src={output} controls style={{ width: '100%', maxWidth: '400px' }} />
            </div>
          );
        }
      }
    }
    
    // Try to guess if raw output is an image or audio
    const cleanOutput = output.trim();
    if (/^[A-Za-z0-9+/=]+$/.test(cleanOutput)) {
      // It's a clean base64 string, see if it can be an image
      // We can prefix data:image/png;base64, to try and render it
      // Standard heuristic check
      if (cleanOutput.length > 100) {
        if (cleanOutput.startsWith('iVBORw0KGgo')) { // PNG header
          return (
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Inferred PNG Image Preview</div>
              <img src={`data:image/png;base64,${cleanOutput}`} alt="Inferred visual preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-sm)' }} />
            </div>
          );
        }
        if (cleanOutput.startsWith('/9j/')) { // JPEG header
          return (
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Inferred JPEG Image Preview</div>
              <img src={`data:image/jpeg;base64,${cleanOutput}`} alt="Inferred visual preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-sm)' }} />
            </div>
          );
        }
      }
    }
    return null;
  }, [output]);

  return (
    <div className="tool-page">
      <SEOHead title="Base64 Encoder / Decoder with Media Previews" description="Encode and decode text or files to/from Base64 format. Preview image and audio base64 structures client-side." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Base64 Converter</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-right-left" style={{ color: 'var(--accent-purple-light)' }}></i> Base64 Sandbox & Decoder
        </h1>
        <p>Convert texts or file media to Base64 hashes and render live image or audio decodes.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            <div className="tabs">
              <button className={`tab-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => { setMode('encode'); setInput(''); setOutput(''); setError(''); setFileInfo(null); }}>Encode Text</button>
              <button className={`tab-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => { setMode('decode'); setInput(''); setOutput(''); setError(''); setFileInfo(null); }}>Decode Text</button>
              <button className={`tab-btn ${mode === 'file' ? 'active' : ''}`} onClick={() => { setMode('file'); setInput(''); setOutput(''); setError(''); setFileInfo(null); }}>File to Base64</button>
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
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>

                <button className="btn btn-primary w-full" onClick={handleConvert} style={{ gap: '8px', minHeight: '42px' }}>
                  {mode === 'encode' ? <><i className="fa-solid fa-lock"></i> Encode to Base64</> : <><i className="fa-solid fa-lock-open"></i> Decode from Base64</>}
                </button>
              </>
            ) : (
              <div
                className="drop-zone"
                onClick={() => document.getElementById('b64-file-input').click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files?.length > 0) handleFileEncode(e.dataTransfer.files[0]); }}
                style={{
                  border: isDragging ? '2px dashed var(--accent-cyan-light)' : '2px dashed var(--border-color)',
                  background: isDragging ? 'var(--bg-glass-hover)' : 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                  padding: '2.5rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div className="drop-zone-icon" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                  <i className="fa-solid fa-file-arrow-up" style={{ color: isDragging ? 'var(--accent-cyan-light)' : 'var(--accent-purple-light)' }}></i>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{isDragging ? 'Drop file here!' : 'Drag & drop or click to select a file'}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>The file will be converted to a Base64 data URI</p>
                <input id="b64-file-input" type="file" style={{ display: 'none' }} onChange={e => handleFileEncode(e.target.files[0])} />
              </div>
            )}

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', marginTop: '1rem', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}

            {output && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                {fileInfo && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--bg-input)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <i className="fa-solid fa-file" style={{ color: 'var(--accent-purple-light)', fontSize: '1.25rem' }}></i>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileInfo.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fileInfo.type || 'unknown type'} — {(fileInfo.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 600 }}>Result Output</label>
                  <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '6px' }}>
                    <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                
                <textarea 
                  className="form-textarea" 
                  rows="6" 
                  value={output} 
                  readOnly 
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }} 
                />

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-purple">{output.length.toLocaleString()} characters</span>
                  <span className="badge badge-cyan">{(new Blob([output]).size / 1024).toFixed(1)} KB size</span>
                </div>

                {/* Media Preview Container */}
                {mediaPreviewElement}
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
