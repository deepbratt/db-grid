import type { CSSProperties, ReactNode } from 'react';

export type RowId = string | number;
export type ColId = string;

export type SortDirection = 'asc' | 'desc' | null;

export type FilterType =
  | 'text'
  | 'number'
  | 'set'
  | 'date'
  | 'boolean'
  | 'advanced'
  | 'multi'
  | 'agTextColumnFilter'
  | 'agNumberColumnFilter'
  | 'agDateColumnFilter'
  | 'agSetColumnFilter'
  | 'agMultiColumnFilter';

export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'first' | 'last' | string;

export type RowModelType = 'clientSide' | 'serverSide' | 'infinite' | 'viewport';

export type CellEditorType = 'text' | 'number' | 'date' | 'boolean' | 'select' | string;

export type CellDataType = 'text' | 'number' | 'boolean' | 'date';

export interface SortModelItem {
  colId: ColId;
  sort: Exclude<SortDirection, null>;
}

export interface FilterModelItem {
  colId: ColId;
  type: FilterType;
  operator?:
    | 'contains'
    | 'notContains'
    | 'equals'
    | 'notEqual'
    | 'startsWith'
    | 'endsWith'
    | 'greaterThan'
    | 'lessThan'
    | 'greaterThanOrEqual'
    | 'lessThanOrEqual'
    | 'inRange'
    | 'blank'
    | 'notBlank';
  filter?: string | number | boolean | null;
  filterTo?: string | number | null;
  values?: Array<string | number | boolean>;
}

export interface CellValueParams<TData = any> {
  data: TData;
  value: any;
  node: RowNode<TData>;
  column: ColumnDef<TData>;
  api: DbGridApi<TData>;
  context?: any;
}

export interface CellRendererParams<TData = any> extends CellValueParams<TData> {
  rowIndex: number;
}

export type CellRenderer<TData = any> =
  | ((params: CellRendererParams<TData>) => ReactNode)
  | React.ComponentType<CellRendererParams<TData>>;

export type CellEditor<TData = any> =
  | ((params: CellRendererParams<TData> & { stopEditing: (cancel?: boolean) => void }) => ReactNode)
  | React.ComponentType<CellRendererParams<TData> & { stopEditing: (cancel?: boolean) => void }>
  | CellEditorType;

export interface ColumnDef<TData = any> {
  field?: keyof TData & string;
  colId?: ColId;
  headerName?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  pinned?: 'left' | 'right' | null;
  hide?: boolean;
  sortable?: boolean;
  filter?: boolean | FilterType;
  floatingFilter?: boolean;
  editable?: boolean | ((params: CellValueParams<TData>) => boolean);
  resizable?: boolean;
  checkboxSelection?: boolean;
  headerCheckboxSelection?: boolean;
  rowGroup?: boolean;
  rowGroupIndex?: number;
  enableRowGroup?: boolean;
  pivot?: boolean;
  enablePivot?: boolean;
  aggFunc?: AggregationType;
  enableValue?: boolean;
  valueGetter?: ((params: CellValueParams<TData>) => any) | string;
  valueFormatter?: (params: CellValueParams<TData>) => string;
  valueSetter?: (params: CellValueParams<TData> & { newValue: any }) => boolean;
  valueParser?: (params: { newValue: any; oldValue: any; data: TData }) => any;
  cellRenderer?: CellRenderer<TData>;
  cellEditor?: CellEditor<TData>;
  cellEditorParams?: { values?: any[]; [key: string]: any };
  cellStyle?: CSSProperties | ((params: CellValueParams<TData>) => CSSProperties | undefined);
  cellClass?: string | ((params: CellValueParams<TData>) => string | undefined);
  cellClassRules?: Record<string, (params: CellValueParams<TData>) => boolean>;
  cellDataType?: CellDataType | boolean;
  sparkline?: boolean | { type?: 'line' | 'bar' | 'area' };
  formula?: string;
  tooltipField?: keyof TData & string;
  tooltipValueGetter?: (params: CellValueParams<TData>) => string;
  children?: ColumnDef<TData>[];
  rowDrag?: boolean;
  suppressMovable?: boolean;
  lockPosition?: boolean | 'left' | 'right';
  filterParams?: Record<string, any>;
  colSpan?: (params: CellValueParams<TData>) => number;
  enableRowSpan?: boolean;
}

