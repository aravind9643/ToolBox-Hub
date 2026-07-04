import { Link } from 'react-router-dom';

export default function ToolCard({ icon, title, description, path, color }) {
  return (
    <Link to={path} className="tool-card">
      <div className="tool-card-icon" style={{ background: `${color}15`, color: color }}>
        <span>{icon}</span>
        <style>{`.tool-card-icon::after { background: ${color} !important; }`}</style>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="tool-card-arrow">→</span>
    </Link>
  );
}
