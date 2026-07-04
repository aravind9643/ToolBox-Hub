import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function MemeGenerator() {
  const [imageSrc, setImageSrc] = useState('');
  const [topText, setTopText] = useState('TOP TEXT');
  const [bottomText, setBottomText] = useState('BOTTOM TEXT');
  const [topTextPos, setTopTextPos] = useState({ x: 150, y: 40 });
  const [bottomTextPos, setBottomTextPos] = useState({ x: 150, y: 260 });
  const [activeDrag, setActiveDrag] = useState(null); // 'top' | 'bottom' | null
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!imageSrc) {
      // Clear canvas with prompt
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'var(--bg-input)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Choose or drag a photo below to generate a meme', canvas.width / 2, canvas.height / 2);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Render top text
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 5;
      ctx.textAlign = 'center';
      ctx.font = '900 28px Impact, sans-serif';

      ctx.strokeText(topText.toUpperCase(), topTextPos.x, topTextPos.y);
      ctx.fillText(topText.toUpperCase(), topTextPos.x, topTextPos.y);

      // Render bottom text
      ctx.strokeText(bottomText.toUpperCase(), bottomTextPos.x, bottomTextPos.y);
      ctx.fillText(bottomText.toUpperCase(), bottomTextPos.x, bottomTextPos.y);
    };
    img.src = imageSrc;
  };

  useEffect(() => {
    drawMeme();
  }, [imageSrc, topText, bottomText, topTextPos, bottomTextPos]);

  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check click hit distance
    const distTop = Math.hypot(mouseX - topTextPos.x, mouseY - topTextPos.y);
    const distBottom = Math.hypot(mouseX - bottomTextPos.x, mouseY - bottomTextPos.y);

    if (distTop < 40) {
      setActiveDrag('top');
    } else if (distBottom < 40) {
      setActiveDrag('bottom');
    }
  };

  const handleMouseMove = (e) => {
    if (!activeDrag || !imageSrc) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = Math.round(e.clientX - rect.left);
    const mouseY = Math.round(e.clientY - rect.top);

    if (activeDrag === 'top') {
      setTopTextPos({ x: mouseX, y: mouseY });
    } else if (activeDrag === 'bottom') {
      setBottomTextPos({ x: mouseX, y: mouseY });
    }
  };

  const handleMouseUp = () => {
    setActiveDrag(null);
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="tool-page">
      <SEOHead title="Meme Generator & Image Editor" description="Upload image templates, overlay custom top/bottom text with Impact font, drag-to-position, and download memes." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Meme Generator</span></div>
        <h1><i className="fa-solid fa-face-laugh-squint" style={{ color: 'var(--accent-purple-light)' }}></i> Meme Generator</h1>
        <p>Upload files and overlay captions. Drag text overlays directly on the image preview to position.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Upload Image Template</label>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="form-input" style={{ padding: '0.5rem' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Or Choose Template Preset</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Drake', url: 'https://api.memegen.link/images/drake.png' },
                    { label: 'Doge', url: 'https://api.memegen.link/images/doge.png' },
                    { label: 'Disaster', url: 'https://api.memegen.link/images/disastergirl.png' },
                    { label: 'Boyfriend', url: 'https://api.memegen.link/images/db.png' }
                  ].map(tpl => (
                    <button 
                      key={tpl.label} 
                      className="btn btn-secondary" 
                      style={{ padding: '0.45rem 0.5rem', fontSize: '0.75rem', flex: '1 1 40%', minWidth: '80px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                      onClick={() => {
                        setImageSrc(tpl.url);
                        setTopTextPos({ x: 150, y: 40 });
                        setBottomTextPos({ x: 150, y: 260 });
                      }}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid-2 mt-1">
              <div className="form-group">
                <label className="form-label">Top Caption Text</label>
                <input type="text" value={topText} onChange={e => setTopText(e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Bottom Caption Text</label>
                <input type="text" value={bottomText} onChange={e => setBottomText(e.target.value)} className="form-input" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
              <div style={{ position: 'relative', width: '300px', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                <canvas 
                  ref={canvasRef} 
                  width="300" 
                  height="300" 
                  style={{ display: 'block', cursor: activeDrag ? 'grabbing' : 'grab' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
            </div>

            <div className="btn-group" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={handleDownload} disabled={!imageSrc} style={{ gap: '8px' }}>
                <i className="fa-solid fa-download"></i> Download Meme
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setImageSrc('');
                setTopText('TOP TEXT');
                setBottomText('BOTTOM TEXT');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }} disabled={!imageSrc} style={{ gap: '8px' }}>
                <i className="fa-solid fa-trash-can"></i> Reset template
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-cyan-light)', marginRight: '6px' }}></i>
              Drag text labels directly on the preview image box to align and position your text perfectly.
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Meme Generator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
