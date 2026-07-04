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
  { path: '/timestamp-converter', label: 'Timestamp Converter' },
  { path: '/markdown-previewer', label: 'Markdown Previewer' },
  { path: '/regex-tester', label: 'Regex Tester' },
  { path: '/gradient-generator', label: 'Gradient Generator' },
];

export default function Navbar({ onMenuToggle }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    if (saved === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    return saved;
  });

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      setTheme('dark');
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  };

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
        <button className="mobile-menu-btn" onClick={onMenuToggle}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <span className="sidebar-logo" style={{ width: 30, height: 30, fontSize: '0.85rem' }}>
          <i className="fa-solid fa-screwdriver-wrench"></i>
        </span>
      </div>

      <div className="navbar-search" style={{ position: 'relative' }}>
        <span className="search-icon">
          <i className="fa-solid fa-magnifying-glass"></i>
        </span>
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
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
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
        <button className="navbar-action-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} style={{ border: 'none', outline: 'none' }}>
          {theme === 'dark' ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
        </button>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="navbar-action-btn" title="GitHub">
          <i className="fa-brands fa-github"></i>
        </a>
      </div>
    </nav>
  );
}
