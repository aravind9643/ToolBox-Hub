import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { tools, categories as rawCategories } from '../../data/tools';

export default function Sidebar({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically group tools by categories from data/tools.js
  const dynamicCategories = rawCategories.map(catTitle => ({
    title: catTitle,
    items: tools
      .filter(t => t.category === catTitle)
      .map(t => ({
        path: t.path,
        icon: t.icon,
        label: t.title
      }))
  }));

  const filteredCategories = dynamicCategories.map(cat => {
    const matchedItems = cat.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, items: matchedItems };
  }).filter(cat => cat.items.length > 0);

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Sidebar Search Bar */}
        <div className="sidebar-search-container">
          <div className="sidebar-search-wrapper">
            <span className="sidebar-search-icon">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              placeholder="Filter menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="sidebar-search-clear"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav" style={{ overflowY: 'auto' }}>
          {!searchQuery && (
            <>
              <div className="sidebar-section-title">Home</div>
              <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose} end>
                <span className="sidebar-link-icon">
                  <i className="fa-solid fa-house"></i>
                </span>
                All Tools
              </NavLink>
            </>
          )}

          {filteredCategories.map((cat) => (
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

          {filteredCategories.length === 0 && (
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No matching tools found
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
