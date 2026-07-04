import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const allTools = [
  { path: '/qr-code-generator', label: 'QR Code Generator' },
  { path: '/password-generator', label: 'Password Generator' },
  { path: '/unit-converter', label: 'Unit Converter' },
  { path: '/color-picker', label: 'Color Picker' },
  { path: '/bmi-calculator', label: 'BMI Calculator' },
  { path: '/age-calculator', label: 'Age Calculator' },
  { path: '/loan-calculator', label: 'Loan Calculator' },
  { path: '/word-counter', label: 'Word Counter' },
  { path: '/json-formatter', label: 'JSON Formatter' },
  { path: '/image-compressor', label: 'Image Compressor' },
  { path: '/base64-converter', label: 'Base64 Converter' },
  { path: '/lorem-ipsum', label: 'Lorem Ipsum Generator' },
];

export default function Navbar({ onMenuToggle }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return allTools.filter(t => t.label.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const handleSelect = (path) => {
    navigate(path);
    setQuery('');
    setShowResults(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <button className="mobile-menu-btn" onClick={onMenuToggle}>☰</button>
        <span className="sidebar-logo" style={{ width: 30, height: 30, fontSize: '0.85rem' }}>T</span>
      </div>

      <div className="navbar-search" style={{ position: 'relative' }}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search tools..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {showResults && results.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
            background: 'rgba(10, 14, 39, 0.98)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', overflow: 'hidden', zIndex: 999,
            boxShadow: 'var(--shadow-lg)'
          }}>
            {results.map(r => (
              <button key={r.path} onClick={() => handleSelect(r.path)} style={{
                display: 'block', width: '100%', padding: '0.7rem 1rem', textAlign: 'left',
                background: 'none', border: 'none', color: 'var(--text-primary)',
                fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.target.style.background = 'var(--bg-glass-hover)'}
              onMouseLeave={e => e.target.style.background = 'none'}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="navbar-actions">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="navbar-action-btn" title="GitHub">⭐</a>
      </div>
    </nav>
  );
}
