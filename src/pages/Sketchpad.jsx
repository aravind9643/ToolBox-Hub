import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function Sketchpad() {
  const [color, setColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('brush'); // 'brush' | 'eraser'
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color; // matching page bg for erase simulation or transparency if cleared
    // Actually, to make transparency work, drawing transparent ink is hard, but drawing with standard canvas composition works!
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';

    isDrawingRef.current = true;
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'sketch.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Adjust coordinates for mobile/touch events
  const startDrawingTouch = (e) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    startDrawing(touch);
  };

  const drawTouch = (e) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    draw(touch);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Sketchpad Drawing Board" description="Online sketch whiteboard tool to draw, sketch, sign document pages, and export transparent PNGs." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Sketchpad</span></div>
        <h1><i className="fa-solid fa-paintbrush" style={{ color: 'var(--accent-purple-light)' }}></i> Sketchpad Whiteboard</h1>
        <p>Sketch diagram ideas, write quick notes, and download transparent PNG image drawings.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Control Toolbox */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.2rem', fontSize: '0.75rem' }}>Brush Color</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 34, height: 34, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#d946ef', '#ffffff'].map(c => (
                    <button key={c} onClick={() => { setColor(c); setTool('brush'); }} style={{ width: 34, height: 34, background: c, borderRadius: 6, border: color === c && tool === 'brush' ? '2px solid var(--accent-purple-light)' : '1px solid var(--border-color)', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0, width: '130px' }}>
                <label className="form-label" style={{ marginBottom: '0.2rem', fontSize: '0.75rem' }}>Brush Size ({brushSize}px)</label>
                <input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button className={`btn ${tool === 'brush' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTool('brush')} style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-pen"></i> Draw
                </button>
                <button className={`btn ${tool === 'eraser' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTool('eraser')} style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-eraser"></i> Eraser
                </button>
              </div>
            </div>

            {/* Drawing Canvas Box */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <canvas 
                ref={canvasRef} 
                width="640" 
                height="360" 
                style={{
                  width: '100%', maxWidth: '640px', height: '360px',
                  background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                  borderRadius: '12px', display: 'block', cursor: 'crosshair',
                  touchAction: 'none'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawingTouch}
                onTouchMove={drawTouch}
                onTouchEnd={stopDrawing}
              />
            </div>

            {/* Actions group */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={downloadCanvas} style={{ gap: '8px' }}>
                <i className="fa-solid fa-download"></i> Save PNG
              </button>
              <button className="btn btn-secondary" onClick={clearCanvas} style={{ gap: '8px', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <i className="fa-solid fa-trash-can"></i> Clear Board
              </button>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Sketchpad Whiteboard — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
