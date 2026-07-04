import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function Sketchpad() {
  const [color, setColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(1.0);
  const [tool, setTool] = useState('brush'); // 'brush' | 'eraser' | 'line' | 'rectangle' | 'circle'
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const snapshotRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const blankState = canvas.toDataURL();
    setHistory([blankState]);
    setHistoryIndex(0);
  }, []);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const state = canvas.toDataURL();
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(state);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    startXRef.current = x;
    startYRef.current = y;
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
    ctx.globalAlpha = tool === 'eraser' ? 1.0 : opacity;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }

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

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.beginPath();
      if (tool === 'line') {
        ctx.moveTo(startXRef.current, startYRef.current);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === 'rectangle') {
        ctx.rect(startXRef.current, startYRef.current, x - startXRef.current, y - startYRef.current);
        ctx.stroke();
      } else if (tool === 'circle') {
        const radius = Math.hypot(x - startXRef.current, y - startYRef.current);
        ctx.arc(startXRef.current, startYRef.current, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      saveHistoryState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  };

  const undo = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      restoreHistoryState(idx);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      restoreHistoryState(idx);
    }
  };

  const restoreHistoryState = (idx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[idx];
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
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.2rem', fontSize: '0.75rem' }}>Brush Color</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 34, height: 34, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#d946ef', '#ffffff'].map(c => (
                    <button key={c} onClick={() => { setColor(c); if (tool === 'eraser') setTool('brush'); }} style={{ width: 34, height: 34, background: c, borderRadius: 6, border: color === c && tool !== 'eraser' ? '2px solid var(--accent-purple-light)' : '1px solid var(--border-color)', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0, width: '120px' }}>
                <label className="form-label" style={{ marginBottom: '0.2rem', fontSize: '0.75rem' }}>Size ({brushSize}px)</label>
                <input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div className="form-group" style={{ margin: 0, width: '100px' }}>
                <label className="form-label" style={{ marginBottom: '0.2rem', fontSize: '0.75rem' }}>Opacity ({Math.round(opacity * 100)}%)</label>
                <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={e => setOpacity(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'brush', icon: 'fa-pen', label: 'Draw' },
                  { id: 'eraser', icon: 'fa-eraser', label: 'Erase' },
                  { id: 'line', icon: 'fa-slash', label: 'Line' },
                  { id: 'rectangle', icon: 'fa-square', label: 'Rect' },
                  { id: 'circle', icon: 'fa-circle', label: 'Circle' }
                ].map(t => (
                  <button
                    key={t.id}
                    className={`btn ${tool === t.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTool(t.id)}
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', gap: '4px' }}
                  >
                    <i className={`fa-solid ${t.icon}`}></i> {t.label}
                  </button>
                ))}
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
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={undo} disabled={historyIndex <= 0} style={{ gap: '6px', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-rotate-left"></i> Undo
              </button>
              <button className="btn btn-secondary" onClick={redo} disabled={historyIndex >= history.length - 1} style={{ gap: '6px', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-rotate-right"></i> Redo
              </button>
              <button className="btn btn-primary" onClick={downloadCanvas} style={{ gap: '6px', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-download"></i> Save PNG
              </button>
              <button className="btn btn-secondary" onClick={clearCanvas} style={{ gap: '6px', fontSize: '0.85rem', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
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
