import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'var(--accent-cyan)', emoji: '🔵', tip: 'Consider a balanced diet with more calories.' };
  if (bmi < 25) return { label: 'Normal', color: 'var(--accent-green)', emoji: '🟢', tip: 'Great! Maintain your healthy lifestyle.' };
  if (bmi < 30) return { label: 'Overweight', color: 'var(--accent-amber)', emoji: '🟡', tip: 'Consider regular exercise and a balanced diet.' };
  return { label: 'Obese', color: 'var(--accent-red)', emoji: '🔴', tip: 'Consult a healthcare professional for guidance.' };
}

export default function BMICalculator() {
  const [unit, setUnit] = useState('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight);
    let h;
    if (unit === 'metric') {
      h = parseFloat(height) / 100; // cm to m
    } else {
      const ft = parseFloat(height) || 0;
      const inches = parseFloat(heightIn) || 0;
      h = (ft * 12 + inches) * 0.0254; // to meters
    }
    if (!w || !h) return;

    const weightKg = unit === 'imperial' ? w * 0.453592 : w;
    const bmi = weightKg / (h * h);

    const minIdealKg = 18.5 * (h * h);
    const maxIdealKg = 24.9 * (h * h);

    let weightDiff = 0;
    let weightDiffDir = 'normal';
    if (weightKg < minIdealKg) {
      weightDiff = minIdealKg - weightKg;
      weightDiffDir = 'gain';
    } else if (weightKg > maxIdealKg) {
      weightDiff = weightKg - maxIdealKg;
      weightDiffDir = 'lose';
    }

    if (unit === 'imperial') {
      weightDiff = weightDiff / 0.453592;
    }

    const heightCm = h * 100;
    const maintenanceCalories = Math.round((10 * weightKg + 6.25 * heightCm - 5 * 30 + 5) * 1.375);
    const waterLiters = (weightKg * 35) / 1000;

    setResult({
      bmi: bmi.toFixed(1),
      weightDiff: weightDiff.toFixed(1),
      weightDiffDir,
      maintenanceCalories,
      waterLiters: waterLiters.toFixed(1)
    });
  };

  const bmi = result ? result.bmi : null;
  const category = bmi ? getBMICategory(parseFloat(bmi)) : null;
  const gaugeRotation = bmi ? Math.min(Math.max((parseFloat(bmi) - 10) / 35, 0), 1) : 0;

  return (
    <div className="tool-page">
      <SEOHead title="BMI Calculator" description="Calculate your Body Mass Index (BMI) and understand your health category. Supports metric and imperial units." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>BMI Calculator</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-weight-scale" style={{ color: 'var(--accent-purple-light)' }}></i> BMI Calculator
        </h1>
        <p>Calculate your Body Mass Index and get health insights.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            <div className="tabs">
              <button className={`tab-btn ${unit === 'metric' ? 'active' : ''}`} onClick={() => setUnit('metric')}>Metric (kg/cm)</button>
              <button className={`tab-btn ${unit === 'imperial' ? 'active' : ''}`} onClick={() => setUnit('imperial')}>Imperial (lbs/ft)</button>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
                <input className="form-input" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={unit === 'metric' ? 'e.g. 70' : 'e.g. 154'} />
              </div>
              {unit === 'metric' ? (
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input className="form-input" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 175" />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Height</label>
                  <div className="flex gap-1">
                    <input className="form-input" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="ft" />
                    <input className="form-input" type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="in" />
                  </div>
                </div>
              )}
            </div>

            <button className="btn btn-primary btn-lg w-full" onClick={calculate}>Calculate BMI</button>

            {bmi && category && (
              <div className="result-box mt-2 text-center">
                <div className="gauge-container">
                  <div style={{ position: 'relative', width: '200px', height: '110px', margin: '0 auto' }}>
                    <svg width="200" height="110" viewBox="0 0 200 110" style={{ display: 'block' }}>
                      <defs>
                        <linearGradient id="bmiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="var(--accent-cyan)" />
                          <stop offset="33%" stopColor="var(--accent-green)" />
                          <stop offset="66%" stopColor="var(--accent-amber)" />
                          <stop offset="100%" stopColor="var(--accent-red)" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="var(--border-color)"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="url(#bmiGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="251.3"
                        strokeDashoffset={251.3 - (251.3 * gaugeRotation)}
                        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      textAlign: 'center'
                    }}>
                      <span style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: category.color
                      }}>{bmi}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: category.color, marginTop: '0.5rem' }}>
                  {category.emoji} {category.label}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{category.tip}</p>

                {/* Premium health metrics cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', width: '100%', marginTop: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="result-box text-center" style={{ marginTop: 0, padding: '0.75rem 0.5rem' }}>
                    <div className="result-label" style={{ fontSize: '0.72rem' }}>🎯 Ideal Weight Target</div>
                    <div className="result-value result-value-sm" style={{ color: result.weightDiffDir === 'normal' ? 'var(--accent-green)' : 'var(--accent-cyan-light)', fontSize: '1.1rem' }}>
                      {result.weightDiffDir === 'normal' ? 'Ideal Range' : `${result.weightDiff} ${unit === 'metric' ? 'kg' : 'lbs'}`}
                    </div>
                    <div className="result-sub" style={{ fontSize: '0.68rem' }}>
                      {result.weightDiffDir === 'normal' ? 'No change needed' : (result.weightDiffDir === 'gain' ? 'Need to gain' : 'Need to lose')}
                    </div>
                  </div>
                  
                  <div className="result-box text-center" style={{ marginTop: 0, padding: '0.75rem 0.5rem' }}>
                    <div className="result-label" style={{ fontSize: '0.72rem' }}>🔥 Daily Calories Target</div>
                    <div className="result-value result-value-sm" style={{ color: 'var(--accent-amber)', fontSize: '1.1rem' }}>
                      {result.maintenanceCalories} kcal
                    </div>
                    <div className="result-sub" style={{ fontSize: '0.68rem' }}>Active BMR estimate</div>
                  </div>

                  <div className="result-box text-center" style={{ marginTop: 0, padding: '0.75rem 0.5rem' }}>
                    <div className="result-label" style={{ fontSize: '0.72rem' }}>💧 Daily Water Target</div>
                    <div className="result-value result-value-sm" style={{ color: 'var(--accent-cyan-light)', fontSize: '1.1rem' }}>
                      {result.waterLiters} L
                    </div>
                    <div className="result-sub" style={{ fontSize: '0.68rem' }}>Approx. {(result.waterLiters * 4).toFixed(0)} glasses</div>
                  </div>
                </div>

                <div className="stats-grid mt-2">
                  <div className="stat-card"><div className="stat-card-label">Underweight</div><div className="stat-card-value" style={{ color: 'var(--accent-cyan)', fontSize: '1rem' }}>&lt; 18.5</div></div>
                  <div className="stat-card"><div className="stat-card-label">Normal</div><div className="stat-card-value" style={{ color: 'var(--accent-green)', fontSize: '1rem' }}>18.5 - 24.9</div></div>
                  <div className="stat-card"><div className="stat-card-label">Overweight</div><div className="stat-card-value" style={{ color: 'var(--accent-amber)', fontSize: '1rem' }}>25 - 29.9</div></div>
                  <div className="stat-card"><div className="stat-card-label">Obese</div><div className="stat-card-value" style={{ color: 'var(--accent-red)', fontSize: '1rem' }}>≥ 30</div></div>
                </div>
              </div>
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
