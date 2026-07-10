import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function BubbleLevel() {
  const [pitch, setPitch] = useState(0); // Beta (front/back tilt)
  const [roll, setRoll] = useState(0);   // Gamma (left/right tilt)
  const [isMobile, setIsMobile] = useState(false);
  const [requiresPermission, setRequiresPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [supportError, setSupportError] = useState('');
  
  // Custom features
  const [useSimulation, setUseSimulation] = useState(false);
  const [calibration, setCalibration] = useState({ pitch: 0, roll: 0 });
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Audio state/ref
  const audioCtxRef = useRef(null);

  // Desktop Simulation values
  const [simulatedPitch, setSimulatedPitch] = useState(0);
  const [simulatedRoll, setSimulatedRoll] = useState(0);

  const handleOrientation = (event) => {
    if (useSimulation) return;
    setPitch(Math.round(event.beta || 0));
    setRoll(Math.round(event.gamma || 0));
    setIsMobile(true);
  };

  useEffect(() => {
    const checkMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      setRequiresPermission(true);
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
      setPermissionGranted(true);
    }

    if (typeof window.DeviceOrientationEvent === 'undefined') {
      setSupportError('Orientation sensors not detected on this browser.');
      setUseSimulation(true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [useSimulation]);

  const requestiOSPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          setRequiresPermission(false);
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setSupportError('Sensor access permission was denied.');
        }
      } catch (err) {
        setSupportError('Error requesting permission: ' + err.message);
      }
    }
  };

  const rawPitch = useSimulation ? simulatedPitch : pitch;
  const rawRoll = useSimulation ? simulatedRoll : roll;

  // Apply calibration offsets
  const currentPitch = rawPitch - calibration.pitch;
  const currentRoll = rawRoll - calibration.roll;

  const isLevel = Math.abs(currentPitch) <= 1 && Math.abs(currentRoll) <= 1;

  // Visual offsets logic (with safe bounds to prevent bubble cutoff)
  const maxVisualTilt = 20;
  const bubbleOffsetX = Math.max(-1, Math.min(1, currentRoll / maxVisualTilt)) * 60;
  const bubbleOffsetY = Math.max(-1, Math.min(1, currentPitch / maxVisualTilt)) * 60;
  
  // 1D tube bubble offsets (container center is 0. Maximum safe travel offset is 80px)
  const horizBubbleTranslateX = Math.max(-1, Math.min(1, currentRoll / maxVisualTilt)) * 80;
  const vertBubbleTranslateY = Math.max(-1, Math.min(1, currentPitch / maxVisualTilt)) * 80;

  // Audio feedback trigger
  useEffect(() => {
    if (isLevel && soundEnabled) {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) {
        // ignore audio errors
      }
    }

    if (isLevel && navigator.vibrate) {
      navigator.vibrate(80);
    }
  }, [isLevel, soundEnabled]);

  const handleCalibrate = () => {
    setCalibration({ pitch: rawPitch, roll: rawRoll });
  };

  const handleResetCalibration = () => {
    setCalibration({ pitch: 0, roll: 0 });
  };

  return (
    <div className="tool-page">
      <SEOHead title="2D Bubble Level & Slope Finder" description="Use device sensors to calculate surfaces inclination pitch and roll slope degrees with offline level tools." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Bubble Level</span></div>
        <h1><i className="fa-solid fa-arrows-to-circle" style={{ color: 'var(--accent-green)' }}></i> 2D Bubble Level</h1>
        <p>Audit surfaces flatness, measure exact slope inclinations, and check tilt angles client-side.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
            
            {/* Status alerts */}
            {useSimulation ? (
              <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-md)', color: 'var(--accent-cyan-light)', fontSize: '0.8rem', marginBottom: '1.5rem', width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                <span>🎮 Manual Simulation mode active. Drag sliders below.</span>
                {!supportError && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setUseSimulation(false)} style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                    Switch to Sensors
                  </button>
                )}
              </div>
            ) : (
              <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', color: 'var(--accent-green)', fontSize: '0.8rem', marginBottom: '1.5rem', width: '100%', textAlign: 'center' }}>
                📡 Live Device Sensors active.
              </div>
            )}

            {requiresPermission && !permissionGranted && (
              <div style={{ marginBottom: '1.5rem', width: '100%', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  iOS devices require motion sensors permission to calculate device inclination.
                </p>
                <button className="btn btn-primary btn-sm" onClick={requestiOSPermission}>
                  Enable Motion Sensors
                </button>
              </div>
            )}

            {/* Level Controls & Audio Toggle */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className={`btn btn-sm ${soundEnabled ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSoundEnabled(!soundEnabled)} style={{ gap: '6px' }}>
                <i className={`fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i> {soundEnabled ? 'Audio Beep On' : 'Audio Beep Muted'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleCalibrate} style={{ gap: '6px' }}>
                <i className="fa-solid fa-compress"></i> Set Zero Reference
              </button>
              {(calibration.pitch !== 0 || calibration.roll !== 0) && (
                <button className="btn btn-secondary btn-sm" onClick={handleResetCalibration} style={{ gap: '6px', color: 'var(--accent-red)' }}>
                  <i className="fa-solid fa-rotate-left"></i> Reset
                </button>
              )}
            </div>

            {/* Combined Level System Layout (Horizontal Tube, Circular Level, Vertical Tube) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1.5rem 0' }}>
              
              {/* Left Column: Horizontal Tube centered over Circular Dial */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                
                {/* Horizontal Tube level */}
                <div style={{
                  width: '200px', height: '24px', borderRadius: '12px',
                  background: 'var(--bg-input)', border: `2px solid ${isLevel ? 'var(--accent-green)' : 'var(--border-color)'}`,
                  boxShadow: isLevel ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none',
                  position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '28px', height: '100%', borderLeft: '1px dashed var(--border-color)', borderRight: '1px dashed var(--border-color)', opacity: 0.5 }} />
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '90px', // exact center (200/2 - 20/2)
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: isLevel ? 'var(--accent-green)' : 'var(--accent-cyan-light)',
                    border: '1.5px solid #fff',
                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
                    transform: `translateX(${horizBubbleTranslateX}px)`,
                    transition: isMobile ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out'
                  }} />
                </div>

                {/* Main Circular 2D Level */}
                <div style={{
                  position: 'relative',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: isLevel ? 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 30%, var(--bg-secondary) 100%)' : 'radial-gradient(circle, var(--bg-secondary) 30%, var(--bg-input) 100%)',
                  border: `4px solid ${isLevel ? 'var(--accent-green)' : 'var(--border-color)'}`,
                  boxShadow: isLevel ? '0 0 25px rgba(16, 185, 129, 0.45)' : 'inset 0 4px 10px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute', width: '38px', height: '38px', borderRadius: '50%',
                    border: `2px dashed ${isLevel ? 'var(--accent-green)' : 'var(--accent-cyan-light)'}`,
                    opacity: 0.8
                  }} />
                  <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'var(--border-color)', opacity: 0.3 }} />
                  <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'var(--border-color)', opacity: 0.3 }} />

                  {/* Liquid bubble */}
                  <div style={{
                    position: 'absolute',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: isLevel ? 'radial-gradient(circle, #fff 0%, #22c55e 100%)' : 'radial-gradient(circle, #f0fdf4 0%, var(--accent-cyan-light) 100%)',
                    border: '2px solid #fff',
                    boxShadow: isLevel ? '0 0 15px #22c55e' : '0 0 10px rgba(6, 182, 212, 0.5)',
                    transform: `translate(${bubbleOffsetX}px, ${bubbleOffsetY}px)`,
                    transition: isMobile ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out'
                  }} />
                </div>

              </div>

              {/* Right Side: Vertical Tube aligned with Circular Level */}
              <div style={{
                width: '24px', height: '200px', borderRadius: '12px',
                background: 'var(--bg-input)', border: `2px solid ${isLevel ? 'var(--accent-green)' : 'var(--border-color)'}`,
                boxShadow: isLevel ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none',
                position: 'relative', overflow: 'hidden',
                marginTop: '44px' // exactly offsets the horizontal tube height + gap above
              }}>
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', height: '28px', width: '100%', borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', opacity: 0.5 }} />
                <div style={{
                  position: 'absolute',
                  left: '0px',
                  top: '90px', // exact center (200/2 - 20/2)
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: isLevel ? 'var(--accent-green)' : 'var(--accent-cyan-light)',
                  border: '1.5px solid #fff',
                  boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
                  transform: `translateY(${vertBubbleTranslateY}px)`,
                  transition: isMobile ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out'
                }} />
              </div>

            </div>

            {/* Calibration details alert banner */}
            {(calibration.pitch !== 0 || calibration.roll !== 0) && (
              <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: 'var(--accent-cyan-light)', background: 'var(--bg-glass-hover)', border: '1px solid var(--border-color)', borderRadius: '4px', marginBottom: '0.75rem' }}>
                ⚙️ Calibrated Offset: Pitch={calibration.pitch}°, Roll={calibration.roll}°
              </div>
            )}

            {/* Tilt readout meters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', maxWidth: '300px', textAlign: 'center', marginTop: '0.5rem' }}>
              <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Roll (Left/Right)</div>
                <strong style={{ fontSize: '1.4rem', color: Math.abs(currentRoll) < 2 ? 'var(--accent-green)' : 'var(--text-primary)' }}>{currentRoll}°</strong>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pitch (Front/Back)</div>
                <strong style={{ fontSize: '1.4rem', color: Math.abs(currentPitch) < 2 ? 'var(--accent-green)' : 'var(--text-primary)' }}>{currentPitch}°</strong>
              </div>
            </div>

          </div>

          {/* Orientation Simulator Sliders */}
          <div className="glass-card mt-2" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}><i className="fa-solid fa-sliders" style={{ marginRight: '6px' }}></i> Orientation Simulator</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <label>Roll (X-axis)</label>
                  <span>{simulatedRoll}°</span>
                </div>
                <input 
                  type="range" 
                  min="-90" 
                  max="90" 
                  value={simulatedRoll} 
                  onChange={e => {
                    setSimulatedRoll(Number(e.target.value));
                    setUseSimulation(true);
                  }} 
                  style={{ width: '100%' }} 
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <label>Pitch (Y-axis)</label>
                  <span>{simulatedPitch}°</span>
                </div>
                <input 
                  type="range" 
                  min="-180" 
                  max="180" 
                  value={simulatedPitch} 
                  onChange={e => {
                    setSimulatedPitch(Number(e.target.value));
                    setUseSimulation(true);
                  }} 
                  style={{ width: '100%' }} 
                />
              </div>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Online 2D Bubble Level — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