export interface RowNode<TData = any> {
  id: RowId;
  data: TData | null;
  level: number;
  group: boolean;
  expanded: boolean;
  parent: RowNode<TData> | null;
  childrenAfterGroup?: RowNode<TData>[];
  aggData?: Record<string, any>;
  key?: string | number | null;
  field?: string;
  leaf?: boolean;
  detail?: boolean;
  footer?: boolean;
  grandTotal?: boolean;
  loading?: boolean;
}

export interface GridRange {
  startRow: number;
  endRow: number;
  startCol: ColId;
  endCol: ColId;
}

export interface ContextMenuItem {
  name: string;
  action?: () => void;
  disabled?: boolean;
  shortcut?: string;
  icon?: string;
  separator?: boolean;
  subMenu?: ContextMenuItem[];
}

export interface QuickAccessToolbarConfig {
  items?: string[];
}

export interface ToolPanelDef {
  id: string;
  label: string;
  icon?: string;
  toolPanel: ReactNode | (() => ReactNode);
}

export interface ServerSideGetRowsParams {
  startRow: number;
  endRow: number;
  sortModel: SortModelItem[];
  filterModel: FilterModelItem[];
  rowGroupCols: Array<{ id: ColId; field?: string; displayName?: string }>;
  valueCols: Array<{ id: ColId; field?: string; aggFunc?: AggregationType }>;
  pivotCols: Array<{ id: ColId; field?: string }>;
  groupKeys: Array<string | number>;
  pivotMode: boolean;
}

export interface ServerSideGetRowsResult<TData = any> {
  rowData: TData[];
  rowCount?: number;
  groupData?: boolean;
}

export interface IServerSideDatasource<TData = any> {
  getRows: (
    params: ServerSideGetRowsParams
  ) => Promise<ServerSideGetRowsResult<TData>> | ServerSideGetRowsResult<TData>;
}

export interface ColumnStateItem {
  colId: ColId;
  width?: number;
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  sort?: SortDirection;
  rowGroup?: boolean;
  pivot?: boolean;
  aggFunc?: AggregationType | null;
}

export interface GridState {
  filterModel: FilterModelItem[];
  sortModel: SortModelItem[];
  columnState: ColumnStateItem[];
  pivotMode?: boolean;
  quickFilter?: string;
}

export type RowSelectionConfig =
  | 'single'
  | 'multiple'
  | false
  | { mode: 'singleRow' | 'multiRow'; checkboxes?: boolean; headerCheckbox?: boolean };

