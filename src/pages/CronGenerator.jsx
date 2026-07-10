import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function translateCronField(field, type) {
  if (field === '*') return `every ${type}`;
  if (field.includes('*/')) {
    const step = field.split('*/')[1];
    return `every ${step} ${type}s`;
  }
  if (field.includes(',')) {
    return `${type}s: ${field}`;
  }
  if (field.includes('-')) {
    const [start, end] = field.split('-');
    return `from ${type} ${start} to ${end}`;
  }
  return `on ${type} ${field}`;
}

function getHumanExplanation(cronString) {
  try {
    const parts = cronString.trim().split(/\s+/);
    if (parts.length < 5) return 'Invalid Cron Expression (Requires 5 fields)';
    const [min, hour, dayOfMonth, month, dayOfWeek] = parts;

    const explanation = [
      translateCronField(min, 'minute'),
      translateCronField(hour, 'hour'),
      translateCronField(dayOfMonth, 'day of month'),
      translateCronField(month, 'month'),
      translateCronField(dayOfWeek, 'day of week')
    ].join(', ');

    return explanation.charAt(0).toUpperCase() + explanation.slice(1);
  } catch (e) {
    return 'Invalid Cron Format';
  }
}

export default function CronGenerator() {
  const [cron, setCron] = useState('*/5 * * * *');
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dom, setDom] = useState('*');
  const [month, setMonth] = useState('*');
  const [dow, setDow] = useState('*');

  const explanation = useMemo(() => getHumanExplanation(cron), [cron]);

  const handleAssemble = () => {
    setCron(`${minute} ${hour} ${dom} ${month} ${dow}`);
  };

  const loadPreset = (presetExpr) => {
    setCron(presetExpr);
    const parts = presetExpr.split(' ');
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDom(parts[2]);
      setMonth(parts[3]);
      setDow(parts[4]);
    }
  };

  return (
    <div className="tool-page">
      <SEOHead title="Crontab Expression Generator & Parser" description="Generate cron schedules and convert cron strings to human-readable text explanations easily." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Cron Generator</span></div>
        <h1><i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--accent-purple-light)' }}></i> Crontab Generator</h1>
        <p>Convert crontab statements into human-readable schedules and generate custom task schedules.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            {/* Presets */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('*/5 * * * *')}>Every 5 Minutes</button>
              <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('0 0 * * *')}>Every Day at Midnight</button>
              <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('0 12 * * 1-5')}>Noon on Weekdays</button>
              <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('0 0 1 * *')}>First Day of Month</button>
            </div>

            <div className="form-group">
              <label className="form-label">Crontab Expression String</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={cron} 
                  onChange={e => setCron(e.target.value)} 
                  style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.05em' }}
                />
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', margin: '1rem 0' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Decoded Schedule</div>
              <strong style={{ fontSize: '1.0rem', color: 'var(--accent-cyan-light)', display: 'block', marginTop: '4px' }}>
                {explanation}
              </strong>
            </div>

            {/* Quick Generator Panel */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 600 }}>Schedule Assembler Dropdowns</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Minutes</label>
                  <select className="form-select" value={minute} onChange={e => setMinute(e.target.value)} style={{ fontSize: '0.8rem', padding: '0.35rem' }}>
                    <option value="*">Every Minute (*)</option>
                    <option value="*/5">Every 5 Min (*/5)</option>
                    <option value="*/10">Every 10 Min (*/10)</option>
                    <option value="0">At 0 min</option>
                    <option value="30">At 30 min</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Hours</label>
                  <select className="form-select" value={hour} onChange={e => setHour(e.target.value)} style={{ fontSize: '0.8rem', padding: '0.35rem' }}>
                    <option value="*">Every Hour (*)</option>
                    <option value="*/2">Every 2 Hours (*/2)</option>
                    <option value="0">Midnight (00:00)</option>
                    <option value="12">Noon (12:00)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Day of Month</label>
                  <select className="form-select" value={dom} onChange={e => setDom(e.target.value)} style={{ fontSize: '0.8rem', padding: '0.35rem' }}>
                    <option value="*">Every Day (*)</option>
                    <option value="1">1st of Month (1)</option>
                    <option value="15">15th of Month (15)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Month</label>
                  <select className="form-select" value={month} onChange={e => setMonth(e.target.value)} style={{ fontSize: '0.8rem', padding: '0.35rem' }}>
                    <option value="*">Every Month (*)</option>
                    <option value="1">January (1)</option>
                    <option value="6">June (6)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Day of Week</label>
                  <select className="form-select" value={dow} onChange={e => setDow(e.target.value)} style={{ fontSize: '0.8rem', padding: '0.35rem' }}>
                    <option value="*">Every Weekday (*)</option>
                    <option value="1-5">Weekdays Only (1-5)</option>
                    <option value="0,6">Weekends Only (0,6)</option>
                  </select>
                </div>

              </div>

              <button className="btn btn-primary mt-3" onClick={handleAssemble} style={{ gap: '6px' }}>
                <i className="fa-solid fa-sliders"></i> Apply Selected Settings
              </button>
            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Crontab Generator — ToolBox Hub" />
          </div>

        </div>
      </div>
    </div>
  );
}
