import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function DateCalculator() {
  const [activeMode, setActiveMode] = useState('diff'); // 'diff' or 'math'
  
  // Diff Mode States
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Math Mode States
  const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [operation, setOperation] = useState('add'); // 'add' or 'subtract'
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState('days'); // 'days', 'weeks', 'months', 'years'

  // Difference Calculations
  const diffResults = useMemo(() => {
    if (!startDate || !endDate) return null;
    
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Business Days calculation (Monday-Friday)
    let businessDays = 0;
    const start = new Date(Math.min(d1, d2));
    const end = new Date(Math.max(d1, d2));
    const tempDate = new Date(start.getTime());
    
    while (tempDate <= end) {
      const day = tempDate.getDay();
      if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
        businessDays++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const weeks = (diffDays / 7).toFixed(1);
    
    // Approximate Months & Years
    const months = (diffDays / 30.4375).toFixed(1);
    const years = (diffDays / 365.25).toFixed(2);

    return {
      days: diffDays,
      businessDays,
      weeks,
      months,
      years
    };
  }, [startDate, endDate]);

  // Date Math Calculations
  const mathResult = useMemo(() => {
    if (!baseDate || !amount) return null;
    
    const date = new Date(baseDate);
    const count = parseInt(amount) || 0;
    const multiplier = operation === 'add' ? 1 : -1;
    
    switch (unit) {
      case 'days':
        date.setDate(date.getDate() + count * multiplier);
        break;
      case 'weeks':
        date.setDate(date.getDate() + count * 7 * multiplier);
        break;
      case 'months':
        date.setMonth(date.getMonth() + count * multiplier);
        break;
      case 'years':
        date.setFullYear(date.getFullYear() + count * multiplier);
        break;
      default:
        break;
    }
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return {
      iso: date.toISOString().split('T')[0],
      formatted: date.toLocaleDateString('en-US', options)
    };
  }, [baseDate, operation, amount, unit]);

  return (
    <div className="tool-page">
      <SEOHead title="Date & Business Days Calculator" description="Calculate duration, business days, or add/subtract time from a specific date. Clean visual layout." />
      
      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Date Calculator</span>
        </div>
        <h1>
          <i className="fa-solid fa-calendar-days" style={{ color: 'var(--accent-purple-light)' }}></i> Date & Business Days Calculator
        </h1>
        <p>Calculate dates, days counts, and working days offline.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          {/* Mode Switcher Tabs */}
          <div className="workspace-tabs tabs" style={{ marginBottom: '1.25rem', display: 'flex' }}>
            <button className={`tab-btn ${activeMode === 'diff' ? 'active' : ''}`} onClick={() => setActiveMode('diff')}>
              <i className="fa-solid fa-arrow-left-right-to-line" style={{ marginRight: '6px' }}></i> Date Difference
            </button>
            <button className={`tab-btn ${activeMode === 'math' ? 'active' : ''}`} onClick={() => setActiveMode('math')}>
              <i className="fa-solid fa-plus-minus" style={{ marginRight: '6px' }}></i> Add / Subtract Days
            </button>
          </div>

          <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
            {activeMode === 'diff' ? (
              <>
                {/* Inputs for Date Diff */}
                <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Select Dates</h2>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="start-date">Start Date</label>
                    <input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="end-date">End Date</label>
                    <input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div className="flex gap-1">
                    <button className="copy-btn btn-sm" onClick={() => setEndDate(new Date().toISOString().split('T')[0])}>
                      Set End to Today
                    </button>
                  </div>
                </div>

                {/* Outputs for Date Diff */}
                <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Duration Breakdown</h2>
                  
                  {diffResults && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Calendar Days</span>
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-purple-light)' }}>{diffResults.days} days</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Working/Business Days</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Excludes Sat & Sun</span>
                        </div>
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-green)' }}>{diffResults.businessDays} days</span>
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Weeks</span>
                        <span style={{ fontWeight: 600 }}>{diffResults.weeks} weeks</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Months (approx.)</span>
                        <span style={{ fontWeight: 600 }}>{diffResults.months} months</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Years (approx.)</span>
                        <span style={{ fontWeight: 600 }}>{diffResults.years} years</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Inputs for Date Math */}
                <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Date Operations</h2>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="base-date">Start Date</label>
                    <input
                      id="base-date"
                      type="date"
                      value={baseDate}
                      onChange={(e) => setBaseDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Action</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className={`copy-btn ${operation === 'add' ? 'active' : ''}`}
                        onClick={() => setOperation('add')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          justifyContent: 'center',
                          borderColor: operation === 'add' ? 'var(--accent-purple-light)' : 'var(--border-color)',
                          background: operation === 'add' ? 'rgba(96, 165, 250, 0.1)' : 'var(--bg-glass)'
                        }}
                      >
                        <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Add
                      </button>
                      <button
                        className={`copy-btn ${operation === 'subtract' ? 'active' : ''}`}
                        onClick={() => setOperation('subtract')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          justifyContent: 'center',
                          borderColor: operation === 'subtract' ? 'var(--accent-purple-light)' : 'var(--border-color)',
                          background: operation === 'subtract' ? 'rgba(96, 165, 250, 0.1)' : 'var(--bg-glass)'
                        }}
                      >
                        <i className="fa-solid fa-minus" style={{ marginRight: '6px' }}></i> Subtract
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" htmlFor="math-amount">Amount</label>
                      <input
                        id="math-amount"
                        type="number"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1.2 }}>
                      <label className="form-label" htmlFor="math-unit">Unit</label>
                      <select
                        id="math-unit"
                        className="form-select"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          height: '46px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Outputs for Date Math */}
                <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
                  <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Calculated Target Date</h2>
                  
                  {mathResult && (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Resulting Date
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan-light)', marginBottom: '0.75rem' }}>
                        {mathResult.formatted}
                      </div>
                      <code style={{
                        padding: '0.4rem 0.8rem',
                        background: 'var(--bg-glass-hover)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        color: 'var(--accent-purple-light)'
                      }}>
                        {mathResult.iso}
                      </code>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Date & Business Days Calculator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
