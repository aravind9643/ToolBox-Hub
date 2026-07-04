import { useState, useEffect } from 'react';
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

  const getDirection = (degree) => {
    const sectors = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
    const index = Math.round(degree / 45) % 8;
    return sectors[index];
  };

  const handleOrientation = (event) => {
    let headingDeg = 0;
    if (event.webkitCompassHeading !== undefined) {
      headingDeg = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      headingDeg = 360 - event.alpha;
    } else {
      return; // orientation values missing
    }

    const rounded = Math.round(headingDeg);
    setHeading(rounded);
    setDirection(getDirection(rounded));
  };

  useEffect(() => {
    // Check if permission API exists (iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      setRequiresPermission(true);
    } else {
      // Normal event listening (Android & Desktop simulation)
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      setPermissionGranted(true);
    }

    // Check if sensors are supported
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

  return (
    <div className="tool-page">
      <SEOHead title="Online Compass Tool" description="Real-time browser compass tool using device orientation sensors. Ideal for mobile and tablet navigation." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Compass</span></div>
        <h1><i className="fa-solid fa-compass" style={{ color: 'var(--accent-purple-light)' }}></i> Device Compass</h1>
        <p>Real-time orientation compass dial using your device's built-in direction sensors.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {supportError && (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1.5rem', width: '100%', maxWidth: '400px' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                {supportError}
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

            {/* Compass Dial Display */}
            <div style={{ position: 'relative', width: '240px', height: '240px', margin: '2rem 0' }}>
              {/* Ring Outer Dial */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '6px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg), inset var(--shadow-md)',
                background: 'var(--bg-input)',
                transform: `rotate(${-heading}deg)`,
                transition: 'transform 0.15s ease-out'
              }}>
                {/* Cardinal directions */}
                <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', fontWeight: 800, color: 'var(--accent-red)', fontSize: '1.25rem' }}>N</div>
                <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.25rem' }}>S</div>
                <div style={{ position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.25rem' }}>E</div>
                <div style={{ position: 'absolute', top: '50%', left: '8px', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.25rem' }}>W</div>
                {/* Dial ticks */}
                <div style={{ position: 'absolute', inset: '10%', borderRadius: '50%', border: '1px dashed var(--border-color)' }} />
              </div>

              {/* Pointer Needle (Stays static pointing straight UP) */}
              <div style={{
                position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)',
                width: 0, height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '24px solid var(--accent-pink)',
                zIndex: 10
              }} />
            </div>

            {/* Heading readouts */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {heading}° <span style={{ color: 'var(--accent-purple-light)', fontSize: '2rem' }}>{direction}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Heading Angle
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'left', width: '100%' }}>
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-cyan-light)', marginRight: '6px' }}></i>
              For best results, lay your device completely flat. Works natively on smartphones and tablets.
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
