import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') return;
    const recent = JSON.parse(localStorage.getItem('toolbox-recent') || '[]').filter(item => item !== location.pathname);
    localStorage.setItem('toolbox-recent', JSON.stringify([location.pathname, ...recent].slice(0, 12)));
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-container" id="main-content" tabIndex="-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
