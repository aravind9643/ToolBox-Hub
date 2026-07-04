import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const allTools = [
  // Generators
  { path: '/qr-code-generator',        label: 'QR Code Generator',         tags: 'qr barcode make creation' },
  { path: '/qr-code-scanner',          label: 'QR Code Scanner',           tags: 'qr scan webcam camera reader decoder' },
  { path: '/password-generator',       label: 'Password Generator',         tags: 'secure random key password creation' },
  { path: '/lorem-ipsum',              label: 'Lorem Ipsum Generator',      tags: 'placeholder text dummy dummytext mockup' },
  { path: '/gradient-generator',       label: 'Gradient Generator',         tags: 'css color design linear radial' },
  { path: '/uuid-generator',           label: 'UUID Generator',             tags: 'guid unique id crypto token' },
  { path: '/ascii-art-generator',      label: 'ASCII Art Generator',        tags: 'text banner font art standard text' },
  // Converters & Utilities
  { path: '/unit-converter',           label: 'Unit Converter',             tags: 'length weight temperature speed data cooking energy pressure' },
  { path: '/color-picker',             label: 'Color Picker & Converter',   tags: 'hex rgb hsl rgb format conversion' },
  { path: '/timestamp-converter',      label: 'Timestamp Converter',        tags: 'unix date epoch time seconds milliseconds' },
  { path: '/base64-converter',         label: 'Base64 Converter',           tags: 'encode decode binary file text' },
  { path: '/currency-converter',       label: 'Currency Converter',         tags: 'money exchange rate forex usd eur gbp inr rates' },
  { path: '/morse-code-translator',    label: 'Morse Code Translator',      tags: 'morse encode decode audio signal dots dashes signal' },
  // Calculators
  { path: '/bmi-calculator',           label: 'BMI Calculator',             tags: 'body mass index health weight mass' },
  { path: '/age-calculator',           label: 'Age Calculator',             tags: 'birthday birth date duration' },
  { path: '/loan-calculator',          label: 'Loan Calculator',            tags: 'emi mortgage interest payment' },
  { path: '/compound-interest-calculator', label: 'Compound Interest Calculator', tags: 'investment savings growth chart compound' },
  { path: '/tip-calculator',           label: 'Tip Calculator',             tags: 'bill split restaurant tip percent calculate' },
  { path: '/date-calculator',          label: 'Date Calculator',            tags: 'business days duration difference add subtract math' },
  { path: '/tdee-calculator',          label: 'TDEE & Calorie Calculator',  tags: 'bmr calories macros diet fitness maintenance bulk cut' },
  // Text & Development
  { path: '/word-counter',             label: 'Word & Character Counter',   tags: 'characters lines reading time words count density' },
  { path: '/text-cleaner',             label: 'Text Cleaner',               tags: 'text format clean trim duplicate empty lines spaces case' },
  { path: '/json-formatter',           label: 'JSON Formatter',             tags: 'format validate beautify json clean pretty print' },
  { path: '/image-compressor',         label: 'Image Compressor',           tags: 'compress optimize photo reduce size optimize crop' },
  { path: '/markdown-previewer',       label: 'Markdown Previewer',         tags: 'md preview render syntax document' },
  { path: '/regex-tester',             label: 'Regex Tester',               tags: 'regular expression match pattern debug test find' },
  // Design Tools
  { path: '/box-shadow-generator',     label: 'Box Shadow Generator',       tags: 'css shadow design layers inset offsets blur' },
  { path: '/aspect-ratio-calculator',  label: 'Aspect Ratio Calculator',    tags: 'resolution scale 16:9 youtube tiktok instagram standard dimensions' },
  { path: '/contrast-checker',         label: 'Contrast Checker',           tags: 'wcag accessibility ratio color preview pass fail AA AAA' },
  { path: '/color-palette-generator',  label: 'Palette Generator',          tags: 'color palette scheme harmony complementary triadic analogous shades' },
  { path: '/password-strength-tester', label: 'Password Strength Tester',   tags: 'entropy crack time security strength lock safe' },
  // Productivity
  { path: '/pomodoro-timer',           label: 'Pomodoro Timer',             tags: 'focus productivity work break sessions clock' },
  { path: '/countdown-timer',          label: 'Countdown Timer',            tags: 'countdown clock timer event birthday deadline live time' },
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
    const q = query.toLowerCase();
    return allTools.filter(t =>
      t.label.toLowerCase().includes(q) || (t.tags && t.tags.toLowerCase().includes(q))
    );
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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div className="sidebar-logo" style={{ width: '32px', height: '32px', fontSize: '0.95rem' }}>
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>
          <span className="sidebar-title" style={{ fontSize: '1.2rem', marginBottom: 0 }}>ToolBox Hub</span>
        </Link>
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
      </div>
    </nav>
  );
}
