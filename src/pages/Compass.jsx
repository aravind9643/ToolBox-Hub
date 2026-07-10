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
  const [isMobile, setIsMobile] = useState(false);

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
  const currentDirection = get16PointWindDirection(currentHeading);

  const delta = lockedHeading !== null ? ((currentHeading - lockedHeading + 180 + 360) % 360 - 180) : 0;

  return (
    <div className="tool-page">
      <SEOHead title="Online Compass & GPS Coordinates Finder" description="Interactive device orientation compass dial with real-time degrees and live GPS coordinates telemetry." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Compass</span></div>
        <h1><i className="fa-solid fa-compass" style={{ color: 'var(--accent-purple-light)' }}></i> Compass</h1>
        <p>Real-time orientation dial, course tracking lock, and GPS coordinates telemetry.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Left Card: Heading & Dial */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              {supportError && !isMobile && (
                <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', color: 'var(--accent-amber)', fontSize: '0.8rem', marginBottom: '1.5rem', width: '100%', textAlign: 'center' }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>
                  Sensor simulation mode. Drag slider below to rotate dial.
                </div>
              )}

              {requiresPermission && !permissionGranted && (
                <div style={{ marginBottom: '1.5rem', width: '100%', textAlign: 'center' }}>
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

              {/* Readouts */}
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

            {/* Right Card: GPS Telemetry */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 600 }}>
                <i className="fa-solid fa-location-crosshairs" style={{ color: 'var(--accent-cyan-light)', marginRight: '6px' }}></i> GPS Telemetry
              </h3>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Coordinates Status</span>
                  <button className="btn btn-secondary btn-sm" onClick={getGPSLocation} disabled={gpsLoading} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                    <i className="fa-solid fa-arrows-rotate" style={{ marginRight: '4px' }}></i> Refresh
                  </button>
                </div>
                
                {gpsData ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                    <div style={{ background: 'var(--bg-input)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Latitude</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{gpsData.lat}°</div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Longitude</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{gpsData.lng}°</div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Altitude</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{gpsData.alt}</div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Accuracy Margin</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{gpsData.acc}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                    {gpsLoading ? 'Retrieving coordinates...' : 'Coordinates not loaded.'}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Simulator slider */}
          {!isMobile && (
            <div className="glass-card mt-2" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}><i className="fa-solid fa-sliders" style={{ marginRight: '6px' }}></i> Rotation Simulator</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <label>Simulate Rotation (Heading)</label>
                  <span>{simulatedHeading}°</span>
                </div>
                <input type="range" min="0" max="359" value={simulatedHeading} onChange={e => setSimulatedHeading(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>
          )}

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Online Compass — ToolBox Hub" />
          </div>
        </div>
      </div>
    </div>
  );
}
