import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function NotFound() {
  return (
    <div className="tool-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <SEOHead title="404 — Page Not Found" description="The page you're looking for doesn't exist." />
      <div style={{ fontSize: '6rem', marginBottom: '1rem', animation: 'fadeInUp 0.5s ease' }}>🔍</div>
      <h1 style={{
        fontSize: 'clamp(3rem, 8vw, 6rem)',
        fontWeight: 800,
        background: 'var(--gradient-hero)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.5rem',
        animation: 'fadeInUp 0.5s ease 0.1s both'
      }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem', animation: 'fadeInUp 0.5s ease 0.2s both' }}>
        Oops! This page doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary btn-lg" style={{ animation: 'fadeInUp 0.5s ease 0.3s both' }}>
        ← Back to All Tools
      </Link>
    </div>
  );
}
