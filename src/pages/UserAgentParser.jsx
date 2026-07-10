import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function parseUA(uaString) {
  if (!uaString) return {};
  
  let browser = 'Unknown';
  let os = 'Unknown';
  let engine = 'Unknown';
  let device = 'Desktop';

  const ua = uaString.toLowerCase();

  // Browser detection
  if (ua.indexOf('firefox') > -1) browser = 'Mozilla Firefox';
  else if (ua.indexOf('chrome') > -1 && ua.indexOf('safari') > -1 && ua.indexOf('edge') === -1) browser = 'Google Chrome';
  else if (ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1) browser = 'Apple Safari';
  else if (ua.indexOf('edge') > -1 || ua.indexOf('edg') > -1) browser = 'Microsoft Edge';
  else if (ua.indexOf('trident') > -1) browser = 'Internet Explorer';

  // OS detection
  if (ua.indexOf('windows') > -1) os = 'Microsoft Windows';
  else if (ua.indexOf('macintosh') > -1 || ua.indexOf('mac os') > -1) os = 'Apple macOS';
  else if (ua.indexOf('android') > -1) { os = 'Google Android'; device = 'Mobile'; }
  else if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) { os = 'Apple iOS'; device = 'Mobile'; }
  else if (ua.indexOf('linux') > -1) os = 'Linux OS';

  // Engine detection
  if (ua.indexOf('webkit') > -1) engine = 'Apple WebKit';
  else if (ua.indexOf('gecko') > -1) engine = 'Mozilla Gecko';
  else if (ua.indexOf('trident') > -1) engine = 'Microsoft Trident';

  return { browser, os, engine, device };
}

export default function UserAgentParser() {
  const [uaInput, setUaInput] = useState('');
  const [clientInfo, setClientInfo] = useState({});

  useEffect(() => {
    // Grab client configurations
    setUaInput(navigator.userAgent);
    setClientInfo({
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      cookiesEnabled: navigator.cookieEnabled ? 'Yes' : 'No',
      language: navigator.language,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }, []);

  const parsed = parseUA(uaInput);

  return (
    <div className="tool-page">
      <SEOHead title="User Agent Parser & Client Info Inspector" description="Parse browser User Agent strings and inspect screen resolutions, languages, cookie states, and timezones." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>User Agent Parser</span></div>
        <h1><i className="fa-solid fa-desktop" style={{ color: 'var(--accent-purple-light)' }}></i> User Agent Parser</h1>
        <p>Analyze web browser User Agent headers and inspect local client configuration parameters.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            <div className="form-group">
              <label className="form-label">User Agent String</label>
              <textarea 
                className="form-textarea"
                rows="4"
                value={uaInput}
                onChange={e => setUaInput(e.target.value)}
                placeholder="Paste browser User Agent string..."
                style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              
              <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Detected Browser</div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--accent-cyan-light)' }}>{parsed.browser}</strong>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Operating System</div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{parsed.os}</strong>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rendering Engine</div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{parsed.engine}</strong>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Device Category</div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{parsed.device}</strong>
              </div>

            </div>

            {/* Client Info Grid */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: 600 }}>Client Environment Specifications</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Screen Resolution</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{clientInfo.screenWidth} × {clientInfo.screenHeight} px</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Window Size</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{clientInfo.windowWidth} × {clientInfo.windowHeight} px</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Preferred Language</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{clientInfo.language}</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Cookies Enabled</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{clientInfo.cookiesEnabled}</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Local Timezone</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{clientInfo.timezone}</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>OS Platform</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{clientInfo.platform}</strong>
                </div>
              </div>
            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="User Agent Parser — ToolBox Hub" />
          </div>

        </div>
      </div>
    </div>
  );
}
