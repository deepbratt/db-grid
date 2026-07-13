import type { CodeVariants } from '../components/ShowCode';

function trio(docs: string, react: string, js: string, node: string): CodeVariants {
  return { docs, react, js, node };
}

export const TRADING_CODES = trio(
  `Install: npm install @deepbratt55/db-grid
Import styles: import '@deepbratt55/db-grid/styles.css'
Feed live rowData and set enableCellChangeFlash so ticks flash. Use sparkline: { type: 'line' } on a column for tape. theme="db-light" is the default grey/white chrome.`,
  `import { useState } from 'react';
import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

export function TradingGrid({ rows }) {
  return (
    <DbGrid
      rowData={rows}
      columnDefs={[
        { field: 'ticker', headerName: 'Symbol', pinned: 'left' },
        { field: 'price', headerName: 'Last' },
        { field: 'changePct', headerName: 'Chg %' },
        { field: 'pnl', headerName: 'Day P&L' },
        { field: 'sparkline', headerName: 'Tape', sparkline: { type: 'line' } },
      ]}
      theme="db-light"
      pagination
      floatingFilter
      enableRangeSelection
      enableCellChangeFlash
      statusBar
    />
  );
}`,
  `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

const columnDefs = [
  { field: 'ticker', headerName: 'Symbol', pinned: 'left' },
  { field: 'price', headerName: 'Last' },
  { field: 'changePct', headerName: 'Chg %' },
  { field: 'pnl', headerName: 'Day P&L' },
  { field: 'sparkline', headerName: 'Tape', sparkline: { type: 'line' } },
];

createRoot(document.getElementById('root')).render(
  createElement(DbGrid, {
    rowData: rows,
    columnDefs,
    theme: 'db-light',
    pagination: true,
    floatingFilter: true,
    enableRangeSelection: true,
    enableCellChangeFlash: true,
    statusBar: true,
  })
);`,
  `// Node — push live ticks to the browser (WebSocket)
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

setInterval(() => {
  const updates = blotter.slice(0, 12).map((row) => ({
    ...row,
    price: +(row.price * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2),
  }));
  const payload = JSON.stringify({ type: 'ticks', updates });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(payload);
  }
}, 500);`
);

export const FINANCE_CODES = trio(
  `Install: npm install @deepbratt55/db-grid
Formula columns use formula: '=[price]*[quantity]'. Turn on enableFormulaBar, enableFillHandle, and undoRedoCellEditing for spreadsheet-style editing.`,
  `import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

export function FinanceGrid({ portfolio }) {
  return (
    <DbGrid
      rowData={portfolio}
      columnDefs={[
        { field: 'ticker', pinned: 'left' },
        { field: 'price', headerName: 'Mark', editable: true },
        { field: 'quantity', headerName: 'Qty', editable: true },
        { colId: 'notional', headerName: 'Notional', formula: '=[price]*[quantity]' },
        { field: 'sparkline', sparkline: { type: 'area' } },
      ]}
      theme="db-light"
      enableFormulaBar
      enableFillHandle
      floatingFilter
      undoRedoCellEditing
    />
  );
}`,
  `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

createRoot(document.getElementById('root')).render(
  createElement(DbGrid, {
    rowData: portfolio,
    columnDefs: [
      { field: 'ticker', pinned: 'left' },
      { field: 'price', headerName: 'Mark', editable: true },
      { field: 'quantity', headerName: 'Qty', editable: true },
      { colId: 'notional', headerName: 'Notional', formula: '=[price]*[quantity]' },
      { field: 'sparkline', sparkline: { type: 'area' } },
    ],
    theme: 'db-light',
    enableFormulaBar: true,
    enableFillHandle: true,
    floatingFilter: true,
    undoRedoCellEditing: true,
  })
);`,
  `// Node — portfolio marks API the grid can poll or stream
import express from 'express';

const app = express();

app.get('/api/portfolio', (_req, res) => {
  res.json(
    holdings.map((h) => ({
      ...h,
      price: +(h.price * (1 + (Math.random() - 0.48) * 0.004)).toFixed(2),
    }))
  );
});

app.listen(3001);`
);

