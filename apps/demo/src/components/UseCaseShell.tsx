import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export type UseCaseAction = {
  label: string;
  onClick: () => void;
  primary?: boolean;
  active?: boolean;
  disabled?: boolean;
};

type Props = {
  eyebrow: string;
  title: string;
  lede: string;
  live?: boolean;
  tickCount?: number;
  speedMs?: number;
  actions: UseCaseAction[];
  children: ReactNode;
  features?: string[];
};

export function UseCaseShell({
  eyebrow,
  title,
  lede,
  live,
  tickCount,
  speedMs,
  actions,
  children,
  features,
}: Props) {
  return (
    <main className="usecase-page">
      <header className="usecase-header">
        <div className="usecase-header-copy">
          <p className="usecase-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede">{lede}</p>
        </div>
        <div className="usecase-meta">
          <span className={`usecase-live-pill ${live ? 'on' : 'off'}`}>
            <i />
            {live ? 'Live' : 'Paused'}
          </span>
          {typeof tickCount === 'number' && <span className="usecase-stat">Ticks {tickCount}</span>}
          {typeof speedMs === 'number' && <span className="usecase-stat">{speedMs}ms</span>}
          <Link to="/demos" className="usecase-back">
            All demos →
          </Link>
        </div>
      </header>

      <div className="usecase-toolbar" role="toolbar" aria-label="Demo actions">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            className={`btn ${a.primary ? 'primary' : ''} ${a.active ? 'usecase-btn-active' : ''}`}
            onClick={a.onClick}
            disabled={a.disabled}
          >
            {a.label}
          </button>
        ))}
      </div>

      <section className="usecase-grid-stage">{children}</section>

      {features && features.length > 0 && (
        <section className="usecase-features">
          <h2>What this demo shows</h2>
          <ul>
            {features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
