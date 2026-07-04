import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState('5000');
  const [addition, setAddition] = useState('200');
  const [rate, setRate] = useState('8');
  const [years, setYears] = useState('10');
  const [frequency, setFrequency] = useState('12'); // 12 = monthly, 4 = quarterly, 1 = annually

  const calculationData = useMemo(() => {
    const initPrincipal = parseFloat(principal) || 0;
    const monthlyAdd = parseFloat(addition) || 0;
    const annualRate = (parseFloat(rate) || 0) / 100;
    const numYears = Math.min(50, Math.max(1, parseInt(years) || 1));
    const compFreq = parseInt(frequency) || 12;

    let balance = initPrincipal;
    let totalContributed = initPrincipal;
    const yearlyBreakdown = [];

    // Calculate month by month for exact accuracy
    for (let y = 1; y <= numYears; y++) {
      let yearInterest = 0;
      
      for (let m = 1; m <= 12; m++) {
        // Contribution added at the start of the month
        balance += monthlyAdd;
        totalContributed += monthlyAdd;

        // Interest compounded according to frequency
        if (compFreq === 12) {
          // Compounded monthly
          const interest = balance * (annualRate / 12);
          balance += interest;
          yearInterest += interest;
        } else if (compFreq === 4 && m % 3 === 0) {
          // Compounded quarterly (every 3 months)
          const interest = balance * (annualRate / 4);
          balance += interest;
          yearInterest += interest;
        }
      }

      // If compounded annually, apply at the end of the year
      if (compFreq === 1) {
        const interest = balance * annualRate;
        balance += interest;
        yearInterest += interest;
      }

      yearlyBreakdown.push({
        year: y,
        contributions: Math.round(totalContributed),
        interest: Math.round(balance - totalContributed),
        total: Math.round(balance)
      });
    }

    return yearlyBreakdown;
  }, [principal, addition, rate, years, frequency]);

  const summary = useMemo(() => {
    if (calculationData.length === 0) return null;
    const lastYear = calculationData[calculationData.length - 1];
    return {
      total: lastYear.total,
      contributions: lastYear.contributions,
      interest: lastYear.interest
    };
  }, [calculationData]);

  // Chart Dimensions & Configuration
  const chartHeight = 220;
  const chartWidth = 500;
  const paddingBottom = 25;
  const paddingTop = 15;
  const paddingLeft = 10;
  const paddingRight = 10;
  
  const chartSvgContent = useMemo(() => {
    if (calculationData.length === 0) return null;
    
    const maxVal = Math.max(...calculationData.map(d => d.total)) || 1;
    const count = calculationData.length;
    
    const drawWidth = chartWidth - paddingLeft - paddingRight;
    const drawHeight = chartHeight - paddingTop - paddingBottom;
    const barSpacing = drawWidth / count;
    const barWidth = Math.max(3, barSpacing * 0.65);

    return calculationData.map((d, index) => {
      const x = paddingLeft + index * barSpacing + (barSpacing - barWidth) / 2;
      
      const totalH = (d.total / maxVal) * drawHeight;
      const contribH = (d.contributions / maxVal) * drawHeight;
      const interestH = totalH - contribH;
      
      const contribY = chartHeight - paddingBottom - contribH;
      const interestY = contribY - interestH;

      return {
        year: d.year,
        x,
        barWidth,
        contribY,
        contribH,
        interestY,
        interestH,
        total: d.total
      };
    });
  }, [calculationData]);

  return (
    <div className="tool-page">
      <SEOHead title="Compound Interest Calculator" description="Model your investment growth with dynamic chart visualizations and annual breakdowns. 100% client-side." />
      
      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Compound Interest Calculator</span>
        </div>
        <h1>
          <i className="fa-solid fa-chart-line" style={{ color: 'var(--accent-purple-light)' }}></i> Compound Interest Calculator
        </h1>
        <p>Calculate compounding growth, periodic additions, and view detailed balance tables.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', alignItems: 'stretch' }}>
            
            {/* Inputs Panel */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Investment Parameters</h2>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="compound-principal">Initial Principal ($)</label>
                  <input
                    id="compound-principal"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)', fontSize: '1rem'
                    }}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="compound-addition">Monthly Addition ($)</label>
                  <input
                    id="compound-addition"
                    type="number"
                    value={addition}
                    onChange={(e) => setAddition(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)', fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="compound-rate">Interest Rate (%, annual)</label>
                  <input
                    id="compound-rate"
                    type="number"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)', fontSize: '1rem'
                    }}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="compound-years">Duration (Years)</label>
                  <input
                    id="compound-years"
                    type="number"
                    min="1"
                    max="50"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)', fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="compound-frequency">Compounding Interval</label>
                <select
                  id="compound-frequency"
                  className="form-select"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem', height: '46px', background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)', fontSize: '1rem'
                  }}
                >
                  <option value="12">Monthly</option>
                  <option value="4">Quarterly</option>
                  <option value="1">Annually</option>
                </select>
              </div>
            </div>

            {/* Results & Visual Chart */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Projections</h2>
              
              {summary && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', justifyContent: 'space-between' }}>
                  {/* Totals panel */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', background: 'var(--bg-glass-hover)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total Value</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-purple-light)' }}>${summary.total.toLocaleString()}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--border-color)' }}></div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Principal</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>${summary.contributions.toLocaleString()}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--border-color)' }}></div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Interest</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-green)' }}>${summary.interest.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* SVG Stacked Bar Chart */}
                  <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', maxWidth: '500px', height: 'auto' }}>
                      {/* Grid Lines */}
                      <line x1={paddingLeft} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom} stroke="var(--border-color)" strokeWidth="1" />
                      <line x1={paddingLeft} y1={paddingTop} x2={chartWidth - paddingRight} y2={paddingTop} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
                      
                      {chartSvgContent && chartSvgContent.map((bar) => (
                        <g key={bar.year}>
                          {/* Principal Portion (Blue) */}
                          <rect
                            x={bar.x}
                            y={bar.contribY}
                            width={bar.barWidth}
                            height={bar.contribH}
                            fill="#3b82f6"
                            rx="2"
                          />
                          {/* Interest Portion (Green) */}
                          <rect
                            x={bar.x}
                            y={bar.interestY}
                            width={bar.barWidth}
                            height={bar.interestH}
                            fill="#10b981"
                            rx="2"
                          />
                          {/* Hover titles/tooltips */}
                          <title>Year {bar.year}: ${bar.total.toLocaleString()}</title>
                          
                          {/* Year Label */}
                          {(bar.year % Math.ceil(years / 5) === 0 || bar.year === 1 || bar.year === parseInt(years)) && (
                            <text
                              x={bar.x + bar.barWidth / 2}
                              y={chartHeight - 8}
                              fill="var(--text-secondary)"
                              fontSize="9"
                              textAnchor="middle"
                            >
                              Yr {bar.year}
                            </text>
                          )}
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#3b82f6', borderRadius: '3px' }}></span>
                      Total Contributed (Principal)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }}></span>
                      Compound Interest
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Table */}
          {calculationData.length > 0 && (
            <div className="glass-card mt-2">
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Annual Breakdown Table</h2>
              <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
                <table className="markdown-preview" style={{ width: '100%', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>Year</th>
                      <th>Total Principal</th>
                      <th>Total Interest</th>
                      <th>End Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculationData.map((row) => (
                      <tr key={row.year} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>Year {row.year}</td>
                        <td>${row.contributions.toLocaleString()}</td>
                        <td style={{ color: 'var(--accent-green)' }}>${row.interest.toLocaleString()}</td>
                        <td style={{ fontWeight: 600, color: 'var(--accent-purple-light)' }}>${row.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Compound Interest & Investment Calculator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
