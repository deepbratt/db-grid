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

function ChangeCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span style={{ color: positive ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
      {positive ? '+' : ''}
      {Number(value).toFixed(2)}%
    </span>
  );
}

export function TradingDemoPage() {
  const apiRef = useRef<DbGridApi<Instrument> | null>(null);
  const { rowData, live, setLive, speedMs, tickCount, reset, bumpSpeed } = useLiveInstruments({
    count: 100,
    intervalMs: 450,
    batchSize: 12,
  });
  const [regionFilter, setRegionFilter] = useState<string | null>(null);

  const displayRows = useMemo(
    () => (regionFilter ? rowData.filter((r) => r.region === regionFilter) : rowData),
    [rowData, regionFilter]
  );

  const columnDefs = useMemo<ColumnDef<Instrument>[]>(
    () => [
      {
        field: 'ticker',
        headerName: 'Symbol',
        width: 110,
        pinned: 'left',
        checkboxSelection: true,
      },
      { field: 'name', headerName: 'Name', flex: 1.1, minWidth: 140 },
      { field: 'instrument', headerName: 'Type', width: 100, filter: 'set' },
      { field: 'region', headerName: 'Region', width: 100, filter: 'set' },
      {
        field: 'price',
        headerName: 'Last',
        width: 110,
        filter: 'number',
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      {
        field: 'changePct',
        headerName: 'Chg %',
        width: 100,
        filter: 'number',
        cellRenderer: (p) => <ChangeCell value={Number(p.value) || 0} />,
      },
      {
        field: 'quantity',
        headerName: 'Size',
        width: 90,
        filter: 'number',
        enableValue: true,
        aggFunc: 'sum',
      },
      {
        field: 'pnl',
        headerName: 'Day P&L',
        width: 120,
        filter: 'number',
        enableValue: true,
        aggFunc: 'sum',
        cellRenderer: (p) => <PnlCell value={Number(p.value) || 0} />,
      },
      {
        field: 'sparkline',
        headerName: 'Tape',
        width: 130,
        sparkline: { type: 'line' },
        sortable: false,
        filter: false,
      },
    ],
    []
  );

  return (
    <UseCaseShell
      eyebrow="Use case · Trading"
      title="Live trading blotter"
      lede="Streaming last prices, day P&L, and tape sparklines — built for desks that need Excel-like speed in the browser."
      live={live}
      tickCount={tickCount}
      speedMs={speedMs}
      actions={[
        {
          label: live ? 'Pause stream' : 'Start stream',
          onClick: () => setLive((v) => !v),
          primary: true,
          active: live,
        },
        { label: 'Faster', onClick: () => bumpSpeed('faster') },
        { label: 'Slower', onClick: () => bumpSpeed('slower') },
        { label: 'US only', onClick: () => setRegionFilter('US'), active: regionFilter === 'US' },
        { label: 'All regions', onClick: () => setRegionFilter(null), disabled: !regionFilter },
        { label: 'Reset book', onClick: reset },
        {
          label: 'Export CSV',
          onClick: () => apiRef.current?.exportDataAsCsv({ fileName: 'trading-blotter.csv' }),
        },
        {
          label: 'Export Excel',
          onClick: () => void apiRef.current?.exportDataAsExcel({ fileName: 'trading-blotter.xlsx' }),
        },
      ]}
      features={[
        'Live applyTransaction-style updates with cell flash',
        'Pinned symbol column + set filters on type/region',
        'Sparklines for short-term tape',
        'Range selection, clipboard, and Excel export',
      ]}
    >
      <DbGrid<Instrument>
        ref={(api) => {
          apiRef.current = api;
        }}
        rowData={displayRows}
        columnDefs={columnDefs}
        licenseKey={DEMO_LICENSE_KEY}
        theme="db-light"
        pagination
        paginationPageSize={50}
        rowSelection="multiple"
        enableRangeSelection
        enableFillHandle
        floatingFilter
        enableCellChangeFlash
        cellFlashDuration={400}
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