export const INVENTORY_CODES = trio(
  `Install: npm install @deepbratt55/db-grid
Mark columns editable: true and filter: 'set' | 'number'. floatingFilter shows compact filters under headers. undoRedoCellEditing enables Ctrl+Z.`,
  `import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

export function InventoryGrid({ inventory }) {
  return (
    <DbGrid
      rowData={inventory}
      columnDefs={[
        { field: 'sku', headerName: 'SKU' },
        { field: 'name', headerName: 'Product', flex: 1 },
        { field: 'category', filter: 'set' },
        { field: 'quantity', editable: true, filter: 'number' },
        { field: 'price', editable: true, filter: 'number' },
      ]}
      theme="db-light"
      floatingFilter
      undoRedoCellEditing
    />
  );
}`,
  `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

createRoot(document.getElementById('root')).render(
  createElement(DbGrid, {
    rowData: inventory,
    columnDefs: [
      { field: 'sku', headerName: 'SKU' },
      { field: 'name', headerName: 'Product', flex: 1 },
      { field: 'category', filter: 'set' },
      { field: 'quantity', editable: true, filter: 'number' },
      { field: 'price', editable: true, filter: 'number' },
    ],
    theme: 'db-light',
    floatingFilter: true,
    undoRedoCellEditing: true,
  })
);`,
  `// Node — persist edited inventory rows
import express from 'express';

const app = express();
app.use(express.json());

app.put('/api/inventory/:sku', (req, res) => {
  const item = inventory.find((i) => i.sku === req.params.sku);
  if (!item) return res.status(404).end();
  Object.assign(item, req.body);
  res.json(item);
});

app.listen(3001);`
);

export const HR_CODES = trio(
  `Install: npm install @deepbratt55/db-grid
Enable treeData and provide getDataPath={(row) => row.orgPath}. autoGroupColumnDef labels the tree column. groupDefaultExpanded opens the first levels.`,
  `import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

export function HrGrid({ employees }) {
  return (
    <DbGrid
      rowData={employees}
      columnDefs={[
        { field: 'title', flex: 1 },
        { field: 'email', flex: 1.2 },
        { field: 'location', width: 120 },
      ]}
      theme="db-light"
      treeData
      getDataPath={(d) => d.orgPath}
      groupDefaultExpanded={1}
      autoGroupColumnDef={{ headerName: 'Organization', minWidth: 240 }}
    />
  );
}`,
  `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

createRoot(document.getElementById('root')).render(
  createElement(DbGrid, {
    rowData: employees,
    columnDefs: [
      { field: 'title', flex: 1 },
      { field: 'email', flex: 1.2 },
      { field: 'location', width: 120 },
    ],
    theme: 'db-light',
    treeData: true,
    getDataPath: (d) => d.orgPath,
    groupDefaultExpanded: 1,
    autoGroupColumnDef: { headerName: 'Organization', minWidth: 240 },
  })
);`,
  `// Node — return org tree paths for treeData
import express from 'express';

const app = express();

app.get('/api/employees', (_req, res) => {
  res.json([
    { id: '1', orgPath: ['Engineering', 'Frontend', 'Alice'], title: 'Staff Engineer' },
    { id: '2', orgPath: ['Engineering', 'Backend', 'Dan'], title: 'Staff Engineer' },
  ]);
});

app.listen(3001);`
);

export const EXCEL_CODES = trio(
  `Install: npm install @deepbratt55/db-grid
Excel-like mode: enableRangeSelection, enableFillHandle, enableFormulaBar, floatingFilter, sideBar, statusBar, undoRedoCellEditing. Default theme is db-light (grey/white).`,
  `import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

export function ExcelGrid({ rows, cols }) {
  return (
    <DbGrid
      rowData={rows}
      columnDefs={cols}
      theme="db-light"
      enableRangeSelection
      enableFillHandle
      enableFormulaBar
      floatingFilter
      sideBar
      statusBar
      undoRedoCellEditing
      pagination
    />
  );
}`,
  `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

createRoot(document.getElementById('root')).render(
  createElement(DbGrid, {
    rowData: rows,
    columnDefs: cols,
    theme: 'db-light',
    enableRangeSelection: true,
    enableFillHandle: true,
    enableFormulaBar: true,
    floatingFilter: true,
    sideBar: true,
    statusBar: true,
    undoRedoCellEditing: true,
    pagination: true,
  })
);`,
  `// Node — export workbook data the grid can download
import express from 'express';

const app = express();

app.get('/api/workbook.csv', (_req, res) => {
  res.type('text/csv').send('ticker,price,quantity\\nAAPL,190,100\\nMSFT,420,50\\n');
});

app.listen(3001);`
);

