import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function Compass() {
  const [heading, setHeading] = useState(0);
  const [direction, setDirection] = useState('N');
  const [requiresPermission, setRequiresPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [supportError, setSupportError] = useState('');
  const [simulatedHeading, setSimulatedHeading] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const gotAbsoluteRef = useRef(false);

  const getDirection = (degree) => {
    const sectors = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
    const index = Math.round(degree / 45) % 8;
    return sectors[index];
  };

  const handleOrientation = (event) => {
    // If we've already received absolute events, ignore relative event updates to prevent conflicting overrides
    if (event.type === 'deviceorientation' && gotAbsoluteRef.current) {
      return;
    }

    if (event.type === 'deviceorientationabsolute') {
      gotAbsoluteRef.current = true;
    }

    let headingDeg = 0;
    if (event.webkitCompassHeading !== undefined) {
      headingDeg = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      headingDeg = 360 - event.alpha;
    } else {
      return;
    }

    const rounded = Math.round(headingDeg);
    setHeading(rounded);
    setDirection(getDirection(rounded));
    setIsMobile(true);
  };

  useEffect(() => {
    // Detect mobile
    const checkMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      setRequiresPermission(true);
    } else {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      setPermissionGranted(true);
    }

    if (typeof window.DeviceOrientationEvent === 'undefined') {
      setSupportError('Device orientation sensors are not supported on this browser or device.');
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const requestiOSPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          setRequiresPermission(false);
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setSupportError('Permission to access device orientation was denied.');
        }
      } catch (err) {
        setSupportError('Error requesting device orientation permission: ' + err.message);
      }
    }
  };

  const currentHeading = isMobile ? heading : simulatedHeading;
  const currentDirection = getDirection(currentHeading);

  return (
    <div className="tool-page">
      <SEOHead title="Online Compass Tool" description="Premium real-time browser compass tool with device orientation tracking. Mobile-first responsive design." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Compass</span></div>
        <h1><i className="fa-solid fa-compass" style={{ color: 'var(--accent-purple-light)' }}></i> Device Compass</h1>
        <p>Real-time orientation compass dial using your device's orientation sensors.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem' }}>
            {supportError && !isMobile && (
              <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', color: 'var(--accent-amber)', fontSize: '0.8rem', marginBottom: '1.5rem', width: '100%', maxWidth: '440px' }}>
                <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>
                Desktop mode: Sensor unavailable. Using interactive manual simulator.
              </div>
            )}

            {/* Permission Prompt for iOS */}
            {requiresPermission && !permissionGranted && (
              <div style={{ marginBottom: '1.5rem', width: '100%', maxWidth: '400px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  iOS devices require permission to access motion and orientation sensors.
                </p>
                <button className="btn btn-primary" onClick={requestiOSPermission} style={{ margin: '0 auto' }}>
                  Enable Compass Sensors
                </button>
              </div>
            )}

            {/* Compass Dial Display Container */}
            <div style={{ position: 'relative', width: '250px', height: '250px', margin: '2rem 0' }}>
              
              {/* Outer Bezel */}
              <div style={{
                position: 'absolute', inset: -8, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--bg-glass-hover) 0%, var(--bg-input) 100%)',
                border: '2px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)'
              }} />

              {/* Static Indicator Notch (pointing straight DOWN at N) */}
              <div style={{
                position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)',
                width: 0, height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '14px solid var(--accent-pink)',
                zIndex: 10
              }} />

              {/* Rotating Compass Dial */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'radial-gradient(circle, var(--bg-secondary) 0%, var(--bg-input) 100%)',
                boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)',
                transform: `rotate(${-currentHeading}deg)`,
                transition: isMobile ? 'transform 0.15s ease-out' : 'transform 0.3s ease-out',
                overflow: 'hidden'
              }}>
                {/* Center Crosshair Grid */}
                <div style={{ position: 'absolute', top: '50%', left: '10px', right: '10px', height: '1px', background: 'var(--border-color)' }} />
                <div style={{ position: 'absolute', left: '50%', top: '10px', bottom: '10px', width: '1px', background: 'var(--border-color)' }} />

                {/* 24 Ticks (every 15 degrees) */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const degree = i * 15;
                  const isCardinal = degree % 90 === 0;
                  return (
                    <div key={degree} style={{
                      position: 'absolute', top: '50%', left: '50%',
                      width: isCardinal ? '2px' : '1px',
                      height: isCardinal ? '10px' : '5px',
                      background: isCardinal ? 'var(--accent-cyan-light)' : 'var(--text-muted)',
                      transform: `translate(-50%, -50%) rotate(${degree}deg) translateY(-112px)`,
                      transformOrigin: 'center center'
                    }} />
                  );
                })}

                {/* Cardinal direction labels */}
                {[
                  { label: 'N', degree: 0, color: 'var(--accent-red)' },
                  { label: 'E', degree: 90, color: 'var(--text-primary)' },
                  { label: 'S', degree: 180, color: 'var(--text-primary)' },
                  { label: 'W', degree: 270, color: 'var(--text-primary)' }
                ].map(({ label, degree, color }) => (
                  <div key={label} style={{
                    position: 'absolute', top: '50%', left: '50%',
                    fontWeight: 800, fontSize: '1.2rem', color,
                    transform: `translate(-50%, -50%) rotate(${degree}deg) translateY(-90px) rotate(${-degree}deg)`
                  }}>
                    {label}
                  </div>
                ))}

                {/* Degree numbers on the dial face */}
                {[30, 60, 120, 150, 210, 240, 300, 330].map(degree => (
                  <div key={degree} style={{
                    position: 'absolute', top: '50%', left: '50%',
                    fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)',
                    transform: `translate(-50%, -50%) rotate(${degree}deg) translateY(-90px) rotate(${-degree}deg)`
                  }}>
                    {degree}
                  </div>
                ))}

                {/* Center Core Cap */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: 'var(--bg-glass-hover)', border: '2px solid var(--border-color)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }} />
              </div>
            </div>

            {/* Readout stats */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {currentHeading}° <span style={{ color: 'var(--accent-purple-light)', fontSize: '2rem' }}>{currentDirection}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Current Heading
              </div>
            </div>

            {/* Simulator slider for non-mobile/desktop fallback */}
            {!isMobile && (
              <div style={{ width: '100%', maxWidth: '300px', marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>Drag to Simulate Orientation</label>
                <input type="range" min="0" max="359" value={simulatedHeading} onChange={e => setSimulatedHeading(Number(e.target.value))} />
              </div>
            )}

            <div style={{ marginTop: '2rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'left', width: '100%' }}>
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-cyan-light)', marginRight: '6px' }}></i>
              For best results on mobile, lay the device flat. Desktop users can interact via the slider above.
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Online Compass Tool — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
