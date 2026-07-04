import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function Speedometer() {
  const [speedMs, setSpeedMs] = useState(0); // speed in m/s
  const [maxSpeedMs, setMaxSpeedMs] = useState(0);
  const [speedUnit, setSpeedUnit] = useState('kmh'); // 'kmh' | 'mph' | 'ms'
  const [coords, setCoords] = useState(null);
  const [gpsError, setGpsError] = useState('');
  const [tracking, setTracking] = useState(false);
  const [mode, setMode] = useState('digital'); // 'digital' | 'analog'
  const [isHud, setIsHud] = useState(false); // Heads-Up Display reflective mode

  const speedHistoryRef = useRef([]);
  const watchIdRef = useRef(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsError('');
    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const speed = position.coords.speed;
        const currentSpeed = speed !== null && speed >= 0 ? speed : 0;

        setSpeedMs(currentSpeed);
        setCoords({
          lat: position.coords.latitude.toFixed(5),
          lng: position.coords.longitude.toFixed(5),
          accuracy: position.coords.accuracy.toFixed(1),
          altitude: position.coords.altitude !== null ? position.coords.altitude.toFixed(1) : '—'
        });

        setMaxSpeedMs(prev => Math.max(prev, currentSpeed));

        if (currentSpeed > 0.1) {
          speedHistoryRef.current.push(currentSpeed);
        }
      },
      (error) => {
        setGpsError('GPS Error: ' + error.message);
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    setSpeedMs(0);
  };

  const resetSession = () => {
    setMaxSpeedMs(0);
    speedHistoryRef.current = [];
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const convertSpeed = (ms) => {
    if (speedUnit === 'mph') return ms * 2.23694;
    if (speedUnit === 'ms') return ms;
    return ms * 3.6; // default km/h
  };

  const unitLabel = {
    kmh: 'km/h',
    mph: 'mph',
    ms: 'm/s'
  }[speedUnit];

  const averageSpeedMs = speedHistoryRef.current.length > 0
    ? speedHistoryRef.current.reduce((a, b) => a + b, 0) / speedHistoryRef.current.length
    : 0;

  const currentSpeedConverted = convertSpeed(speedMs);
  const maxGaugeVal = speedUnit === 'kmh' ? 220 : speedUnit === 'mph' ? 140 : 60;
  const step = maxGaugeVal / 10;

  // Rotation angle calculations: -120deg to 120deg (240deg total span)
  const needleAngle = -120 + Math.min(1, currentSpeedConverted / maxGaugeVal) * 240;

  return (
    <div className="tool-page">
      <SEOHead title="GPS Speedometer Tool" description="Real-time GPS Speedometer tracking tool with digital/analog views and windshield Heads-Up Display (HUD) mirroring." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Speedometer</span></div>
        <h1><i className="fa-solid fa-gauge" style={{ color: 'var(--accent-purple-light)' }}></i> GPS Speedometer</h1>
        <p>Track your travel speed and sensor telemetry, with mirror HUD dashboard mode.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div 
            className="glass-card" 
            style={{ 
              textAlign: 'center', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              backgroundColor: isHud ? '#000000' : 'var(--bg-glass)',
              borderColor: isHud ? '#111111' : 'var(--border-color)',
              transition: 'background-color 0.3s'
            }}
          >
            {gpsError && !isHud && (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1.5rem', width: '100%' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                {gpsError}
              </div>
            )}

            {/* Segmented Mode Selector */}
            <div style={{ display: 'inline-flex', background: isHud ? '#111111' : 'var(--bg-input)', padding: '4px', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <button onClick={() => setMode('digital')} style={{ background: mode === 'digital' ? 'var(--accent-purple-light)' : 'transparent', color: mode === 'digital' ? 'white' : (isHud ? '#888888' : 'var(--text-secondary)'), border: 'none', padding: '5px 16px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                Digital
              </button>
              <button onClick={() => setMode('analog')} style={{ background: mode === 'analog' ? 'var(--accent-purple-light)' : 'transparent', color: mode === 'analog' ? 'white' : (isHud ? '#888888' : 'var(--text-secondary)'), border: 'none', padding: '5px 16px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                Analog
              </button>
            </div>

            {/* HUD Reflected Container */}
            <div style={{ transform: isHud ? 'scaleX(-1)' : 'none', transition: 'transform 0.3s' }}>
              {mode === 'digital' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '250px', height: '250px', margin: '2rem 0' }}>
                  <div style={{ 
                    fontSize: '6.2rem', 
                    fontWeight: 800, 
                    color: isHud ? '#22c55e' : 'var(--accent-cyan-light)', 
                    fontVariantNumeric: 'tabular-nums', 
                    lineHeight: 1,
                    textShadow: isHud ? '0 0 18px #22c55e' : 'none'
                  }}>
                    {currentSpeedConverted.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isHud ? '#22c55e' : 'var(--text-secondary)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {unitLabel}
                  </div>
                </div>
              ) : (
                /* Analog Dial Gauge */
                <div style={{ position: 'relative', width: '250px', height: '250px', margin: '2rem 0' }}>
                  <div style={{
                    position: 'absolute', inset: -6, borderRadius: '50%',
                    background: isHud ? '#000000' : 'linear-gradient(135deg, var(--bg-glass-hover) 0%, var(--bg-input) 100%)',
                    border: isHud ? '2px solid #22c55e' : '2px solid var(--border-color)',
                  }} />

                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: isHud ? '#000000' : 'radial-gradient(circle, var(--bg-secondary) 0%, var(--bg-input) 100%)',
                    overflow: 'hidden'
                  }}>
                    {/* Tick Marks */}
                    {Array.from({ length: 11 }).map((_, i) => {
                      const angle = -120 + (i * 24);
                      const val = Math.round(i * step);
                      return (
                        <div key={i}>
                          <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            width: '2px', height: '10px', background: isHud ? '#22c55e' : 'var(--text-secondary)',
                            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-112px)`,
                            transformOrigin: 'center center'
                          }} />
                          <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            fontSize: '0.65rem', fontWeight: 700, color: isHud ? '#22c55e' : 'var(--text-muted)',
                            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-96px) rotate(${-angle}deg)`
                          }}>
                            {val}
                          </div>
                        </div>
                      );
                    })}

                    {/* Needle */}
                    <div style={{
                      position: 'absolute', bottom: '50%', left: '50%',
                      width: '3px', height: '94px',
                      background: isHud ? '#22c55e' : 'linear-gradient(to top, var(--accent-pink) 30%, #f472b6 100%)',
                      borderRadius: '3px',
                      transformOrigin: 'bottom center',
                      transform: `translate(-50%, 0) rotate(${needleAngle}deg)`,
                      transition: tracking ? 'transform 0.2s ease-out' : 'transform 0.4s ease-out',
                      boxShadow: isHud ? '0 0 10px #22c55e' : '0 0 6px rgba(244,114,182,0.6)',
                      zIndex: 2
                    }} />

                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: isHud ? '#22c55e' : 'var(--bg-glass-hover)', border: '2px solid var(--border-color)',
                      zIndex: 3
                    }} />

                    <div style={{ position: 'absolute', bottom: '55px', left: '0', right: '0', textAlign: 'center', zIndex: 1 }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isHud ? '#22c55e' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {currentSpeedConverted.toFixed(0)}
                      </div>
                      <div style={{ fontSize: '0.55rem', color: isHud ? '#22c55e' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {unitLabel}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Toggle Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {!tracking ? (
                <button className="btn btn-primary" onClick={startTracking} style={{ gap: '8px' }}>
                  <i className="fa-solid fa-play"></i> Start Tracking
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={stopTracking} style={{ gap: '8px', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)', ...(isHud ? { backgroundColor: '#111111' } : {}) }}>
                  <i className="fa-solid fa-stop"></i> Stop Tracking
                </button>
              )}
              
              <button className="btn btn-secondary" onClick={resetSession} style={isHud ? { gap: '8px', backgroundColor: '#111111', borderColor: '#333333', color: '#ffffff' } : { gap: '8px' }}>
                <i className="fa-solid fa-rotate-left"></i> Reset
              </button>

              <button 
                className={`btn ${isHud ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setIsHud(!isHud)} 
                style={isHud ? { gap: '8px' } : { gap: '8px', color: 'var(--text-primary)' }}
              >
                <i className="fa-solid fa-mobile-screen-button"></i> {isHud ? 'Exit HUD' : 'HUD Reflect'}
              </button>

              <select 
                className="form-select" 
                value={speedUnit} 
                onChange={e => setSpeedUnit(e.target.value)} 
                style={isHud ? { width: '110px', height: '38px', padding: '0.35rem 0.5rem', backgroundColor: '#111111', borderColor: '#333333', color: '#ffffff' } : { width: '110px', height: '38px', padding: '0.35rem 0.5rem' }}
              >
                <option value="kmh">km/h</option>
                <option value="mph">mph</option>
                <option value="ms">m/s</option>
              </select>
            </div>

            {/* Stats section */}
            {!isHud && (
              <div className="stats-grid" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="stat-card" style={{ textAlign: 'center' }}>
                  <div className="stat-card-value" style={{ color: 'var(--accent-purple-light)' }}>
                    {convertSpeed(maxSpeedMs).toFixed(1)}
                  </div>
                  <div className="stat-card-label">Max Speed ({unitLabel})</div>
                </div>
                <div className="stat-card" style={{ textAlign: 'center' }}>
                  <div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>
                    {convertSpeed(averageSpeedMs).toFixed(1)}
                  </div>
                  <div className="stat-card-label">Avg Speed ({unitLabel})</div>
                </div>
              </div>
            )}

            {/* Coordinates / Metadata */}
            {coords && !isHud && (
              <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', textAlign: 'left', width: '100%' }}>
                {[
                  { label: 'Latitude', val: coords.lat },
                  { label: 'Longitude', val: coords.lng },
                  { label: 'Accuracy', val: `${coords.accuracy} m` },
                  { label: 'Altitude', val: `${coords.altitude} m` }
                ].map(({ label, val }) => (
                  <div key={label} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{label}</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{val}</div>
                  </div>
                ))}
              </div>
            )}

            {!isHud && (
              <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'left', width: '100%' }}>
                <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-cyan-light)', marginRight: '6px' }}></i>
                Windshield HUD (Heads-Up Display) mirrors the numeric readout. Lay your phone flat on the dashboard under the windshield for ideal reflections.
              </div>
            )}
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="GPS Speedometer — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
