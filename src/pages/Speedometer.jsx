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
        const speed = position.coords.speed; // speed in m/s (can be null if device stationary or low accuracy)
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

  return (
    <div className="tool-page">
      <SEOHead title="GPS Speedometer Tool" description="Real-time GPS Speedometer tracking tool. Check current, max, and average speeds in km/h, mph, and m/s." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Speedometer</span></div>
        <h1><i className="fa-solid fa-gauge" style={{ color: 'var(--accent-purple-light)' }}></i> GPS Speedometer</h1>
        <p>Track your real-time travel speed and coordinates using browser-native Geolocation sensors.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card" style={{ textAlign: 'center' }}>
            {gpsError && (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1.5rem', width: '100%' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                {gpsError}
              </div>
            )}

            {/* Main Speed Gauge display */}
            <div style={{ padding: '2rem 0' }}>
              <div style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--accent-cyan-light)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {convertSpeed(speedMs).toFixed(1)}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {unitLabel}
              </div>
            </div>

            {/* Tracking Toggle Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {!tracking ? (
                <button className="btn btn-primary" onClick={startTracking} style={{ gap: '8px' }}>
                  <i className="fa-solid fa-play"></i> Start Tracking
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={stopTracking} style={{ gap: '8px', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <i className="fa-solid fa-stop"></i> Stop Tracking
                </button>
              )}
              <button className="btn btn-secondary" onClick={resetSession} style={{ gap: '8px' }}>
                <i className="fa-solid fa-rotate-left"></i> Reset Stats
              </button>
              <select className="form-select" value={speedUnit} onChange={e => setSpeedUnit(e.target.value)} style={{ width: '110px', height: '38px', padding: '0.35rem 0.5rem' }}>
                <option value="kmh">km/h</option>
                <option value="mph">mph</option>
                <option value="ms">m/s</option>
              </select>
            </div>

            {/* Stats section */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--accent-purple-light)' }}>
                  {convertSpeed(maxSpeedMs).toFixed(1)}
                </div>
                <div className="stat-card-label">Max Speed ({unitLabel})</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>
                  {convertSpeed(averageSpeedMs).toFixed(1)}
                </div>
                <div className="stat-card-label">Avg Speed ({unitLabel})</div>
              </div>
            </div>

            {/* Coordinates / Metadata */}
            {coords && (
              <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', textAlign: 'left' }}>
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

            <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-cyan-light)', marginRight: '6px' }}></i>
              Speedometer tracks values using your device's built-in GPS. Ensure GPS or Location Services are enabled and active. Accuracy is higher outdoors.
            </div>
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
