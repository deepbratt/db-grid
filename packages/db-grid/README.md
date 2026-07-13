# 📊 @deepbratt55/db-grid

**Excel-like React data grid for trading blotters, finance workbooks, inventory, HR trees, and AG Grid–class apps.**  
Formulas, clipboard, fill handle, sparklines, grouping, pivot, tree data, Excel export, and server-side row model — MIT open source.

---

![npm](https://img.shields.io/npm/v/@deepbratt55/db-grid)
![downloads](https://img.shields.io/npm/dm/@deepbratt55/db-grid)
![license](https://img.shields.io/npm/l/@deepbratt55/db-grid)
![typescript](https://img.shields.io/badge/TypeScript-Ready-3178C6)
![react](https://img.shields.io/badge/React-18%20%7C%2019-61DAFB)

**Live demo:** [deepbratt.github.io/db-grid](https://deepbratt.github.io/db-grid/) · **Repo:** [github.com/deepbratt/db-grid](https://github.com/deepbratt/db-grid)

---

## ✨ Why db-grid?

| | |
|---|---|
| 📈 **Excel DNA** | Ranges, fill handle, formula bar, undo/redo, CSV + Excel export |
| ⚡ **Fast by default** | Row/column virtualization for large datasets |
| 🧩 **AG Grid–familiar** | Column defs, filter/sort models, SSRM, side bar, status bar |
| 🎨 **Themes** | Grey/white `db-light` default + dark, quartz, alpine, balham, material |
| 🔓 **MIT** | Free to use, fork, and ship in commercial apps |

---

## 📦 Installation

```bash
npm install @deepbratt55/db-grid react react-dom
```

**Peers:** `react` and `react-dom` `^18` or `^19`.

Always import styles once in your app entry:

```ts
import '@deepbratt55/db-grid/styles.css';
```

> ⚠️ Without the CSS import, the grid structure renders but looks unstyled.

---

## 🚀 Quick Start

```tsx
import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

const rows = [
  { ticker: 'AAPL', name: 'Apple', price: 190, quantity: 100 },
  { ticker: 'MSFT', name: 'Microsoft', price: 420, quantity: 50 },
];

const cols = [
  { field: 'ticker', headerName: 'Ticker', width: 110, pinned: 'left' },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'price', headerName: 'Price', editable: true },
  { field: 'quantity', headerName: 'Qty', editable: true },
  { colId: 'notional', headerName: 'Notional', formula: '=[price]*[quantity]' },
];

export function App() {
  return (
    <DbGrid
      rowData={rows}
      columnDefs={cols}
      theme="db-light"
      pagination
      floatingFilter
      enableRangeSelection
      enableFillHandle
      enableFormulaBar
      undoRedoCellEditing
      style={{ height: 480, width: '100%' }}
    />
  );
}
```

---

## 📚 Feature Highlights

### 🧮 Formulas & Excel editing
Column `formula` (e.g. `=[price]*[quantity]`), formula bar UI, fill handle, cell notes, undo/redo (`Ctrl+Z` / `Ctrl+Y`), full-row and batch edit modes.

### 📋 Clipboard & ranges
Excel-like range selection, copy/paste (TSV), range handle, multi-row checkbox selection.

### 🔍 Sort, filter & find
Text / number / set / date / boolean / advanced filters, floating filters, multi-column sort, quick filter, find next/previous.

### 🌳 Grouping, pivot & tree
Row grouping (`groupRows` bands), aggregations (`sum`, `avg`, `min`, `max`, `count`, …), pivot mode, tree data + `getDataPath` for org charts.

### 🖥️ Server-side row model (SSRM)
`rowModelType="serverSide"` with datasource paging, sort, and filter — works with PostgreSQL or any API.

### 📉 Sparklines & live data
Inline line / bar / area sparklines, cell change flash for streaming blotters, stable `getRowId` for high-frequency updates.

### 📤 Export & import
CSV export/import, Excel export, context-menu shortcuts.

### 🎛️ Chrome & layout
Side bar (columns + filters), status bar, column menu, context menu, pinned rows/cols, master/detail, row drag, RTL, locales, print/autoHeight layouts.

### 🎨 Theming
Built-ins: `db-light` · `db-dark` · `quartz` · `alpine` · `balham` · `material`  
Or pass theme params / helpers: `themeDbLight`, `themeWithParams`, `themeToCssVars`.

---

## 🧪 Use-case recipes

### Trading blotter (live flash + sparklines)

```tsx
<DbGrid
  rowData={rows}
  getRowId={(r) => r.ticker}
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
```

### Grouping with AG-style group rows

```tsx
<DbGrid
  rowData={rows}
  columnDefs={[
    { field: 'region', rowGroup: true, hide: true },
    { field: 'ticker' },
    { field: 'pnl', aggFunc: 'sum' },
    { field: 'quantity', aggFunc: 'sum' },
  ]}
  theme="db-light"
  groupDisplayType="groupRows"
  sideBar
  groupDefaultExpanded={1}
  animateRows
/>
```

### Org chart (tree data)

```tsx
<DbGrid
  rowData={employees}
  columnDefs={[
    { field: 'title', flex: 1 },
    { field: 'email', flex: 1.2 },
  ]}
  theme="db-light"
  treeData
  getDataPath={(d) => d.orgPath}
  groupDefaultExpanded={1}
  autoGroupColumnDef={{ headerName: 'Organization', minWidth: 240 }}
/>
```

### Server-side paging

```tsx
const datasource = {
  getRows(params) {
    // startRow, endRow, sortModel, filterModel → { rowData, rowCount }
    return getPage(params);
  },
};

<DbGrid
  columnDefs={cols}
  rowModelType="serverSide"
  serverSideDatasource={datasource}
  theme="db-light"
  pagination
  paginationPageSize={50}
  statusBar
/>
```

More live examples: [Trading · Finance · Inventory · HR · Excel · Grouping · SSRM](https://deepbratt.github.io/db-grid/).

---

## 🔑 Key props

| Prop | Purpose |
|------|---------|
| `rowData` / `columnDefs` | Data + columns |
| `theme` | `"db-light"` or theme params |
| `pagination` / `paginationPageSize` | Paging |
| `floatingFilter` | Filters under headers |
| `enableRangeSelection` | Excel-like ranges |
| `enableFillHandle` | Drag-fill |
| `enableFormulaBar` | Formula bar UI |
| `undoRedoCellEditing` | Ctrl+Z / Ctrl+Y |
| `sideBar` / `statusBar` | Tool panels + footer |
| `treeData` + `getDataPath` | Hierarchy |
| `groupDisplayType` | `"groupRows"` \| `"singleColumn"` … |
| `rowModelType="serverSide"` | SSRM |
| `licenseKey` | Optional seat validation (source stays MIT) |

**Column tips:** `editable`, `filter` (`'set'` \| `'number'` \| …), `formula`, `sparkline`, `rowGroup`, `aggFunc`, `pinned`, `flex` / `width`.

---

## 🏷 Discoverability / hashtags

Share or tag npm/GitHub/social posts with:

`#React` `#TypeScript` `#DataGrid` `#Excel` `#Spreadsheet` `#AGGrid` `#Virtualization` `#PivotTable` `#ServerSide` `#OpenSource` `#MIT` `#FinTech` `#TradingUI` `#Frontend`

**npm keywords** (indexed on the registry): see `package.json` — React data grid, Excel-like table, AG Grid alternative, SSRM, pivot, formulas, clipboard, and more.

---

## 👥 Contributing

1. Fork [deepbratt/db-grid](https://github.com/deepbratt/db-grid)
2. `npm install && npm run dev:demo`
3. Open a PR into `main` (branch is protected)

---

## 📝 License

MIT © [Deep Bratt](https://github.com/deepbratt) · [LICENSE](https://github.com/deepbratt/db-grid/blob/main/LICENSE)

Optional `licenseKey` is for product-style seat checks only — it does **not** change the MIT terms of this source.

```tsx
<DbGrid licenseKey={process.env.DB_GRID_LICENSE_KEY} … />
```

---

Made with ❤️ for React data-heavy UIs — blotters, workbooks, and admin tables.
