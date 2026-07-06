import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function SvgPngConverter() {
  const [svgContent, setSvgContent] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#3b82f6" stroke="#1e293b" stroke-width="4" />
  <path d="M35 50 L45 60 L65 40" stroke="#f8fafc" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`);

  const [width, setWidth] = useState('512');
  const [height, setHeight] = useState('512');
  const [scale, setScale] = useState(1);
  const [bgTransparent, setBgTransparent] = useState(true);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [pngDataUrl, setPngDataUrl] = useState('');
  
  // Optimization Toggles
  const [minify, setMinify] = useState(false);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(false);

  const canvasRef = useRef(null);

  const autoDetectDimensions = (svgText) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (svgEl) {
        const w = svgEl.getAttribute('width') || svgEl.viewBox?.baseVal?.width || '512';
        const h = svgEl.getAttribute('height') || svgEl.viewBox?.baseVal?.height || '512';
        setWidth(Math.round(parseFloat(w)).toString());
        setHeight(Math.round(parseFloat(h)).toString());
      }
    } catch (e) {
      // Ignored
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setSvgContent(text);
      autoDetectDimensions(text);
    };
    reader.readAsText(file);
  };

  // Compute optimized SVG XML based on toggles
  const optimizedSvg = useMemo(() => {
    if (!svgContent) return '';
    let result = svgContent;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(result, 'image/svg+xml');
      
      if (doc.querySelector('parsererror')) {
        return result; // Return raw on parse error
      }

      const svgEl = doc.querySelector('svg');
      if (!svgEl) return result;

      // Strip metadata, comments, and elements
      if (stripMetadata) {
        const metadata = doc.querySelector('metadata');
        if (metadata) metadata.remove();
        const desc = doc.querySelector('desc');
        if (desc) desc.remove();
        const comments = doc.evaluate('//comment()', doc, null, XPathResult.ANY_TYPE, null);
        let comment = comments.iterateNext();
        while (comment) {
          comment.remove();
          comment = comments.iterateNext();
        }
      }

      const serializer = new XMLSerializer();
      result = serializer.serializeToString(doc);

      if (minify) {
        result = result.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
      } else if (prettyPrint) {
        // Simple formatting
        let formatted = '';
        let indent = '';
        result.split(/>\s*</).forEach((node) => {
          if (node.match(/^\/\w/)) indent = indent.substring(2);
          formatted += indent + '<' + node + '>\n';
          if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input')) indent += '  ';
        });
        result = formatted.substring(1, formatted.length - 2);
      }
    } catch (e) {
      // Return raw on error
    }

    return result;
  }, [svgContent, minify, stripMetadata, prettyPrint]);

  // Compile PNG Data URL whenever settings or content changes
  useEffect(() => {
    if (!optimizedSvg) {
      setPngDataUrl('');
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([optimizedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = parseInt(width) || 512;
      const h = parseInt(height) || 512;

      const finalW = w * scale;
      const finalH = h * scale;

      canvas.width = finalW;
      canvas.height = finalH;

      if (!bgTransparent) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, finalW, finalH);
      } else {
        ctx.clearRect(0, 0, finalW, finalH);
      }

      ctx.drawImage(img, 0, 0, finalW, finalH);
      setPngDataUrl(canvas.toDataURL('image/png'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [optimizedSvg, width, height, scale, bgTransparent, bgColor]);

  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    const link = document.createElement('a');
    link.download = 'sandbox_export.png';
    link.href = pngDataUrl;
    link.click();
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([optimizedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'sandbox_optimized.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-page">
      <SEOHead title="SVG Sandbox & Optimizer" description="A professional SVG sandbox, editor, and minifier with live interactive preview canvases and PNG/optimized-SVG export capabilities." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>SVG Sandbox</span></div>
        <h1><i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--accent-purple-light)' }}></i> SVG Playground & Sandbox</h1>
        <p>Write, edit, minify, and optimize SVGs with live transparency checkers and high-res exporting.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              
              {/* Left Column: Live XML Editor */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Raw SVG XML Editor</h3>
                  <input type="file" accept=".svg" onChange={handleFileUpload} style={{ fontSize: '0.75rem', maxWidth: '180px' }} />
                </div>

                <textarea
                  className="form-textarea"
                  rows="14"
                  value={svgContent}
                  onChange={e => setSvgContent(e.target.value)}
                  placeholder="<svg>...</svg>"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem', minHeight: '300px' }}
                />

                {/* Optimizations Checklist */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>SVG Optimization Parameters</h4>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={stripMetadata} onChange={e => { setStripMetadata(e.target.checked); if (e.target.checked) setPrettyPrint(false); }} style={{ accentColor: 'var(--accent-purple-light)' }} />
                      <span>Strip Metadata & Comments</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={minify} onChange={e => { setMinify(e.target.checked); if (e.target.checked) setPrettyPrint(false); }} style={{ accentColor: 'var(--accent-purple-light)' }} />
                      <span>Minify XML payload</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={prettyPrint} onChange={e => { setPrettyPrint(e.target.checked); if (e.target.checked) { setMinify(false); setStripMetadata(false); } }} style={{ accentColor: 'var(--accent-purple-light)' }} />
                      <span>Pretty Print XML layout</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Canvas Preview */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3>Interactive Canvas Preview</h3>

                {/* Grid Checkerboard Preview Box */}
                <div style={{
                  flex: 1,
                  minHeight: '280px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: bgTransparent ? 'repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%) 50% / 20px 20px' : bgColor,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {optimizedSvg ? (
                    <div 
                      style={{ maxWidth: '90%', maxHeight: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      dangerouslySetInnerHTML={{ __html: optimizedSvg }}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Enter SVG XML code to preview</span>
                  )}
                </div>

                {/* Canvas settings & options */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', background: 'var(--bg-glass)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Canvas width (px)</label>
                    <input type="number" className="form-input" value={width} onChange={e => setWidth(e.target.value)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', height: '30px' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Canvas height (px)</label>
                    <input type="number" className="form-input" value={height} onChange={e => setHeight(e.target.value)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', height: '30px' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>DPI Multiplier</label>
                    <select className="form-select" value={scale} onChange={e => setScale(Number(e.target.value))} style={{ padding: '0.25rem', fontSize: '0.8rem', height: '30px' }}>
                      <option value={1}>1x (Standard)</option>
                      <option value={2}>2x (Retina)</option>
                      <option value={4}>4x (Ultra HD)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Background</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '30px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={bgTransparent} onChange={e => setBgTransparent(e.target.checked)} style={{ accentColor: 'var(--accent-purple-light)' }} />
                        <span>Trans</span>
                      </label>
                      {!bgTransparent && (
                        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ border: 'none', width: '22px', height: '22px', padding: 0, background: 'none', cursor: 'pointer' }} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Export panel */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-primary" onClick={handleDownloadPng} disabled={!pngDataUrl} style={{ flex: 1, gap: '6px' }}>
                    <i className="fa-solid fa-file-image"></i> Export PNG
                  </button>
                  <button className="btn btn-secondary" onClick={handleDownloadSvg} disabled={!optimizedSvg} style={{ flex: 1, gap: '6px' }}>
                    <i className="fa-solid fa-code"></i> Export SVG
                  </button>
                </div>
              </div>

            </div>

          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="SVG Sandbox & Optimizer — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
