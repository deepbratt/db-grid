/** Docs sidebar structure mirroring AG Grid React docs nav */
export type DocLink = { slug: string; title: string };
export type DocSection = { id: string; title: string; items: DocLink[] };

export const DOC_SECTIONS: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    items: [
      { slug: 'getting-started', title: 'Quick Start' },
      { slug: 'key-features', title: 'Key Features' },
      { slug: 'community-vs-enterprise', title: 'Community vs Enterprise' },
      { slug: 'installation', title: 'Installation' },
      { slug: 'modules', title: 'Modules' },
    ],
  },
  {
    id: 'ai',
    title: 'AI Features',
    items: [
      { slug: 'ai-toolkit', title: 'AI Toolkit' },
      { slug: 'mcp-server', title: 'MCP Server' },
    ],
  },
  {
    id: 'layout',
    title: 'Layout & Styling',
    items: [
      { slug: 'theming', title: 'Theming' },
      { slug: 'theming-api', title: 'Theming API' },
      { slug: 'themes', title: 'Themes' },
      { slug: 'ag-grid-design-system', title: 'Design System' },
      { slug: 'grid-size', title: 'Grid Layout' },
    ],
  },
  {
    id: 'presentation',
    title: 'Cell presentation',
    items: [
      { slug: 'sparklines-overview', title: 'Sparklines' },
    ],
  },
  {
    id: 'columns',
    title: 'Columns',
    items: [
      { slug: 'column-definitions', title: 'Column Definitions' },
      { slug: 'column-headers', title: 'Column Headers' },
      { slug: 'column-moving', title: 'Column Moving' },
      { slug: 'column-pinning', title: 'Column Pinning' },
      { slug: 'column-sizing', title: 'Column Sizing' },
      { slug: 'column-state', title: 'Column State' },
    ],
  },
  {
    id: 'rows',
    title: 'Rows',
    items: [
      { slug: 'row-sorting', title: 'Row Sorting' },
      { slug: 'row-pagination', title: 'Pagination' },
      { slug: 'row-pinning', title: 'Row Pinning' },
      { slug: 'row-height', title: 'Row Height' },
      { slug: 'row-dragging', title: 'Row Dragging' },
      { slug: 'row-spanning', title: 'Row Spanning' },
    ],
  },
  {
    id: 'cells',
    title: 'Cells',
    items: [
      { slug: 'cell-content', title: 'Cell Content' },
      { slug: 'cell-editing', title: 'Cell Editing' },
      { slug: 'cell-editors', title: 'Cell Editors' },
      { slug: 'cell-styles', title: 'Cell Styles' },
      { slug: 'tooltips', title: 'Tooltips' },
    ],
  },
  {
    id: 'filtering',
    title: 'Filtering',
    items: [
      { slug: 'filtering', title: 'Overview' },
      { slug: 'filter-text', title: 'Text Filter' },
      { slug: 'filter-number', title: 'Number Filter' },
      { slug: 'filter-date', title: 'Date Filter' },
      { slug: 'filter-set', title: 'Set Filter' },
      { slug: 'filter-multi', title: 'Multi Filter' },
      { slug: 'filter-advanced', title: 'Advanced Filter' },
      { slug: 'floating-filters', title: 'Floating Filters' },
    ],
  },
  {
    id: 'selection',
    title: 'Selection',
    items: [
      { slug: 'row-selection', title: 'Row Selection' },
      { slug: 'cell-selection', title: 'Cell Selection' },
      { slug: 'cell-selection-fill-handle', title: 'Fill Handle' },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    items: [
      { slug: 'grouping', title: 'Row Grouping' },
      { slug: 'aggregation', title: 'Aggregation' },
      { slug: 'pivoting', title: 'Pivoting' },
      { slug: 'tree-data', title: 'Tree Data' },
      { slug: 'master-detail', title: 'Master Detail' },
      { slug: 'formulas', title: 'Formulas' },
      { slug: 'server-side-model', title: 'Server-Side Row Model' },
      { slug: 'excel-export', title: 'Excel Export' },
      { slug: 'clipboard', title: 'Clipboard' },
      { slug: 'side-bar', title: 'Side Bar' },
      { slug: 'status-bar', title: 'Status Bar' },
    ],
  },
];

export const API_GROUPS = [
  {
    title: 'Grid API',
    items: [
      { name: 'getSelectedRows()', desc: 'Return selected row data' },
      { name: 'setFilterModel(model)', desc: 'Apply column filter model' },
      { name: 'getFilterModel()', desc: 'Read active filters' },
      { name: 'setSortModel(model)', desc: 'Apply multi-column sort' },
      { name: 'exportDataAsCsv()', desc: 'Download CSV' },
      { name: 'exportDataAsExcel()', desc: 'Download Excel SpreadsheetML' },
      { name: 'applyTransaction(tx)', desc: 'Add / update / remove rows' },
      { name: 'applyTransactionAsync(tx)', desc: 'Batched RAF transaction' },
      { name: 'getState() / setState()', desc: 'Persist filter, sort, columns' },
      { name: 'flashCells()', desc: 'Flash cells after updates' },
      { name: 'importDataAsCsv(text)', desc: 'Import TSV/CSV into grid' },
      { name: 'expandAll() / collapseAll()', desc: 'Group expand state' },
      { name: 'refreshServerSide()', desc: 'Reload SSRM datasource' },
      { name: 'sizeColumnsToFit()', desc: 'Fit columns to viewport' },
      { name: 'autoSizeAllColumns()', desc: 'Autosize from content' },
      { name: 'copySelectedRangeToClipboard()', desc: 'Copy range as TSV' },
      { name: 'pasteFromClipboard()', desc: 'Paste TSV into range' },
      { name: 'startEditingCell() / stopEditing()', desc: 'Programmatic edit control' },
      { name: 'commitBatchEdits() / cancelBatchEdits()', desc: 'Batch edit mode' },
    ],
  },
  {
    title: 'Grid Options (props)',
    items: [
      { name: 'rowData / columnDefs', desc: 'Primary data binding' },
      { name: 'rowModelType', desc: 'clientSide | serverSide | infinite | viewport' },
      { name: 'pagination', desc: 'Client pagination controls' },
      { name: 'enableFillHandle / enableFormulaBar', desc: 'Excel-like interactions' },
      { name: 'treeData / masterDetail / pivotMode', desc: 'Advanced data shapes' },
      { name: 'sideBar / statusBar', desc: 'Accessory panels' },
      { name: 'theme / localeText / enableRtl', desc: 'Look & language' },
      { name: 'rowNumbers / enableFormulaBar', desc: 'Spreadsheet UX' },
      { name: 'licenseKey', desc: 'Enterprise license validation' },
    ],
  },
  {
    title: 'Column Def',
    items: [
      { name: 'field / colId / headerName', desc: 'Identity' },
      { name: 'valueGetter / valueFormatter / valueSetter', desc: 'Value pipeline' },
      { name: 'cellRenderer / cellEditor', desc: 'Custom components' },
      { name: 'filter / floatingFilter', desc: 'Column filters' },
      { name: 'rowGroup / pivot / aggFunc', desc: 'Enterprise analytics' },
      { name: 'pinned / flex / width / hide', desc: 'Layout' },
      { name: 'cellClassRules / sparkline / formula', desc: 'Presentation' },
    ],
  },
];
