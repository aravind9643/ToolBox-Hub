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
      // w is in lbs, convert to kg
    }
    if (!w || !h) return;

    const weightKg = unit === 'imperial' ? w * 0.453592 : w;
    const bmi = weightKg / (h * h);
    setResult(bmi);
  };

  const bmi = result ? result.toFixed(1) : null;
  const category = bmi ? getBMICategory(parseFloat(bmi)) : null;
  const gaugeRotation = bmi ? Math.min(Math.max((parseFloat(bmi) - 10) / 35, 0), 1) * 180 : 0;

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
                  <div className="gauge">
                    <div className="gauge-bg" />
                    <div className="gauge-fill" style={{
                      background: `conic-gradient(from 180deg, var(--accent-cyan) 0deg, var(--accent-green) 60deg, var(--accent-amber) 120deg, var(--accent-red) 180deg)`,
                      transform: `rotate(${gaugeRotation * 180}deg)`,
                      clipPath: 'inset(0 0 50% 0)'
                    }} />
                    <div className="gauge-cover">
                      <span className="gauge-value" style={{ color: category.color }}>{bmi}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: category.color, marginTop: '0.5rem' }}>
                  {category.emoji} {category.label}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{category.tip}</p>

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