export interface DbGridProps<TData = any> {
  rowData?: TData[];
  columnDefs: ColumnDef<TData>[];
  defaultColDef?: Partial<ColumnDef<TData>>;
  getRowId?: (data: TData, index: number) => RowId;
  rowModelType?: RowModelType;
  serverSideDatasource?: IServerSideDatasource<TData>;
  cacheBlockSize?: number;
  rowHeight?: number;
  getRowHeight?: (params: { data: TData; node: RowNode<TData> }) => number | undefined;
  headerHeight?: number;
  groupHeaderHeight?: number;
  floatingFiltersHeight?: number;
  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeSelector?: number[];
  rowSelection?: RowSelectionConfig;
  suppressRowClickSelection?: boolean;
  enableRangeSelection?: boolean;
  cellSelection?: boolean;
  enableFillHandle?: boolean;
  animateRows?: boolean;
  treeData?: boolean;
  getDataPath?: (data: TData) => string[];
  masterDetail?: boolean;
  isRowMaster?: (data: TData) => boolean;
  detailCellRenderer?: CellRenderer<TData>;
  detailCellRendererParams?: { detailGridOptions?: { columnDefs?: ColumnDef<any>[] }; getDetailRowData?: (params: { data: TData; successCallback: (rows: any[]) => void }) => void };
  groupDefaultExpanded?: number;
  groupDisplayType?: 'singleColumn' | 'multipleColumns' | 'groupRows' | 'custom';
  groupIncludeFooter?: boolean;
  groupIncludeTotalFooter?: boolean;
  autoGroupColumnDef?: Partial<ColumnDef<TData>>;
  pivotMode?: boolean;
  sideBar?: boolean | { toolPanels?: ToolPanelDef[]; defaultToolPanel?: string | null };
  statusBar?: boolean | { statusPanels?: Array<{ statusPanel: string }> };
  suppressContextMenu?: boolean;
  getContextMenuItems?: (params: { node?: RowNode<TData>; column?: ColumnDef<TData> }) => ContextMenuItem[];
  enableCellTextSelection?: boolean;
  quickFilterText?: string;
  floatingFilter?: boolean;
  undoRedoCellEditing?: boolean;
  undoRedoCellEditingLimit?: number;
  localeText?: Record<string, string>;
  enableRtl?: boolean;
  rowDragManaged?: boolean;
  suppressCellFocus?: boolean;
  tooltipShowDelay?: number;
  enableRangeHandle?: boolean;
  cellNotes?: boolean;
  quickAccessToolbar?: boolean | QuickAccessToolbarConfig;
  alwaysShowVerticalScroll?: boolean;
  popupParent?: HTMLElement | null;
  licenseKey?: string;
  theme?:
    | 'quartz'
    | 'alpine'
    | 'balham'
    | 'material'
    | 'db-dark'
    | 'db-light'
    | Partial<import('./theme/themeApi').ThemeParams> & { base?: string }
    | Record<string, string>;
  domLayout?: 'normal' | 'autoHeight' | 'print';
  loading?: boolean;
  overlayNoRowsTemplate?: string;
  overlayLoadingTemplate?: string;
  rowClassRules?: Record<string, (params: { data: TData; node: RowNode<TData> }) => boolean>;
  getRowClass?: (params: { data: TData; node: RowNode<TData> }) => string | undefined;
  getRowStyle?: (params: { data: TData; node: RowNode<TData> }) => CSSProperties | undefined;
  pinnedTopRowData?: TData[];
  pinnedBottomRowData?: TData[];
  isExternalFilterPresent?: () => boolean;
  doesExternalFilterPass?: (node: RowNode<TData>) => boolean;
  isFullWidthRow?: (params: { rowNode: RowNode<TData> }) => boolean;
  fullWidthCellRenderer?: CellRenderer<TData>;
  aggFuncs?: Record<string, (params: { values: any[] }) => any>;
  onGridReady?: (api: DbGridApi<TData>) => void;
  onSelectionChanged?: (selected: TData[]) => void;
  onCellClicked?: (event: { data: TData; colId: ColId; value: any; rowIndex: number }) => void;
  onCellDoubleClicked?: (event: { data: TData; colId: ColId; value: any; rowIndex: number }) => void;
  onRowClicked?: (event: { data: TData; rowIndex: number }) => void;
  onRowSelected?: (event: { data: TData; selected: boolean }) => void;
  onCellValueChanged?: (event: {
    data: TData;
    colId: ColId;
    oldValue: any;
    newValue: any;
  }) => void;
  onSortChanged?: (sortModel: SortModelItem[]) => void;
  onFilterChanged?: (filterModel: FilterModelItem[]) => void;
  onColumnMoved?: (columnDefs: ColumnDef<TData>[]) => void;
  onColumnPinned?: (columnDefs: ColumnDef<TData>[]) => void;
  onColumnVisible?: (columnDefs: ColumnDef<TData>[]) => void;
  onRangeSelectionChanged?: (ranges: GridRange[]) => void;
  onModelUpdated?: (event: { rowCount: number }) => void;
  onFirstDataRendered?: () => void;
  className?: string;
  style?: CSSProperties;

  // --- Cell editing behaviour ---
  editType?: 'fullRow';
  editMode?: 'batch';
  singleClickEdit?: boolean;
  stopEditingWhenCellsLoseFocus?: boolean;
  readOnlyEdit?: boolean;
  suppressClickEdit?: boolean;
  enterNavigatesVertically?: boolean;
  enterNavigatesVerticallyAfterEdit?: boolean;

