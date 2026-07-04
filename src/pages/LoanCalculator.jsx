import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState('500000');
  const [rate, setRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');
  const [tenureType, setTenureType] = useState('years');

  const result = useMemo(() => {
    const P = parseFloat(principal);
    const R = parseFloat(rate) / 100 / 12;
    const N = tenureType === 'years' ? parseFloat(tenure) * 12 : parseFloat(tenure);

    if (!P || !R || !N) return null;

    const emi = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;
    const interestPercent = (totalInterest / totalPayment * 100).toFixed(1);

    // Amortization schedule (yearly summary)
    const schedule = [];
    let balance = P;
    const monthsPerYear = 12;
    const totalYears = Math.ceil(N / 12);

    for (let year = 1; year <= totalYears; year++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      const monthsThisYear = Math.min(monthsPerYear, N - (year - 1) * monthsPerYear);

      for (let m = 0; m < monthsThisYear; m++) {
        const interest = balance * R;
        const principalPart = emi - interest;
        yearInterest += interest;
        yearPrincipal += principalPart;
        balance -= principalPart;
      }

      schedule.push({
        year,
        principal: yearPrincipal,
        interest: yearInterest,
        balance: Math.max(balance, 0)
      });
    }

    return { emi, totalPayment, totalInterest, interestPercent, schedule };
  }, [principal, rate, tenure, tenureType]);

  const fmt = (n) => {
    if (n >= 10000000) return (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return (n / 100000).toFixed(2) + ' L';
    return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <div className="tool-page">
      <SEOHead title="Loan / EMI Calculator" description="Calculate EMI, total interest, and view amortization schedule for your loan. Free and instant." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Loan Calculator</span></div>
        <h1>💰 Loan / EMI Calculator</h1>
        <p>Calculate your monthly EMI, total interest, and amortization schedule.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            <div className="form-group">
              <label className="form-label">Loan Amount (₹)</label>
              <input className="form-input" type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="e.g. 500000" style={{ fontSize: '1.1rem', fontWeight: 600 }} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Interest Rate (% per year)</label>
                <input className="form-input" type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 8.5" />
              </div>
              <div className="form-group">
                <label className="form-label">Loan Tenure</label>
                <div className="flex gap-1">
                  <input className="form-input" type="number" value={tenure} onChange={e => setTenure(e.target.value)} placeholder="20" />
                  <select className="form-select" value={tenureType} onChange={e => setTenureType(e.target.value)} style={{ width: 'auto', minWidth: 100 }}>
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>

            {result && (
              <>
                <div className="result-box mt-2 text-center">
                  <div className="result-label">Monthly EMI</div>
                  <div className="result-value" style={{ color: 'var(--accent-purple-light)' }}>₹{fmt(result.emi)}</div>
                </div>

                <div className="stats-grid mt-2">
                  <div className="stat-card">
                    <div className="stat-card-label">Principal</div>
                    <div className="stat-card-value" style={{ fontSize: '1.1rem' }}>₹{fmt(parseFloat(principal))}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Total Interest</div>
                    <div className="stat-card-value" style={{ fontSize: '1.1rem', color: 'var(--accent-amber)' }}>₹{fmt(result.totalInterest)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Total Payment</div>
                    <div className="stat-card-value" style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>₹{fmt(result.totalPayment)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Interest Ratio</div>
                    <div className="stat-card-value" style={{ fontSize: '1.1rem', color: 'var(--accent-pink)' }}>{result.interestPercent}%</div>
                  </div>
                </div>

                {/* Visual bar */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--accent-purple-light)' }}>● Principal ({(100 - parseFloat(result.interestPercent)).toFixed(1)}%)</span>
                    <span className="text-xs" style={{ color: 'var(--accent-amber)' }}>● Interest ({result.interestPercent}%)</span>
                  </div>
                  <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${100 - parseFloat(result.interestPercent)}%`, background: 'var(--accent-purple)', transition: 'width 0.5s ease' }} />
                    <div style={{ flex: 1, background: 'var(--accent-amber)' }} />
                  </div>
                </div>

                {/* Amortization Table */}
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Amortization Schedule (Yearly)</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '0.6rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Year</th>
                          <th style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Principal</th>
                          <th style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Interest</th>
                          <th style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.schedule.map(row => (
                          <tr key={row.year} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.6rem', color: 'var(--text-primary)' }}>{row.year}</td>
                            <td style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--accent-purple-light)' }}>₹{fmt(row.principal)}</td>
                            <td style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--accent-amber)' }}>₹{fmt(row.interest)}</td>
                            <td style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text-secondary)' }}>₹{fmt(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
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
