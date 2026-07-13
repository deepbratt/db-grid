import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DbGrid,
  type DbGridApi,
  type ColumnDef,
  type IServerSideDatasource,
} from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';
import { DEMO_LICENSE_KEY, type Instrument } from '../data/instruments';

export function ServerSidePage() {
  const apiRef = useRef<DbGridApi<Instrument> | null>(null);
  const [live, setLive] = useState(false);
  const [status, setStatus] = useState('Connecting to PostgreSQL SSRM…');

  const columnDefs = useMemo<ColumnDef<Instrument>[]>(
    () => [
      { field: 'ticker', headerName: 'Ticker', width: 120 },
      { field: 'name', headerName: 'Name', flex: 1 },
      { field: 'instrument', headerName: 'Type', width: 110 },
      { field: 'region', headerName: 'Region', width: 100 },
      { field: 'price', headerName: 'Price', width: 110, filter: 'number' },
      { field: 'pnl', headerName: 'P&L', width: 120, filter: 'number', aggFunc: 'sum' },
      { field: 'totalValue', headerName: 'Total', width: 130, aggFunc: 'sum' },
      { field: 'sparkline', headerName: 'Spark', width: 120, sparkline: true, sortable: false },
    ],
    []
  );

  const datasource = useMemo<IServerSideDatasource<Instrument>>(
    () => ({
      async getRows(params) {
        const res = await fetch('/api/grid/ssrm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (!res.ok) {
          setStatus('API/DB unavailable — start docker + api (`npm run db:up` then `npm run dev:api`)');
          return { rowData: [], rowCount: 0 };
        }
        const data = await res.json();
        setStatus(`PostgreSQL SSRM · ${data.rowCount} rows`);
        return data;
      },
    }),
    []
  );

  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      ws = new WebSocket(`${proto}://${location.host}/ws`);
      ws.onopen = () => setLive(true);
      ws.onclose = () => setLive(false);
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'ticks' && apiRef.current) {
          // Refresh keeps SSRM truthful; ticks are visibility signal
          setStatus((s) => s.replace(/·.*/, `· live ticks ${msg.updates.length}`));
        }
      };
    } catch {
      setLive(false);
    }
    return () => ws?.close();
  }, []);

  const onReady = useCallback((api: DbGridApi<Instrument>) => {
    apiRef.current = api;
  }, []);

  return (
    <main className="page">
      <h1>Server-Side Row Model</h1>
      <p className="lede">
        Sort, filter, and page against PostgreSQL — AG Grid enterprise SSRM parity with a
        first-party SQL adapter. Live channel: {live ? 'connected' : 'offline'}.
      </p>
      <p className="hint">{status}</p>
      <section className="grid-stage tall">
        <DbGrid<Instrument>
          columnDefs={columnDefs}
          rowModelType="serverSide"
          serverSideDatasource={datasource}
          licenseKey={DEMO_LICENSE_KEY}
          pagination
          paginationPageSize={50}
          sideBar
          statusBar
          onGridReady={onReady}
        />
      </section>
    </main>
  );
}
