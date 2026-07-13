import { useMemo, useState } from 'react';
import { AG_GRID_REACT_SLUGS, PARITY_STATUS, type ParityStatus } from '@deepbratt55/db-grid';

type Status = 'done' | 'progress';

interface Feature {
  name: string;
  status: Status;
}

function f(name: string, status: Status = 'done'): Feature {
  return { name, status };
}

const COMMUNITY: Feature[] = [
  f('Column defs, valueGetter / valueFormatter'),
  f('Custom cell renderers'),
  f('Custom / typed cell editors (text, number, date, boolean, select)'),
  f('Sorting (multi-column with Shift)'),
  f('Filtering (text, number, set, date, boolean, blank)'),
  f('Floating filter row'),
  f('Column menu (⋮ button + header right-click): sort, pin, hide, autosize, filter'),
  f('Quick filter + Find'),
  f('External filter hook (isExternalFilterPresent / doesExternalFilterPass)'),
  f('Pagination + page size selector'),
  f('Row selection (single / multiple) + checkbox selection'),
  f('Column resize, flex, pin (sticky left), hide'),
  f('Cell editing with undo/redo'),
  f('Fill handle (drag to extend series)'),
  f('Copy / paste clipboard (TSV, Excel-compatible)'),
  f('Row & column virtualization'),
  f('Keyboard navigation (arrows, Enter to edit, Esc to cancel) / ARIA grid roles'),
  f('CSV export'),
  f('cellClassRules / rowClassRules / getRowClass / getRowStyle'),
  f('Loading & no-rows overlays'),
  f('Row numbers column'),
  f('Value cache + cell change flash'),
  f('Full-row / single-click / batch edit modes'),
  f('Cell expressions + formula bar'),
  f('ThemeParams API (quartz / alpine / balham / material)'),
  f('RTL, localeText, tooltips, touch long-press'),
  f('Print layout (domLayout=print)'),
  f('CSV/TSV drag-drop import'),
];

const ENTERPRISE: Feature[] = [
  f('Row grouping + expand/collapse'),
  f('Group footers (groupIncludeFooter) with aggregated totals'),
  f('Aggregations (sum, avg, min, max, count) + custom aggFunc registry'),
  f('Pivot mode'),
  f('Tree data'),
  f('Master / detail nested views (custom renderer or built-in DetailGrid)'),
  f('Range selection + clipboard copy/paste'),
  f('Sparklines in cells (line / bar / area)'),
  f('Excel export — styled SpreadsheetML (zebra rows, typed cells)'),
  f('Columns & Filters tool panels'),
  f('Context menu + getContextMenuItems override'),
  f('Status bar with live selection stats (sum/avg/min/max/count)'),
  f('Undo / redo cell editing'),
  f('Formulas (= [price]*[quantity] )'),
  f('Server-Side Row Model (SSRM)'),
  f('Grid state save/restore (getState/setState, serializeGridState)'),
  f('applyTransaction / applyTransactionAsync'),
  f('License key validation + watermark'),
  f('Set filter (searchable multi-select) & date filter (equals/after/before/range)'),
  f('Pinned top/bottom rows'),
  f('Column virtualization (center cols)'),
  f('Infinite row model block cache (InfiniteCache)'),
  f('Row / column spanning'),
  f('Full-width rows + loading cell renderer'),
  f('Rich select / large text editors'),
  f('Multi + advanced + BigInt filters'),
  f('Cell notes, QAT toolbar, custom icons'),
  f('Grand total footer + fill / range handles'),
];

const BEYOND = [
  'Native PostgreSQL SSRM adapter (sort/filter/page in SQL)',
  'Natural-language AI filter endpoint',
  'Realtime WebSocket tick updates',
  'Custom licensing dashboard (issue / revoke / activations / events)',
  'HMAC-signed DBG.* license keys',
  'Seat usage & org billing control plane',
  'Focused package: @deepbratt55/db-grid (Excel-like grid)',
];

const PARITY_LABELS: Record<ParityStatus, string> = {
  done: 'Done',
  partial: 'Partial',
  todo: 'Todo',
  na: 'N/A',
};

function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul>
      {items.map((f) => (
        <li key={f.name}>
          <span className={`status-badge status-${f.status}`}>
            {f.status === 'done' ? '✅' : '🚧'}
          </span>{' '}
          {f.name}
        </li>
      ))}
    </ul>
  );
}

function ParityBadge({ status }: { status: ParityStatus }) {
  return <span className={`parity-badge parity-${status}`}>{PARITY_LABELS[status]}</span>;
}

export function FeaturesPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ParityStatus | 'all'>('all');

  const filteredSlugs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AG_GRID_REACT_SLUGS.filter((slug) => {
      const status = PARITY_STATUS[slug] ?? 'todo';
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (!q) return true;
      return slug.includes(q);
    });
  }, [query, statusFilter]);

  const counts = useMemo(() => {
    const tally = { done: 0, partial: 0, todo: 0, na: 0 };
    for (const slug of AG_GRID_REACT_SLUGS) {
      const status = PARITY_STATUS[slug] ?? 'todo';
      tally[status]++;
    }
    return tally;
  }, []);

  return (
    <main className="page features-page">
      <h1>Feature matrix vs AG Grid</h1>
      <p className="lede">
        Scraped from{' '}
        <a href="https://www.ag-grid.com/react-data-grid/" target="_blank" rel="noreferrer">
          ag-grid.com
        </a>{' '}
        community/enterprise docs — implemented in db-grid, then extended.
      </p>
      <div className="feature-grid">
        <section>
          <h2>Community (parity)</h2>
          <FeatureList items={COMMUNITY} />
        </section>
        <section>
          <h2>Enterprise (parity)</h2>
          <FeatureList items={ENTERPRISE} />
        </section>
        <section>
          <h2>Beyond AG Grid</h2>
          <ul>
            {BEYOND.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="parity-matrix">
        <div className="parity-matrix-header">
          <h2>Full AG Grid React docs parity ({AG_GRID_REACT_SLUGS.length} pages)</h2>
          <p className="parity-summary">
            <span className="parity-badge parity-done">{counts.done} done</span>
            <span className="parity-badge parity-partial">{counts.partial} partial</span>
            <span className="parity-badge parity-todo">{counts.todo} todo</span>
            <span className="parity-badge parity-na">{counts.na} n/a</span>
          </p>
        </div>

        <div className="parity-controls">
          <label>
            Search docs
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by slug…"
            />
          </label>
          <label>
            Status
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ParityStatus | 'all')}>
              <option value="all">All</option>
              <option value="done">Done</option>
              <option value="partial">Partial</option>
              <option value="todo">Todo</option>
              <option value="na">N/A</option>
            </select>
          </label>
          <span className="parity-count">
            Showing {filteredSlugs.length} of {AG_GRID_REACT_SLUGS.length}
          </span>
        </div>

        <div className="parity-table-wrap">
          <table className="parity-table">
            <thead>
              <tr>
                <th>Doc slug</th>
                <th>Status</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlugs.map((slug) => {
                const status = PARITY_STATUS[slug] ?? 'todo';
                return (
                  <tr key={slug}>
                    <td>
                      <code>{slug}</code>
                    </td>
                    <td>
                      <ParityBadge status={status} />
                    </td>
                    <td>
                      <a
                        href={`https://www.ag-grid.com/react-data-grid/${slug}/`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View docs
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
