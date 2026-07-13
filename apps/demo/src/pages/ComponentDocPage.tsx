import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DbGrid, type ColumnDef } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';
import { Alert, Paper, Stack, Typography } from '@db-grid/ui';
import { findCatalogItem, MUI_NAV_SECTIONS } from '../data/muiCatalog';
import { DEMO_LICENSE_KEY } from '../data/instruments';

type DemoRow = {
  id: string;
  name: string;
  qty: number;
  price: number;
  total: number;
  region: string;
  spark: number[];
};

const ROWS: DemoRow[] = [
  { id: '1', name: 'Alpha', qty: 12, price: 40, total: 480, region: 'EMEA', spark: [3, 5, 4, 7, 6] },
  { id: '2', name: 'Bravo', qty: 8, price: 55, total: 440, region: 'NA', spark: [2, 3, 5, 4, 8] },
  { id: '3', name: 'Charlie', qty: 20, price: 22, total: 440, region: 'APAC', spark: [5, 4, 6, 5, 7] },
  { id: '4', name: 'Delta', qty: 5, price: 120, total: 600, region: 'EMEA', spark: [4, 4, 5, 6, 5] },
  { id: '5', name: 'Echo', qty: 15, price: 33, total: 495, region: 'NA', spark: [6, 5, 4, 8, 9] },
];

function DemoShell({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <Paper elevation={0} className="mui-demo-shell">
      {hint && (
        <Alert severity="info" className="mui-demo-alert">
          {hint}
        </Alert>
      )}
      {children}
    </Paper>
  );
}

function GridStage({ children }: { children: React.ReactNode }) {
  return <div className="mui-db-grid-stage">{children}</div>;
}

