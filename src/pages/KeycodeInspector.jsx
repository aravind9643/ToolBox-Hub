import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function KeycodeInspector() {
  const [currentKey, setCurrentKey] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent standard browser shortcuts only if focusing body
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
      
      const keyData = {
        key: e.key === ' ' ? 'Space' : e.key,
        code: e.code,
        keyCode: e.keyCode,
        which: e.which,
        location: e.location,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        time: new Date().toLocaleTimeString()
      };

      setCurrentKey(keyData);
      setHistory(prev => [keyData, ...prev].slice(0, 10));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearHistory = () => {
    setHistory([]);
    setCurrentKey(null);
  };

  const getCodeSnippet = (key) => {
    if (!key) return '';
    return `window.addEventListener('keydown', (e) => {\n  if (e.code === '${key.code}') {\n    // Trigger action for ${key.key}\n  }\n});`;
  };

  return (
    <div className="tool-page">
      <SEOHead title="Keyboard Keycode Event Inspector & Dashboard" description="Detect JavaScript keydown events. View event.key, event.code, and modifier status instantly." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Keycode Inspector</span></div>
        <h1><i className="fa-solid fa-keyboard" style={{ color: 'var(--accent-purple-light)' }}></i> Keycode Event Inspector</h1>
        <p>Press any keyboard key to analyze JavaScript event properties, keyCodes, and code snippets.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            
            {currentKey ? (
              <div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--accent-cyan-light)', fontFamily: 'monospace' }}>
                  {currentKey.keyCode}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  event.keyCode
                </div>

                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <div className="stat-card" style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentKey.key}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>event.key</div>
                  </div>
                  <div className="stat-card" style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentKey.code}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>event.code</div>
                  </div>
                  <div className="stat-card" style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentKey.which}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>event.which</div>
                  </div>
                  <div className="stat-card" style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentKey.location}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>event.location</div>
                  </div>
                </div>

                {/* Modifiers List */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                  {[
                    { label: 'Ctrl', val: currentKey.ctrlKey },
                    { label: 'Shift', val: currentKey.shiftKey },
                    { label: 'Alt', val: currentKey.altKey },
                    { label: 'Meta (Win/Cmd)', val: currentKey.metaKey }
                  ].map(m => (
                    <span key={m.label} style={{
                      padding: '0.3rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                      background: m.val ? 'var(--accent-green)' : 'var(--bg-input)',
                      color: m.val ? '#fff' : 'var(--text-muted)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {m.label}
                    </span>
                  ))}
                </div>

                {/* Code snippets */}
                <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>JavaScript Listener Snippet</h3>
                  <pre style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-cyan-light)', overflowX: 'auto' }}>
                    {getCodeSnippet(currentKey)}
                  </pre>
                </div>

              </div>
            ) : (
              <div style={{ padding: '3rem 1rem' }}>
                <i className="fa-solid fa-keyboard" style={{ fontSize: '3rem', color: 'var(--border-color)', marginBottom: '1rem' }}></i>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Press any key on your keyboard to begin</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.35rem' }}>This dashboard displays key properties and event configurations live.</p>
              </div>
            )}

            {/* History stack */}
            {history.length > 0 && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Key Event History</h3>
                  <button className="btn btn-secondary btn-sm" onClick={clearHistory} style={{ color: 'var(--accent-red)', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                    Clear history
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.8rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.5rem 0.25rem' }}>Key</th>
                        <th style={{ padding: '0.5rem 0.25rem' }}>Code</th>
                        <th style={{ padding: '0.5rem 0.25rem' }}>KeyCode</th>
                        <th style={{ padding: '0.5rem 0.25rem' }}>Which</th>
                        <th style={{ padding: '0.5rem 0.25rem' }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.5rem 0.25rem', fontFamily: 'monospace', fontWeight: 600 }}>{h.key}</td>
                          <td style={{ padding: '0.5rem 0.25rem', fontFamily: 'monospace', color: 'var(--accent-cyan-light)' }}>{h.code}</td>
                          <td style={{ padding: '0.5rem 0.25rem' }}>{h.keyCode}</td>
                          <td style={{ padding: '0.5rem 0.25rem' }}>{h.which}</td>
                          <td style={{ padding: '0.5rem 0.25rem', color: 'var(--text-muted)' }}>{h.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Keyboard Keycode Event Inspector — ToolBox Hub" />
          </div>

        </div>
      </div>
    </div>
  );
}