export const GROUPING_CODES = trio(
  `Install: npm install @deepbratt55/db-grid
Set rowGroup: true (often hide: true) on group columns. enableValue + aggFunc: 'sum' for aggregations. groupDisplayType="groupRows" renders full-width AG Grid–style group bands. sideBar lets users drag columns into Row Groups / Values.`,
  `import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

export function GroupingGrid({ rows }) {
  return (
    <DbGrid
      rowData={rows}
      columnDefs={[
        { field: 'region', enableRowGroup: true, rowGroup: true, hide: true },
        { field: 'instrument', enableRowGroup: true, enablePivot: true },
        { field: 'ticker' },
        { field: 'pnl', enableValue: true, aggFunc: 'sum' },
        { field: 'quantity', enableValue: true, aggFunc: 'sum' },
      ]}
      theme="db-light"
      groupDisplayType="groupRows"
      sideBar
      groupDefaultExpanded={1}
      animateRows
    />
  );
}`,
  `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

createRoot(document.getElementById('root')).render(
  createElement(DbGrid, {
    rowData: rows,
    columnDefs: [
      { field: 'region', enableRowGroup: true, rowGroup: true, hide: true },
      { field: 'instrument', enableRowGroup: true, enablePivot: true },
      { field: 'ticker' },
      { field: 'pnl', enableValue: true, aggFunc: 'sum' },
      { field: 'quantity', enableValue: true, aggFunc: 'sum' },
    ],
    theme: 'db-light',
    groupDisplayType: 'groupRows',
    sideBar: true,
    groupDefaultExpanded: 1,
    animateRows: true,
  })
);`,
  `// Node — pre-aggregate groups if you prefer server grouping
import express from 'express';

const app = express();

app.get('/api/grouped', (_req, res) => {
  const byRegion = Object.groupBy(rows, (r) => r.region);
  res.json(
    Object.entries(byRegion).map(([region, items]) => ({
      region,
      pnl: items.reduce((s, r) => s + r.pnl, 0),
      quantity: items.reduce((s, r) => s + r.quantity, 0),
    }))
  );
});

app.listen(3001);`
);

export const SSRM_CODES = trio(
  `Install: npm install @deepbratt55/db-grid
Set rowModelType="serverSide" and pass serverSideDatasource={{ getRows }}. getRows receives startRow/endRow/sortModel/filterModel and must return { rowData, rowCount }. Pagination drives which block is requested.`,
  `import { useMemo } from 'react';
import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

export function SsrmGrid({ getPage }) {
  const datasource = useMemo(
    () => ({
      getRows(params) {
        return getPage(params); // { rowData, rowCount }
      },
    }),
    [getPage]
  );

  return (
    <DbGrid
      columnDefs={cols}
      rowModelType="serverSide"
      serverSideDatasource={datasource}
      theme="db-light"
      pagination
      paginationPageSize={50}
      sideBar
      statusBar
    />
  );
}`,
  `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

const datasource = {
  getRows(params) {
    return getPage(params);
  },
};

createRoot(document.getElementById('root')).render(
  createElement(DbGrid, {
    columnDefs: cols,
    rowModelType: 'serverSide',
    serverSideDatasource: datasource,
    theme: 'db-light',
    pagination: true,
    paginationPageSize: 50,
    sideBar: true,
    statusBar: true,
  })
);`,
  `// Node — SSRM endpoint (sort / filter / page in SQL)
import express from 'express';
import { pool } from './db.js';

const app = express();
app.use(express.json());

app.post('/api/grid/ssrm', async (req, res) => {
  const { startRow = 0, endRow = 50, sortModel = [] } = req.body;
  const order = sortModel[0]
    ? \`ORDER BY \${sortModel[0].colId} \${sortModel[0].sort}\`
    : 'ORDER BY ticker';
  const limit = endRow - startRow;
  const { rows } = await pool.query(
    \`SELECT * FROM instruments \${order} LIMIT $1 OFFSET $2\`,
    [limit, startRow]
  );
  const count = await pool.query('SELECT COUNT(*)::int AS n FROM instruments');
  res.json({ rowData: rows, rowCount: count.rows[0].n });
});

app.listen(3001);`
);