function FeatureDemo({ slug }: { slug: string }) {
  const [rows] = useState(ROWS);

  const baseCols = useMemo<ColumnDef<DemoRow>[]>(
    () => [
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 120, editable: true },
      { field: 'region', headerName: 'Region', width: 110, filter: 'set', enableRowGroup: true },
      { field: 'qty', headerName: 'Qty', width: 90, filter: 'number', editable: true, enableValue: true, aggFunc: 'sum' },
      {
        field: 'price',
        headerName: 'Price',
        width: 100,
        filter: 'number',
        editable: true,
        enableValue: true,
        valueFormatter: (p) => (p.value == null ? '' : `$${Number(p.value)}`),
      },
      {
        field: 'total',
        headerName: 'Total',
        width: 110,
        enableValue: true,
        aggFunc: 'sum',
        formula: '=[qty]*[price]',
        valueFormatter: (p) => (p.value == null ? '' : `$${Number(p.value)}`),
      },
    ],
    []
  );

  const common = {
    rowData: rows,
    licenseKey: DEMO_LICENSE_KEY,
    getRowId: (d: DemoRow) => d.id,
    defaultColDef: { sortable: true, filter: true, resizable: true },
    style: { height: 360, width: '100%' } as const,
  };

  switch (slug) {
    case 'db-grid':
    case 'virtualization':
    case 'column-definitions':
      return (
        <DemoShell hint="Default DbGrid — sorting, filtering, resize, Excel-ready editing.">
          <GridStage>
            <DbGrid<DemoRow> {...common} columnDefs={baseCols} pagination paginationPageSize={10} sideBar />
          </GridStage>
        </DemoShell>
      );
    case 'formulas':
      return (
        <DemoShell hint="Total uses formula =[qty]*[price]. Focus a cell to see the formula bar.">
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={baseCols}
              enableFormulaBar
              enableRangeSelection
            />
          </GridStage>
        </DemoShell>
      );
    case 'clipboard':
    case 'range-selection':
      return (
        <DemoShell hint="Select a range, then Ctrl+C / Ctrl+V (Excel-style clipboard).">
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={baseCols}
              enableRangeSelection
              enableRangeHandle
            />
          </GridStage>
        </DemoShell>
      );
    case 'fill-handle':
      return (
        <DemoShell hint="Select cells, then drag the fill handle to extend a series.">
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={baseCols}
              enableRangeSelection
              enableFillHandle
            />
          </GridStage>
        </DemoShell>
      );
    case 'cell-editing':
      return (
        <DemoShell hint="Double-click or press Enter to edit. Undo/redo supported when licensed.">
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={baseCols}
              enableRangeSelection
              undoRedoCellEditing
            />
          </GridStage>
        </DemoShell>
      );
    case 'excel-export':
      return (
        <DemoShell hint="Use the toolbar Excel button or context menu → Export Excel.">
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={baseCols}
              quickAccessToolbar
              sideBar
            />
          </GridStage>
        </DemoShell>
      );
    case 'column-pinning':
      return (
        <DemoShell>
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={[
                { ...baseCols[0], pinned: 'left' },
                ...baseCols.slice(1),
              ]}
            />
          </GridStage>
        </DemoShell>
      );
    case 'column-sizing':
    case 'column-moving':
    case 'column-state':
    case 'tool-panels':
      return (
        <DemoShell hint="Open the columns tool panel (sidebar) to show/hide, pin, and reorder.">
          <GridStage>
            <DbGrid<DemoRow> {...common} columnDefs={baseCols} sideBar />
          </GridStage>
        </DemoShell>
      );
    case 'sorting':
    case 'pagination':
      return (
        <DemoShell>
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={baseCols}
              pagination
              paginationPageSize={3}
              paginationPageSizeSelector={[3, 5, 10]}
            />
          </GridStage>
        </DemoShell>
      );
    case 'row-pinning':
      return (
        <DemoShell>
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={baseCols}
              pinnedTopRowData={[rows[0]]}
              pinnedBottomRowData={[rows[rows.length - 1]]}
            />
          </GridStage>
        </DemoShell>
      );
    case 'row-dragging':
      return (
        <DemoShell hint="Drag rows using the row-drag handle.">
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={[{ rowDrag: true, width: 40 }, ...baseCols]}
              rowDragManaged
            />
          </GridStage>
        </DemoShell>
      );
    case 'row-selection':
      return (
        <DemoShell>
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={baseCols}
              rowSelection="multiple"
            />
          </GridStage>
        </DemoShell>
      );
    case 'filtering':
    case 'floating-filters':
    case 'set-filter':
    case 'advanced-filter':
    case 'quick-filter':
      return (
        <DemoShell hint="Floating filters under headers; set filter on Region.">
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={baseCols}
              floatingFilter
            />
          </GridStage>
        </DemoShell>
      );
    case 'row-grouping':
    case 'aggregation':
      return (
        <DemoShell hint="Region is a row-group column — expand groups to see sum aggregates.">
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={[
                { field: 'region', headerName: 'Region', rowGroup: true, hide: true, enableRowGroup: true },
                { field: 'name', headerName: 'Name', flex: 1 },
                { field: 'qty', headerName: 'Qty', width: 90, enableValue: true, aggFunc: 'sum' },
                { field: 'total', headerName: 'Total', width: 110, enableValue: true, aggFunc: 'sum' },
              ]}
              groupDisplayType="groupRows"
              sideBar
              autoGroupColumnDef={{ headerName: 'Group', minWidth: 180 }}
            />
          </GridStage>
        </DemoShell>
      );
    case 'pivot':
      return (
        <DemoShell hint="Enable pivot via sidebar Columns panel (Pivot mode).">
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={[
                ...baseCols,
                { field: 'region', headerName: 'Region', enablePivot: true, pivot: true },
              ]}
              pivotMode
              sideBar
            />
          </GridStage>
        </DemoShell>
      );
    case 'tree-data':
      return (
        <DemoShell hint="See the HR demo for a full org tree.">
          <Stack spacing={2}>
            <Link to="/demos/hr">Open HR tree-data demo →</Link>
            <GridStage>
              <DbGrid<DemoRow> {...common} columnDefs={baseCols} />
            </GridStage>
          </Stack>
        </DemoShell>
      );
    case 'master-detail':
      return (
        <DemoShell hint="Expand a row for nested detail (kitchen sink has a fuller example).">
          <Stack spacing={2}>
            <Link to="/demos/live">Open kitchen sink →</Link>
            <GridStage>
              <DbGrid<DemoRow> {...common} columnDefs={baseCols} />
            </GridStage>
          </Stack>
        </DemoShell>
      );
    case 'integrated-charts':
      return (
        <DemoShell hint="Charts were removed — db-grid is grid-only. Try sparklines or Excel-like editing.">
          <Stack spacing={2}>
            <Link to="/db-grid/sparklines">Sparklines →</Link>
            <Link to="/db-grid/formulas">Formulas →</Link>
          </Stack>
        </DemoShell>
      );
    case 'sparklines':
      return (
        <DemoShell>
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={[
                { field: 'name', headerName: 'Name', flex: 1 },
                { field: 'spark', headerName: 'Trend', width: 140, sparkline: true },
                { field: 'total', headerName: 'Total', width: 110 },
              ]}
            />
          </GridStage>
        </DemoShell>
      );
    case 'custom-theme':
      return (
        <DemoShell hint="Pass theme params or use Theme Builder.">
          <Stack spacing={2}>
            <Link to="/theme-builder">Open Theme Builder →</Link>
            <GridStage>
              <DbGrid<DemoRow>
                {...common}
                columnDefs={baseCols}
                theme={{ accentColor: '#6B7280', headerBackgroundColor: '#F3F4F6' }}
              />
            </GridStage>
          </Stack>
        </DemoShell>
      );
    case 'full-suite':
      return (
        <DemoShell>
          <Alert severity="info">
            Prefer <code>@deepbratt55/db-grid</code> for the Excel-like grid. Use <code>@db-grid/full</code> if
            you also want the UI kit.
          </Alert>
        </DemoShell>
      );
    default:
      return (
        <DemoShell hint="Live grid with this feature area enabled where applicable.">
          <GridStage>
            <DbGrid<DemoRow>
              {...common}
              columnDefs={baseCols}
              enableRangeSelection
              sideBar
              pagination
            />
          </GridStage>
        </DemoShell>
      );
  }
}

