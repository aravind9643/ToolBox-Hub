import { useState, useMemo, useEffect } from 'react';
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
  { path: '/decision-maker',           label: 'Decision Maker',             tags: 'roll dice coin flip spin wheel winner choice random select decision' },
  // Additional Standalone Tools
  { path: '/hash-generator',           label: 'Hash Generator',             tags: 'md5 sha1 sha256 sha512 hash checksum encrypt security' },
  { path: '/color-palette-extractor',  label: 'Color Palette Extractor',    tags: 'image color extract load palette canvas swatch pixel rbg' },
  { path: '/exif-metadata-viewer',     label: 'EXIF Metadata Viewer',       tags: 'exif metadata image details GPS camera parameters privacy edit clear strip' },
  { path: '/svg-png-converter',        label: 'SVG to PNG Converter',       tags: 'svg vector png raster image convert render high-dpi scale backdrop' },
  { path: '/unit-price-calculator',    label: 'Unit Price Calculator',      tags: 'value comparison buy deal cheap price volume weight grams pieces' },
  { path: '/number-base-converter',    label: 'Number Base Converter',      tags: 'base binary octal decimal hex conversion integers division steps' },
  { path: '/diff-checker',             label: 'Diff Checker',               tags: 'compare text difference additions deletions side by side inline code split' },
  { path: '/json-yaml-converter',      label: 'JSON to YAML Converter',     tags: 'json yaml config serialize parsing bidirectional data format conversion' },
  { path: '/compass',                  label: 'Compass',                    tags: 'compass navigation orientation angle heading cardinal N S E W direction sensors' },
  { path: '/speedometer',              label: 'Speedometer',                tags: 'speedometer speed travel GPS coordinates tracker velocity velocity stats max avg' },
  { path: '/voice-recorder',           label: 'Voice Recorder',             tags: 'voice recorder sound recording visualizer mic microphone webm audio waveform' },
  { path: '/bpm-metronome',            label: 'BPM & Metronome',            tags: 'bpm metronome tap beat click rhythm audio tempo count measure timing' },
  { path: '/meme-generator',           label: 'Meme Generator',             tags: 'meme generator caption custom text template image text impact layout' },
  { path: '/glassmorphism-generator',  label: 'Glassmorphism Generator',    tags: 'glassmorphism css style code design backdrop blur opacity transperancy shadow' },
  { path: '/text-to-speech',           label: 'Text to Speech Reader',      tags: 'text to speech speech reader speech synthesis voice audio speaker listen speech read aloud' },
  { path: '/csv-json-converter',       label: 'CSV ↔ JSON Converter',       tags: 'csv json converter spreadsheet array table columns records spreadsheet parsing' },
  { path: '/sketchpad',                label: 'Sketchpad Whiteboard',       tags: 'sketchpad paint drawing whiteboard draw erase sketch sign image transparent png' },
  { path: '/stopwatch',                label: 'Precision Stopwatch',        tags: 'stopwatch timer split lap centisecond clock precise duration delta' },
];

export default function Navbar({ onMenuToggle }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
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

  useEffect(() => {
    setFocusedIndex(-1);
  }, [query]);

  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      setFocusedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      handleSelect(results[focusedIndex].path);
    }
  };

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
          onKeyDown={handleKeyDown}
        />
        {showResults && results.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', overflow: 'hidden', zIndex: 999,
            boxShadow: 'var(--shadow-lg)'
          }}>
            {results.map((r, idx) => (
              <button 
                key={r.path} 
                onTouchStart={(e) => { e.preventDefault(); handleSelect(r.path); }}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(r.path); }} 
                style={{
                  display: 'block', width: '100%', padding: '0.7rem 1rem', textAlign: 'left',
                  background: idx === focusedIndex ? 'var(--bg-glass-hover)' : 'none', border: 'none', color: 'var(--text-primary)',
                  fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s'
                }}
                onMouseEnter={() => setFocusedIndex(idx)}
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
