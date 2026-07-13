import { Link } from 'react-router-dom';

const STATS = [
  { value: '324', label: 'Features marked done' },
  { value: '358', label: 'AG Grid docs pages mapped' },
  { value: '94%', label: 'Community parity' },
  { value: 'MIT', label: 'Community license' },
];

export function CommunityPage() {
  return (
    <main className="page community-page">
      <header className="page-hero">
        <p className="eyebrow">Open source</p>
        <h1>Community</h1>
        <p className="lede">
          db-grid Community is free for production use. Enterprise features unlock with a
          license key from the control plane.
        </p>
      </header>

      <div className="community-grid">
        <section className="community-card">
          <h2>GitHub</h2>
          <p>Source, issues, and contributions — built in the open alongside AG Grid parity work.</p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="btn primary"
          >
            View on GitHub
          </a>
        </section>

        <section className="community-card">
          <h2>Feature matrix</h2>
          <p>
            Compare Community, Enterprise, and db-grid–specific capabilities against the scraped
            AG Grid docs surface.
          </p>
          <Link to="/features" className="btn primary">
            Open feature matrix
          </Link>
        </section>

        <section className="community-card">
          <h2>Licensing dashboard</h2>
          <p>
            Issue keys, track seat utilization, and validate licenses against the db-grid API.
          </p>
          <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="btn primary">
            Open dashboard
          </a>
        </section>

        <section className="community-card community-stats">
          <h2>Parity stats</h2>
          <div className="community-stat-grid">
            {STATS.map((s) => (
              <article key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </article>
            ))}
          </div>
          <p className="hint">
            Track progress in <code>FEATURE_IMPLEMENTATION_PLAN.md</code> and the live matrix.
          </p>
        </section>
      </div>
    </main>
  );
}
