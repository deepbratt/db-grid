import { Link } from 'react-router-dom';
import { DEMO_CARDS } from '../data/demoCards';

export function DemosHubPage() {
  return (
    <main className="page page-wide demos-hub">
      <header className="demos-hub-hero">
        <h1>Demos</h1>
        <p className="lede">Live trading &amp; finance blotters, plus Excel-like and enterprise demos.</p>
      </header>
      <div className="demo-card-grid large">
        {DEMO_CARDS.map((d) => (
          <Link key={d.id} to={d.to} className="demo-card">
            <span className="demo-tag">{d.tag}</span>
            <h3>{d.title}</h3>
            <p>{d.blurb}</p>
            <span className="demo-open">Open →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
