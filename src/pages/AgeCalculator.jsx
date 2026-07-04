import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

export default function AgeCalculator() {
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState(null);

  const calculate = () => {
    if (!dob) return;
    const birth = new Date(dob);
    const target = new Date(targetDate);

    if (birth >= target) return;

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((target - birth) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Next birthday
    let nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= target) {
      nextBirthday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysUntilBirthday = Math.floor((nextBirthday - target) / (1000 * 60 * 60 * 24));

    // Day of birth
    const dayOfWeek = birth.toLocaleDateString('en-US', { weekday: 'long' });

    setResult({ years, months, days, totalDays, totalWeeks, totalHours, totalMinutes, daysUntilBirthday, dayOfWeek, nextBirthdayAge: years + 1 });
  };

  return (
    <div className="tool-page">
      <SEOHead title="Age Calculator" description="Calculate your exact age in years, months, and days. Find out your next birthday countdown." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Age Calculator</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-cake-candles" style={{ color: 'var(--accent-purple-light)' }}></i> Age Calculator
        </h1>
        <p>Calculate your exact age and countdown to your next birthday.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Calculate Age On</label>
                <input className="form-input" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-full" onClick={calculate} style={{ gap: '8px' }}>
              <i className="fa-solid fa-cake-candles"></i> Calculate Age
            </button>

            {result && (
              <>
                <div className="result-box mt-2 text-center">
                  <div className="result-label">Your Age</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.75rem' }}>
                    <div>
                      <div className="result-value">{result.years}</div>
                      <div className="result-sub">Years</div>
                    </div>
                    <div>
                      <div className="result-value">{result.months}</div>
                      <div className="result-sub">Months</div>
                    </div>
                    <div>
                      <div className="result-value">{result.days}</div>
                      <div className="result-sub">Days</div>
                    </div>
                  </div>
                </div>

                <div className="stats-grid mt-2">
                  <div className="stat-card"><div className="stat-card-value">{result.totalDays.toLocaleString()}</div><div className="stat-card-label">Total Days</div></div>
                  <div className="stat-card"><div className="stat-card-value">{result.totalWeeks.toLocaleString()}</div><div className="stat-card-label">Total Weeks</div></div>
                  <div className="stat-card"><div className="stat-card-value">{result.totalHours.toLocaleString()}</div><div className="stat-card-label">Total Hours</div></div>
                  <div className="stat-card"><div className="stat-card-value">{result.totalMinutes.toLocaleString()}</div><div className="stat-card-label">Total Minutes</div></div>
                </div>

                <div className="grid-2 mt-2">
                  <div className="result-box text-center" style={{ marginTop: 0 }}>
                    <div className="result-label">🎉 Next Birthday In</div>
                    <div className="result-value" style={{ color: 'var(--accent-pink)' }}>{result.daysUntilBirthday}</div>
                    <div className="result-sub">days (turning {result.nextBirthdayAge})</div>
                  </div>
                  <div className="result-box text-center" style={{ marginTop: 0 }}>
                    <div className="result-label">📅 Born On</div>
                    <div className="result-value result-value-sm" style={{ color: 'var(--accent-cyan)' }}>{result.dayOfWeek}</div>
                    <div className="result-sub">Day of the week</div>
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
