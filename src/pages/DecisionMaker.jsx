import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function DecisionMaker() {
  const [activeTab, setActiveTab] = useState('wheel');

  // Spin Wheel states
  const [optionsText, setOptionsText] = useState('Pizza\nBurgers\nSushi\nTacos\nSalad');
  const [winner, setWinner] = useState('');
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef(null);
  const angleRef = useRef(0);

  // Coin states
  const [coinResult, setCoinResult] = useState('');
  const [flipping, setFlipping] = useState(false);

  // Dice states
  const [diceCount, setDiceCount] = useState(1);
  const [diceResults, setDiceResults] = useState([6]);
  const [rolling, setRolling] = useState(false);

  const options = optionsText.split('\n').map(o => o.trim()).filter(Boolean);

  // Draw spin wheel
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const center = w / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, w, h);

    if (options.length === 0) {
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'var(--bg-input)';
      ctx.fill();
      ctx.strokeStyle = 'var(--border-color)';
      ctx.stroke();
      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Enter options to draw wheel', center, center);
      return;
    }

    const arcSize = (2 * Math.PI) / options.length;
    const colors = ['#3b82f6', '#d946ef', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

    options.forEach((opt, i) => {
      const angle = angleRef.current + i * arcSize;
      ctx.beginPath();
      ctx.arc(center, center, radius, angle, angle + arcSize);
      ctx.lineTo(center, center);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.stroke();

      // Draw Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arcSize / 2);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(opt.length > 10 ? opt.substring(0, 9) + '..' : opt, radius - 15, 4);
      ctx.restore();
    });

    // Arrow pointer
    ctx.beginPath();
    ctx.moveTo(w - 5, center);
    ctx.lineTo(w - 20, center - 10);
    ctx.lineTo(w - 20, center + 10);
    ctx.closePath();
    ctx.fillStyle = 'var(--accent-pink)';
    ctx.fill();
  };

  useEffect(() => {
    if (activeTab === 'wheel') drawWheel();
  }, [optionsText, activeTab]);

  const spinWheel = () => {
    if (spinning || options.length === 0) return;
    setSpinning(true);
    setWinner('');

    let speed = Math.random() * 0.4 + 0.3; // initial rotation speed
    const friction = 0.985; // deceleration speed

    const animate = () => {
      if (speed < 0.002) {
        setSpinning(false);
        // Calculate winner
        const arcSize = (2 * Math.PI) / options.length;
        // The pointer is at angle 0 (3 o'clock / East). 
        // Need to find which segment covers the 0-angle.
        // segment index = Math.floor((2*Math.PI - (rotationAngle % 2*Math.PI)) / arcSize)
        const normalizedAngle = (2 * Math.PI - (angleRef.current % (2 * Math.PI))) % (2 * Math.PI);
        const winIdx = Math.floor(normalizedAngle / arcSize);
        setWinner(options[winIdx]);
        return;
      }

      angleRef.current += speed;
      speed *= friction;
      drawWheel();
      requestAnimationFrame(animate);
    };

    animate();
  };

  // Flip Coin
  const flipCoin = () => {
    if (flipping) return;
    setFlipping(true);
    setCoinResult('');

    setTimeout(() => {
      const res = Math.random() < 0.5 ? 'Heads' : 'Tails';
      setCoinResult(res);
      setFlipping(false);
    }, 1200);
  };

  // Roll Dice
  const rollDice = () => {
    if (rolling) return;
    setRolling(true);

    const interval = setInterval(() => {
      setDiceResults(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      setDiceResults(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
      setRolling(false);
    }, 1000);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Random Decision Maker (Wheel Spinner & Dice)" description="Spin a decision wheel, flip a coin, or roll dice client-side. Make selections and choices randomly." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Decision Maker</span></div>
        <h1><i className="fa-solid fa-dice" style={{ color: 'var(--accent-purple-light)' }}></i> Random Decision Maker</h1>
        <p>Can't decide? Let random chance pick for you with interactive wheels, coins, and dice.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab-btn ${activeTab === 'wheel' ? 'active' : ''}`} onClick={() => setActiveTab('wheel')}>
              <i className="fa-solid fa-spinner" style={{ marginRight: '6px' }}></i> Spin the Wheel
            </button>
            <button className={`tab-btn ${activeTab === 'coin' ? 'active' : ''}`} onClick={() => setActiveTab('coin')}>
              <i className="fa-solid fa-circle-dollar-to-slot" style={{ marginRight: '6px' }}></i> Flip a Coin
            </button>
            <button className={`tab-btn ${activeTab === 'dice' ? 'active' : ''}`} onClick={() => setActiveTab('dice')}>
              <i className="fa-solid fa-dice" style={{ marginRight: '6px' }}></i> Roll Dice
            </button>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            {activeTab === 'wheel' && (
              <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', alignItems: 'stretch' }}>
                {/* Inputs */}
                <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <label className="form-label">Wheel Choices (One per line)</label>
                  <textarea className="form-textarea" rows="8" value={optionsText} onChange={e => setOptionsText(e.target.value)} style={{ flex: 1 }} disabled={spinning} />
                </div>

                {/* Display Wheel */}
                <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                    <canvas ref={canvasRef} width="220" height="220" style={{ borderRadius: '50%', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }} />
                  </div>
                  <button className="btn btn-primary mt-2" onClick={spinWheel} disabled={spinning || options.length === 0} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-rotate"></i> Spin Wheel
                  </button>

                  {winner && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selected Winner</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>🏆 {winner}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'coin' && (
              <div style={{ padding: '2rem 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '130px', height: '130px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: '6px double #fff3', color: 'white', fontSize: '1.4rem', fontWeight: 800, boxShadow: 'var(--shadow-lg)', animation: flipping ? 'spin 0.15s linear infinite' : 'none', textShadow: '0 2px 4px rgba(0,0,0,0.3)', cursor: 'pointer' }} onClick={flipCoin}>
                  {coinResult || (flipping ? '?' : 'FLIP')}
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <button className="btn btn-primary" onClick={flipCoin} disabled={flipping} style={{ gap: '8px', margin: '0 auto' }}>
                    <i className="fa-solid fa-coins"></i> Flip Coin
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'dice' && (
              <div style={{ padding: '2rem 0' }}>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dice Count:</span>
                  {[1, 2, 3].map(n => (
                    <button key={n} className={`copy-btn ${diceCount === n ? 'active' : ''}`} onClick={() => { setDiceCount(n); setDiceResults(Array(n).fill(6)); }} disabled={rolling} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      {n}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', height: '80px', alignItems: 'center', marginBottom: '1.5rem' }}>
                  {diceResults.map((val, i) => (
                    <div key={i} style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--bg-input)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple-light)', boxShadow: 'var(--shadow-md)' }}>
                      {val}
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary" onClick={rollDice} disabled={rolling} style={{ gap: '8px', margin: '0 auto' }}>
                  <i className="fa-solid fa-dice"></i> Roll Dice
                </button>

                {!rolling && diceResults.length > 1 && (
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '1.25rem' }}>
                    Sum Total: <span style={{ color: 'var(--accent-cyan-light)' }}>{diceResults.reduce((a, b) => a + b, 0)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
