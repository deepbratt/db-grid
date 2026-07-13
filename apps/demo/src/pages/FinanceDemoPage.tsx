import { useMemo, useRef, useState } from 'react';
import { DbGrid, type ColumnDef, type DbGridApi } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';
import { UseCaseShell } from '../components/UseCaseShell';
import { DEMO_LICENSE_KEY, type Instrument } from '../data/instruments';
import { useLiveInstruments } from '../data/liveInstruments';

function PnlCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span style={{ color: positive ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
      {positive ? '+' : ''}
      {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </span>
  );
}

export function FinanceDemoPage() {
  const apiRef = useRef<DbGridApi<Instrument> | null>(null);
  const { rowData, setRowData, live, setLive, speedMs, tickCount, reset, bumpSpeed } =
    useLiveInstruments({
      count: 80,
      intervalMs: 700,
      batchSize: 6,
    });
  const [theme, setTheme] = useState<'db-light' | 'db-dark'>('db-light');
  const [winnersOnly, setWinnersOnly] = useState(false);

  const displayRows = useMemo(
    () => (winnersOnly ? rowData.filter((r) => r.pnl >= 0) : rowData),
    [rowData, winnersOnly]
  );

  const totals = useMemo(() => {
    const pnl = displayRows.reduce((s, r) => s + r.pnl, 0);
    const nav = displayRows.reduce((s, r) => s + r.totalValue, 0);
    return { pnl, nav };
  }, [displayRows]);

  const columnDefs = useMemo<ColumnDef<Instrument>[]>(
    () => [
      {
        field: 'ticker',
        headerName: 'Ticker',
        width: 100,
        pinned: 'left',
        checkboxSelection: true,
      },
      {
        field: 'sparkline',
        headerName: 'Trend',
        width: 130,
        sparkline: { type: 'area' },
        sortable: false,
        filter: false,
      },
      { field: 'name', headerName: 'Holding', flex: 1.2, minWidth: 140 },
      { field: 'instrument', headerName: 'Asset', width: 110, filter: 'set', enableRowGroup: true },
      { field: 'region', headerName: 'Region', width: 100, filter: 'set', enableRowGroup: true },
      {
        field: 'price',
        headerName: 'Mark',
        width: 110,
        editable: true,
        filter: 'number',
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      {
        field: 'quantity',
        headerName: 'Qty',
        width: 90,
        editable: true,
        filter: 'number',
        enableValue: true,
        aggFunc: 'sum',
      },
      {
        field: 'pnl',
        headerName: 'P&L',
        width: 120,
        filter: 'number',
        enableValue: true,
        aggFunc: 'sum',
        cellRenderer: (p) => <PnlCell value={Number(p.value) || 0} />,
      },
      {
        colId: 'notional',
        headerName: 'Notional',
        width: 130,
        formula: '=[price]*[quantity]',
        enableValue: true,
        aggFunc: 'sum',
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      },
    ],
    []
  );

  const addHolding = () => {
    const id = Date.now();
    const price = +(50 + Math.random() * 200).toFixed(2);
    const quantity = Math.floor(Math.random() * 500) + 20;
    const row: Instrument = {
      id,
      ticker: `NEW-${id % 1000}`,
      name: 'Manual holding',
      instrument: 'Stock',
      region: 'US',
      currency: 'USD',
      price,
      quantity,
      pnl: 0,
      totalValue: +(price * quantity).toFixed(2),
      changePct: 0,
      sparkline: Array.from({ length: 20 }, () => price / 10),
    };
    setRowData((prev) => [row, ...prev]);
  };

  return (
    <UseCaseShell
      eyebrow="Use case · Finance"
      title="Portfolio & P&L"
      lede="Live marks, formula notional, sparklines, and Excel export — a finance workbook that stays in React."
      live={live}
      tickCount={tickCount}
      speedMs={speedMs}
      actions={[
        {
          label: live ? 'Pause marks' : 'Resume marks',
          onClick: () => setLive((v) => !v),
          primary: true,
          active: live,
        },
        { label: 'Faster', onClick: () => bumpSpeed('faster') },
        { label: 'Slower', onClick: () => bumpSpeed('slower') },
        {
          label: winnersOnly ? 'Show all' : 'Winners only',
          onClick: () => setWinnersOnly((v) => !v),
          active: winnersOnly,
        },
        { label: 'Add holding', onClick: addHolding },
        { label: 'Reset book', onClick: reset },
        {
          label: theme === 'db-light' ? 'Dark theme' : 'Light theme',
          onClick: () => setTheme((t) => (t === 'db-light' ? 'db-dark' : 'db-light')),
        },
        {
          label: 'Excel export',
          onClick: () => void apiRef.current?.exportDataAsExcel({ fileName: 'portfolio.xlsx' }),
        },
      ]}
      features={[
        `Live NAV $${totals.nav.toLocaleString(undefined, { maximumFractionDigits: 0 })} · P&L ${
          totals.pnl >= 0 ? '+' : ''
        }${totals.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        'Formula column: Notional = price × quantity',
        'Editable marks & qty with undo/redo',
        'Grouping by asset/region via Columns panel',
      ]}
    >
      <DbGrid<Instrument>
        ref={(api) => {
          apiRef.current = api;
        }}
        rowData={displayRows}
        columnDefs={columnDefs}
        licenseKey={DEMO_LICENSE_KEY}
        theme={theme}
        pagination
        paginationPageSize={40}
        rowSelection="multiple"
        enableRangeSelection
        enableFillHandle
        floatingFilter
        enableCellChangeFlash
        enableFormulaBar
        statusBar
        sideBar={{ defaultToolPanel: null }}
        undoRedoCellEditing
        defaultColDef={{ sortable: true, filter: true, resizable: true }}
        getRowId={(d) => String(d.id ?? d.ticker)}
        style={{ height: '100%', width: '100%' }}
      />
    </UseCaseShell>
  );
}
