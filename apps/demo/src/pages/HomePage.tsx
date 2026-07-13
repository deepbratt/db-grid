import { useEffect, useMemo, useState } from 'react';
import {
  DbGrid,
  type ColumnDef,
  type IServerSideDatasource,
} from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';
import { ShowCode, type CodeVariants } from '../components/ShowCode';
import { DEMO_LICENSE_KEY, generateInstruments, type Instrument } from '../data/instruments';
import { useLiveInstruments } from '../data/liveInstruments';
import {
  EXCEL_CODES,
  FINANCE_CODES,
  GROUPING_CODES,
  HR_CODES,
  INVENTORY_CODES,
  SSRM_CODES,
  TRADING_CODES,
} from '../data/useCaseSnippets';

const USE_CASES = [
  { id: 'trading', label: 'Trading', blurb: 'Live blotter' },
  { id: 'finance', label: 'Finance', blurb: 'Portfolio & P&L' },
  { id: 'inventory', label: 'Inventory', blurb: 'Stock levels' },
  { id: 'hr', label: 'HR / org chart', blurb: 'Tree data' },
  { id: 'excel', label: 'Excel-like', blurb: 'Formulas & fill' },
  { id: 'grouping', label: 'Grouping', blurb: 'Groups & pivot' },
  { id: 'ssrm', label: 'SSRM', blurb: 'Server-side' },
] as const;

const DEFAULT_COL_DEF = { sortable: true, filter: true, resizable: true } as const;

function PnlCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span style={{ color: positive ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
      {positive ? '+' : ''}
      {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </span>
  );
}

function ChangeCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span style={{ color: positive ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
      {positive ? '+' : ''}
      {Number(value).toFixed(2)}%
    </span>
  );
}

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  instrument: string;
  quantity: number;
  price: number;
};

const INVENTORY: InventoryItem[] = [
  { id: '1', sku: 'WDG-001', name: 'Widget A', category: 'Components', instrument: 'Widget', quantity: 420, price: 12.5 },
  { id: '2', sku: 'WDG-002', name: 'Widget B', category: 'Components', instrument: 'Widget', quantity: 180, price: 14.25 },
  { id: '3', sku: 'CBL-100', name: 'USB-C Cable', category: 'Peripherals', instrument: 'Cable', quantity: 950, price: 8.99 },
  { id: '4', sku: 'CBL-200', name: 'HDMI Cable', category: 'Peripherals', instrument: 'Cable', quantity: 640, price: 11.5 },
  { id: '5', sku: 'MON-010', name: '27" Monitor', category: 'Displays', instrument: 'Monitor', quantity: 72, price: 299 },
  { id: '6', sku: 'MON-020', name: '32" Monitor', category: 'Displays', instrument: 'Monitor', quantity: 38, price: 449 },
  { id: '7', sku: 'KEY-050', name: 'Mechanical Keyboard', category: 'Peripherals', instrument: 'Keyboard', quantity: 210, price: 89 },
  { id: '8', sku: 'MSE-060', name: 'Wireless Mouse', category: 'Peripherals', instrument: 'Mouse', quantity: 530, price: 34.99 },
  { id: '9', sku: 'SSD-128', name: 'NVMe 1TB', category: 'Storage', instrument: 'SSD', quantity: 156, price: 79 },
  { id: '10', sku: 'SSD-256', name: 'NVMe 2TB', category: 'Storage', instrument: 'SSD', quantity: 94, price: 129 },
  { id: '11', sku: 'RAM-016', name: 'DDR5 16GB', category: 'Components', instrument: 'Memory', quantity: 320, price: 54 },
  { id: '12', sku: 'RAM-032', name: 'DDR5 32GB', category: 'Components', instrument: 'Memory', quantity: 145, price: 98 },
];

type Employee = {
  id: string;
  orgPath: string[];
  title: string;
  email: string;
  location: string;
};

