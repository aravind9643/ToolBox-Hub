import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function SvgPngConverter() {
  const [svgContent, setSvgContent] = useState('');
  const [width, setWidth] = useState('512');
  const [height, setHeight] = useState('512');
  const [pngDataUrl, setPngDataUrl] = useState('');
  const [scale, setScale] = useState(1); // 1x, 2x, 4x DPI multiplier
  
  // Background Customization
  const [bgTransparent, setBgTransparent] = useState(true);
  const [bgColor, setBgColor] = useState('#ffffff');

  // Batch Queue
  const [batchQueue, setBatchQueue] = useState([]); // Array of { id, name, content, pngUrl }
  const canvasRef = useRef(null);

  // Parse width/height metadata from SVG string to auto-populate target sizes
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
      // failed to parse dim
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length === 1) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setSvgContent(text);
        autoDetectDimensions(text);
      };
      reader.readAsText(files[0]);
    } else {
      // Load into batch queue
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setBatchQueue(prev => [
            ...prev,
            {
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              content: event.target.result,
              pngUrl: ''
            }
          ]);
        };
        reader.readAsText(file);
      });
    }
  };

  const processQueueItem = (item, w, h, bgCol, isTrans, scaleFactor) => {
    return new Promise((resolve) => {
      const img = new Image();
      const svgBlob = new Blob([item.content], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const finalW = w * scaleFactor;
        const finalH = h * scaleFactor;

        canvas.width = finalW;
        canvas.height = finalH;

        if (!isTrans) {
          ctx.fillStyle = bgCol;
          ctx.fillRect(0, 0, finalW, finalH);
        } else {
          ctx.clearRect(0, 0, finalW, finalH);
        }

        ctx.drawImage(img, 0, 0, finalW, finalH);
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.src = url;
    });
  };

  // Trigger batch compilation for the queue
  const compileBatchQueue = async () => {
    const w = parseInt(width) || 512;
    const h = parseInt(height) || 512;
    const updated = [];
    for (let item of batchQueue) {
      const pngUrl = await processQueueItem(item, w, h, bgColor, bgTransparent, scale);
      updated.push({ ...item, pngUrl });
    }
    setBatchQueue(updated);
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
  }, [svgContent, width, height, scale, bgTransparent, bgColor]);

  const handleDownload = () => {
    if (!pngDataUrl) return;
    const link = document.createElement('a');
    link.download = 'vector_converted.png';
    link.href = pngDataUrl;
    link.click();
  };

  const handleDownloadQueueItem = (item) => {
    if (!item.pngUrl) return;
    const link = document.createElement('a');
    link.download = item.name.replace('.svg', '.png');
    link.href = item.pngUrl;
    link.click();
  };

  return (
    <div className="tool-page">
      <SEOHead title="SVG to PNG Converter" description="Convert single or batch SVG vector files into high-resolution PNG raster images with custom transparent backdrops and DPI scales." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>SVG to PNG</span></div>
        <h1><i className="fa-solid fa-file-export" style={{ color: 'var(--accent-purple-light)' }}></i> SVG to PNG Converter</h1>
        <p>Convert vector SVG files into high-definition transparent or color-filled PNG images.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Upload Zone */}
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Upload SVG File(s)</label>
                <input type="file" accept=".svg" multiple onChange={handleFileUpload} className="form-input" style={{ padding: '0.5rem' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Tip: Select multiple files to trigger batch queue mode.</span>
              </div>
              <div className="form-group">
                <label className="form-label">Or Paste SVG Code</label>
                <textarea className="form-textarea" rows="1" value={svgContent} onChange={e => {
                  setSvgContent(e.target.value);
                  autoDetectDimensions(e.target.value);
                }} placeholder="<svg>...</svg>" style={{ minHeight: '44px', padding: '0.65rem' }} />
              </div>
            </div>

            {/* Customization Options Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Width (px)</label>
                <input type="number" className="form-input" value={width} onChange={e => setWidth(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Height (px)</label>
                <input type="number" className="form-input" value={height} onChange={e => setHeight(e.target.value)} />
              </div>
              
              {/* DPI Scale Multipliers */}
              <div className="form-group">
                <label className="form-label">Resolution Scale</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 4].map(s => (
                    <button 
                      key={s} 
                      className={`btn btn-sm ${scale === s ? 'btn-primary' : 'btn-secondary'}`} 
                      onClick={() => setScale(s)}
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color Picker */}
              <div className="form-group">
                <label className="form-label">Background</label>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button 
                    className={`btn btn-sm ${bgTransparent ? 'btn-primary' : 'btn-secondary'}`} 
                    onClick={() => setBgTransparent(!bgTransparent)}
                    style={{ fontSize: '0.72rem', padding: '0.4rem 0.5rem', whiteSpace: 'nowrap' }}
                  >
                    {bgTransparent ? 'Transparent' : 'Solid'}
                  </button>
                  {!bgTransparent && (
                    <input 
                      type="color" 
                      value={bgColor} 
                      onChange={e => setBgColor(e.target.value)} 
                      style={{ width: '38px', height: '34px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', padding: 0 }} 
                    />
                  )}
                </div>
              </div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Render single item mode vs Batch queue mode */}
            {batchQueue.length > 0 ? (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Batch Conversion Queue ({batchQueue.length} files)</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={compileBatchQueue}>
                      <i className="fa-solid fa-gears"></i> Process All
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setBatchQueue([])} style={{ color: 'var(--accent-red)' }}>
                      Clear Queue
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {batchQueue.map((item, idx) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                      <span><strong>#{idx + 1}</strong>: {item.name}</span>
                      <div>
                        {item.pngUrl ? (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadQueueItem(item)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', gap: '4px' }}>
                            <i className="fa-solid fa-download"></i> Download PNG
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Ready to process</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', marginTop: '1.5rem' }}>
                {/* SVG Preview */}
                <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3>SVG Source Preview</h3>
                  {svgContent ? (
                    <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgTransparent ? 'var(--bg-glass-hover)' : bgColor, border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '220px', border: '2px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      Paste SVG code or drop file to preview...
                    </div>
                  )}
                </div>

                {/* PNG Output */}
                <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3>PNG Output Preview ({width * scale} x {height * scale} px)</h3>
                  {pngDataUrl ? (
                    <>
                      <img src={pngDataUrl} alt="Output" style={{ maxWidth: '100%', height: '220px', display: 'block', border: '1px solid var(--border-color)', borderRadius: '12px', background: bgTransparent ? 'var(--bg-glass-hover)' : bgColor, objectFit: 'contain' }} />
                      <button className="btn btn-primary mt-2" onClick={handleDownload} style={{ gap: '8px', width: '100%', justifyContent: 'center' }}>
                        <i className="fa-solid fa-download"></i> Download PNG
                      </button>
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '220px', border: '2px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      PNG preview will generate automatically
                    </div>
                  )}
                </div>
              </div>
            )}

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
