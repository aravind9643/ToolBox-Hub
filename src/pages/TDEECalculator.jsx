import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function TDEECalculator() {
  const [unitSystem, setUnitSystem] = useState('metric'); // 'metric' or 'imperial'
  
  // Basic states
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState(''); // kg or lbs
  const [heightCm, setHeightCm] = useState(''); // cm
  const [heightFt, setHeightFt] = useState(''); // feet
  const [heightIn, setHeightIn] = useState(''); // inches
  const [activity, setActivity] = useState('1.2'); // multiplier
  const [activeTab, setActiveTab] = useState('maintenance'); // maintenance, cutting, bulking

  // Form conversions
  const stats = useMemo(() => {
    const ageVal = parseFloat(age) || 0;
    let weightKg = parseFloat(weight) || 0;
    let heightValCm = parseFloat(heightCm) || 0;

    if (unitSystem === 'imperial') {
      weightKg = (parseFloat(weight) || 0) * 0.45359237; // lbs to kg
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      heightValCm = (ft * 12 + inch) * 2.54; // feet+inches to cm
    }

    if (ageVal <= 0 || weightKg <= 0 || heightValCm <= 0) return null;

    // Mifflin-St Jeor Equation
    let bmr = 10 * weightKg + 6.25 * heightValCm - 5 * ageVal;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = bmr * parseFloat(activity);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee)
    };
  }, [gender, age, weight, heightCm, heightFt, heightIn, activity, unitSystem]);

  // Macro Calculations
  const macros = useMemo(() => {
    if (!stats) return null;
    
    let targetCalories = stats.tdee;
    if (activeTab === 'cutting') targetCalories = Math.max(1200, stats.tdee - 500);
    if (activeTab === 'bulking') targetCalories = stats.tdee + 500;

    // Standard high protein split: 30% Protein, 40% Carbs, 30% Fat
    // 1g Protein = 4 kcal, 1g Carb = 4 kcal, 1g Fat = 9 kcal
    const proteinGrams = Math.round((targetCalories * 0.30) / 4);
    const carbGrams = Math.round((targetCalories * 0.40) / 4);
    const fatGrams = Math.round((targetCalories * 0.30) / 9);

    return {
      calories: targetCalories,
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams
    };
  }, [stats, activeTab]);

  return (
    <div className="tool-page">
      <SEOHead title="TDEE & Calorie Calculator" description="Calculate your Basal Metabolic Rate (BMR) and Daily Calorie Expenditure (TDEE). Metric/Imperial support." />
      
      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>TDEE Calculator</span>
        </div>
        <h1>
          <i className="fa-solid fa-calculator" style={{ color: 'var(--accent-purple-light)' }}></i> TDEE & Calorie Calculator
        </h1>
        <p>Estimate your daily calorie expenditure (TDEE) and macronutrient ratios.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          {/* Unit System Selector */}
          <div className="workspace-tabs tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab-btn ${unitSystem === 'metric' ? 'active' : ''}`} onClick={() => setUnitSystem('metric')}>
              Metric Units (kg / cm)
            </button>
            <button className={`tab-btn ${unitSystem === 'imperial' ? 'active' : ''}`} onClick={() => setUnitSystem('imperial')}>
              Imperial Units (lbs / ft)
            </button>
          </div>

          <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
            {/* Input Form */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Biometrics</h2>
              
              {/* Gender Selection */}
              <div className="form-group">
                <label className="form-label">Gender</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={`copy-btn ${gender === 'male' ? 'active' : ''}`}
                    onClick={() => setGender('male')}
                    style={{
                      flex: 1, padding: '0.5rem', justifyContent: 'center',
                      borderColor: gender === 'male' ? 'var(--accent-purple-light)' : 'var(--border-color)',
                      background: gender === 'male' ? 'rgba(96, 165, 250, 0.1)' : 'var(--bg-glass)'
                    }}
                  >
                    <i className="fa-solid fa-mars" style={{ marginRight: '6px' }}></i> Male
                  </button>
                  <button
                    className={`copy-btn ${gender === 'female' ? 'active' : ''}`}
                    onClick={() => setGender('female')}
                    style={{
                      flex: 1, padding: '0.5rem', justifyContent: 'center',
                      borderColor: gender === 'female' ? 'var(--accent-purple-light)' : 'var(--border-color)',
                      background: gender === 'female' ? 'rgba(96, 165, 250, 0.1)' : 'var(--bg-glass)'
                    }}
                  >
                    <i className="fa-solid fa-venus" style={{ marginRight: '6px' }}></i> Female
                  </button>
                </div>
              </div>

              {/* Age and Weight */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="biometrics-age">Age (Years)</label>
                  <input
                    id="biometrics-age"
                    type="number"
                    min="1"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)', fontSize: '1rem'
                    }}
                  />
                </div>

                <div className="form-group" style={{ flex: 1.2 }}>
                  <label className="form-label" htmlFor="biometrics-weight">
                    Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
                  </label>
                  <input
                    id="biometrics-weight"
                    type="number"
                    min="1"
                    placeholder={unitSystem === 'metric' ? '70' : '150'}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)', fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              {/* Height Inputs */}
              <div className="form-group">
                <label className="form-label">Height</label>
                {unitSystem === 'metric' ? (
                  <input
                    type="number"
                    min="1"
                    placeholder="175"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)', fontSize: '1rem'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      placeholder="ft"
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      style={{
                        flex: 1, padding: '0.75rem', background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)', fontSize: '1rem', textAlign: 'center'
                      }}
                    />
                    <input
                      type="number"
                      placeholder="in"
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      style={{
                        flex: 1, padding: '0.75rem', background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)', fontSize: '1rem', textAlign: 'center'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Activity Level */}
              <div className="form-group">
                <label className="form-label" htmlFor="biometrics-activity">Activity Level</label>
                <select
                  id="biometrics-activity"
                  className="form-select"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem', height: '46px', background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)', fontSize: '1rem'
                  }}
                >
                  <option value="1.2">Sedentary (Office job, little exercise)</option>
                  <option value="1.375">Light Activity (Exercise 1-3 times/week)</option>
                  <option value="1.55">Moderate Activity (Exercise 3-5 times/week)</option>
                  <option value="1.725">Active (Hard exercise 6-7 times/week)</option>
                  <option value="1.9">Very Active (Double daily/extreme workouts)</option>
                </select>
              </div>
            </div>

            {/* Results Board */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Your Caloric Targets</h2>
              
              {stats ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Large TDEE display */}
                  <div style={{
                    padding: '1rem', background: 'var(--bg-glass-hover)',
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Daily Maintenance Calories (TDEE)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple-light)' }}>
                      {stats.tdee} <span style={{ fontSize: '1rem', fontWeight: 500 }}>kcal/day</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      BMR (Base Rate): {stats.bmr} kcal
                    </div>
                  </div>

                  {/* Goal Mode Switcher */}
                  <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <button
                      className={`tab-btn btn-sm ${activeTab === 'cutting' ? 'active' : ''}`}
                      onClick={() => setActiveTab('cutting')}
                      style={{ flex: 1, padding: '6px', fontSize: '0.75rem', border: 'none' }}
                    >
                      Weight Loss
                    </button>
                    <button
                      className={`tab-btn btn-sm ${activeTab === 'maintenance' ? 'active' : ''}`}
                      onClick={() => setActiveTab('maintenance')}
                      style={{ flex: 1, padding: '6px', fontSize: '0.75rem', border: 'none' }}
                    >
                      Maintain
                    </button>
                    <button
                      className={`tab-btn btn-sm ${activeTab === 'bulking' ? 'active' : ''}`}
                      onClick={() => setActiveTab('bulking')}
                      style={{ flex: 1, padding: '6px', fontSize: '0.75rem', border: 'none' }}
                    >
                      Weight Gain
                    </button>
                  </div>

                  {/* Macros breakdown */}
                  {macros && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>Target Calories ({activeTab}):</span>
                        <span style={{ color: 'var(--accent-cyan-light)', fontWeight: 700 }}>{macros.calories} kcal</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                        {/* Protein bar */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                            <span>Protein (30%)</span>
                            <span><strong>{macros.protein}g</strong> ({macros.protein * 4} kcal)</span>
                          </div>
                          <div style={{ height: '8px', background: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: '30%', height: '100%', background: 'var(--accent-purple-light)' }}></div>
                          </div>
                        </div>

                        {/* Carbs bar */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                            <span>Carbs (40%)</span>
                            <span><strong>{macros.carbs}g</strong> ({macros.carbs * 4} kcal)</span>
                          </div>
                          <div style={{ height: '8px', background: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: '40%', height: '100%', background: 'var(--accent-cyan-light)' }}></div>
                          </div>
                        </div>

                        {/* Fat bar */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                            <span>Fat (30%)</span>
                            <span><strong>{macros.fat}g</strong> ({macros.fat * 9} kcal)</span>
                          </div>
                          <div style={{ height: '8px', background: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: '30%', height: '100%', background: 'var(--accent-pink)' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                  <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}></i>
                  Please fill in your biometrics on the left to see calculations.
                </div>
              )}
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="TDEE & Calorie Targets Calculator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
