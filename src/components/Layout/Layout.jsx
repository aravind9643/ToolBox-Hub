import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

function LoadingScreen() {
  return (
    <div className="route-loading" role="status" aria-live="polite" style={{ display: 'grid', placeContent: 'center', justifyItems: 'center', minHeight: '60vh', gap: '1rem', color: 'var(--text-secondary)' }}>
      <span className="loading-spinner" />
      <span>Loading tool…</span>
    </div>
  );
}

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
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}
