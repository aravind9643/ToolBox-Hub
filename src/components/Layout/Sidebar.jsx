import { NavLink } from 'react-router-dom';

const categories = [
  {
    title: 'Generators',
    items: [
      { path: '/qr-code-generator', icon: 'fa-solid fa-qrcode', label: 'QR Code Generator' },
      { path: '/qr-code-scanner', icon: 'fa-solid fa-camera', label: 'QR Code Scanner' },
      { path: '/password-generator', icon: 'fa-solid fa-shield-halved', label: 'Password Generator' },
      { path: '/lorem-ipsum', icon: 'fa-solid fa-file-lines', label: 'Lorem Ipsum' },
      { path: '/gradient-generator', icon: 'fa-solid fa-palette', label: 'Gradient Generator' },
      { path: '/uuid-generator', icon: 'fa-solid fa-fingerprint', label: 'UUID Generator' },
      { path: '/ascii-art-generator', icon: 'fa-solid fa-font', label: 'ASCII Art Generator' },
      { path: '/hash-generator', icon: 'fa-solid fa-hashtag', label: 'Hash Generator' }
    ]
  },
  {
    title: 'Converters & Utilities',
    items: [
      { path: '/unit-converter', icon: 'fa-solid fa-ruler-combined', label: 'Unit Converter' },
      { path: '/color-picker', icon: 'fa-solid fa-eye-dropper', label: 'Color Picker' },
      { path: '/timestamp-converter', icon: 'fa-solid fa-clock', label: 'Timestamp Converter' },
      { path: '/base64-converter', icon: 'fa-solid fa-right-left', label: 'Base64 Converter' },
      { path: '/currency-converter', icon: 'fa-solid fa-money-bill-transfer', label: 'Currency Converter' },
      { path: '/morse-code-translator', icon: 'fa-solid fa-tower-broadcast', label: 'Morse Code Translator' },
      { path: '/color-palette-extractor', icon: 'fa-solid fa-palette', label: 'Palette Extractor' },
      { path: '/exif-metadata-viewer', icon: 'fa-solid fa-camera-retro', label: 'EXIF Viewer' },
      { path: '/svg-png-converter', icon: 'fa-solid fa-file-export', label: 'SVG to PNG' }
    ]
  },
  {
    title: 'Calculators',
    items: [
      { path: '/bmi-calculator', icon: 'fa-solid fa-weight-scale', label: 'BMI Calculator' },
      { path: '/age-calculator', icon: 'fa-solid fa-cake-candles', label: 'Age Calculator' },
      { path: '/loan-calculator', icon: 'fa-solid fa-coins', label: 'Loan Calculator' },
      { path: '/compound-interest-calculator', icon: 'fa-solid fa-chart-line', label: 'Compound Interest' },
      { path: '/tip-calculator', icon: 'fa-solid fa-coins', label: 'Tip Calculator' },
      { path: '/date-calculator', icon: 'fa-solid fa-calendar-days', label: 'Date Calculator' },
      { path: '/tdee-calculator', icon: 'fa-solid fa-calculator', label: 'TDEE Calculator' },
      { path: '/unit-price-calculator', icon: 'fa-solid fa-scale-balanced', label: 'Unit Price' },
      { path: '/number-base-converter', icon: 'fa-solid fa-calculator', label: 'Base Converter' }
    ]
  },
  {
    title: 'Text & Development',
    items: [
      { path: '/word-counter', icon: 'fa-solid fa-paragraph', label: 'Word Counter' },
      { path: '/text-cleaner', icon: 'fa-solid fa-wand-magic-sparkles', label: 'Text Cleaner' },
      { path: '/json-formatter', icon: 'fa-solid fa-code', label: 'JSON Formatter' },
      { path: '/markdown-previewer', icon: 'fa-solid fa-file-code', label: 'Markdown Previewer' },
      { path: '/regex-tester', icon: 'fa-solid fa-magnifying-glass', label: 'Regex Tester' },
      { path: '/image-compressor', icon: 'fa-solid fa-file-image', label: 'Image Compressor' },
      { path: '/diff-checker', icon: 'fa-solid fa-code-compare', label: 'Diff Checker' },
      { path: '/json-yaml-converter', icon: 'fa-solid fa-code', label: 'JSON to YAML' }
    ]
  },
  {
    title: 'Design Tools',
    items: [
      { path: '/box-shadow-generator', icon: 'fa-solid fa-layer-group', label: 'Box Shadow Generator' },
      { path: '/aspect-ratio-calculator', icon: 'fa-solid fa-expand', label: 'Aspect Ratio Calculator' },
      { path: '/contrast-checker', icon: 'fa-solid fa-circle-half-stroke', label: 'Contrast Checker' },
      { path: '/color-palette-generator', icon: 'fa-solid fa-palette', label: 'Palette Generator' },
      { path: '/password-strength-tester', icon: 'fa-solid fa-shield-halved', label: 'Password Strength Tester' }
    ]
  },
  {
    title: 'Productivity',
    items: [
      { path: '/pomodoro-timer', icon: 'fa-solid fa-clock', label: 'Pomodoro Timer' },
      { path: '/countdown-timer', icon: 'fa-solid fa-hourglass-half', label: 'Countdown Timer' },
      { path: '/decision-maker', icon: 'fa-solid fa-dice', label: 'Decision Maker' }
    ]
  },
  {
    title: 'Device Sensors',
    items: [
      { path: '/compass', icon: 'fa-solid fa-compass', label: 'Compass' },
      { path: '/speedometer', icon: 'fa-solid fa-gauge', label: 'Speedometer' }
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 10 }}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        <nav className="sidebar-nav" style={{ paddingTop: '1.5rem' }}>
          <div className="sidebar-section-title">Home</div>
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose} end>
            <span className="sidebar-link-icon">
              <i className="fa-solid fa-house"></i>
            </span>
            All Tools
          </NavLink>

          {categories.map((cat) => (
            <div key={cat.title}>
              <div className="sidebar-section-title">{cat.title}</div>
              {cat.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="sidebar-link-icon">
                    <i className={item.icon}></i>
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
