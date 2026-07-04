import { NavLink } from 'react-router-dom';

const categories = [
  {
    title: 'Generators',
    items: [
      { path: '/qr-code-generator', icon: 'fa-solid fa-qrcode', label: 'QR Code Generator' },
      { path: '/password-generator', icon: 'fa-solid fa-shield-halved', label: 'Password Generator' },
      { path: '/lorem-ipsum', icon: 'fa-solid fa-file-lines', label: 'Lorem Ipsum' },
      { path: '/gradient-generator', icon: 'fa-solid fa-palette', label: 'Gradient Generator' }
    ]
  },
  {
    title: 'Converters & Utilities',
    items: [
      { path: '/unit-converter', icon: 'fa-solid fa-ruler-combined', label: 'Unit Converter' },
      { path: '/color-picker', icon: 'fa-solid fa-eye-dropper', label: 'Color Picker' },
      { path: '/timestamp-converter', icon: 'fa-solid fa-clock', label: 'Timestamp Converter' },
      { path: '/base64-converter', icon: 'fa-solid fa-right-left', label: 'Base64 Converter' }
    ]
  },
  {
    title: 'Calculators',
    items: [
      { path: '/bmi-calculator', icon: 'fa-solid fa-weight-scale', label: 'BMI Calculator' },
      { path: '/age-calculator', icon: 'fa-solid fa-cake-candles', label: 'Age Calculator' },
      { path: '/loan-calculator', icon: 'fa-solid fa-coins', label: 'Loan Calculator' }
    ]
  },
  {
    title: 'Text & Development',
    items: [
      { path: '/word-counter', icon: 'fa-solid fa-paragraph', label: 'Word Counter' },
      { path: '/json-formatter', icon: 'fa-solid fa-code', label: 'JSON Formatter' },
      { path: '/markdown-previewer', icon: 'fa-solid fa-file-code', label: 'Markdown Previewer' },
      { path: '/regex-tester', icon: 'fa-solid fa-magnifying-glass', label: 'Regex Tester' },
      { path: '/image-compressor', icon: 'fa-solid fa-file-image', label: 'Image Compressor' }
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>
          <span className="sidebar-title">ToolBox Hub</span>
          <button className="sidebar-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
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
