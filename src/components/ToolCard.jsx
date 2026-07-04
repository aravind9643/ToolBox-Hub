import { Link } from 'react-router-dom';

export default function ToolCard({ icon, title, description, path, color, category, favorite, onFavorite }) {
  return (
    <article className="tool-card" style={{ '--tool-color': color }}>
      <button type="button" className={`favorite-btn ${favorite ? 'active' : ''}`} aria-label={`${favorite ? 'Remove' : 'Add'} ${title} ${favorite ? 'from' : 'to'} favorites`} aria-pressed={favorite} onClick={() => onFavorite?.(path)}><i className={`${favorite ? 'fa-solid' : 'fa-regular'} fa-star`} aria-hidden="true" /></button>
      <Link to={path} className="tool-card-link" onClick={() => {
        const recent = JSON.parse(localStorage.getItem('toolbox-recent') || '[]').filter(item => item !== path);
        localStorage.setItem('toolbox-recent', JSON.stringify([path, ...recent].slice(0, 12)));
      }}>
      <div className="tool-card-icon">
        <i className={icon}></i>
      </div>
      <span className="tool-card-category">{category}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="tool-card-arrow">
        <i className="fa-solid fa-arrow-right"></i>
      </span>
      </Link>
    </article>
  );
}
