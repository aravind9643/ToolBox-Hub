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
    base: { Kilogram: 1, Gram: 0.001, Milligram: 0.000001, Pound: 0.453592, Ounce: 0.0283495, Ton: 1000 }
  },
  Temperature: { units: ['Celsius', 'Fahrenheit', 'Kelvin'], custom: true },
  Speed: {
    units: ['m/s', 'km/h', 'mph', 'knots', 'ft/s'],
    base: { 'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, 'knots': 0.514444, 'ft/s': 0.3048 }
  },
  'Data Storage': {
    units: ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB'],
    base: { Byte: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776, PB: 1125899906842624 }
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
      <SEOHead title="Unit Converter" description="Convert between units of length, weight, temperature, speed, data storage, cooking volumes, energy, and pressure." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Unit Converter</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-ruler-combined" style={{ color: 'var(--accent-purple-light)' }}></i> Unit Converter
        </h1>
        <p>Convert between units of length, weight, speed, data, cooking, energy, pressure, and more.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div className="tabs" style={{ flexWrap: 'wrap' }}>
              {Object.keys(categories).map(cat => (
                <button key={cat} className={`tab-btn ${category === cat ? 'active' : ''}`} onClick={() => handleCategoryChange(cat)}>{cat}</button>
              ))}
            </div>

            <div className="converter-row">
              <div style={{ flex: 1 }}>
                <div className="form-group">
                  <label className="form-label">From</label>
                  <select className="form-select" value={fromUnit} onChange={e => setFromUnit(e.target.value)}>
                    {cat.units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <input className="form-input" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter value..." style={{ fontSize: '1.25rem', fontWeight: 600 }} />
                </div>
              </div>

              <button className="converter-swap" onClick={handleSwap} title="Swap units">
                <i className="fa-solid fa-arrow-right-arrow-left"></i>
              </button>

              <div style={{ flex: 1 }}>
                <div className="form-group">
                  <label className="form-label">To</label>
                  <select className="form-select" value={toUnit} onChange={e => setToUnit(e.target.value)}>
                    {cat.units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="result-box" style={{ marginTop: 0 }}>
                  <div className="result-label">Result</div>
                  <div className="result-value result-value-sm">{result || '—'}</div>
                  <div className="result-sub">{toUnit}</div>
                </div>
              </div>
            </div>

            {value && result && (
              <div className="result-box mt-2 text-center">
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                  {value} {fromUnit} = <strong style={{ color: 'var(--text-primary)' }}>{result} {toUnit}</strong>
                </span>
              </div>
            )}

            {/* All Conversions Table */}
            {allResults.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  All Conversions for {value} {fromUnit}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  {allResults.map(({ unit, val }) => (
                    <div key={unit} className="stat-card" style={{ cursor: 'pointer', opacity: unit === fromUnit ? 0.5 : 1 }}
                      onClick={() => navigator.clipboard.writeText(val)}>
                      <div className="stat-card-label">{unit}</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem', fontSize: '0.9rem', wordBreak: 'break-all' }}>{val}</div>
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
