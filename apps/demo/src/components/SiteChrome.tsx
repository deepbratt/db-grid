import { Link } from 'react-router-dom';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">D</span>
          <span className="brand-text">db-grid</span>
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer site-footer-min">
      <p className="site-footer-copy">© {new Date().getFullYear()} db-grid</p>
    </footer>
  );
}