const EMPLOYEES: Employee[] = [
  { id: 'eng-fe-alice', orgPath: ['Engineering', 'Frontend', 'Alice Chen'], title: 'Staff Engineer', email: 'alice@dbgrid.dev', location: 'NYC' },
  { id: 'eng-fe-bob', orgPath: ['Engineering', 'Frontend', 'Bob Rivera'], title: 'Senior Engineer', email: 'bob@dbgrid.dev', location: 'Remote' },
  { id: 'eng-fe-cara', orgPath: ['Engineering', 'Frontend', 'Cara Singh'], title: 'Engineer', email: 'cara@dbgrid.dev', location: 'London' },
  { id: 'eng-be-dan', orgPath: ['Engineering', 'Backend', 'Dan Okonkwo'], title: 'Staff Engineer', email: 'dan@dbgrid.dev', location: 'NYC' },
  { id: 'eng-be-eva', orgPath: ['Engineering', 'Backend', 'Eva Martins'], title: 'Senior Engineer', email: 'eva@dbgrid.dev', location: 'Berlin' },
  { id: 'eng-plat-finn', orgPath: ['Engineering', 'Platform', 'Finn Walsh'], title: 'Principal Engineer', email: 'finn@dbgrid.dev', location: 'SF' },
  { id: 'sales-emea-gina', orgPath: ['Sales', 'EMEA', 'Gina Park'], title: 'Account Executive', email: 'gina@dbgrid.dev', location: 'Paris' },
  { id: 'sales-emea-hugo', orgPath: ['Sales', 'EMEA', 'Hugo Berg'], title: 'Sales Manager', email: 'hugo@dbgrid.dev', location: 'Stockholm' },
  { id: 'sales-na-ivy', orgPath: ['Sales', 'North America', 'Ivy Thompson'], title: 'Enterprise AE', email: 'ivy@dbgrid.dev', location: 'Chicago' },
  { id: 'ops-hr-jade', orgPath: ['Operations', 'HR', 'Jade Miller'], title: 'People Partner', email: 'jade@dbgrid.dev', location: 'Remote' },
  { id: 'ops-fin-kyle', orgPath: ['Operations', 'Finance', 'Kyle Brooks'], title: 'Finance Manager', email: 'kyle@dbgrid.dev', location: 'NYC' },
];

function UseCaseBlock({
  id,
  title,
  blurb,
  codes,
  children,
}: {
  id: string;
  title: string;
  blurb: string;
  codes: CodeVariants;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="home-usecase-block">
      <div className="home-usecase-head">
        <div>
          <h2>{title}</h2>
          <p>{blurb}</p>
        </div>
      </div>
      <div className="home-usecase-grid-stage">{children}</div>
      <ShowCode codes={codes} />
    </section>
  );
}

function TradingPanel() {
  const { rowData } = useLiveInstruments({ count: 60, intervalMs: 500, batchSize: 8 });
  const columnDefs = useMemo<ColumnDef<Instrument>[]>(
    () => [
      { field: 'ticker', headerName: 'Symbol', width: 100, pinned: 'left' },
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 120 },
      { field: 'instrument', headerName: 'Type', width: 90, filter: 'set' },
      { field: 'region', headerName: 'Region', width: 90, filter: 'set' },
      {
        field: 'price',
        headerName: 'Last',
        width: 100,
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      {
        field: 'changePct',
        headerName: 'Chg %',
        width: 90,
        cellRenderer: (p) => <ChangeCell value={Number(p.value) || 0} />,
      },
      {
        field: 'pnl',
        headerName: 'Day P&L',
        width: 110,
        cellRenderer: (p) => <PnlCell value={Number(p.value) || 0} />,
      },
      { field: 'sparkline', headerName: 'Tape', width: 120, sparkline: { type: 'line' }, sortable: false, filter: false },
    ],
    []
  );

  return (
    <DbGrid<Instrument>
      rowData={rowData}
      columnDefs={columnDefs}
      licenseKey={DEMO_LICENSE_KEY}
      theme="db-light"
      pagination
      paginationPageSize={25}
      floatingFilter
      enableRangeSelection
      enableCellChangeFlash
      statusBar
      sideBar={{ defaultToolPanel: null }}
      defaultColDef={DEFAULT_COL_DEF}
      getRowId={(d) => String(d.id ?? d.ticker)}
      style={{ height: '100%', width: '100%' }}
    />
  );
}

