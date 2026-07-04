import { Link } from 'react-router-dom';

export default function ToolCard({ icon, title, description, path, color }) {
  return (
    <Link to={path} className="tool-card">
      <div className="tool-card-icon" style={{ background: `${color}15`, color: color }}>
        <i className={icon}></i>
        <style>{`.tool-card-icon::after { background: ${color} !important; }`}</style>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="tool-card-arrow">
        <i className="fa-solid fa-arrow-right"></i>
      </span>
    </Link>
  );
}
