import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

export default function TimestampConverter() {
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [timestampInput, setTimestampInput] = useState(currentTimestamp.toString());
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 16));
  
  const [timestampResult, setTimestampResult] = useState('');
  const [dateResult, setDateResult] = useState('');

  // Update current timestamp every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConvertTimestamp = () => {
    const ts = parseInt(timestampInput);
    if (isNaN(ts)) {
      setTimestampResult('Invalid Timestamp');
      return;
    }
    // Handle milliseconds vs seconds
    const ms = ts > 99999999999 ? ts : ts * 1000;
    const date = new Date(ms);
    if (isNaN(date.getTime())) {
      setTimestampResult('Invalid Timestamp');
      return;
    }
    setTimestampResult(date.toString());
  };

  const handleConvertDate = () => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      setDateResult('Invalid Date');
      return;
    }
    setDateResult({
      seconds: Math.floor(date.getTime() / 1000),
      ms: date.getTime()
    });
  };

  return (
    <div className="tool-page">
      <SEOHead title="Epoch & Unix Timestamp Converter" description="Convert Unix timestamps to human-readable dates and vice versa. Free online time tools." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Timestamp Converter</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-clock" style={{ color: 'var(--accent-purple-light)' }}></i> Unix Timestamp Converter
        </h1>
        <p>Convert Epoch/Unix timestamps to human-readable dates and vice versa.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card mb-2">
            <div className="result-box" style={{ marginTop: 0 }}>
              <div className="result-label">
                <i className="fa-solid fa-stopwatch" style={{ marginRight: '6px' }}></i> Current Unix Timestamp
              </div>
              <div className="result-value" style={{ color: 'var(--accent-cyan)' }}>{currentTimestamp}</div>
              <div className="result-sub">Seconds since Jan 1, 1970 (UTC)</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="glass-card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Timestamp to Date</h2>
              <div className="form-group">
                <label className="form-label">Unix Timestamp (seconds or ms)</label>
                <input className="form-input" type="text" value={timestampInput} onChange={e => setTimestampInput(e.target.value)} />
              </div>
              <button className="btn btn-primary w-full" onClick={handleConvertTimestamp} style={{ gap: '6px' }}>
                <i className="fa-solid fa-calendar-day"></i> Convert to Date
              </button>
              
              {timestampResult && (
                <div className="result-box mt-2">
                  <div className="result-label">Date (Local)</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{timestampResult}</div>
                </div>
              )}
            </div>

            <div className="glass-card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Date to Timestamp</h2>
              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input className="form-input" type="datetime-local" value={dateInput} onChange={e => setDateInput(e.target.value)} />
              </div>
              <button className="btn btn-primary w-full" onClick={handleConvertDate} style={{ gap: '6px' }}>
                <i className="fa-solid fa-hourglass-start"></i> Convert to Timestamp
              </button>

              {dateResult && (
                <div className="result-box mt-2">
                  <div className="result-label">Unix Timestamp</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <div><strong>Seconds:</strong> {dateResult.seconds}</div>
                    <div style={{ marginTop: '0.25rem' }}><strong>Milliseconds:</strong> {dateResult.ms}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Unix Timestamp Converter — ToolBox Hub" />
          </div>
        </div>
        <div className="tool-sidebar">
          <AdBanner type="sidebar" />
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
