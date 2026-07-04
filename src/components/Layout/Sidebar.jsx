import { NavLink } from 'react-router-dom';

const categories = [
  {
    title: 'Generators',
    items: [
      { path: '/qr-code-generator', icon: '📱', label: 'QR Code Generator' },
      { path: '/password-generator', icon: '🔐', label: 'Password Generator' },
      { path: '/lorem-ipsum', icon: '📄', label: 'Lorem Ipsum' },
      { path: '/gradient-generator', icon: '🌈', label: 'Gradient Generator' }
    ]
  },
  {
    title: 'Converters & Utilities',
    items: [
      { path: '/unit-converter', icon: '📏', label: 'Unit Converter' },
      { path: '/color-picker', icon: '🎨', label: 'Color Picker' },
      { path: '/timestamp-converter', icon: '⏰', label: 'Timestamp Converter' },
      { path: '/base64-converter', icon: '🔄', label: 'Base64 Converter' }
    ]
  },
  {
    title: 'Calculators',
    items: [
      { path: '/bmi-calculator', icon: '⚖️', label: 'BMI Calculator' },
      { path: '/age-calculator', icon: '🎂', label: 'Age Calculator' },
      { path: '/loan-calculator', icon: '💰', label: 'Loan Calculator' }
    ]
  },
  {
    title: 'Text & Development',
    items: [
      { path: '/word-counter', icon: '📝', label: 'Word Counter' },
      { path: '/json-formatter', icon: '{ }', label: 'JSON Formatter' },
      { path: '/markdown-previewer', icon: '✍️', label: 'Markdown Previewer' },
      { path: '/regex-tester', icon: '🔍', label: 'Regex Tester' },
      { path: '/image-compressor', icon: '🖼️', label: 'Image Compressor' }
    ]
  }
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
                  <span className="sidebar-link-icon">{item.icon}</span>
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