function FinancePanel() {
  const { rowData } = useLiveInstruments({ count: 50, intervalMs: 700, batchSize: 5 });
  const columnDefs = useMemo<ColumnDef<Instrument>[]>(
    () => [
      { field: 'ticker', headerName: 'Ticker', width: 100, pinned: 'left' },
      { field: 'sparkline', headerName: 'Trend', width: 120, sparkline: { type: 'area' }, sortable: false, filter: false },
      { field: 'name', headerName: 'Holding', flex: 1, minWidth: 120 },
      { field: 'instrument', headerName: 'Asset', width: 100, filter: 'set' },
      {
        field: 'price',
        headerName: 'Mark',
        width: 100,
        editable: true,
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      { field: 'quantity', headerName: 'Qty', width: 80, editable: true },
      {
        field: 'pnl',
        headerName: 'P&L',
        width: 110,
        cellRenderer: (p) => <PnlCell value={Number(p.value) || 0} />,
      },
      {
        colId: 'notional',
        headerName: 'Notional',
        width: 120,
        formula: '=[price]*[quantity]',
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      },
    ],
    []
  );

  return (
    <DbGrid<Instrument>
      rowData={rowData}
      columnDefs={columnDefs}
      licenseKey={DEMO_LICENSE_KEY}
      theme="db-light"
      pagination
      paginationPageSize={25}
      floatingFilter
      enableRangeSelection
      enableFillHandle
      enableFormulaBar
      enableCellChangeFlash
      statusBar
      sideBar={{ defaultToolPanel: null }}
      undoRedoCellEditing
      defaultColDef={DEFAULT_COL_DEF}
      getRowId={(d) => String(d.id ?? d.ticker)}
      style={{ height: '100%', width: '100%' }}
    />
  );
}

function InventoryPanel() {
  const [rowData] = useState(INVENTORY);
  const columnDefs = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      { field: 'sku', headerName: 'SKU', width: 100 },
      { field: 'name', headerName: 'Product', flex: 1, minWidth: 140 },
      { field: 'category', headerName: 'Category', width: 120, filter: 'set' },
      { field: 'quantity', headerName: 'Qty', width: 90, editable: true, filter: 'number' },
      {
        field: 'price',
        headerName: 'Unit Price',
        width: 110,
        editable: true,
        filter: 'number',
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      {
        colId: 'lineTotal',
        headerName: 'Line Total',
        width: 110,
        valueGetter: (p) => (p.data ? p.data.quantity * p.data.price : null),
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
    ],
    []
  );

  return (
    <DbGrid<InventoryItem>
      rowData={rowData}
      columnDefs={columnDefs}
      licenseKey={DEMO_LICENSE_KEY}
      theme="db-light"
      floatingFilter
      undoRedoCellEditing
      defaultColDef={DEFAULT_COL_DEF}
      getRowId={(d) => d.id}
      style={{ height: '100%', width: '100%' }}
    />
  );
}

function HrPanel() {
  const [rowData] = useState(EMPLOYEES);
  const columnDefs = useMemo<ColumnDef<Employee>[]>(
    () => [
      { field: 'title', headerName: 'Title', flex: 1, minWidth: 140 },
      { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 180 },
      { field: 'location', headerName: 'Location', width: 110 },
    ],
    []
  );

  return (
    <DbGrid<Employee>
      rowData={rowData}
      columnDefs={columnDefs}
      licenseKey={DEMO_LICENSE_KEY}
      theme="db-light"
      treeData
      getDataPath={(d) => d.orgPath}
      groupDefaultExpanded={1}
      autoGroupColumnDef={{ headerName: 'Organization', minWidth: 220, flex: 1.2 }}
      defaultColDef={DEFAULT_COL_DEF}
      getRowId={(d) => d.id}
      style={{ height: '100%', width: '100%' }}
    />
  );
}

function ExcelPanel() {
  const [rowData] = useState(() => generateInstruments(40));
  const columnDefs = useMemo<ColumnDef<Instrument>[]>(
    () => [
      { field: 'ticker', headerName: 'Ticker', width: 100, pinned: 'left', checkboxSelection: true },
      { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 140 },
      { field: 'region', headerName: 'Region', width: 100, filter: 'set', editable: true },
      {
        field: 'price',
        headerName: 'Price',
        width: 100,
        editable: true,
        filter: 'number',
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      { field: 'quantity', headerName: 'Qty', width: 90, editable: true, filter: 'number' },
      {
        field: 'pnl',
        headerName: 'P&L',
        width: 110,
        cellRenderer: (p) => <PnlCell value={Number(p.value) || 0} />,
      },
      {
        colId: 'notional',
        headerName: 'Notional',
        width: 120,
        formula: '=[price]*[quantity]',
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      },
      { field: 'sparkline', headerName: 'Trend', width: 110, sparkline: { type: 'area' }, sortable: false, filter: false },
    ],
    []
  );

  return (
    <DbGrid<Instrument>
      rowData={rowData}
      columnDefs={columnDefs}
      licenseKey={DEMO_LICENSE_KEY}
      theme="db-light"
      pagination
      paginationPageSize={20}
      rowSelection="multiple"
      enableRangeSelection
      enableFillHandle
      enableFormulaBar
      floatingFilter
      sideBar={{ defaultToolPanel: null }}
      statusBar
      undoRedoCellEditing
      defaultColDef={DEFAULT_COL_DEF}
      getRowId={(d) => String(d.id ?? d.ticker)}
      style={{ height: '100%', width: '100%' }}
    />
  );
}

function GroupingPanel() {
  const [rowData] = useState(() => generateInstruments(80));
  const columnDefs = useMemo<ColumnDef<Instrument>[]>(
    () => [
      { field: 'region', headerName: 'Region', enableRowGroup: true, rowGroup: true, hide: true },
      { field: 'instrument', headerName: 'Type', width: 110, enableRowGroup: true, enablePivot: true, filter: 'set' },
      { field: 'ticker', headerName: 'Ticker', width: 110 },
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 140 },
      {
        field: 'pnl',
        headerName: 'P&L',
        width: 120,
        enableValue: true,
        aggFunc: 'sum',
        cellRenderer: (p) => <PnlCell value={Number(p.value) || 0} />,
      },
      { field: 'quantity', headerName: 'Qty', width: 100, enableValue: true, aggFunc: 'sum' },
      {
        field: 'price',
        headerName: 'Price',
        width: 100,
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
    ],
    []
  );

  return (
    <DbGrid<Instrument>
      rowData={rowData}
      columnDefs={columnDefs}
      licenseKey={DEMO_LICENSE_KEY}
      theme="db-light"
      sideBar
      groupDisplayType="groupRows"
      groupDefaultExpanded={1}
      animateRows
      statusBar
      defaultColDef={DEFAULT_COL_DEF}
      getRowId={(d) => String(d.id ?? d.ticker)}
      style={{ height: '100%', width: '100%' }}
    />
  );
}

function pageClientSsrm(
  rows: Instrument[],
  params: { startRow?: number; endRow?: number; sortModel?: Array<{ colId: string; sort: 'asc' | 'desc' }> }
) {
  let next = [...rows];
  const sorts = [...(params.sortModel ?? [])].reverse();
  for (const s of sorts) {
    const field = s.colId as keyof Instrument;
    next.sort((a, b) => {
      const av = a[field] as string | number;
      const bv = b[field] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return s.sort === 'asc' ? cmp : -cmp;
    });
  }
  const start = params.startRow ?? 0;
  const end = params.endRow ?? start + 50;
  return { rowData: next.slice(start, end), rowCount: next.length };
}

function SsrmPanel() {
  const [rowData] = useState(() => generateInstruments(120));

  const columnDefs = useMemo<ColumnDef<Instrument>[]>(
    () => [
      { field: 'ticker', headerName: 'Ticker', width: 110 },
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 140 },
      { field: 'instrument', headerName: 'Type', width: 100, filter: 'set' },
      { field: 'region', headerName: 'Region', width: 90, filter: 'set' },
      {
        field: 'price',
        headerName: 'Price',
        width: 100,
        filter: 'number',
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      {
        field: 'pnl',
        headerName: 'P&L',
        width: 110,
        filter: 'number',
        cellRenderer: (p) => <PnlCell value={Number(p.value) || 0} />,
      },
      { field: 'sparkline', headerName: 'Spark', width: 110, sparkline: { type: 'area' }, sortable: false, filter: false },
    ],
    []
  );

  const datasource = useMemo<IServerSideDatasource<Instrument>>(
    () => ({
      getRows(params) {
        return pageClientSsrm(rowData, params);
      },
    }),
    [rowData]
  );

  return (
    <div className="home-ssrm-wrap">
      <p className="home-ssrm-status">Server-side row model · local page/sort demo</p>
      <DbGrid<Instrument>
        columnDefs={columnDefs}
        rowModelType="serverSide"
        serverSideDatasource={datasource}
        licenseKey={DEMO_LICENSE_KEY}
        theme="db-light"
        pagination
        paginationPageSize={50}
        sideBar={{ defaultToolPanel: null }}
        statusBar
        defaultColDef={DEFAULT_COL_DEF}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

function HomeSidebar({ activeId, onNavigate }: { activeId: string; onNavigate?: () => void }) {
  return (
    <aside className="home-sidebar">
      <div className="home-sidebar-brand">
        <p className="home-sidebar-kicker">Use cases</p>
        <p className="home-sidebar-hint">Jump to a live grid</p>
      </div>
      <nav className="home-sidebar-nav" aria-label="Use case navigation">
        {USE_CASES.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`home-sidebar-link${activeId === item.id ? ' active' : ''}`}
            onClick={() => onNavigate?.()}
          >
            <span className="home-sidebar-label">{item.label}</span>
            <span className="home-sidebar-blurb">{item.blurb}</span>
          </a>
        ))}
      </nav>
      <div className="home-sidebar-foot">
        <p className="home-sidebar-tip">Open Show code on any grid for install notes and React / JS / Node samples.</p>
      </div>
    </aside>
  );
}

export function HomePage() {
  const [activeId, setActiveId] = useState<string>(USE_CASES[0].id);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const nodes = USE_CASES.map((u) => document.getElementById(u.id)).filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-shell">
      <button
        type="button"
        className="home-sidebar-toggle btn"
        aria-expanded={navOpen}
        onClick={() => setNavOpen((v) => !v)}
      >
        {navOpen ? 'Close nav' : 'Use cases'}
      </button>

      <div className={`home-layout${navOpen ? ' nav-open' : ''}`}>
        <HomeSidebar activeId={activeId} onNavigate={() => setNavOpen(false)} />
        {navOpen && (
          <button
            type="button"
            className="home-sidebar-backdrop"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
          />
        )}

        <main className="home home-minimal" onClick={() => navOpen && setNavOpen(false)}>
          <section className="home-hero-min">
            <h1>db-grid</h1>
            <p className="home-tagline">
              Excel-like React data grid — formulas, clipboard, fill handle, grouping, pivot, SSRM.
            </p>
            <div className="hero-actions">
              <a href="#trading" className="btn primary">
                Browse use cases
              </a>
              <a href="#excel" className="btn">
                Excel-like demo
              </a>
            </div>
          </section>

          <UseCaseBlock
            id="trading"
            title="Trading"
            blurb="Live blotter with streaming prices, P&L, and tape sparklines."
            codes={TRADING_CODES}
          >
            <TradingPanel />
          </UseCaseBlock>

          <UseCaseBlock
            id="finance"
            title="Finance"
            blurb="Portfolio marks, formula notional, editable qty, and sparklines."
            codes={FINANCE_CODES}
          >
            <FinancePanel />
          </UseCaseBlock>

          <UseCaseBlock
            id="inventory"
            title="Inventory"
            blurb="Editable stock levels with set filters and line totals."
            codes={INVENTORY_CODES}
          >
            <InventoryPanel />
          </UseCaseBlock>

          <UseCaseBlock
            id="hr"
            title="HR / org chart"
            blurb="Tree data for departments, teams, and employees."
            codes={HR_CODES}
          >
            <HrPanel />
          </UseCaseBlock>

          <UseCaseBlock
            id="excel"
            title="Excel-like workbook"
            blurb="Formulas, fill handle, range selection, floating filters, and undo/redo."
            codes={EXCEL_CODES}
          >
            <ExcelPanel />
          </UseCaseBlock>

          <UseCaseBlock
            id="grouping"
            title="Grouping & pivot"
            blurb="Row groups by region with aggregations — drag columns in the side bar to pivot."
            codes={GROUPING_CODES}
          >
            <GroupingPanel />
          </UseCaseBlock>

          <UseCaseBlock
            id="ssrm"
            title="Server-side (SSRM)"
            blurb="Sort, filter, and page against an API — falls back to local data if the server is offline."
            codes={SSRM_CODES}
          >
            <SsrmPanel />
          </UseCaseBlock>
        </main>
      </div>
    </div>
  );
}
