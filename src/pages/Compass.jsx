import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function Compass() {
  const [heading, setHeading] = useState(0);
  const [requiresPermission, setRequiresPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [supportError, setSupportError] = useState('');
  const [simulatedHeading, setSimulatedHeading] = useState(0);
  const [simulatedPitch, setSimulatedPitch] = useState(0);
  const [simulatedRoll, setSimulatedRoll] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Spirit Level states
  const [pitch, setPitch] = useState(0); // Beta (front/back tilt)
  const [roll, setRoll] = useState(0);   // Gamma (left/right tilt)

  // GPS Telemetry states
  const [gpsData, setGpsData] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const gotAbsoluteRef = useRef(false);

  const get16PointWindDirection = (degree) => {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'
    ];
    const index = Math.round(degree / 22.5) % 16;
    return directions[index];
  };

  const handleOrientation = (event) => {
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
    setPitch(Math.round(event.beta || 0));
    setRoll(Math.round(event.gamma || 0));
    setIsMobile(true);
  };

  const getGPSLocation = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsData({
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5),
          alt: pos.coords.altitude ? `${pos.coords.altitude.toFixed(1)} m` : 'N/A',
          acc: `${pos.coords.accuracy.toFixed(1)} m`
        });
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
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
      setSupportError('Orientation sensors not detected on this browser.');
    }

    // Grab initial GPS telemetry
    getGPSLocation();

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

  const [lockedHeading, setLockedHeading] = useState(null);

  const currentHeading = isMobile ? heading : simulatedHeading;
  const currentPitch = isMobile ? pitch : simulatedPitch;
  const currentRoll = isMobile ? roll : simulatedRoll;
  const currentDirection = get16PointWindDirection(currentHeading);

  const delta = lockedHeading !== null ? ((currentHeading - lockedHeading + 180 + 360) % 360 - 180) : 0;

  // Spirit Level bubble offset math (clamp to +/- 20 degrees for visual boundary)
  const maxVisualTilt = 20;
  const bubbleOffsetX = Math.max(-1, Math.min(1, currentRoll / maxVisualTilt)) * 40;
  const bubbleOffsetY = Math.max(-1, Math.min(1, currentPitch / maxVisualTilt)) * 40;

  return (
    <div className="tool-page">
      <SEOHead title="Online Compass & Bubble Level" description="Interactive device compass with built-in pitch/roll spirit bubble levels and GPS location coordinates." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Compass</span></div>
        <h1><i className="fa-solid fa-compass" style={{ color: 'var(--accent-purple-light)' }}></i> Compass & Level</h1>
        <p>Real-time orientation dial, 2D spirit slope level, and GPS coordinates telemetry.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Left Card: Heading & Dial */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              {supportError && !isMobile && (
                <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', color: 'var(--accent-amber)', fontSize: '0.8rem', marginBottom: '1.5rem', width: '100%' }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>
                  Sensor simulation mode. Drag sliders below to rotate dial.
                </div>
              )}

              {requiresPermission && !permissionGranted && (
                <div style={{ marginBottom: '1.5rem', width: '100%' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    iOS devices require motion permission for compass features.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={requestiOSPermission}>
                    Enable Motion Sensors
                  </button>
                </div>
              )}

              {/* Compass Dial */}
              <div style={{ position: 'relative', width: '220px', height: '220px', margin: '1rem 0' }}>
                <div style={{
                  position: 'absolute', inset: -6, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--bg-glass-hover) 0%, var(--bg-input) 100%)',
                  border: '2px solid var(--border-color)',
                  boxShadow: 'var(--shadow-lg)'
                }} />

                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '12px solid var(--accent-pink)',
                  zIndex: 10
                }} />

                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'radial-gradient(circle, var(--bg-secondary) 0%, var(--bg-input) 100%)',
                  transform: `rotate(${-currentHeading}deg)`,
                  transition: isMobile ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: '50%', left: '8px', right: '8px', height: '1px', background: 'var(--border-color)' }} />
                  <div style={{ position: 'absolute', left: '50%', top: '8px', bottom: '8px', width: '1px', background: 'var(--border-color)' }} />

                  {lockedHeading !== null && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: 'var(--accent-cyan-light)',
                      border: '1px solid #fff',
                      boxShadow: '0 0 6px var(--accent-cyan-light)',
                      transform: `translate(-50%, -50%) rotate(${lockedHeading}deg) translateY(-98px)`,
                      transformOrigin: 'center center',
                      zIndex: 8
                    }} />
                  )}

                  {Array.from({ length: 24 }).map((_, i) => {
                    const degree = i * 15;
                    const isCardinal = degree % 90 === 0;
                    return (
                      <div key={degree} style={{
                        position: 'absolute', top: '50%', left: '50%',
                        width: isCardinal ? '2px' : '1px',
                        height: isCardinal ? '8px' : '4px',
                        background: isCardinal ? 'var(--accent-cyan-light)' : 'var(--text-muted)',
                        transform: `translate(-50%, -50%) rotate(${degree}deg) translateY(-98px)`,
                        transformOrigin: 'center center'
                      }} />
                    );
                  })}

                  {[
                    { label: 'N', degree: 0, color: 'var(--accent-red)' },
                    { label: 'E', degree: 90, color: 'var(--text-primary)' },
                    { label: 'S', degree: 180, color: 'var(--text-primary)' },
                    { label: 'W', degree: 270, color: 'var(--text-primary)' }
                  ].map(({ label, degree, color }) => (
                    <div key={label} style={{
                      position: 'absolute', top: '50%', left: '50%',
                      fontWeight: 800, fontSize: '1.1rem', color,
                      transform: `translate(-50%, -50%) rotate(${degree}deg) translateY(-80px) rotate(${-degree}deg)`
                    }}>
                      {label}
                    </div>
                  ))}

                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: 'var(--bg-glass-hover)', border: '2px solid var(--border-color)',
                  }} />
                </div>
              </div>

              {/* Course lock and numeric readout */}
              <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {currentHeading}° <span style={{ color: 'var(--accent-purple-light)', fontSize: '1.8rem' }}>{currentDirection}</span>
                </div>
                
                {lockedHeading !== null && (
                  <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.75rem', background: 'var(--bg-glass-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                      <span>Locked Course: <strong>{lockedHeading}°</strong></span>
                      <span style={{ color: Math.abs(delta) <= 5 ? 'var(--accent-green)' : 'var(--accent-pink)' }}>
                        <strong>{delta > 0 ? `+${delta}` : delta}°</strong>
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, marginTop: '0.2rem', color: Math.abs(delta) <= 5 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                      {Math.abs(delta) <= 5 ? '🎯 ON COURSE' : (delta > 0 ? '👈 TURN LEFT' : '👉 TURN RIGHT')}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '0.75rem' }}>
                  {lockedHeading === null ? (
                    <button className="btn btn-secondary btn-sm" onClick={() => setLockedHeading(currentHeading)} style={{ gap: '6px' }}>
                      <i className="fa-solid fa-lock"></i> Lock Course
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => setLockedHeading(null)} style={{ gap: '6px', color: 'var(--accent-red)' }}>
                      <i className="fa-solid fa-lock-open"></i> Unlock Course
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Card: 2D Spirit Level & Telemetry */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}><i className="fa-solid fa-arrows-to-circle" style={{ color: 'var(--accent-green)', marginRight: '6px' }}></i> 2D Bubble Level</h3>

              {/* Bubble Level Container */}
              <div style={{
                position: 'relative',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--bg-secondary) 30%, var(--bg-input) 100%)',
                border: '3px solid var(--border-color)',
                boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.15)',
                margin: '0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {/* Center target circle */}
                <div style={{
                  position: 'absolute',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '2px dashed var(--accent-cyan-light)',
                  opacity: 0.6
                }} />

                {/* Level Grid Crosshairs */}
                <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'var(--border-color)', opacity: 0.4 }} />
                <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'var(--border-color)', opacity: 0.4 }} />

                {/* Animated Level Bubble */}
                <div style={{
                  position: 'absolute',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #f0fdf4 0%, var(--accent-green) 100%)',
                  border: '2px solid #fff',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
                  transform: `translate(${bubbleOffsetX}px, ${bubbleOffsetY}px)`,
                  transition: isMobile ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out'
                }} />
              </div>

              {/* Slope Degrees */}
              <div style={{ marginTop: '0.75rem', width: '100%', display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Roll (X)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: Math.abs(currentRoll) < 2 ? 'var(--accent-green)' : 'var(--text-primary)' }}>{currentRoll}°</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Pitch (Y)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: Math.abs(currentPitch) < 2 ? 'var(--accent-green)' : 'var(--text-primary)' }}>{currentPitch}°</div>
                </div>
              </div>

              {/* GPS Telemetry Grid */}
              <div style={{ marginTop: '1.5rem', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>GPS Telemetry</span>
                  <button className="btn btn-secondary btn-sm" onClick={getGPSLocation} disabled={gpsLoading} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                    <i className="fa-solid fa-arrows-rotate" style={{ marginRight: '4px' }}></i> Refresh
                  </button>
                </div>
                
                {gpsData ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <div style={{ background: 'var(--bg-input)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ color: 'var(--text-muted)' }}>Latitude</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{gpsData.lat}°</div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ color: 'var(--text-muted)' }}>Longitude</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{gpsData.lng}°</div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ color: 'var(--text-muted)' }}>Altitude</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{gpsData.alt}</div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ color: 'var(--text-muted)' }}>Accuracy</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{gpsData.acc}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem' }}>
                    {gpsLoading ? 'Retrieving coordinates...' : 'Coordinates not loaded.'}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Fallback Simulator Sliders */}
          {!isMobile && (
            <div className="glass-card mt-2" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}><i className="fa-solid fa-sliders" style={{ marginRight: '6px' }}></i> Orientation Simulator (Desktop Fallback)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <label>Simulate Rotation (Heading)</label>
                    <span>{simulatedHeading}°</span>
                  </div>
                  <input type="range" min="0" max="359" value={simulatedHeading} onChange={e => setSimulatedHeading(Number(e.target.value))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <label>Simulate Roll (X-axis)</label>
                      <span>{simulatedRoll}°</span>
                    </div>
                    <input type="range" min="-90" max="90" value={simulatedRoll} onChange={e => setSimulatedRoll(Number(e.target.value))} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <label>Simulate Pitch (Y-axis)</label>
                      <span>{simulatedPitch}°</span>
                    </div>
                    <input type="range" min="-180" max="180" value={simulatedPitch} onChange={e => setSimulatedPitch(Number(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Online Compass & Level — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
