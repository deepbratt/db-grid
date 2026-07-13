import { useMemo, useState } from 'react';
import { API_GROUPS } from '../data/siteNav';

export function ApiPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return API_GROUPS;
    return API_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  const totalMatches = filtered.reduce((n, g) => n + g.items.length, 0);

  return (
    <main className="page page-wide api-page">
      <header className="page-hero compact">
        <p className="eyebrow">Reference</p>
        <h1>API</h1>
        <p className="lede">
          Grid instance methods, component props, and column definition fields — searchable
          and aligned with AG Grid naming where possible.
        </p>
      </header>

      <div className="api-search-bar">
        <label>
          Search API
          <input
            type="search"
            placeholder="e.g. exportDataAsExcel, rowGroup, setFilterModel"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <span className="api-count">
          {totalMatches} {totalMatches === 1 ? 'match' : 'matches'}
        </span>
      </div>

      <div className="api-groups">
        {filtered.map((group) => (
          <section key={group.title} className="api-group">
            <h2>{group.title}</h2>
            <div className="api-table-wrap">
              <table className="api-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item) => (
                    <tr key={item.name}>
                      <td>
                        <code>{item.name}</code>
                      </td>
                      <td>{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <p className="hint">No API entries match &ldquo;{query}&rdquo;.</p>
        )}
      </div>
    </main>
  );
}
