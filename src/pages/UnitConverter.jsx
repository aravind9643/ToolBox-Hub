import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

const categories = {
  Length: {
    units: ['Meter', 'Kilometer', 'Centimeter', 'Millimeter', 'Mile', 'Yard', 'Foot', 'Inch'],
    base: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.344, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254 }
  },
  Weight: {
    units: ['Kilogram', 'Gram', 'Milligram', 'Pound', 'Ounce', 'Ton'],
    base: { Kilogram: 1, Gram: 0.001, Milligram: 0.000001, Pound: 0.45359237, Ounce: 0.028349523, Ton: 1000 }
  },
  Temperature: { units: ['Celsius', 'Fahrenheit', 'Kelvin'], custom: true },
  Speed: {
    units: ['m/s', 'km/h', 'mph', 'knots', 'ft/s'],
    base: { 'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, 'knots': 0.514444, 'ft/s': 0.3048 }
  },
  'Data (Binary)': {
    units: ['Byte', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'],
    base: { Byte: 1, KiB: 1024, MiB: 1048576, GiB: 1073741824, TiB: 1099511627776, PiB: 1125899906842624 }
  },
  'Data (Decimal)': {
    units: ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB'],
    base: { Byte: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, PB: 1e15 }
  },
  Time: {
    units: ['Second', 'Minute', 'Hour', 'Day', 'Week', 'Month', 'Year'],
    base: { Second: 1, Minute: 60, Hour: 3600, Day: 86400, Week: 604800, Month: 2592000, Year: 31536000 }
  },
  Cooking: {
    units: ['Teaspoon', 'Tablespoon', 'Cup', 'Fluid oz', 'Pint', 'Quart', 'Gallon', 'mL', 'Liter'],
    base: { Teaspoon: 4.92892, Tablespoon: 14.7868, Cup: 236.588, 'Fluid oz': 29.5735, Pint: 473.176, Quart: 946.353, Gallon: 3785.41, mL: 1, Liter: 1000 }
  },
  Energy: {
    units: ['Joule', 'Kilojoule', 'Calorie', 'Kilocalorie', 'Wh', 'kWh', 'BTU', 'eV'],
    base: { Joule: 1, Kilojoule: 1000, Calorie: 4.184, Kilocalorie: 4184, Wh: 3600, kWh: 3600000, BTU: 1055.06, eV: 1.60218e-19 }
  },
  Pressure: {
    units: ['Pascal', 'Kilopascal', 'Bar', 'PSI', 'Atmosphere', 'mmHg', 'Torr'],
    base: { Pascal: 1, Kilopascal: 1000, Bar: 100000, PSI: 6894.76, Atmosphere: 101325, mmHg: 133.322, Torr: 133.322 }
  },
};

function convertTemp(value, from, to) {
  let celsius;
  if (from === 'Celsius') celsius = value;
  else if (from === 'Fahrenheit') celsius = (value - 32) * 5 / 9;
  else celsius = value - 273.15;
  if (to === 'Celsius') return celsius;
  if (to === 'Fahrenheit') return celsius * 9 / 5 + 32;
  return celsius + 273.15;
}

export default function UnitConverter() {
  const [category, setCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState('Meter');
  const [toUnit, setToUnit] = useState('Kilometer');
  const [value, setValue] = useState('1');

  const cat = categories[category];

  const result = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    if (cat.custom) return convertTemp(num, fromUnit, toUnit).toFixed(4);
    const inBase = num * cat.base[fromUnit];
    return (inBase / cat.base[toUnit]).toFixed(6).replace(/\.?0+$/, '');
  }, [value, fromUnit, toUnit, category, cat]);

  // All conversions at once
  const allResults = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num) || !value) return [];
    return cat.units.map(u => {
      if (cat.custom) {
        return { unit: u, val: convertTemp(num, fromUnit, u).toFixed(4) };
      }
      const inBase = num * cat.base[fromUnit];
      return { unit: u, val: (inBase / cat.base[u]).toFixed(6).replace(/\.?0+$/, '') };
    });
  }, [value, fromUnit, category, cat]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const units = categories[newCat].units;
    setFromUnit(units[0]);
    setToUnit(units[1]);
  };

  const handleSwap = () => { setFromUnit(toUnit); setToUnit(fromUnit); };

  return (
    <div className="tool-page">
      <SEOHead title="Scientific Unit Converter & Byte Calculator" description="Convert units of length, weight, speed, digital data storage bytes (KiB/MiB vs KB/MB), temperature, and pressure." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Unit Converter</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-ruler-combined" style={{ color: 'var(--accent-purple-light)' }}></i> Unit Converter Hub
        </h1>
        <p>Convert metrics, cooking scales, and developer data storage bytes (Binary vs Decimal) instantly.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Category tabs */}
            <div className="tabs" style={{ flexWrap: 'wrap', gap: '4px', marginBottom: '1.25rem' }}>
              {Object.keys(categories).map(cat => (
                <button key={cat} className={`tab-btn ${category === cat ? 'active' : ''}`} onClick={() => handleCategoryChange(cat)} style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}>{cat}</button>
              ))}
            </div>

            <div className="converter-row" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>From</label>
                  <select className="form-select" value={fromUnit} onChange={e => setFromUnit(e.target.value)}>
                    {cat.units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <input className="form-input" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter value..." style={{ fontSize: '1.2rem', fontWeight: 600 }} />
                </div>
              </div>

              <button className="converter-swap" onClick={handleSwap} title="Swap units" style={{ background: 'var(--bg-glass-hover)', border: '1px solid var(--border-color)', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', alignSelf: 'center', marginTop: '12px' }}>
                <i className="fa-solid fa-arrow-right-arrow-left"></i>
              </button>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>To</label>
                  <select className="form-select" value={toUnit} onChange={e => setToUnit(e.target.value)}>
                    {cat.units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="result-box" style={{ marginTop: 0, padding: '0.6rem 0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div className="result-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Converted Result</div>
                  <div className="result-value result-value-sm" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan-light)', margin: '2px 0' }}>{result || '—'}</div>
                  <div className="result-sub" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{toUnit}</div>
                </div>
              </div>
            </div>

            {value && result && (
              <div className="result-box mt-2 text-center" style={{ padding: '0.75rem', background: 'var(--bg-glass-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  {value} {fromUnit} = <strong style={{ color: 'var(--text-primary)' }}>{result} {toUnit}</strong>
                </span>
              </div>
            )}

            {/* All Conversions Table Grid */}
            {allResults.length > 0 && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
                  <i className="fa-solid fa-grid-2"></i> All Conversions for {value} {fromUnit}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.6rem' }}>
                  {allResults.map(({ unit, val }) => (
                    <div key={unit} className="stat-card" style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', opacity: unit === fromUnit ? 0.5 : 1, transition: 'border-color 0.15s' }}
                      onClick={() => navigator.clipboard.writeText(val)}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-purple-light)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                      <div className="stat-card-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{unit}</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem', fontSize: '0.9rem', wordBreak: 'break-all' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