function importSnippet(_slug: string): string {
  return `import { DbGrid } from '@deepbratt55/db-grid';\nimport '@deepbratt55/db-grid/styles.css';\n\n<DbGrid rowData={rows} columnDefs={cols} theme="db-light" />`;
}

export function ComponentDocPage() {
  const { slug = '' } = useParams();
  const item = findCatalogItem(slug);

  const siblings = useMemo(() => {
    for (const s of MUI_NAV_SECTIONS) {
      if (s.items.some((i) => i.slug === slug)) return s;
    }
    return null;
  }, [slug]);

  if (!item) {
    return (
      <article className="mui-doc-page">
        <h1>Not found</h1>
        <Link to="/material-ui/all-components">Back to grid features</Link>
      </article>
    );
  }

  // External demos (kitchen sink, SSRM, theme builder) — don't render inline grid doc chrome twice
  if (item.href.startsWith('/demos') || item.href.startsWith('/theme-builder')) {
    return (
      <article className="mui-doc-page">
        <nav className="mui-doc-crumbs">
          <Link to="/material-ui/all-components">Grid features</Link>
          <span>/</span>
          <strong>{item.title}</strong>
        </nav>
        <header className="mui-doc-hero">
          <h1>{item.title}</h1>
        </header>
        <p className="mui-doc-intro">{item.blurb ?? 'Open the live demo for this feature.'}</p>
        <Link className="mui-all-cta" to={item.href}>
          Open demo →
        </Link>
      </article>
    );
  }

  return (
    <article className="mui-doc-page">
      <nav className="mui-doc-crumbs">
        <Link to="/material-ui/all-components">Grid features</Link>
        <span>/</span>
        <span>{siblings?.title}</span>
        <span>/</span>
        <strong>{item.title}</strong>
      </nav>
      <header className="mui-doc-hero">
        <h1>{item.title}</h1>
        {item.badge && (
          <span className={`mui-badge mui-badge-${String(item.badge).toLowerCase()}`}>{item.badge}</span>
        )}
      </header>
      <p className="mui-doc-intro">
        {item.blurb ??
          `DbGrid feature: ${item.title}. Excel-like spreadsheet behavior with AG Grid–class capabilities.`}
      </p>

      <h2>Demo</h2>
      <FeatureDemo slug={slug} />

      <h2>Import</h2>
      <pre className="mui-code">{importSnippet(slug)}</pre>

      <Typography variant="body2" className="mui-doc-intro" style={{ marginTop: 16 }}>
        Full API reference lives under <Link to="/docs">Docs</Link> and <Link to="/api">API</Link>.
      </Typography>
    </article>
  );
}
