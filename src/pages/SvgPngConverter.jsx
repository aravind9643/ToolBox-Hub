import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function SvgPngConverter() {
  const [svgContent, setSvgContent] = useState('');
  const [width, setWidth] = useState('512');
  const [height, setHeight] = useState('512');
  const [copied, setCopied] = useState(false);
  const [pngDataUrl, setPngDataUrl] = useState('');
  const canvasRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSvgContent(event.target.result);
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (!svgContent) {
      setPngDataUrl('');
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const w = parseInt(width) || 512;
      const h = parseInt(height) || 512;

      canvas.width = w;
      canvas.height = h;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      setPngDataUrl(canvas.toDataURL('image/png'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [svgContent, width, height]);

  const handleDownload = () => {
    if (!pngDataUrl) return;
    const link = document.createElement('a');
    link.download = 'vector_converted.png';
    link.href = pngDataUrl;
    link.click();
  };

  return (
    <div className="tool-page">
      <SEOHead title="SVG to PNG Converter" description="Convert SVG vector files to PNG images client-side. Custom scale resolution and transparent backdrops." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>SVG to PNG</span></div>
        <h1><i className="fa-solid fa-file-export" style={{ color: 'var(--accent-purple-light)' }}></i> SVG to PNG Converter</h1>
        <p>Convert SVG vector files into rasterized PNG images with custom sizes.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Upload SVG File</label>
                <input type="file" accept=".svg" onChange={handleFileUpload} className="form-input" style={{ padding: '0.5rem' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Or Paste SVG Code</label>
                <textarea className="form-textarea" rows="1" value={svgContent} onChange={e => setSvgContent(e.target.value)} placeholder="<svg>...</svg>" style={{ minHeight: '44px', padding: '0.65rem' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Target Width (px)</label>
                <input type="number" className="form-input" value={width} onChange={e => setWidth(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Target Height (px)</label>
                <input type="number" className="form-input" value={height} onChange={e => setHeight(e.target.value)} />
              </div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', marginTop: '1.5rem' }}>
              {/* SVG Preview */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3>SVG Source Preview</h3>
                {svgContent ? (
                  <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-glass-hover)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '220px', border: '2px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    Paste SVG to see preview
                  </div>
                )}
              </div>

              {/* PNG Output */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3>PNG Output Preview</h3>
                {pngDataUrl ? (
                  <>
                    <img src={pngDataUrl} alt="Output" style={{ maxWidth: '100%', height: '220px', display: 'block', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-glass-hover)', objectFit: 'contain' }} />
                    <button className="btn btn-primary mt-2" onClick={handleDownload} style={{ gap: '8px', width: '100%', justifyContent: 'center' }}>
                      <i className="fa-solid fa-download"></i> Download PNG
                    </button>
                  </>
                ) : (
                  <div style={{ width: '100%', height: '220px', border: '2px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    PNG generation will appear here
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="SVG to PNG Converter — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
