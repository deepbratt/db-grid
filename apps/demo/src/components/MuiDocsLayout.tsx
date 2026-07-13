import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { MUI_NAV_SECTIONS } from '../data/muiCatalog';
import { ThemeProvider } from '@db-grid/ui';

export function MuiDocsLayout() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  const toc = useMemo(
    () => MUI_NAV_SECTIONS.map((s) => ({ id: s.id, title: s.title })),
    []
  );

  return (
    <ThemeProvider mode="light">
      <div className="mui-docs">
        <header className="mui-docs-topbar">
          <button type="button" className="mui-docs-menu-btn" aria-label="Open menu" onClick={() => setOpen(true)}>
            ☰
          </button>
          <Link to="/material-ui/all-components" className="mui-docs-brand">
            <span className="mui-docs-brand-mark">D</span>
            <span>
              <strong>db-grid</strong>
              <em>Excel-like data grid</em>
            </span>
          </Link>
          <nav className="mui-docs-top-links">
            <Link to="/">Home</Link>
            <Link to="/db-grid/installation">Install</Link>
            <Link to="/material-ui/all-components">Features</Link>
            <Link to="/demos/live">Kitchen sink</Link>
            <Link to="/demos">Demos</Link>
          </nav>
          <input className="mui-docs-search" placeholder="Search…" readOnly title="Search (visual)" />
        </header>

        <div className="mui-docs-body">
          <aside className={`mui-docs-sidebar ${open ? 'open' : ''}`}>
            <div className="mui-docs-sidebar-head">
              <span>Documentation</span>
              <button type="button" className="mui-docs-close" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <p className="mui-docs-nav-group">Getting started</p>
            <NavLink to="/" className="mui-docs-nav-link" onClick={() => setOpen(false)}>
              Overview
            </NavLink>
            <NavLink
              to="/db-grid/installation"
              className={({ isActive }) => `mui-docs-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              Installation
            </NavLink>

            <p className="mui-docs-nav-group">Grid</p>
            <NavLink
              to="/material-ui/all-components"
              className={({ isActive }) => `mui-docs-nav-link ${isActive ? 'active' : ''}`}
              end
              onClick={() => setOpen(false)}
            >
              All features
            </NavLink>

            {MUI_NAV_SECTIONS.map((section) => (
              <div key={section.id} className="mui-docs-nav-section">
                <p className="mui-docs-nav-label">{section.title}</p>
                {section.items.map((item) => (
                  <NavLink
                    key={item.slug}
                    to={item.href}
                    className={({ isActive }) => `mui-docs-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <span>{item.title}</span>
                    {item.badge && <span className={`mui-badge mui-badge-${String(item.badge).toLowerCase()}`}>{item.badge}</span>}
                  </NavLink>
                ))}
              </div>
            ))}
          </aside>

          {open && <button type="button" className="mui-docs-backdrop" aria-label="Close" onClick={() => setOpen(false)} />}

          <main className="mui-docs-main">
            <Outlet />
          </main>

          {loc.pathname.includes('all-components') && (
            <aside className="mui-docs-toc">
              <p className="mui-docs-toc-title">Contents</p>
              <ul>
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`}>{t.title}</a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
