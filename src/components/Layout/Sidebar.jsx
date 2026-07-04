import { NavLink } from 'react-router-dom';

const tools = [
  { path: '/qr-code-generator', icon: '📱', label: 'QR Code Generator' },
  { path: '/password-generator', icon: '🔐', label: 'Password Generator' },
  { path: '/unit-converter', icon: '📏', label: 'Unit Converter' },
  { path: '/color-picker', icon: '🎨', label: 'Color Picker' },
  { path: '/bmi-calculator', icon: '⚖️', label: 'BMI Calculator' },
  { path: '/age-calculator', icon: '🎂', label: 'Age Calculator' },
  { path: '/loan-calculator', icon: '💰', label: 'Loan Calculator' },
  { path: '/word-counter', icon: '📝', label: 'Word Counter' },
  { path: '/json-formatter', icon: '{ }', label: 'JSON Formatter' },
  { path: '/image-compressor', icon: '🖼️', label: 'Image Compressor' },
  { path: '/base64-converter', icon: '🔄', label: 'Base64 Converter' },
  { path: '/lorem-ipsum', icon: '📄', label: 'Lorem Ipsum' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">T</div>
          <span className="sidebar-title">ToolBox Hub</span>
          <button className="sidebar-close-btn" onClick={onClose}>✕</button>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Home</div>
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose} end>
            <span className="sidebar-link-icon">🏠</span>
            All Tools
          </NavLink>

          <div className="sidebar-section-title">Generators</div>
          {tools.slice(0, 2).map(t => (
            <NavLink key={t.path} to={t.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <span className="sidebar-link-icon">{t.icon}</span>
              {t.label}
            </NavLink>
          ))}

          <div className="sidebar-section-title">Converters</div>
          {tools.slice(2, 4).map(t => (
            <NavLink key={t.path} to={t.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <span className="sidebar-link-icon">{t.icon}</span>
              {t.label}
            </NavLink>
          ))}

          <div className="sidebar-section-title">Calculators</div>
          {tools.slice(4, 7).map(t => (
            <NavLink key={t.path} to={t.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <span className="sidebar-link-icon">{t.icon}</span>
              {t.label}
            </NavLink>
          ))}

          <div className="sidebar-section-title">Text & Data</div>
          {tools.slice(7, 10).map(t => (
            <NavLink key={t.path} to={t.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <span className="sidebar-link-icon">{t.icon}</span>
              {t.label}
            </NavLink>
          ))}

          <div className="sidebar-section-title">Utilities</div>
          {tools.slice(10).map(t => (
            <NavLink key={t.path} to={t.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <span className="sidebar-link-icon">{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