  // --- Value cache ---
  valueCache?: boolean;
  valueCacheNeverExpires?: boolean;

  // --- Cell flashing ---
  enableCellChangeFlash?: boolean;
  cellFlashDuration?: number;

  // --- Row numbers ---
  rowNumbers?: boolean | { minWidth?: number };

  // --- Cell expressions ---
  enableCellExpressions?: boolean;

  // --- Excel styles / icons ---
  excelStyles?: any[];
  icons?: Record<string, string>;

  // --- Tooltips ---
  enableBrowserTooltips?: boolean;
  tooltipInteraction?: boolean;

  // --- Selection / hover ---
  rowMultiSelectWithClick?: boolean;
  suppressRowHoverHighlight?: boolean;

  // --- Virtualisation ---
  debounceVerticalScrollbar?: boolean;
  ensureDomOrder?: boolean;
  suppressColumnVirtualisation?: boolean;
  suppressRowVirtualisation?: boolean;
  rowBuffer?: number;

  // --- Context ---
  context?: any;

  // --- Misc ---
  reactiveCustomComponents?: boolean;
  enableFormulaBar?: boolean;
}

export interface DbGridApi<TData = any> {
  getSelectedRows: () => TData[];
  selectAll: () => void;
  deselectAll: () => void;
  setQuickFilter: (text: string) => void;
  setFilterModel: (model: FilterModelItem[]) => void;
  getFilterModel: () => FilterModelItem[];
  setSortModel: (model: SortModelItem[]) => void;
  getSortModel: () => SortModelItem[];
  exportDataAsCsv: (params?: { fileName?: string; onlySelected?: boolean; columnSeparator?: string }) => void;
  exportDataAsExcel: (params?: { fileName?: string; sheetName?: string }) => Promise<void>;
  expandAll: () => void;
  collapseAll: () => void;
  setRowData: (data: TData[]) => void;
  applyTransaction: (tx: {
    add?: TData[];
    update?: TData[];
    remove?: TData[];
  }) => void;
  applyTransactionAsync: (
    tx: { add?: TData[]; update?: TData[]; remove?: TData[] },
    callback?: () => void
  ) => void;
  undoCellEditing: () => void;
  redoCellEditing: () => void;
  getDisplayedRowCount: () => number;
  refreshServerSide: () => void;
  refreshCells: (params?: { force?: boolean }) => void;
  redrawRows: () => void;
  sizeColumnsToFit: () => void;
  autoSizeAllColumns: () => void;
  showLoadingOverlay: () => void;
  hideOverlay: () => void;
  getColumnState: () => ColumnStateItem[];
  applyColumnState: (state: ColumnStateItem[]) => void;
  getState: () => GridState;
  setState: (state: GridState) => void;
  copySelectedRangeToClipboard: () => void;
  pasteFromClipboard: () => Promise<void>;
  findNext: (text: string) => void;
  findPrevious: (text: string) => void;
  startEditingCell: (params: { rowIndex: number; colKey: string }) => void;
  stopEditing: (cancel?: boolean) => void;
  ensureIndexVisible: (index: number) => void;
  getRowNode: (id: RowId) => RowNode<TData> | undefined;
  forEachNode: (callback: (node: RowNode<TData>, index: number) => void) => void;
  resetColumnState: () => void;
  setColumnsVisible: (keys: string[], visible: boolean) => void;
  setColumnsPinned: (keys: string[], pinned: 'left' | 'right' | null) => void;
  flashCells: (params?: { rowNodes?: RowNode<TData>[]; columns?: string[] }) => void;
  resetRowHeights: () => void;
  setGridOption: (key: string, value: any) => void;
  getRenderedNodes: () => RowNode<TData>[];
  getSelectedNodes: () => RowNode<TData>[];
  getCellValue: (params: { rowNode: RowNode<TData>; colKey: string }) => any;
  commitBatchEdits: () => void;
  cancelBatchEdits: () => void;
  importDataAsCsv: (text: string, params?: { delimiter?: string }) => void;
}
