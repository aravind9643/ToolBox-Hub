import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ToolCard from '../components/ToolCard';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import { categories, tools } from '../data/tools';

const readList = key => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};

export default function Home() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [sort, setSort] = useState(params.get('sort') || 'featured');
  const [favorites, setFavorites] = useState(() => readList('toolbox-favorites'));
  const recent = readList('toolbox-recent');

  useEffect(() => {
    const next = {};
    if (query) next.q = query;
    if (category !== 'All') next.category = category;
    if (sort !== 'featured') next.sort = sort;
    setParams(next, { replace: true });
  }, [query, category, sort, setParams]);

  const visibleTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = tools.filter(tool => (category === 'All' || tool.category === category) &&
      (!q || `${tool.title} ${tool.description} ${tool.tags}`.toLowerCase().includes(q)));
    if (sort === 'az') result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'favorites') result = result.filter(tool => favorites.includes(tool.path));
    if (sort === 'recent') result = [...result].sort((a, b) => recent.indexOf(a.path) - recent.indexOf(b.path)).filter(t => recent.includes(t.path));
    return result;
  }, [query, category, sort, favorites, recent]);

  const toggleFavorite = path => {
    const next = favorites.includes(path) ? favorites.filter(item => item !== path) : [...favorites, path];
    setFavorites(next);
    localStorage.setItem('toolbox-favorites', JSON.stringify(next));
  };

  return <>
    <SEOHead title={null} description="52 free, private browser tools for calculations, conversion, development, design and productivity." />
    <section className="hero">
      <div className="hero-badge">✨ Free, private and no sign-up</div>
      <h1>Your All-in-One Online Toolbox</h1>
      <p>Fast utilities that run in your browser. Find the right tool and get back to the interesting work.</p>
    </section>
    <section aria-labelledby="tools-heading">
      <div className="catalog-heading">
        <div><h2 id="tools-heading">Explore tools</h2><p>{visibleTools.length} of {tools.length} tools</p></div>
        <label className="sort-control"><span>Show</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="az">A–Z</option><option value="favorites">Favorites</option><option value="recent">Recently used</option></select></label>
      </div>
      <label className="catalog-search">
        <span className="sr-only">Filter tool cards</span>
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filter tools by name or feature…" />
        {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear tool filter"><i className="fa-solid fa-xmark" aria-hidden="true" /></button>}
      </label>
      <div className="category-chips" role="group" aria-label="Filter by category">
        {['All', ...categories].map(item => <button type="button" key={item} className={category === item ? 'active' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      {visibleTools.length ? <div className="tools-grid">{visibleTools.map(tool => <ToolCard key={tool.path} {...tool} favorite={favorites.includes(tool.path)} onFavorite={toggleFavorite} />)}</div> :
        <div className="empty-state"><i className="fa-solid fa-magnifying-glass" /><h3>No tools found</h3><p>Try another search or clear the active filters.</p><button className="btn btn-primary" onClick={() => { setQuery(''); setCategory('All'); setSort('featured'); }}>Clear filters</button></div>}
    </section>
    <AdBanner type="footer" />
  </>;
}
