import { useMemo, useRef, useState } from 'react';
import {
  DbGrid,
  type DbGridApi,
  type ColumnDef,
} from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';
import { DEMO_LICENSE_KEY, generateInstruments, type Instrument } from '../data/instruments';

function PnlCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span style={{ color: positive ? '#0f766e' : '#b91c1c', fontWeight: 600 }}>
      {positive ? '+' : ''}
      {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </span>
  );
}

export function ShowcasePage() {
  const apiRef = useRef<DbGridApi<Instrument> | null>(null);
  const [theme, setTheme] = useState<'db-light' | 'db-dark'>('db-light');
  const [rowData] = useState(() => generateInstruments(150));
  const [aiQuery, setAiQuery] = useState('');
  const [aiNote, setAiNote] = useState('');
  const [localeText] = useState<Record<string, string> | undefined>(undefined);

  const columnDefs = useMemo<ColumnDef<Instrument>[]>(
    () => [
      {
        field: 'ticker',
        headerName: 'Ticker',
        width: 110,
        checkboxSelection: true,
        pinned: 'left',
        rowDrag: true,
      },
      { field: 'name', headerName: 'Name', flex: 1.4, minWidth: 160 },
      {
        field: 'instrument',
        headerName: 'Instrument',
        width: 120,
        enableRowGroup: true,
        rowGroup: false,
        filter: 'set',
      },
      {
        field: 'region',
        headerName: 'Region',
        width: 100,
        enableRowGroup: true,
        editable: true,
        cellEditor: 'select',
        cellEditorParams: { values: ['US', 'EU', 'UK', 'APAC', 'Global'] },
      },
      {
        field: 'price',
        headerName: 'Price',
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
        field: 'totalValue',
        headerName: 'Total Value',
        width: 130,
        enableValue: true,
        aggFunc: 'sum',
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      },
      {
        field: 'changePct',
        headerName: 'Chg %',
        width: 90,
        valueFormatter: (p) => `${Number(p.value || 0).toFixed(2)}%`,
      },
      {
        field: 'sparkline',
        headerName: 'Timeline',
        width: 120,
        sparkline: { type: 'area' },
        sortable: false,
        filter: false,
      },
      {
        colId: 'notional',
        headerName: 'Notional (formula)',
        width: 140,
        formula: '=[price]*[quantity]',
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      },
    ],
    []
  );

  const runAiFilter = async () => {
    try {
      const res = await fetch('/api/grid/ai-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      });
      if (!res.ok) throw new Error('API offline — using local fallback');
      const data = await res.json();
      apiRef.current?.setFilterModel(data.filterModel);
      setAiNote(data.explanation);
    } catch {
      // Local NL fallback when API is down
      const q = aiQuery.toLowerCase();
      const model: any[] = [];
      if (q.includes('stock')) model.push({ colId: 'instrument', operator: 'equals', filter: 'Stock', type: 'text' });
      if (q.includes('bond')) model.push({ colId: 'instrument', operator: 'equals', filter: 'Bond', type: 'text' });
      apiRef.current?.setFilterModel(model);
      setAiNote('Local AI-filter fallback applied (start API for full NL parsing).');
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Beyond AG Grid · React · TypeScript · PostgreSQL</p>
        <h1>db-grid</h1>
        <p className="lede">
          Excel-like enterprise React data grid — formulas, clipboard, fill handle, pivot,
          sparklines, master/detail, Excel export, SSRM — plus a custom licensing control plane.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn primary" onClick={() => void apiRef.current?.exportDataAsExcel()}>
            Excel export
          </button>
          <button type="button" className="btn" onClick={() => setTheme((t) => (t === 'db-light' ? 'db-dark' : 'db-light'))}>
            Toggle {theme === 'db-light' ? 'dark' : 'light'} theme
          </button>
        </div>
      </section>

      <section className="ai-bar">
        <label>
          AI filter
          <input
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder='e.g. "stocks in US with pnl > 100"'
          />
        </label>
        <button type="button" className="btn" onClick={() => void runAiFilter()}>
          Apply
        </button>
        {aiNote && <span className="ai-note">{aiNote}</span>}
      </section>

      <section className="grid-stage">
        <DbGrid<Instrument>
          ref={(api) => {
            apiRef.current = api;
          }}
          rowData={rowData}
          columnDefs={columnDefs}
          licenseKey={DEMO_LICENSE_KEY}
          theme={theme}
          pagination
          paginationPageSize={50}
          rowSelection="multiple"
          enableRangeSelection
          enableFillHandle
          floatingFilter
          groupIncludeFooter
          groupIncludeTotalFooter
          localeText={localeText}
          enableRtl={false}
          quickAccessToolbar
          cellNotes
          masterDetail
          isRowMaster={(d) => !!d.orders?.length}
          detailCellRenderer={(p) => (
            <div>
              <strong>Orders for {p.data.ticker}</strong>
              <ul>
                {p.data.orders?.map((o) => (
                  <li key={o.id}>
                    {o.side} {o.qty} @ {o.price}
                  </li>
                ))}
              </ul>
            </div>
          )}
          sideBar
          statusBar
          undoRedoCellEditing
          rowNumbers
          enableCellChangeFlash
          enableFormulaBar
          valueCache
          // editType="fullRow" — flip to full-row editing (double-click a row, Enter to commit, Esc to cancel)
          defaultColDef={{ sortable: true, filter: true, resizable: true, editable: false }}
          getRowId={(d) => d.id ?? d.ticker}
          onGridReady={(api) => {
            apiRef.current = api;
          }}
        />
      </section>

      <p className="hint">
        Tip: Shift+click headers for multi-sort · right-click for charts/export · open Columns
        panel to group/pivot · double-click Price/Qty to edit with undo (Ctrl+Z).
      </p>
    </main>
  );
}
