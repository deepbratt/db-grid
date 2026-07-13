import { Link } from 'react-router-dom';
import { MUI_NAV_SECTIONS, type CatalogBadge } from '../data/muiCatalog';

function PreviewArt({ slug, sectionId }: { slug: string; sectionId: string }) {
  const kind =
    sectionId === 'excel'
      ? 'excel'
      : sectionId === 'presentation' || slug === 'sparklines'
        ? 'spark'
        : sectionId === 'filtering'
          ? 'filter'
          : sectionId === 'enterprise-data'
            ? 'group'
            : sectionId === 'columns'
              ? 'columns'
              : sectionId === 'styling'
                ? 'theme'
                : 'grid';

  return (
    <div className={`mui-comp-art mui-comp-art-${kind}`} aria-hidden>
      {kind === 'excel' && (
        <span className="mui-art-excel">
          <span className="mui-art-excel-fx">fx</span>
          <span className="mui-art-excel-cells">
            <i /><i /><i /><i />
          </span>
        </span>
      )}
      {kind === 'grid' && (
        <span className="mui-art-grid">
          <i /><i /><i /><i /><i /><i />
        </span>
      )}
      {kind === 'spark' && (
        <span className="mui-art-chart">
          <i style={{ height: '40%' }} />
          <i style={{ height: '70%' }} />
          <i style={{ height: '55%' }} />
          <i style={{ height: '85%' }} />
        </span>
      )}
      {kind === 'filter' && (
        <span className="mui-art-generic">
          <i /><i /><i />
        </span>
      )}
      {kind === 'group' && (
        <span className="mui-art-generic">
          <i /><i /><i />
        </span>
      )}
      {kind === 'columns' && (
        <span className="mui-art-grid">
          <i /><i /><i /><i /><i /><i />
        </span>
      )}
      {kind === 'theme' && <span className="mui-art-pkg" />}
    </div>
  );
}

function Badge({ badge }: { badge?: CatalogBadge }) {
  if (!badge) return null;
  return <span className={`mui-card-badge mui-badge mui-badge-${String(badge).toLowerCase()}`}>{badge}</span>;
}

export function AllComponentsPage() {
  return (
    <article className="mui-all-components">
      <header className="mui-all-hero">
        <p className="mui-all-kicker">Excel-like · AG Grid class</p>
        <h1>Grid features</h1>
        <p className="mui-all-lede">
          One React data grid: spreadsheet formulas, clipboard, fill-handle, Excel I/O — plus the full AG Grid
          feature surface (grouping, pivot, SSRM, charts, and more).
        </p>
        <div className="mui-all-actions">
          <Link to="/db-grid/installation" className="mui-all-cta">
            Install @deepbratt55/db-grid
          </Link>
          <Link to="/demos/live" className="mui-all-cta ghost">
            Kitchen sink
          </Link>
          <code className="mui-all-pkg">npm i @deepbratt55/db-grid</code>
        </div>
      </header>

      {MUI_NAV_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="mui-comp-section">
          <div className="mui-comp-section-head">
            <h2>{section.title}</h2>
            <span className="mui-comp-count">{section.items.length}</span>
          </div>
          <div className="mui-comp-grid">
            {section.items.map((item) => (
              <Link key={item.slug} to={item.href} className="mui-comp-card">
                <div className="mui-comp-card-preview">
                  <PreviewArt slug={item.slug} sectionId={section.id} />
                  <Badge badge={item.badge} />
                </div>
                <div className="mui-comp-card-foot">
                  <div>
                    <span className="mui-comp-card-title">{item.title}</span>
                    {item.blurb && <p className="mui-comp-card-blurb">{item.blurb}</p>}
                  </div>
                  <span className="mui-comp-card-arrow" aria-hidden>
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
