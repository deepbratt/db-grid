import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
  type CSSProperties,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import type {
  DbGridApi,
  DbGridProps,
  ColumnDef,
  ColumnStateItem,
  ContextMenuItem,
  FilterModelItem,
  GridRange,
  GridState,
  RowId,
  RowNode,
} from './types';
import { useContainerSize, useVirtualRows } from './hooks/useVirtualization';
import { useColumnVirtualization } from './hooks/useColumnVirtualization';
import { InfiniteCache } from './rowModels/infinite';
import { useGridDataPipeline } from './hooks/useGridDataPipeline';
import { useSelection } from './hooks/useSelection';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import {
  aggregate,
  buildGroupTree,
  buildTreeDataNodes,
  collectUniqueColumnValues,
  countLeafDescendants,
  debounce,
  evaluateFormula,
  flattenVisibleNodes,
  formatCellValue,
  getCellValue,
  pivotData,
  resolveColId,
} from './utils/dataOps';
import { inferCellDataType } from './utils/dataTypes';
import { exportCsv } from './export/exporters';
import { exportExcelXlsx } from './export/excelXlsx';
import { parseClipboardTsv, formatRangeAsTsv } from './export/clipboard';
import { hasFeature, validateLicenseKey } from './license/validateLicense';
import { registerAggFunc } from './aggregation/registry';
import { resolveClassRules } from './features/classRules';
import { fillSeries } from './features/fillHandle';
import { reorderRows } from './features/rowDrag';
import { getTooltipText } from './features/tooltips';
import { computeColSpan } from './features/spanning';
import { setNote, getNote, clearNote } from './features/cellNotes';
import { createTranslate } from './i18n/locale';
import { ColumnsToolPanel } from './components/ColumnsToolPanel';
import { FiltersToolPanel } from './components/FiltersToolPanel';
import { ContextMenu } from './components/ContextMenu';
import { StatusBar } from './components/StatusBar';
import { Sparkline } from './components/Sparkline';
import { Tooltip } from './components/Tooltip';
import { DetailGrid, type DetailColumnDef } from './components/DetailGrid';
import { ColumnMenu } from './filters/ColumnMenu';
import { FloatingFilterRow } from './filters/FloatingFilterRow';
import { CellEditor } from './editors/CellEditor';
import { resolveBaseTheme, themeToCssVars, themeWithParams, type ThemeParams } from './theme/themeApi';
import './styles/db-grid.css';

const EMPTY_ROW_DATA: any[] = [];

type EditorKind = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'richSelect' | 'largeText';

function defaultGetRowId<T>(_data: T, index: number): RowId {
  return index;
}

function parseCsvText(text: string, delimiter?: string): string[][] {
  const sep = delimiter ?? (text.includes('\t') ? '\t' : ',');
  return text
    .split(/\r\n|\n/)
    .filter((line) => line.length > 0)
    .map((line) => line.split(sep).map((cell) => cell.trim()));
}

const THEME_PARAM_KEY_SET = new Set([
  'backgroundColor',
  'foregroundColor',
  'borderColor',
  'headerBackgroundColor',
  'headerTextColor',
  'oddRowBackgroundColor',
  'rowHoverColor',
  'selectedRowBackgroundColor',
  'rangeSelectionBackgroundColor',
  'fontFamily',
  'fontSize',
  'headerFontSize',
  'spacing',
  'borderRadius',
  'cellHorizontalPadding',
  'wrapperBorder',
  'chromeBackgroundColor',
  'inputFocusBorder',
  'checkboxCheckedBackgroundColor',
  'iconSize',
  'popupShadow',
  'tooltipBackgroundColor',
  'toolPanelBackgroundColor',
  'statusBarBackgroundColor',
  'accentColor',
]);

function isThemeParamsLike(value: unknown): value is Partial<ThemeParams> {
  if (!value || typeof value !== 'object') return false;
  return Object.keys(value).some((k) => THEME_PARAM_KEY_SET.has(k));
}

function normalizeEditorKind(v: string | undefined): EditorKind {
  return v === 'text' ||
    v === 'number' ||
    v === 'date' ||
    v === 'boolean' ||
    v === 'select' ||
    v === 'richSelect' ||
    v === 'largeText'
    ? v
    : 'text';
}

function resolveEditorType<T>(col: ColumnDef<T>, currentValue: any): EditorKind {
  if (col.cellEditor === 'agRichSelectCellEditor' || col.cellEditor === 'richSelect') return 'richSelect';
  if (col.cellEditor === 'agLargeTextCellEditor' || col.cellEditor === 'largeText') return 'largeText';
  if (typeof col.cellEditor === 'string') return normalizeEditorKind(col.cellEditor);
  if (col.cellEditorParams?.values?.length) return 'select';
  if (typeof col.cellDataType === 'string') return normalizeEditorKind(col.cellDataType);
  return inferCellDataType(currentValue);
}

function addGroupFooters<T>(nodes: RowNode<T>[]): RowNode<T>[] {
  return nodes.map((n) => {
    if (n.group && n.childrenAfterGroup) {
      const children = addGroupFooters(n.childrenAfterGroup);
      const footer: RowNode<T> = {
        id: `${n.id}__footer`,
        data: null,
        level: n.level + 1,
        group: false,
        expanded: false,
        parent: n,
        leaf: true,
        footer: true,
        aggData: n.aggData,
      };
      return { ...n, childrenAfterGroup: [...children, footer] };
    }
    return n;
  });
}

function DbGridInner<TData = any>(
  props: DbGridProps<TData>,
  ref: React.ForwardedRef<DbGridApi<TData>>
) {
  const {
    rowData: rowDataProp = EMPTY_ROW_DATA,
    columnDefs: columnDefsProp,
    defaultColDef,
    getRowId = defaultGetRowId,
    rowModelType = 'clientSide',
    serverSideDatasource,
    cacheBlockSize = 100,
    pinnedTopRowData = EMPTY_ROW_DATA,
    pinnedBottomRowData = EMPTY_ROW_DATA,
    rowHeight = 36,
    headerHeight = 40,
    floatingFiltersHeight = 32,
    pagination = false,
    paginationPageSize = 100,
    paginationPageSizeSelector = [25, 50, 100, 500],
    rowSelection = 'multiple',
    enableRangeSelection = true,
    cellSelection = false,
    enableFillHandle = false,
    animateRows = true,
    treeData = false,
    getDataPath,
    masterDetail = false,
    isRowMaster,
    detailCellRenderer,
    detailCellRendererParams,
    groupDefaultExpanded = 1,
    groupIncludeFooter = false,
    groupIncludeTotalFooter = false,
    groupDisplayType = 'groupRows',
    autoGroupColumnDef,
    pivotMode: pivotModeProp = false,
    sideBar = true,
    statusBar = true,
    suppressContextMenu = false,
    getContextMenuItems,
    enableCellTextSelection = false,
    quickFilterText,
    floatingFilter = false,
    undoRedoCellEditing = true,
    undoRedoCellEditingLimit = 20,
    localeText,
    enableRtl = false,
    rowDragManaged = true,
    suppressCellFocus = false,
    tooltipShowDelay = 400,
    enableRangeHandle = false,
    cellNotes = false,
    quickAccessToolbar = false,
    alwaysShowVerticalScroll = false,
    popupParent,
    licenseKey,
    theme = 'db-light',
    domLayout = 'normal',
    loading: loadingProp = false,
    rowClassRules,
    getRowClass,
    getRowStyle,
    isExternalFilterPresent,
    doesExternalFilterPass,
    isFullWidthRow,
    fullWidthCellRenderer,
    aggFuncs,
    onGridReady,
    onSelectionChanged,
    onCellValueChanged,
    onSortChanged,
    onFilterChanged,
    className,
    style,
    editType,
    editMode,
    singleClickEdit = false,
    stopEditingWhenCellsLoseFocus = false,
    readOnlyEdit = false,
    suppressClickEdit = false,
    enterNavigatesVertically = false,
    enterNavigatesVerticallyAfterEdit = false,
    valueCache = false,
    valueCacheNeverExpires = false,
    enableCellChangeFlash = false,
    cellFlashDuration = 500,
    rowNumbers = false,
    enableCellExpressions = false,
    icons,
    enableBrowserTooltips = false,
    tooltipInteraction = false,
    suppressRowHoverHighlight = false,
    ensureDomOrder = false,
    suppressColumnVirtualisation = false,
    suppressRowVirtualisation = false,
    rowBuffer = 8,
    context,
    enableFormulaBar = false,
    rowMultiSelectWithClick = false,
    debounceVerticalScrollbar = false,
  } = props;

  const translate = useMemo(() => createTranslate(localeText), [localeText]);

  const license = useMemo(() => validateLicenseKey(licenseKey), [licenseKey]);
  const ent = useCallback((f: string) => hasFeature(license, f), [license]);

  const [rowData, setRowData] = useState<TData[]>(rowDataProp);
  const [columnDefs, setColumnDefs] = useState(
    columnDefsProp.map((c) => ({ ...defaultColDef, ...c }))
  );
  const [pivotMode, setPivotMode] = useState(pivotModeProp);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(paginationPageSize);
  const [editing, setEditing] = useState<{ rowId: RowId; colId: string } | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [expandedIds, setExpandedIds] = useState<Set<RowId>>(new Set());
  const [detailOpen, setDetailOpen] = useState<Set<RowId>>(new Set());
  const [sidePanel, setSidePanel] = useState<string | null>(
    typeof sideBar === 'object'
      ? sideBar.defaultToolPanel === undefined
        ? 'columns'
        : sideBar.defaultToolPanel
      : sideBar
        ? 'columns'
        : null
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);
  const [columnMenu, setColumnMenu] = useState<{ x: number; y: number; colId: string } | null>(
    null
  );
  const [loading, setLoading] = useState(loadingProp);
  const [findQuery, setFindQuery] = useState('');
  const [findIndex, setFindIndex] = useState(0);
  const [ssrmRows, setSsrmRows] = useState<TData[]>([]);
  const [ssrmCount, setSsrmCount] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: ReactNode } | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, setNotesVersion] = useState(0);
  const [dragRowId, setDragRowId] = useState<RowId | null>(null);
  const [fullRowEditingId, setFullRowEditingId] = useState<RowId | null>(null);
  const [rowEditValues, setRowEditValues] = useState<Record<string, any>>({});
  const [flashingCells, setFlashingCells] = useState<Set<string>>(new Set());
  const flashTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [pendingEditKeys, setPendingEditKeys] = useState<Set<string>>(new Set());
  const batchEditsRef = useRef<
    Map<string, { rowId: RowId; colId: string; data: any; oldValue: any; newValue: any }>
  >(new Map());
  const valueCacheMapRef = useRef<Map<string, any>>(new Map());
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [infiniteVersion, setInfiniteVersion] = useState(0);
  const [infiniteRowCount, setInfiniteRowCount] = useState(0);
  const infiniteCacheRef = useRef(new InfiniteCache<TData>());
  const infiniteFetchingRef = useRef<Set<string>>(new Set());
  const undoStack = useRef<Array<{ data: TData; colId: string; oldValue: any; newValue: any }>>([]);
  const redoStack = useRef<typeof undoStack.current>([]);
  const apiRef = useRef<DbGridApi<TData>>(null as any);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { ref: bodyRef, height: bodyHeight, width: bodyWidth } = useContainerSize<HTMLDivElement>();

  useEffect(() => {
    setRowData((prev) => (prev === rowDataProp ? prev : rowDataProp));
  }, [rowDataProp]);

  // defaultColDef is often an inline object — do not put it in deps or we loop forever.
  useEffect(() => {
    setColumnDefs(columnDefsProp.map((c) => ({ ...defaultColDef, ...c })));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when column defs change
  }, [columnDefsProp]);

  useEffect(() => {
    setLoading((prev) => (prev === loadingProp ? prev : loadingProp));
  }, [loadingProp]);
  useEffect(() => {
    if (!valueCacheNeverExpires) valueCacheMapRef.current.clear();
  }, [rowData, columnDefs, valueCacheNeverExpires]);
  useEffect(
    () => () => {
      flashTimersRef.current.forEach((t) => clearTimeout(t));
      flashTimersRef.current.clear();
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    },
    []
  );
  useEffect(() => {
    if (!aggFuncs) return;
    Object.entries(aggFuncs).forEach(([name, fn]) => {
      registerAggFunc(name, (values) => fn({ values }));
    });
  }, [aggFuncs]);

  const pipeline = useGridDataPipeline(rowData, columnDefs, getRowId, apiRef);
  useEffect(() => {
    if (quickFilterText !== undefined) pipeline.setQuickFilter(quickFilterText);
  }, [quickFilterText]);

  useEffect(() => onSortChanged?.(pipeline.sortModel), [pipeline.sortModel]);
  useEffect(() => onFilterChanged?.(pipeline.filterModel), [pipeline.filterModel]);

  const selectionMode = useMemo<'single' | 'multiple' | false>(() => {
    if (rowSelection === false) return false;
    if (rowSelection === 'single' || rowSelection === 'multiple') return rowSelection;
    if (rowSelection && typeof rowSelection === 'object') {
      return rowSelection.mode === 'singleRow' ? 'single' : 'multiple';
    }
    return 'multiple';
  }, [rowSelection]);

  const selection = useSelection(selectionMode);
  const rangeSelectionEnabled = enableRangeSelection || cellSelection;

  const visibleCols = useMemo(
    () => columnDefs.filter((c) => !c.hide),
    [columnDefs]
  );

  const groupCols = useMemo(
    () =>
      ent('rowGrouping')
        ? columnDefs
            .filter((c) => c.rowGroup)
            .sort((a, b) => (a.rowGroupIndex ?? 0) - (b.rowGroupIndex ?? 0))
        : [],
    [columnDefs, ent]
  );

  const valueCols = useMemo(
    () => columnDefs.filter((c) => c.aggFunc && ent('aggregation')),
    [columnDefs, ent]
  );

  const qatItems = useMemo(() => {
    if (quickAccessToolbar && typeof quickAccessToolbar === 'object' && quickAccessToolbar.items?.length) {
      return quickAccessToolbar.items;
    }
    return ['csv', 'excel', 'expandAll', 'collapseAll'];
  }, [quickAccessToolbar]);

  const infiniteRows = useMemo(() => {
    if (rowModelType !== 'infinite') return [];
    const ranges = infiniteCacheRef.current.getLoadedRanges().sort((a, b) => a.start - b.start);
    const rows: TData[] = [];
    let expected = 0;
    for (const { start, end } of ranges) {
      if (start !== expected) break;
      const block = infiniteCacheRef.current.getBlock(start, end);
      if (!block) break;
      rows.push(...block.data);
      expected = end;
    }
    return rows;
  }, [rowModelType, infiniteVersion, infiniteRowCount]);

  const sourceRows =
    rowModelType === 'serverSide'
      ? ssrmRows
      : rowModelType === 'infinite'
        ? infiniteRows
        : pipeline.processed;

  // Pivot transform
  const pivotResult = useMemo(() => {
    if (!pivotMode || !ent('pivoting')) return null;
    const pivotCol = columnDefs.find((c) => c.pivot);
    const valueCol = valueCols[0];
    if (!pivotCol?.field || !valueCol?.field) return null;
    const rowGroupFields = groupCols.map((c) => c.field!).filter(Boolean);
    return pivotData(
      sourceRows,
      rowGroupFields,
      pivotCol.field,
      valueCol.field,
      valueCol.aggFunc ?? 'sum',
      (row, field) => (row as any)[field]
    );
  }, [pivotMode, columnDefs, groupCols, valueCols, sourceRows, ent]);

  const rowNumberColWidth = typeof rowNumbers === 'object' ? rowNumbers.minWidth ?? 50 : 50;

  const displayColumns: ColumnDef<any>[] = useMemo(() => {
    const base: ColumnDef<any>[] = !pivotResult
      ? visibleCols
      : pivotResult.columns.map((c) => ({
          field: c,
          headerName: c,
          width: 120,
          aggFunc: groupCols.some((g) => g.field === c) ? undefined : ('sum' as const),
        }));
    if (!rowNumbers) return base;
    const rowNumberCol: ColumnDef<any> = {
      colId: '__rowNumber__',
      headerName: '#',
      width: rowNumberColWidth,
      minWidth: rowNumberColWidth,
      pinned: 'left',
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      cellRenderer: (p: any) => <span className="agx-row-number">{p.rowIndex + 1}</span>,
    };
    return [rowNumberCol, ...base];
  }, [pivotResult, visibleCols, groupCols, rowNumbers, rowNumberColWidth]);

  // Client-side (external filter) + pivot pipeline output
  const workingRows = useMemo(() => {
    const base = pivotResult ? (pivotResult.rows as TData[]) : sourceRows;
    if (!isExternalFilterPresent?.() || !doesExternalFilterPass) return base;
    return base.filter((data, i) =>
      doesExternalFilterPass({
        id: i,
        data,
        level: 0,
        group: false,
        expanded: false,
        parent: null,
      } as RowNode<TData>)
    );
  }, [pivotResult, sourceRows, isExternalFilterPresent, doesExternalFilterPass]);

  const grandTotalNode: RowNode<TData> | null = useMemo(() => {
    if (!groupIncludeTotalFooter || !valueCols.length) return null;
    const aggData: Record<string, any> = {};
    for (const vc of valueCols) {
      if (!vc.aggFunc || !vc.field) continue;
      const values = workingRows.map((r) =>
        getCellValue(
          r,
          vc,
          { id: 0, data: r, level: 0, group: false, expanded: false, parent: null } as RowNode<TData>,
          apiRef.current
        )
      );
      aggData[vc.field] = aggregate(values, vc.aggFunc);
    }
    return {
      id: '__grand_total__',
      data: null,
      level: 0,
      group: false,
      expanded: false,
      parent: null,
      leaf: true,
      footer: true,
      grandTotal: true,
      aggData,
    };
  }, [groupIncludeTotalFooter, valueCols, workingRows]);

  // Group / tree nodes
  const rootNodes: RowNode<TData>[] = useMemo(() => {
    if (treeData && getDataPath && ent('treeData')) {
      return buildTreeDataNodes(workingRows, getDataPath, getRowId);
    }
    if (groupCols.length && !pivotMode && ent('rowGrouping')) {
      let nodes = buildGroupTree(
        workingRows,
        groupCols,
        valueCols,
        getRowId,
        (row, col) => getCellValue(row, col, { id: 0, data: row, level: 0, group: false, expanded: false, parent: null } as any, apiRef.current)
      );
      if (groupIncludeFooter) nodes = addGroupFooters(nodes);
      return nodes;
    }
    return workingRows.map((data, i) => ({
      id: getRowId(data, i),
      data,
      level: 0,
      group: false,
      expanded: false,
      parent: null,
      leaf: true,
    }));
  }, [workingRows, treeData, getDataPath, groupCols, valueCols, pivotMode, getRowId, ent, groupIncludeFooter]);

  useEffect(() => {
    if (groupDefaultExpanded < 0) {
      setExpandedIds((prev) => (prev.size === 0 ? prev : new Set()));
      return;
    }
    const ids = new Set<RowId>();
    const walk = (nodes: RowNode<TData>[], depth: number) => {
      for (const n of nodes) {
        if (n.group && depth < groupDefaultExpanded) ids.add(n.id);
        if (n.childrenAfterGroup) walk(n.childrenAfterGroup, depth + 1);
      }
    };
    walk(rootNodes, 0);
    setExpandedIds((prev) => {
      if (prev.size === ids.size) {
        let same = true;
        for (const id of ids) {
          if (!prev.has(id)) {
            same = false;
            break;
          }
        }
        if (same) return prev;
      }
      return ids;
    });
  }, [rootNodes, groupDefaultExpanded]);

  const isGroupExpanded = useCallback(
    (node: RowNode<TData>) => expandedIds.has(node.id),
    [expandedIds]
  );

  const toggleGroupExpanded = useCallback((node: RowNode<TData>) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(node.id)) next.delete(node.id);
      else next.add(node.id);
      return next;
    });
  }, []);

  const flatNodes = useMemo(
    () => flattenVisibleNodes(rootNodes, expandedIds),
    [rootNodes, expandedIds]
  );

  const pagedNodes = useMemo(() => {
    if (!pagination) return flatNodes;
    const start = page * pageSize;
    return flatNodes.slice(start, start + pageSize);
  }, [flatNodes, pagination, page, pageSize]);

  const viewportNodes = useMemo(() => {
    if (rowModelType !== 'infinite') return pagedNodes;
    const count = Math.max(infiniteRowCount, flatNodes.length);
    return Array.from({ length: count }, (_, i) =>
      flatNodes[i] ?? {
        id: `__infinite_placeholder_${i}`,
        data: null as TData,
        level: 0,
        group: false,
        expanded: false,
        parent: null,
        leaf: true,
      }
    );
  }, [rowModelType, infiniteRowCount, flatNodes, pagedNodes]);

  const showFloatingFilter = floatingFilter || displayColumns.some((c) => c.floatingFilter);
  const extraHeaderHeight = showFloatingFilter ? floatingFiltersHeight : 0;

  const filterValuesByCol = useMemo(() => {
    const map = new Map<string, Array<string | number | boolean>>();
    for (let i = 0; i < displayColumns.length; i++) {
      const col = displayColumns[i];
      const colId = resolveColId(col, i);
      if (col.filter === 'set') {
        map.set(colId, collectUniqueColumnValues(sourceRows as any[], col));
      }
    }
    return map;
  }, [displayColumns, sourceRows]);


  const isPrintLayout = domLayout === 'print';
  const rowVirtualisationDisabled = suppressRowVirtualisation || isPrintLayout;

  const {
    startIndex: vStartIndex,
    endIndex: vEndIndex,
    offsetY: vOffsetY,
    totalHeight,
    onScroll: onVerticalScroll,
  } = useVirtualRows(
    viewportNodes.length,
    rowHeight,
    // Reserve room for the horizontal scrollbar so the last row is not covered.
    Math.max(bodyHeight - headerHeight - extraHeaderHeight - 14, 100),
    rowBuffer
  );
  const startIndex = rowVirtualisationDisabled ? 0 : vStartIndex;
  const endIndex = rowVirtualisationDisabled ? viewportNodes.length : vEndIndex;
  const offsetY = rowVirtualisationDisabled ? 0 : vOffsetY;

  const fetchInfiniteBlock = useCallback(
    async (startRow: number) => {
      if (rowModelType !== 'infinite') return;
      const endRow = startRow + cacheBlockSize;
      const key = `${startRow}:${endRow}`;
      if (infiniteCacheRef.current.hasBlock(startRow, endRow) || infiniteFetchingRef.current.has(key)) {
        return;
      }
      infiniteFetchingRef.current.add(key);
      if (serverSideDatasource && ent('serverSideRowModel')) {
        setLoading(true);
        try {
          const result = await serverSideDatasource.getRows({
            startRow,
            endRow,
            sortModel: pipeline.sortModel,
            filterModel: pipeline.filterModel,
            rowGroupCols: [],
            valueCols: [],
            pivotCols: [],
            groupKeys: [],
            pivotMode: false,
          });
          infiniteCacheRef.current.setBlock(startRow, endRow, result.rowData);
          if (result.rowCount != null) setInfiniteRowCount(result.rowCount);
          setInfiniteVersion((v) => v + 1);
        } finally {
          infiniteFetchingRef.current.delete(key);
          setLoading(false);
        }
      } else {
        const allRows = pipeline.processed;
        const blockData = allRows.slice(startRow, endRow);
        infiniteCacheRef.current.setBlock(startRow, endRow, blockData);
        setInfiniteRowCount(allRows.length);
        setInfiniteVersion((v) => v + 1);
        infiniteFetchingRef.current.delete(key);
      }
    },
    [
      rowModelType,
      cacheBlockSize,
      serverSideDatasource,
      pipeline.sortModel,
      pipeline.filterModel,
      pipeline.processed,
      ent,
    ]
  );

  const debouncedVerticalScroll = useMemo(
    () => debounce((e: React.UIEvent<HTMLDivElement>) => onVerticalScroll(e), 50),
    [onVerticalScroll]
  );

  const onViewportScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (debounceVerticalScrollbar) debouncedVerticalScroll(e);
      else onVerticalScroll(e);
      setScrollLeft(e.currentTarget.scrollLeft);
      if (rowModelType === 'infinite') {
        const st = e.currentTarget.scrollTop;
        const vh = e.currentTarget.clientHeight;
        const lastVisible = Math.floor((st + vh) / rowHeight);
        const loadedEnd = infiniteRows.length;
        if (lastVisible >= loadedEnd - 10 && loadedEnd < infiniteRowCount) {
          void fetchInfiniteBlock(loadedEnd);
        }
      }
    },
    [
      onVerticalScroll,
      debouncedVerticalScroll,
      debounceVerticalScrollbar,
      rowModelType,
      rowHeight,
      infiniteRows.length,
      infiniteRowCount,
      fetchInfiniteBlock,
    ]
  );

  useEffect(() => {
    if (rowModelType !== 'infinite') return;
    infiniteCacheRef.current.clear();
    infiniteFetchingRef.current.clear();
    setInfiniteVersion((v) => v + 1);
    void fetchInfiniteBlock(0);
  }, [rowModelType, pipeline.sortModel, pipeline.filterModel, rowData, fetchInfiniteBlock]);

  const slice = viewportNodes.slice(startIndex, endIndex);

  // SSRM fetch
  const fetchSsrm = useCallback(async () => {
    if (!serverSideDatasource || !hasFeature(license, 'serverSideRowModel')) return;
    setLoading(true);
    try {
      const startRow = pagination ? page * pageSize : 0;
      const endRow = pagination ? startRow + pageSize : 200;
      const result = await serverSideDatasource.getRows({
        startRow,
        endRow,
        sortModel: pipeline.sortModel,
        filterModel: pipeline.filterModel,
        rowGroupCols: groupCols.map((c, i) => ({
          id: resolveColId(c, i),
          field: c.field,
          displayName: c.headerName,
        })),
        valueCols: valueCols.map((c, i) => ({
          id: resolveColId(c, i),
          field: c.field,
          aggFunc: c.aggFunc,
        })),
        pivotCols: columnDefs.filter((c) => c.pivot).map((c, i) => ({
          id: resolveColId(c, i),
          field: c.field,
        })),
        groupKeys: [],
        pivotMode,
      });
      setSsrmRows(result.rowData);
      setSsrmCount(result.rowCount ?? result.rowData.length);
    } catch {
      setSsrmRows([]);
      setSsrmCount(0);
    } finally {
      setLoading(false);
    }
  }, [
    serverSideDatasource,
    page,
    pageSize,
    pagination,
    pipeline.sortModel,
    pipeline.filterModel,
    groupCols,
    valueCols,
    columnDefs,
    pivotMode,
    license,
  ]);

  useEffect(() => {
    if (rowModelType === 'serverSide') {
      void fetchSsrm();
    }
  }, [rowModelType, fetchSsrm]);

  const colWidths = useMemo(() => {
    const flexTotal = displayColumns.reduce((s, c) => s + (c.flex ?? 0), 0);
    const fixed = displayColumns.reduce((s, c) => s + (c.flex ? 0 : c.width ?? 140), 0);
    const remain = Math.max(bodyWidth - fixed - (sidePanel ? 260 : 0), 0);
    return displayColumns.map((c) => {
      if (c.flex && flexTotal) return Math.max(c.minWidth ?? 80, (remain * c.flex) / flexTotal);
      return c.width ?? 140;
    });
  }, [displayColumns, bodyWidth, sidePanel]);

  const pinnedLeftOffsets = useMemo(() => {
    const offsets: number[] = [];
    let acc = 0;
    displayColumns.forEach((c, i) => {
      if (c.pinned === 'left') {
        offsets[i] = acc;
        acc += colWidths[i] ?? c.width ?? 140;
      }
    });
    return offsets;
  }, [displayColumns, colWidths]);

  const columnPartitions = useMemo(() => {
    const left: Array<{ col: ColumnDef<any>; idx: number; width: number }> = [];
    const center: Array<{ col: ColumnDef<any>; idx: number; width: number }> = [];
    const right: Array<{ col: ColumnDef<any>; idx: number; width: number }> = [];
    displayColumns.forEach((col, idx) => {
      const entry = { col, idx, width: colWidths[idx] };
      if (col.pinned === 'left') left.push(entry);
      else if (col.pinned === 'right') right.push(entry);
      else center.push(entry);
    });
    return { left, center, right };
  }, [displayColumns, colWidths]);

  const leftPinnedWidth = useMemo(
    () => columnPartitions.left.reduce((s, c) => s + c.width, 0),
    [columnPartitions.left]
  );
  const rightPinnedWidth = useMemo(
    () => columnPartitions.right.reduce((s, c) => s + c.width, 0),
    [columnPartitions.right]
  );
  const centerColWidths = useMemo(
    () => columnPartitions.center.map((c) => c.width),
    [columnPartitions.center]
  );
  const centerViewportWidth = Math.max(bodyWidth - leftPinnedWidth - rightPinnedWidth - (sidePanel ? 260 : 0), 0);
  const colVirtComputed = useColumnVirtualization(centerColWidths, scrollLeft, centerViewportWidth);
  const colVirt = suppressColumnVirtualisation
    ? {
        startCol: 0,
        endCol: columnPartitions.center.length,
        offsetX: 0,
        totalWidth: colVirtComputed.totalWidth,
      }
    : colVirtComputed;
  const visibleCenterCols = columnPartitions.center.slice(colVirt.startCol, colVirt.endCol);
  const centerLeadSpacer = colVirt.offsetX;
  const centerTrailSpacer = Math.max(
    0,
    colVirt.totalWidth - colVirt.offsetX - visibleCenterCols.reduce((s, c) => s + c.width, 0)
  );
  const gridTotalWidth =
    leftPinnedWidth + colVirt.totalWidth + rightPinnedWidth;

  const pinnedTopNodes: RowNode<TData>[] = useMemo(
    () =>
      pinnedTopRowData.map((data, i) => ({
        id: `__pinned_top_${i}`,
        data,
        level: 0,
        group: false,
        expanded: false,
        parent: null,
        leaf: true,
      })),
    [pinnedTopRowData]
  );

  const pinnedBottomNodes: RowNode<TData>[] = useMemo(
    () =>
      pinnedBottomRowData.map((data, i) => ({
        id: `__pinned_bottom_${i}`,
        data,
        level: 0,
        group: false,
        expanded: false,
        parent: null,
        leaf: true,
      })),
    [pinnedBottomRowData]
  );

  const applyFilterPatch = useCallback(
    (colId: string, patch: Partial<FilterModelItem> | null) => {
      pipeline.setFilterModel((prev) => {
        const rest = prev.filter((f) => f.colId !== colId);
        if (!patch) return rest;
        const existing = prev.find((f) => f.colId === colId);
        return [
          ...rest,
          { colId, type: 'text', operator: 'contains', ...existing, ...patch } as FilterModelItem,
        ];
      });
    },
    [pipeline.setFilterModel]
  );

  const getDetailRows = useCallback(
    (data: any): any[] => {
      let rows: any[] = [];
      if (detailCellRendererParams?.getDetailRowData) {
        detailCellRendererParams.getDetailRowData({
          data,
          successCallback: (r) => {
            rows = r;
          },
        });
        return rows;
      }
      for (const key of Object.keys(data ?? {})) {
        if (Array.isArray((data as any)[key])) return (data as any)[key];
      }
      return rows;
    },
    [detailCellRendererParams]
  );

  const getDetailColumnDefs = useCallback(
    (data: any): DetailColumnDef[] => {
      const cols = detailCellRendererParams?.detailGridOptions?.columnDefs;
      if (cols?.length) {
        return cols.map((c, i) => ({
          field: c.field ?? c.colId ?? `col_${i}`,
          headerName: c.headerName,
        }));
      }
      const rows = getDetailRows(data);
      const first = rows[0];
      if (first && typeof first === 'object') {
        return Object.keys(first).map((k) => ({ field: k }));
      }
      return [];
    },
    [detailCellRendererParams, getDetailRows]
  );

  const flashCell = useCallback(
    (rowId: RowId, colId: string) => {
      if (!enableCellChangeFlash) return;
      const key = `${rowId}:${colId}`;
      setFlashingCells((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      const existing = flashTimersRef.current.get(key);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        setFlashingCells((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        flashTimersRef.current.delete(key);
      }, cellFlashDuration);
      flashTimersRef.current.set(key, timer);
    },
    [enableCellChangeFlash, cellFlashDuration]
  );

  const getCellValueForColumn = useCallback(
    (data: any, col: ColumnDef<any>, node: RowNode<any>, colId: string): any => {
      if (enableCellExpressions && typeof col.valueGetter === 'string') {
        return evaluateFormula(col.valueGetter, (data as Record<string, any>) ?? {});
      }
      if (valueCache) {
        const key = `${node.id}:${colId}`;
        if (valueCacheMapRef.current.has(key)) return valueCacheMapRef.current.get(key);
        const v = getCellValue(data, col, node, apiRef.current);
        valueCacheMapRef.current.set(key, v);
        return v;
      }
      return getCellValue(data, col, node, apiRef.current);
    },
    [enableCellExpressions, valueCache]
  );

  const commitEdit = useCallback(() => {
    if (!editing) return;
    if (readOnlyEdit) {
      setEditing(null);
      return;
    }
    const { rowId, colId } = editing;
    const node = flatNodes.find((n) => n.id === rowId);
    if (!node?.data) {
      setEditing(null);
      return;
    }
    const col = displayColumns.find((c, i) => resolveColId(c, i) === colId);
    if (!col) {
      setEditing(null);
      return;
    }
    const oldValue = getCellValue(node.data, col, node, apiRef.current);
    const newValue: any = editValue;

    if (col.valueSetter) {
      col.valueSetter({
        data: node.data,
        value: oldValue,
        newValue,
        node,
        column: col,
        api: apiRef.current,
      });
    } else if (col.field) {
      (node.data as any)[col.field] = newValue;
      setRowData((prev) => [...prev]);
    }

    if (undoRedoCellEditing && ent('undoRedo')) {
      undoStack.current.push({ data: node.data, colId, oldValue, newValue });
      if (undoStack.current.length > undoRedoCellEditingLimit) undoStack.current.shift();
      redoStack.current = [];
    }
    flashCell(rowId, colId);
    if (editMode === 'batch') {
      const key = `${rowId}:${colId}`;
      batchEditsRef.current.set(key, { rowId, colId, data: node.data, oldValue, newValue });
      setPendingEditKeys((prev) => new Set(prev).add(key));
    } else {
      onCellValueChanged?.({ data: node.data, colId, oldValue, newValue });
    }
    setEditing(null);
  }, [
    editing,
    editValue,
    flatNodes,
    displayColumns,
    undoRedoCellEditing,
    undoRedoCellEditingLimit,
    onCellValueChanged,
    ent,
    readOnlyEdit,
    editMode,
    flashCell,
  ]);

  const beginFullRowEdit = useCallback(
    (node: RowNode<TData>) => {
      if (!node.data || node.footer || node.group || readOnlyEdit) return;
      const values: Record<string, any> = {};
      displayColumns.forEach((col, i) => {
        const colId = resolveColId(col, i);
        values[colId] = getCellValue(node.data, col, node, apiRef.current);
      });
      setRowEditValues(values);
      setFullRowEditingId(node.id);
    },
    [displayColumns, readOnlyEdit]
  );

  const cancelFullRowEdit = useCallback(() => {
    setFullRowEditingId(null);
    setRowEditValues({});
  }, []);

  const commitFullRowEdit = useCallback(() => {
    if (fullRowEditingId == null) {
      cancelFullRowEdit();
      return;
    }
    const node = flatNodes.find((n) => n.id === fullRowEditingId);
    const data = node?.data;
    if (node && data && !readOnlyEdit) {
      displayColumns.forEach((col, i) => {
        const colId = resolveColId(col, i);
        const oldValue = getCellValue(data, col, node, apiRef.current);
        const newValue = rowEditValues[colId];
        const editable =
          typeof col.editable === 'function'
            ? col.editable({ data, value: oldValue, node, column: col, api: apiRef.current })
            : col.editable;
        if (!editable || newValue === undefined || newValue === oldValue) return;
        if (col.valueSetter) {
          col.valueSetter({ data, value: oldValue, newValue, node, column: col, api: apiRef.current });
        } else if (col.field) {
          (data as any)[col.field] = newValue;
        }
        flashCell(node.id, colId);
        onCellValueChanged?.({ data, colId, oldValue, newValue });
      });
      setRowData((prev) => [...prev]);
    }
    cancelFullRowEdit();
  }, [fullRowEditingId, flatNodes, displayColumns, rowEditValues, readOnlyEdit, onCellValueChanged, flashCell, cancelFullRowEdit]);

  const beginEdit = useCallback(
    (rowIndex: number, colIndex: number) => {
      const node = pagedNodes[rowIndex];
      const col = displayColumns[colIndex];
      if (!node?.data || node.footer || readOnlyEdit) return;
      const value = getCellValue(node.data, col, node, apiRef.current);
      const editable =
        typeof col.editable === 'function'
          ? col.editable({ data: node.data as TData, value, node, column: col, api: apiRef.current, context })
          : col.editable;
      if (!editable) return;
      const colId = resolveColId(col, colIndex);
      setEditing({ rowId: node.id, colId });
      setEditValue(value);
    },
    [pagedNodes, displayColumns]
  );

  const keyboardNav = useKeyboardNav({
    rowCount: pagedNodes.length,
    colCount: displayColumns.length,
    enabled: !editing && fullRowEditingId == null,
    onEdit: ({ row, col }) => {
      if (editType === 'fullRow') beginFullRowEdit(pagedNodes[row]);
      else beginEdit(row, col);
    },
    onCommit: () => commitEdit(),
  });

  const commitFill = useCallback(
    (range: { startRow: number; endRow: number; startCol: string; endCol: string }, newEndRow: number) => {
      const startColIdx = displayColumns.findIndex((c, i) => resolveColId(c, i) === range.startCol);
      const endColIdx = displayColumns.findIndex((c, i) => resolveColId(c, i) === range.endCol);
      if (startColIdx < 0 || endColIdx < 0) return;
      const loCol = Math.min(startColIdx, endColIdx);
      const hiCol = Math.max(startColIdx, endColIdx);
      for (let ci = loCol; ci <= hiCol; ci++) {
        const col = displayColumns[ci];
        if (!col.field && !col.valueSetter) continue;
        const sourceValues: any[] = [];
        for (let r = range.startRow; r <= range.endRow; r++) {
          const node = pagedNodes[r];
          if (node?.data) sourceValues.push(getCellValue(node.data, col, node, apiRef.current));
        }
        const targetCount = newEndRow - range.startRow + 1;
        const filled = fillSeries(sourceValues, targetCount);
        for (let r = range.startRow; r <= newEndRow; r++) {
          const node = pagedNodes[r];
          if (!node?.data) continue;
          const newValue = filled[r - range.startRow];
          const oldValue = getCellValue(node.data, col, node, apiRef.current);
          if (col.valueSetter) {
            col.valueSetter({ data: node.data, value: oldValue, newValue, node, column: col, api: apiRef.current });
          } else if (col.field) {
            (node.data as any)[col.field] = newValue;
          }
          flashCell(node.id, resolveColId(col, ci));
          onCellValueChanged?.({ data: node.data, colId: resolveColId(col, ci), oldValue, newValue });
        }
      }
      setRowData((prev) => [...prev]);
      selection.setRange({ ...range, endRow: newEndRow });
    },
    [displayColumns, pagedNodes, onCellValueChanged, selection, flashCell]
  );

  const startFillDrag = useCallback(
    (e: MouseEvent, range: { startRow: number; endRow: number; startCol: string; endCol: string }) => {
      e.stopPropagation();
      e.preventDefault();
      let targetEndRow = range.endRow;
      const move = (ev: globalThis.MouseEvent) => {
        const el = (document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null)?.closest(
          '[data-row-index]'
        ) as HTMLElement | null;
        if (el) {
          const idx = Number(el.dataset.rowIndex);
          if (!Number.isNaN(idx)) targetEndRow = Math.max(range.startRow, idx);
        }
      };
      const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        if (targetEndRow > range.endRow) commitFill(range, targetEndRow);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [commitFill]
  );

  const startRangeHandleDrag = useCallback(
    (e: MouseEvent, range: GridRange) => {
      e.stopPropagation();
      e.preventDefault();
      const anchorRow = range.startRow;
      const move = (ev: globalThis.MouseEvent) => {
        const el = (document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null)?.closest(
          '[data-row-index]'
        ) as HTMLElement | null;
        if (el) {
          const idx = Number(el.dataset.rowIndex);
          if (!Number.isNaN(idx)) {
            selection.setRange({
              startRow: Math.min(anchorRow, idx),
              endRow: Math.max(anchorRow, idx),
              startCol: range.startCol,
              endCol: range.endCol,
            });
          }
        }
      };
      const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [selection]
  );

  const api: DbGridApi<TData> = useMemo(
    () => ({
      getSelectedRows: () =>
        flatNodes.filter((n) => selection.selectedIds.has(n.id) && n.data).map((n) => n.data!),
      selectAll: () => selection.selectAll(flatNodes.map((n) => n.id)),
      deselectAll: () => selection.deselectAll(),
      setQuickFilter: pipeline.setQuickFilter,
      setFilterModel: pipeline.setFilterModel,
      getFilterModel: () => pipeline.filterModel,
      setSortModel: pipeline.setSortModel,
      getSortModel: () => pipeline.sortModel,
      exportDataAsCsv: (p) => {
        const rows = p?.onlySelected
          ? api.getSelectedRows()
          : workingRows;
        exportCsv(rows, displayColumns as ColumnDef<TData>[], p);
      },
      exportDataAsExcel: async (p) => {
        if (!ent('excelExport')) {
          exportCsv(workingRows, displayColumns as ColumnDef<TData>[], {
            fileName: (p?.fileName ?? 'export').replace(/\.xlsx?$/i, '.csv'),
          });
          return;
        }
        await exportExcelXlsx(workingRows, displayColumns as ColumnDef<TData>[], p);
      },
      expandAll: () => {
        const ids = new Set<RowId>();
        const walk = (nodes: RowNode<TData>[]) => {
          for (const n of nodes) {
            if (n.group) ids.add(n.id);
            if (n.childrenAfterGroup) walk(n.childrenAfterGroup);
          }
        };
        walk(rootNodes);
        setExpandedIds(ids);
      },
      collapseAll: () => setExpandedIds(new Set()),
      setRowData: (data) => setRowData(data),
      applyTransaction: ({ add, update, remove }) => {
        setRowData((prev) => {
          let next = [...prev];
          if (remove?.length) {
            const rm = new Set(remove.map((r, i) => getRowId(r, i)));
            next = next.filter((r, i) => !rm.has(getRowId(r, i)));
          }
          if (update?.length) {
            const map = new Map(update.map((r, i) => [getRowId(r, i), r]));
            next = next.map((r, i) => map.get(getRowId(r, i)) ?? r);
          }
          if (add?.length) next = [...next, ...add];
          return next;
        });
      },
      applyTransactionAsync: (tx, callback) => {
        requestAnimationFrame(() => {
          api.applyTransaction(tx);
          callback?.();
        });
      },
      undoCellEditing: () => {
        const last = undoStack.current.pop();
        if (!last || !last.data || !(last as any)) return;
        const col = displayColumns.find((c, i) => resolveColId(c, i) === last.colId);
        if (col?.field) (last.data as any)[col.field] = last.oldValue;
        redoStack.current.push(last);
        setRowData((p) => [...p]);
      },
      redoCellEditing: () => {
        const last = redoStack.current.pop();
        if (!last) return;
        const col = displayColumns.find((c, i) => resolveColId(c, i) === last.colId);
        if (col?.field) (last.data as any)[col.field] = last.newValue;
        undoStack.current.push(last);
        setRowData((p) => [...p]);
      },
      getDisplayedRowCount: () => flatNodes.length,
      refreshServerSide: () => void fetchSsrm(),
      refreshCells: () => setRowData((p) => [...p]),
      redrawRows: () => setRowData((p) => [...p]),
      sizeColumnsToFit: () => {
        const w = Math.floor((bodyWidth - (sidePanel ? 260 : 0)) / Math.max(displayColumns.length, 1));
        setColumnDefs((cols) => cols.map((c) => ({ ...c, width: w, flex: undefined })));
      },
      autoSizeAllColumns: () => {
        setColumnDefs((cols) =>
          cols.map((c) => ({
            ...c,
            width: Math.min(
              320,
              Math.max(100, String(c.headerName ?? c.field ?? '').length * 10 + 40)
            ),
          }))
        );
      },
      showLoadingOverlay: () => setLoading(true),
      hideOverlay: () => setLoading(false),
      getColumnState: () =>
        columnDefs.map((c, i) => ({
          colId: resolveColId(c, i),
          width: c.width,
          hide: c.hide,
          pinned: c.pinned ?? null,
          sort: pipeline.sortModel.find((s) => s.colId === resolveColId(c, i))?.sort ?? null,
        })),
      applyColumnState: (state: ColumnStateItem[]) => {
        setColumnDefs((cols) =>
          cols.map((c, i) => {
            const id = resolveColId(c, i);
            const s = state.find((x) => x.colId === id);
            return s ? { ...c, width: s.width ?? c.width, hide: s.hide, pinned: s.pinned } : c;
          })
        );
      },
      getState: (): GridState => ({
        filterModel: pipeline.filterModel,
        sortModel: pipeline.sortModel,
        columnState: api.getColumnState(),
        pivotMode,
        quickFilter: pipeline.quickFilter,
      }),
      setState: (state: GridState) => {
        pipeline.setFilterModel(state.filterModel ?? []);
        pipeline.setSortModel(state.sortModel ?? []);
        if (state.columnState) api.applyColumnState(state.columnState);
        setPivotMode(state.pivotMode ?? false);
        if (state.quickFilter !== undefined) pipeline.setQuickFilter(state.quickFilter);
      },
      copySelectedRangeToClipboard: () => {
        if (!ent('clipboard')) return;
        const range = selection.ranges[0];
        if (!range) return;
        const startColIdx = displayColumns.findIndex((c, i) => resolveColId(c, i) === range.startCol);
        const endColIdx = displayColumns.findIndex((c, i) => resolveColId(c, i) === range.endCol);
        const loCol = Math.max(0, Math.min(startColIdx, endColIdx));
        const hiCol = Math.max(startColIdx, endColIdx);
        const matrix: string[][] = [];
        for (let r = range.startRow; r <= range.endRow; r++) {
          const node = flatNodes[r];
          if (!node?.data) continue;
          const rowVals: string[] = [];
          for (let ci = loCol; ci <= hiCol; ci++) {
            const col = displayColumns[ci];
            rowVals.push(
              formatCellValue(
                getCellValue(node.data, col, node, apiRef.current),
                node.data,
                col,
                node,
                apiRef.current
              )
            );
          }
          matrix.push(rowVals);
        }
        void navigator.clipboard.writeText(formatRangeAsTsv(matrix));
      },
      pasteFromClipboard: async () => {
        if (!ent('clipboard')) return;
        const text = await navigator.clipboard.readText();
        const matrix = parseClipboardTsv(text);
        if (!matrix.length) return;
        const range = selection.ranges[0];
        const startRow = range ? range.startRow : 0;
        const startColId = range ? range.startCol : resolveColId(displayColumns[0], 0);
        const startColIdx = Math.max(0, displayColumns.findIndex((c, i) => resolveColId(c, i) === startColId));
        matrix.forEach((rowVals, ri) => {
          const node = flatNodes[startRow + ri];
          const data = node?.data;
          if (!node || !data) return;
          rowVals.forEach((raw, ci) => {
            const col = displayColumns[startColIdx + ci];
            if (!col) return;
            const oldValue = getCellValue(data, col, node, apiRef.current);
            let newValue: any = raw;
            if (col.valueParser) {
              newValue = col.valueParser({ newValue: raw, oldValue, data });
            } else if (typeof oldValue === 'number') {
              newValue = Number(raw);
            } else if (typeof oldValue === 'boolean') {
              newValue = raw === 'true';
            }
            if (col.valueSetter) {
              col.valueSetter({ data, value: oldValue, newValue, node, column: col, api: apiRef.current });
            } else if (col.field) {
              (data as any)[col.field] = newValue;
            }
            flashCell(node.id, resolveColId(col, startColIdx + ci));
            onCellValueChanged?.({ data, colId: resolveColId(col, startColIdx + ci), oldValue, newValue });
          });
        });
        setRowData((prev) => [...prev]);
      },
      findNext: (text) => {
        setFindQuery(text);
        setFindIndex((i) => i + 1);
      },
      findPrevious: (text) => {
        setFindQuery(text);
        setFindIndex((i) => Math.max(0, i - 1));
      },
      startEditingCell: ({ rowIndex, colKey }) => {
        if (readOnlyEdit) return;
        const node = pagedNodes[rowIndex];
        const colIdx = displayColumns.findIndex((c, i) => resolveColId(c, i) === colKey || c.field === colKey);
        const col = displayColumns[colIdx];
        if (!node?.data || !col) return;
        const colId = resolveColId(col, colIdx);
        setEditing({ rowId: node.id, colId });
        setEditValue(getCellValue(node.data, col, node, apiRef.current));
      },
      stopEditing: (cancel) => {
        if (cancel) setEditing(null);
        else commitEdit();
      },
      ensureIndexVisible: (index) => {
        viewportRef.current?.scrollTo({ top: index * rowHeight });
      },
      getRowNode: (id) => flatNodes.find((n) => n.id === id),
      forEachNode: (callback) => flatNodes.forEach((n, i) => callback(n, i)),
      resetColumnState: () => setColumnDefs(columnDefsProp.map((c) => ({ ...defaultColDef, ...c }))),
      setColumnsVisible: (keys, visible) => {
        setColumnDefs((cols) =>
          cols.map((c, i) => (keys.includes(resolveColId(c, i)) ? { ...c, hide: !visible } : c))
        );
      },
      setColumnsPinned: (keys, pinned) => {
        setColumnDefs((cols) =>
          cols.map((c, i) => (keys.includes(resolveColId(c, i)) ? { ...c, pinned } : c))
        );
      },
      flashCells: (params) => {
        const nodes = params?.rowNodes ?? flatNodes;
        const cols = params?.columns ?? displayColumns.map((c, i) => resolveColId(c, i));
        nodes.forEach((n) => cols.forEach((cid) => flashCell(n.id, cid)));
      },
      resetRowHeights: () => setRowData((p) => [...p]),
      setGridOption: (key, value) => {
        switch (key) {
          case 'rowData':
            setRowData(value);
            break;
          case 'columnDefs':
            setColumnDefs((value as ColumnDef<TData>[]).map((c) => ({ ...defaultColDef, ...c })));
            break;
          case 'loading':
            setLoading(!!value);
            break;
          case 'quickFilterText':
            pipeline.setQuickFilter(value ?? '');
            break;
          case 'pivotMode':
            setPivotMode(!!value);
            break;
          default:
            break;
        }
      },
      getRenderedNodes: () => slice,
      getSelectedNodes: () => flatNodes.filter((n) => selection.selectedIds.has(n.id)),
      getCellValue: ({ rowNode, colKey }) => {
        const colIdx = displayColumns.findIndex((c, i) => resolveColId(c, i) === colKey || c.field === colKey);
        const col = displayColumns[colIdx];
        if (!col) return undefined;
        return getCellValue(rowNode.data, col, rowNode, apiRef.current);
      },
      commitBatchEdits: () => {
        batchEditsRef.current.forEach((entry) => {
          onCellValueChanged?.({
            data: entry.data,
            colId: entry.colId,
            oldValue: entry.oldValue,
            newValue: entry.newValue,
          });
        });
        batchEditsRef.current.clear();
        setPendingEditKeys(new Set());
      },
      cancelBatchEdits: () => {
        batchEditsRef.current.forEach((entry) => {
          const col = displayColumns.find((c, i) => resolveColId(c, i) === entry.colId);
          if (col?.field && entry.data) (entry.data as any)[col.field] = entry.oldValue;
        });
        batchEditsRef.current.clear();
        setPendingEditKeys(new Set());
        setRowData((p) => [...p]);
      },
      importDataAsCsv: (text, p) => {
        const rows = parseCsvText(text, p?.delimiter);
        if (!rows.length) return;
        const [header, ...body] = rows;
        const newRows = body.map((cols) => {
          const obj: Record<string, any> = {};
          header.forEach((h, i) => {
            obj[h] = cols[i];
          });
          return obj as TData;
        });
        api.applyTransaction({ add: newRows });
      },
    }),
    [
      flatNodes,
      selection,
      pipeline,
      workingRows,
      displayColumns,
      ent,
      rootNodes,
      getRowId,
      fetchSsrm,
      bodyWidth,
      sidePanel,
      columnDefs,
      pivotMode,
      pagedNodes,
      rowHeight,
      commitEdit,
      onCellValueChanged,
      columnDefsProp,
      defaultColDef,
      flashCell,
      slice,
      readOnlyEdit,
    ]
  );

  apiRef.current = api;
  useImperativeHandle(ref, () => api, [api]);
  useEffect(() => {
    onGridReady?.(api);
  }, []);

  useEffect(() => {
    onSelectionChanged?.(api.getSelectedRows());
  }, [selection.selectedIds]);

  const onHeaderClick = (colId: string, e: MouseEvent) => {
    const col = displayColumns.find((c, i) => resolveColId(c, i) === colId);
    if (col?.sortable === false) return;
    pipeline.toggleSort(colId, e.shiftKey);
  };

  const openContextMenu = (e: MouseEvent, node?: RowNode<TData>, colId?: string) => {
    if (suppressContextMenu || !ent('contextMenu')) return;
    e.preventDefault();
    const col = colId ? displayColumns.find((c, i) => resolveColId(c, i) === colId) : undefined;
    const defaultItems: ContextMenuItem[] = [
      { name: 'Copy', action: () => api.copySelectedRangeToClipboard(), shortcut: 'Ctrl+C' },
      { name: 'Paste', action: () => void api.pasteFromClipboard(), shortcut: 'Ctrl+V', disabled: !ent('clipboard') },
      { name: 'Export CSV', action: () => api.exportDataAsCsv() },
      { name: 'Export Excel', action: () => void api.exportDataAsExcel(), disabled: !ent('excelExport') },
      { separator: true, name: '' },
      {
        name: node?.group ? (isGroupExpanded(node) ? 'Collapse' : 'Expand') : 'Toggle Detail',
        action: () => {
          if (node?.group) {
            toggleGroupExpanded(node);
          } else if (node && masterDetail) {
            setDetailOpen((prev) => {
              const n = new Set(prev);
              if (n.has(node.id)) n.delete(node.id);
              else n.add(node.id);
              return n;
            });
          }
        },
      },
      {
        name: 'Auto-size Columns',
        action: () => api.autoSizeAllColumns(),
      },
    ];
    if (cellNotes && node && !node.footer && !node.group && colId) {
      const existingNote = getNote(node.id, colId);
      defaultItems.push({ separator: true, name: '' });
      defaultItems.push({
        name: existingNote ? translate('editNote', 'Edit note') : translate('addNote', 'Add note'),
        action: () => {
          const next = window.prompt(translate('addNote', 'Add note'), existingNote ?? '');
          if (next == null) return;
          if (next.trim() === '') clearNote(node.id, colId);
          else setNote(node.id, colId, next);
          setNotesVersion((v) => v + 1);
        },
      });
      if (existingNote) {
        defaultItems.push({
          name: translate('removeNote', 'Remove note'),
          action: () => {
            clearNote(node.id, colId);
            setNotesVersion((v) => v + 1);
          },
        });
      }
    }
    const custom = getContextMenuItems?.({ node, column: col });
    setContextMenu({ x: e.clientX, y: e.clientY, items: custom && custom.length ? custom : defaultItems });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (fullRowEditingId != null) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitFullRowEdit();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelFullRowEdit();
      }
      return;
    }
    if (e.key === 'Enter' && !editing && enterNavigatesVertically) {
      e.preventDefault();
      const cur = keyboardNav.focused ?? { row: 0, col: 0 };
      keyboardNav.setFocused({ row: cur.row + 1, col: cur.col });
      return;
    }
    if (!editing) keyboardNav.onKeyDown(e);
    if (e.ctrlKey && e.key === 'c') api.copySelectedRangeToClipboard();
    if (e.ctrlKey && e.key === 'v') void api.pasteFromClipboard();
    if (e.ctrlKey && e.key === 'z') api.undoCellEditing();
    if (e.ctrlKey && e.key === 'y') api.redoCellEditing();
    if (e.key === 'Enter' && editing) {
      const focusedBefore = keyboardNav.focused;
      commitEdit();
      if (enterNavigatesVerticallyAfterEdit && focusedBefore) {
        keyboardNav.setFocused({ row: focusedBefore.row + 1, col: focusedBefore.col });
      }
    }
    if (e.key === 'Escape') setEditing(null);
  };

  const totalRows =
    rowModelType === 'serverSide'
      ? ssrmCount
      : rowModelType === 'infinite'
        ? infiniteRowCount || flatNodes.length
        : flatNodes.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

  const selectionStats = useMemo(() => {
    if (!selection.ranges.length) return undefined;
    const nums: number[] = [];
    for (const range of selection.ranges) {
      const startColIdx = displayColumns.findIndex((c, i) => resolveColId(c, i) === range.startCol);
      const endColIdx = displayColumns.findIndex((c, i) => resolveColId(c, i) === range.endCol);
      if (startColIdx < 0 || endColIdx < 0) continue;
      const loCol = Math.min(startColIdx, endColIdx);
      const hiCol = Math.max(startColIdx, endColIdx);
      for (let r = range.startRow; r <= range.endRow; r++) {
        const node = pagedNodes[r];
        if (!node) continue;
        for (let ci = loCol; ci <= hiCol; ci++) {
          const col = displayColumns[ci];
          const value = getCellValue(node.data, col, node, apiRef.current);
          const num = typeof value === 'number' ? value : Number(value);
          if (value != null && value !== '' && !Number.isNaN(num)) nums.push(num);
        }
      }
    }
    if (!nums.length) return undefined;
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
      count: nums.length,
      sum,
      avg: sum / nums.length,
      min: Math.min(...nums),
      max: Math.max(...nums),
    };
  }, [selection.ranges, displayColumns, pagedNodes]);

  const icon = (key: string, fallback: string) => icons?.[key] ?? fallback;

  const renderHeaderCell = (col: ColumnDef<any>, idx: number, width: number) => {
    const colId = resolveColId(col, idx);
    const sort = pipeline.sortModel.find((s) => s.colId === colId);
    const pinnedLeft = col.pinned === 'left';
    return (
      <div
        key={colId}
        className={`agx-header-cell ${pinnedLeft ? 'agx-pinned-left' : ''}`}
        style={{
          width,
          minWidth: width,
          maxWidth: width,
          ...(pinnedLeft ? { position: 'sticky' as const, left: pinnedLeftOffsets[idx] ?? 0, zIndex: 4 } : {}),
        }}
        onClick={(e) => onHeaderClick(colId, e)}
        onContextMenu={(e) => {
          if (suppressContextMenu) return;
          e.preventDefault();
          setColumnMenu({ x: e.clientX, y: e.clientY, colId });
        }}
        role="columnheader"
        aria-sort={sort ? (sort.sort === 'asc' ? 'ascending' : 'descending') : 'none'}
        aria-colindex={idx + 1}
      >
        <span className="agx-header-label">{col.headerName ?? col.field ?? colId}</span>
        {sort && (
          <span className="agx-sort">
            {icon(sort.sort === 'asc' ? 'sortAscending' : 'sortDescending', sort.sort === 'asc' ? '↑' : '↓')}
          </span>
        )}
        <button
          type="button"
          className="agx-col-menu-btn"
          title="Column menu"
          onClick={(e) => {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setColumnMenu({ x: rect.left, y: rect.bottom + 2, colId });
          }}
        >
          {icon('menu', '⋮')}
        </button>
        <div
          className="agx-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const startX = e.clientX;
            const startW = width;
            const move = (ev: globalThis.MouseEvent) => {
              const nw = Math.max(col.minWidth ?? 60, startW + (ev.clientX - startX));
              setColumnDefs((cols) =>
                cols.map((c, i) => (resolveColId(c, i) === colId ? { ...c, width: nw, flex: undefined } : c))
              );
            };
            const up = () => {
              window.removeEventListener('mousemove', move);
              window.removeEventListener('mouseup', up);
            };
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', up);
          }}
        />
      </div>
    );
  };

  const renderCell = (
    node: RowNode<TData>,
    col: ColumnDef<any>,
    colIndex: number,
    rowIndex: number,
    width: number,
    _opts?: { compact?: boolean },
    prevNode?: RowNode<TData>
  ) => {
    const colId = resolveColId(col, colIndex);
    const isEditing = editing?.rowId === node.id && editing.colId === colId;
    const isFullRowEditingCell = editType === 'fullRow' && fullRowEditingId === node.id && !node.footer && !node.group;
    const value = node.footer
      ? col.field && node.aggData
        ? node.aggData[col.field]
        : null
      : node.group
        ? col.field && node.aggData
          ? node.aggData[col.field]
          : colIndex === 0
            ? node.key
            : getCellValueForColumn(node.data, col, node, colId)
        : getCellValueForColumn(node.data, col, node, colId);

    const activeRange = selection.ranges[0];
    const inRange =
      rangeSelectionEnabled &&
      selection.ranges.some(
        (r) =>
          rowIndex >= r.startRow &&
          rowIndex <= r.endRow
      );

    const editableHere =
      typeof col.editable === 'function'
        ? col.editable({ data: node.data as TData, value, node, column: col, api, context })
        : col.editable;

    const isRowSpanMerge =
      !!col.enableRowSpan &&
      !!prevNode?.data &&
      !!node.data &&
      !node.group &&
      !node.footer &&
      getCellValueForColumn(prevNode.data, col, prevNode, colId) === value;

    let content: ReactNode;
    if (isFullRowEditingCell && editableHere) {
      const rowValue = rowEditValues[colId];
      if (col.cellEditor && typeof col.cellEditor !== 'string') {
        const Editor = col.cellEditor as any;
        const editorParams = {
          data: node.data,
          value: rowValue,
          node,
          column: col,
          api,
          rowIndex,
          context,
          stopEditing: (cancel?: boolean) => (cancel ? cancelFullRowEdit() : commitFullRowEdit()),
        };
        content = (
          <div onKeyDown={(e) => e.stopPropagation()}>
            {typeof Editor === 'function' ? Editor(editorParams) : null}
          </div>
        );
      } else {
        const editorType = resolveEditorType(col, rowValue);
        content = (
          <div onKeyDown={(e) => e.stopPropagation()}>
            <CellEditor
              type={editorType}
              value={rowValue}
              values={col.cellEditorParams?.values}
              onChange={(v) => setRowEditValues((prev) => ({ ...prev, [colId]: v }))}
              onCommit={commitFullRowEdit}
              onCancel={cancelFullRowEdit}
            />
          </div>
        );
      }
    } else if (isEditing) {
      if (col.cellEditor && typeof col.cellEditor !== 'string') {
        const Editor = col.cellEditor as any;
        const editorParams = {
          data: node.data,
          value: editValue,
          node,
          column: col,
          api,
          rowIndex,
          context,
          stopEditing: (cancel?: boolean) => (cancel ? setEditing(null) : commitEdit()),
        };
        content = (
          <div onKeyDown={(e) => e.stopPropagation()}>
            {typeof Editor === 'function' ? Editor(editorParams) : null}
          </div>
        );
      } else {
        const editorType = resolveEditorType(col, value);
        content = (
          <div onKeyDown={(e) => e.stopPropagation()}>
            <CellEditor
              type={editorType}
              value={editValue}
              values={col.cellEditorParams?.values}
              onChange={setEditValue}
              onCommit={commitEdit}
              onCancel={() => setEditing(null)}
            />
          </div>
        );
      }
    } else if (node.footer) {
      content =
        colIndex === 0 ? (
          <strong>
            {node.grandTotal ? translate('grandTotalLabel', 'Grand Total') : translate('totalLabel', 'Total')}
          </strong>
        ) : value == null ? (
          ''
        ) : (
          formatCellValue(value, null, col, node, api)
        );
    } else if (col.sparkline && Array.isArray(value) && ent('sparklines')) {
      const sparkType = typeof col.sparkline === 'object' ? col.sparkline.type : undefined;
      content = <Sparkline values={value.map(Number)} type={sparkType} />;
    } else if (col.cellRenderer && node.data) {
      const Comp = col.cellRenderer as any;
      const params = {
        data: node.data,
        value,
        node,
        column: col,
        api,
        rowIndex,
        context,
      };
      content = typeof Comp === 'function' ? Comp(params) : null;
    } else if (node.group && (colIndex === 0 || col.colId === '__autoGroup__')) {
      const expanded = isGroupExpanded(node);
      const leafCount = countLeafDescendants(node);
      content = (
        <button
          type="button"
          className={`agx-group-contract${expanded ? ' agx-group-expanded' : ''}`}
          style={{ paddingLeft: node.level * 28 }}
          aria-expanded={expanded}
          onClick={(e) => {
            e.stopPropagation();
            toggleGroupExpanded(node);
          }}
        >
          <span className="agx-group-arrow" aria-hidden>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M4.2 2.4L8.4 6L4.2 9.6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="agx-group-value">{String(node.key ?? '')}</span>
          <span className="agx-group-count">({leafCount})</span>
        </button>
      );
    } else if (isRowSpanMerge) {
      content = null;
    } else {
      content = formatCellValue(value, node.data, col, node, api);
    }

    const cellClassStr =
      typeof col.cellClass === 'function'
        ? col.cellClass({ data: node.data as TData, value, node, column: col, api, context }) ?? ''
        : col.cellClass ?? '';
    const classRulesStr = resolveClassRules(col.cellClassRules as any, {
      data: node.data as TData,
      value,
      node,
      column: col,
      api,
      context,
    });

    const styleCell: CSSProperties =
      typeof col.cellStyle === 'function'
        ? col.cellStyle({ data: node.data as TData, value, node, column: col, api, context }) ?? {}
        : col.cellStyle ?? {};

    const pinnedLeft = col.pinned === 'left';
    const isFocused =
      !suppressCellFocus && keyboardNav.focused?.row === rowIndex && keyboardNav.focused?.col === colIndex;
    const isFillCorner =
      enableFillHandle &&
      !!activeRange &&
      rowIndex === activeRange.endRow &&
      colId === activeRange.endCol &&
      !node.footer &&
      !node.group;
    const isRangeHandleCorner =
      !isFillCorner &&
      enableRangeHandle &&
      !!activeRange &&
      rowIndex === activeRange.endRow &&
      colId === activeRange.endCol &&
      !node.footer &&
      !node.group;

    const noteText = cellNotes ? getNote(node.id, colId) : undefined;
    const hasNote = cellNotes && noteText != null;

    const tooltipText =
      !node.footer && !node.group ? getTooltipText(col, node.data, node, api) : undefined;

    const clearTooltipTimer = () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
        tooltipTimerRef.current = null;
      }
    };

    const isFlashing = flashingCells.has(`${node.id}:${colId}`);
    const isPendingBatchEdit = pendingEditKeys.has(`${node.id}:${colId}`);

    return (
      <div
        key={colId}
        className={`agx-cell ${inRange ? 'agx-cell-range' : ''} ${cellClassStr} ${classRulesStr} ${isFocused ? 'agx-cell-focused' : ''} ${pinnedLeft ? 'agx-pinned-left' : ''} ${isFlashing ? 'agx-cell-flash' : ''} ${isPendingBatchEdit ? 'agx-cell-pending-edit' : ''} ${isRowSpanMerge ? 'agx-row-span-hidden' : ''}`}
        style={{
          width,
          minWidth: width,
          maxWidth: width,
          ...(pinnedLeft ? { position: 'sticky' as const, left: pinnedLeftOffsets[colIndex] ?? 0, zIndex: 3 } : {}),
          ...styleCell,
        }}
        role="gridcell"
        tabIndex={suppressCellFocus ? -1 : 0}
        aria-colindex={colIndex + 1}
        title={enableBrowserTooltips ? tooltipText : undefined}
        onDoubleClick={() => {
          if (node.footer || node.group || suppressClickEdit || readOnlyEdit) return;
          if (editType === 'fullRow') {
            beginFullRowEdit(node);
            return;
          }
          if (editableHere && node.data) {
            setEditing({ rowId: node.id, colId });
            setEditValue(value);
          }
        }}
        onClick={() => {
          if (node.footer || node.group || suppressClickEdit || readOnlyEdit || !singleClickEdit) return;
          if (editType === 'fullRow') {
            beginFullRowEdit(node);
            return;
          }
          if (editableHere && node.data && !isEditing) {
            setEditing({ rowId: node.id, colId });
            setEditValue(value);
          }
        }}
        onMouseDown={(e) => {
          if (node.footer) return;
          keyboardNav.setFocused({ row: rowIndex, col: colIndex });
          if (!rangeSelectionEnabled) return;
          if (e.shiftKey) selection.extendRange(rowIndex, colId);
          else {
            selection.setAnchor({ row: rowIndex, colId });
            selection.setRange({
              startRow: rowIndex,
              endRow: rowIndex,
              startCol: colId,
              endCol: colId,
            });
          }
        }}
        onMouseEnter={(e) => {
          if (e.buttons === 1 && rangeSelectionEnabled) selection.extendRange(rowIndex, colId);
          if (tooltipText && !enableBrowserTooltips) {
            const x = e.clientX;
            const y = e.clientY;
            clearTooltipTimer();
            tooltipTimerRef.current = setTimeout(() => {
              setTooltip({ x: x + 12, y: y + 16, content: tooltipText });
            }, tooltipShowDelay);
          }
        }}
        onMouseLeave={() => {
          clearTooltipTimer();
          if (!tooltipInteraction) setTooltip(null);
        }}
        onBlur={() => {
          if (stopEditingWhenCellsLoseFocus && isEditing) commitEdit();
        }}
        onContextMenu={(e) => {
          if (node.footer) return;
          e.stopPropagation();
          openContextMenu(e, node, colId);
        }}
      >
        {col.rowDrag && !node.footer && !node.group && (
          <span
            className="agx-row-drag"
            draggable
            title="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.effectAllowed = 'move';
              setDragRowId(node.id);
            }}
            onDragEnd={() => setDragRowId(null)}
          >
            ⠿
          </span>
        )}
        {col.checkboxSelection && (
          <input
            type="checkbox"
            checked={selection.selectedIds.has(node.id)}
            onChange={() => selection.toggleRow(node.id, true)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {content}
        {hasNote && <span className="agx-note-dot" title={noteText} />}
        {isFillCorner && (
          <div
            className="agx-fill-handle"
            onMouseDown={(e) => startFillDrag(e, activeRange!)}
          />
        )}
        {isRangeHandleCorner && (
          <div
            className="agx-range-handle"
            onMouseDown={(e) => startRangeHandleDrag(e, activeRange!)}
          />
        )}
      </div>
    );
  };

  const renderSpannableRow = (
    list: Array<{ col: ColumnDef<any>; idx: number; width: number }>,
    node: RowNode<TData>,
    rowIndex: number,
    prevNode?: RowNode<TData>
  ): ReactNode[] => {
    const out: ReactNode[] = [];
    let i = 0;
    while (i < list.length) {
      const { col, idx, width } = list[i];
      let span = 1;
      if (typeof col.colSpan === 'function' && node.data) {
        const value = getCellValue(node.data, col, node, apiRef.current);
        span = computeColSpan(col, { data: node.data as TData, value, node, column: col, api: apiRef.current, context });
      }
      if (span > 1) {
        let mergedWidth = width;
        let consumed = 1;
        while (consumed < span && i + consumed < list.length) {
          mergedWidth += list[i + consumed].width;
          consumed++;
        }
        out.push(renderCell(node, col, idx, rowIndex, mergedWidth, undefined, prevNode));
        i += consumed;
      } else {
        out.push(renderCell(node, col, idx, rowIndex, width, undefined, prevNode));
        i += 1;
      }
    }
    return out;
  };

  const renderRowColumns = (node: RowNode<TData>, rowIndex: number, prevNode?: RowNode<TData>) => (
    <>
      {renderSpannableRow(columnPartitions.left, node, rowIndex, prevNode)}
      {centerLeadSpacer > 0 && (
        <div className="agx-col-spacer" style={{ width: centerLeadSpacer, minWidth: centerLeadSpacer }} />
      )}
      {renderSpannableRow(visibleCenterCols, node, rowIndex, prevNode)}
      {centerTrailSpacer > 0 && (
        <div className="agx-col-spacer" style={{ width: centerTrailSpacer, minWidth: centerTrailSpacer }} />
      )}
      {renderSpannableRow(columnPartitions.right, node, rowIndex, prevNode)}
    </>
  );

  const renderGroupRowsCell = (node: RowNode<TData>) => {
    const expanded = isGroupExpanded(node);
    const leafCount = countLeafDescendants(node);
    const fieldLabel =
      (node.field &&
        (columnDefs.find((c) => c.field === node.field)?.headerName ||
          autoGroupColumnDef?.headerName ||
          node.field)) ||
      '';
    return (
      <button
        type="button"
        className={`agx-group-row-full${expanded ? ' agx-group-expanded' : ''}`}
        style={{
          width: gridTotalWidth,
          minWidth: gridTotalWidth,
          paddingLeft: 12 + node.level * 28,
        }}
        aria-expanded={expanded}
        onClick={(e) => {
          e.stopPropagation();
          toggleGroupExpanded(node);
        }}
      >
        <span className="agx-group-arrow" aria-hidden>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M4.2 2.4L8.4 6L4.2 9.6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {fieldLabel ? <span className="agx-group-field">{fieldLabel}</span> : null}
        <span className="agx-group-value">{String(node.key ?? '')}</span>
        <span className="agx-group-count">({leafCount})</span>
        {node.aggData && Object.keys(node.aggData).length > 0 ? (
          <span className="agx-group-aggs">
            {Object.entries(node.aggData)
              .slice(0, 3)
              .map(([k, v]) => (
                <span key={k} className="agx-group-agg">
                  <em>{k}</em> {typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(v ?? '')}
                </span>
              ))}
          </span>
        ) : null}
      </button>
    );
  };

  const renderPinnedRow = (node: RowNode<TData>, position: 'top' | 'bottom', rowIndex: number) => (
    <div
      key={String(node.id)}
      className={`agx-row agx-pinned-row agx-pinned-row-${position}`}
      style={{ height: rowHeight, minWidth: gridTotalWidth }}
      role="row"
      aria-rowindex={position === 'top' ? rowIndex + 1 : totalRows + rowIndex + 1}
    >
      {columnPartitions.left.map(({ col, idx, width }) => {
        const colId = resolveColId(col, idx);
        const value = getCellValue(node.data, col, node, api);
        const pinnedLeft = col.pinned === 'left';
        return (
          <div
            key={colId}
            className="agx-cell agx-pinned-left"
            style={{
              width,
              minWidth: width,
              maxWidth: width,
              ...(pinnedLeft ? { position: 'sticky' as const, left: pinnedLeftOffsets[idx] ?? 0, zIndex: 3 } : {}),
            }}
            role="gridcell"
          >
            {formatCellValue(value, node.data, col, node, api)}
          </div>
        );
      })}
      {centerLeadSpacer > 0 && (
        <div className="agx-col-spacer" style={{ width: centerLeadSpacer, minWidth: centerLeadSpacer }} />
      )}
      {visibleCenterCols.map(({ col, idx, width }) => {
        const colId = resolveColId(col, idx);
        const value = getCellValue(node.data, col, node, api);
        return (
          <div key={colId} className="agx-cell" style={{ width, minWidth: width, maxWidth: width }} role="gridcell">
            {formatCellValue(value, node.data, col, node, api)}
          </div>
        );
      })}
      {centerTrailSpacer > 0 && (
        <div className="agx-col-spacer" style={{ width: centerTrailSpacer, minWidth: centerTrailSpacer }} />
      )}
      {columnPartitions.right.map(({ col, idx, width }) => {
        const colId = resolveColId(col, idx);
        const value = getCellValue(node.data, col, node, api);
        return (
          <div key={colId} className="agx-cell" style={{ width, minWidth: width, maxWidth: width }} role="gridcell">
            {formatCellValue(value, node.data, col, node, api)}
          </div>
        );
      })}
    </div>
  );

  const renderHeaderColumns = () => (
    <>
      {columnPartitions.left.map(({ col, idx, width }) => renderHeaderCell(col, idx, width))}
      {centerLeadSpacer > 0 && (
        <div className="agx-col-spacer agx-header-spacer" style={{ width: centerLeadSpacer, minWidth: centerLeadSpacer }} />
      )}
      {visibleCenterCols.map(({ col, idx, width }) => renderHeaderCell(col, idx, width))}
      {centerTrailSpacer > 0 && (
        <div className="agx-col-spacer agx-header-spacer" style={{ width: centerTrailSpacer, minWidth: centerTrailSpacer }} />
      )}
      {columnPartitions.right.map(({ col, idx, width }) => renderHeaderCell(col, idx, width))}
    </>
  );

  const columnMenuColumn = columnMenu
    ? displayColumns.find((c, i) => resolveColId(c, i) === columnMenu.colId)
    : undefined;

  const renderInPopupParent = (node: ReactNode): ReactNode =>
    popupParent ? createPortal(node, popupParent) : node;

  const themeClassName = typeof theme === 'string' ? `agx-theme-${theme}` : 'agx-theme-custom';
  const themeStyle: CSSProperties = useMemo(() => {
    if (typeof theme === 'string') {
      return themeToCssVars(resolveBaseTheme(theme)) as CSSProperties;
    }
    if (!theme || typeof theme !== 'object') return {};
    if (isThemeParamsLike(theme)) {
      const baseName =
        typeof (theme as { base?: string }).base === 'string'
          ? (theme as { base: string }).base
          : 'db-light';
      const { base: _base, ...overrides } = theme as Partial<ThemeParams> & { base?: string };
      const merged = themeWithParams(resolveBaseTheme(baseName), overrides);
      return themeToCssVars(merged) as CSSProperties;
    }
    return theme as CSSProperties;
  }, [theme]);
  const iconStyle: CSSProperties = useMemo(() => {
    if (!icons) return {};
    const vars: Record<string, string> = {};
    Object.entries(icons).forEach(([k, v]) => {
      vars[`--agx-icon-${k}`] = `"${v}"`;
    });
    return vars as CSSProperties;
  }, [icons]);
  const rootStyle: CSSProperties = { ...themeStyle, ...iconStyle, ...style };

  const focusedFormulaCell = enableFormulaBar && keyboardNav.focused
    ? { node: pagedNodes[keyboardNav.focused.row], col: displayColumns[keyboardNav.focused.col] }
    : null;

  return (
    <div
      ref={rootRef}
      className={`agx-root ${themeClassName} ${className ?? ''} ${animateRows ? 'agx-animate' : ''} ${enableRtl ? 'agx-rtl' : ''} ${!enableCellTextSelection ? 'agx-no-cell-text-select' : ''} ${isPrintLayout ? 'agx-print' : ''} ${ensureDomOrder ? 'agx-ensure-dom-order' : ''} ${suppressRowHoverHighlight ? 'agx-no-hover' : ''}`}
      style={rootStyle}
      dir={enableRtl ? 'rtl' : undefined}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="grid"
      aria-rowcount={totalRows}
      aria-colcount={displayColumns.length}
      aria-multiselectable={selectionMode === 'multiple'}
    >
      {license.watermark && (
        <div className="agx-watermark" title={license.message}>
          db-grid Enterprise — {license.message || 'Invalid / missing license'}
        </div>
      )}

      {quickAccessToolbar && (
        <div className="agx-qat">
          {qatItems.includes('csv') && (
            <button type="button" onClick={() => api.exportDataAsCsv()}>
              {translate('csvExportLabel', 'CSV')}
            </button>
          )}
          {qatItems.includes('excel') && (
            <button type="button" onClick={() => void api.exportDataAsExcel()} disabled={!ent('excelExport')}>
              {translate('excelExportLabel', 'Excel')}
            </button>
          )}
          {qatItems.includes('expandAll') && (
            <button type="button" onClick={() => api.expandAll()}>
              {translate('expandAllLabel', 'Expand All')}
            </button>
          )}
          {qatItems.includes('collapseAll') && (
            <button type="button" onClick={() => api.collapseAll()}>
              {translate('collapseAllLabel', 'Collapse All')}
            </button>
          )}
        </div>
      )}

      <div className="agx-toolbar">
        <input
          className="agx-quick-filter"
          placeholder={translate('quickFilterPlaceholder', 'Quick filter…')}
          value={pipeline.quickFilter}
          onChange={(e) => pipeline.setQuickFilter(e.target.value)}
        />
        {ent('find') && (
          <input
            className="agx-find"
            placeholder={translate('findPlaceholder', 'Find…')}
            value={findQuery}
            onChange={(e) => {
              setFindQuery(e.target.value);
              setFindIndex(0);
            }}
          />
        )}
        <label className="agx-toggle">
          <input
            type="checkbox"
            checked={pivotMode}
            disabled={!ent('pivoting')}
            onChange={(e) => setPivotMode(e.target.checked)}
          />
          {translate('pivotLabel', 'Pivot')}
        </label>
        <button type="button" onClick={() => api.exportDataAsCsv()}>
          {translate('csvExportLabel', 'CSV')}
        </button>
        <button type="button" onClick={() => void api.exportDataAsExcel()} disabled={!ent('excelExport')}>
          {translate('excelExportLabel', 'Excel')}
        </button>
        {sideBar && (
          <div className="agx-side-tabs">
            <button
              type="button"
              className={sidePanel === 'columns' ? 'active' : ''}
              onClick={() => setSidePanel(sidePanel === 'columns' ? null : 'columns')}
            >
              {translate('columnsLabel', 'Columns')}
            </button>
            <button
              type="button"
              className={sidePanel === 'filters' ? 'active' : ''}
              onClick={() => setSidePanel(sidePanel === 'filters' ? null : 'filters')}
            >
              {translate('filtersLabel', 'Filters')}
            </button>
          </div>
        )}
      </div>

      {enableFormulaBar && (
        <div className="agx-formula-bar">
          <span className="agx-formula-bar-label">
            {focusedFormulaCell?.col ? resolveColId(focusedFormulaCell.col, keyboardNav.focused!.col) : ''}
          </span>
          <span className="agx-formula-bar-value">
            {focusedFormulaCell?.node && focusedFormulaCell?.col
              ? focusedFormulaCell.col.formula ??
                String(
                  getCellValue(focusedFormulaCell.node.data, focusedFormulaCell.col, focusedFormulaCell.node, apiRef.current) ?? ''
                )
              : ''}
          </span>
        </div>
      )}

      <div className="agx-main">
        <div className="agx-grid-body" ref={bodyRef}>
          <div className="agx-header" style={{ height: headerHeight, minWidth: gridTotalWidth }} role="row">
            {renderHeaderColumns()}
          </div>
          {showFloatingFilter && (
            <FloatingFilterRow
              columns={displayColumns}
              widths={colWidths}
              filterModel={pipeline.filterModel}
              onChangeFilter={applyFilterPatch}
              resolveColId={resolveColId}
              getFilterValues={(colId) => filterValuesByCol.get(colId) ?? []}
              height={floatingFiltersHeight}
            />
          )}
          {pinnedTopNodes.length > 0 && (
            <div className="agx-pinned-top" style={{ minWidth: gridTotalWidth }}>
              {pinnedTopNodes.map((node, i) => renderPinnedRow(node, 'top', i))}
            </div>
          )}
          <div
            className={`agx-viewport ${alwaysShowVerticalScroll ? 'agx-scroll-always' : ''}`}
            ref={viewportRef}
            onScroll={onViewportScroll}
            style={{
              height: `calc(100% - ${headerHeight + extraHeaderHeight + pinnedTopNodes.length * rowHeight + pinnedBottomNodes.length * rowHeight}px)`,
            }}
            onDragOver={(e) => {
              if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
            }}
            onDrop={(e) => {
              const file = e.dataTransfer?.files?.[0];
              if (!file) return;
              e.preventDefault();
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') api.importDataAsCsv(reader.result);
              };
              reader.readAsText(file);
            }}
          >
            {loading && (
              <div className="agx-overlay">
                {props.overlayLoadingTemplate ?? translate('loadingOoo', 'Loading…')}
              </div>
            )}
            {!loading && pagedNodes.length === 0 && rowModelType !== 'infinite' && (
              <div className="agx-overlay">
                {props.overlayNoRowsTemplate ?? translate('noRowsToShow', 'No Rows To Show')}
              </div>
            )}
            <div className="agx-spacer" style={{ height: totalHeight, minWidth: gridTotalWidth }}>
              <div className="agx-rows" style={{ transform: `translateY(${offsetY}px)` }}>
                {slice.map((node, i) => {
                  const rowIndex = startIndex + i;
                  if ((!node.data && String(node.id).startsWith('__infinite_placeholder_')) || node.loading) {
                    return (
                      <div
                        key={String(node.id)}
                        className="agx-row agx-row-loading"
                        style={{ height: rowHeight, minWidth: gridTotalWidth }}
                        role="row"
                        data-row-index={rowIndex}
                      >
                        <div className="agx-cell agx-loading-cell">{translate('loadingOoo', 'Loading…')}</div>
                      </div>
                    );
                  }
                  const selected = selection.selectedIds.has(node.id);
                  const matchFind =
                    findQuery &&
                    node.data &&
                    JSON.stringify(node.data).toLowerCase().includes(findQuery.toLowerCase());
                  const rowClassRuleStr = node.data
                    ? resolveClassRules(rowClassRules as any, { data: node.data, node })
                    : '';
                  const rowClassCustom = node.data ? getRowClass?.({ data: node.data, node }) ?? '' : '';
                  const rowStyleCustom = node.data ? getRowStyle?.({ data: node.data, node }) ?? {} : {};
                  const prevNode = i > 0 ? slice[i - 1] : undefined;
                  const isFullWidth = !!isFullWidthRow?.({ rowNode: node }) && !!fullWidthCellRenderer;
                  const useGroupRows =
                    !!node.group &&
                    !node.footer &&
                    !treeData &&
                    groupDisplayType === 'groupRows' &&
                    groupCols.length > 0;
                  return (
                    <div key={String(node.id)}>
                      <div
                        className={`agx-row ${selected ? 'agx-row-selected' : ''} ${node.group ? 'agx-row-group' : ''} ${useGroupRows ? 'agx-row-group-full' : ''} ${node.footer ? 'agx-row-footer' : ''} ${matchFind ? 'agx-row-find' : ''} ${dragRowId === node.id ? 'agx-row-dragging' : ''} ${rowClassCustom} ${rowClassRuleStr}`}
                        style={{ height: rowHeight, minWidth: gridTotalWidth, ...rowStyleCustom }}
                        role="row"
                        data-row-index={rowIndex}
                        aria-rowindex={rowIndex + 1 + pinnedTopNodes.length}
                        aria-selected={selected}
                        aria-expanded={node.group ? isGroupExpanded(node) : undefined}
                        onClick={(e) => {
                          if (node.footer) return;
                          if (useGroupRows) {
                            toggleGroupExpanded(node);
                            return;
                          }
                          if (rowSelection) {
                            selection.toggleRow(node.id, rowMultiSelectWithClick || e.ctrlKey || e.metaKey);
                          }
                        }}
                        onContextMenu={(e) => openContextMenu(e, node)}
                        onTouchStart={(e) => {
                          const t = e.touches[0];
                          if (!t) return;
                          touchStartPosRef.current = { x: t.clientX, y: t.clientY };
                          if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
                          touchTimerRef.current = setTimeout(() => {
                            openContextMenu(
                              {
                                preventDefault: () => {},
                                stopPropagation: () => {},
                                clientX: t.clientX,
                                clientY: t.clientY,
                              } as unknown as MouseEvent,
                              node
                            );
                          }, 500);
                        }}
                        onTouchMove={(e) => {
                          const t = e.touches[0];
                          const start = touchStartPosRef.current;
                          if (start && t && (Math.abs(t.clientX - start.x) > 10 || Math.abs(t.clientY - start.y) > 10)) {
                            if (touchTimerRef.current) {
                              clearTimeout(touchTimerRef.current);
                              touchTimerRef.current = null;
                            }
                          }
                        }}
                        onTouchEnd={() => {
                          if (touchTimerRef.current) {
                            clearTimeout(touchTimerRef.current);
                            touchTimerRef.current = null;
                          }
                        }}
                        onTouchCancel={() => {
                          if (touchTimerRef.current) {
                            clearTimeout(touchTimerRef.current);
                            touchTimerRef.current = null;
                          }
                        }}
                        onDragOver={(e) => {
                          if (dragRowId == null) return;
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          if (dragRowId == null) return;
                          e.preventDefault();
                          const targetId = node.id;
                          if (rowDragManaged && targetId !== dragRowId) {
                            setRowData((prev) => {
                              const fromIdx = prev.findIndex((d, i) => getRowId(d, i) === dragRowId);
                              const toIdx = prev.findIndex((d, i) => getRowId(d, i) === targetId);
                              if (fromIdx < 0 || toIdx < 0) return prev;
                              return reorderRows(prev, fromIdx, toIdx);
                            });
                          }
                          setDragRowId(null);
                        }}
                      >
                        {isFullWidth ? (
                          <div className="agx-full-width" style={{ width: gridTotalWidth }}>
                            {typeof fullWidthCellRenderer === 'function'
                              ? (fullWidthCellRenderer as any)({
                                  data: node.data,
                                  value: null,
                                  node,
                                  column: displayColumns[0],
                                  api,
                                  rowIndex,
                                  context,
                                })
                              : null}
                          </div>
                        ) : useGroupRows ? (
                          renderGroupRowsCell(node)
                        ) : (
                          renderRowColumns(node, rowIndex, prevNode)
                        )}
                      </div>
                      {masterDetail &&
                        ent('masterDetail') &&
                        detailOpen.has(node.id) &&
                        node.data &&
                        (!isRowMaster || isRowMaster(node.data)) && (
                          <div className="agx-detail">
                            {detailCellRenderer ? (
                              typeof detailCellRenderer === 'function' ? (
                                (detailCellRenderer as any)({
                                  data: node.data,
                                  value: null,
                                  node,
                                  column: displayColumns[0],
                                  api,
                                  rowIndex,
                                  context,
                                })
                              ) : null
                            ) : (
                              <DetailGrid
                                rowData={getDetailRows(node.data)}
                                columnDefs={getDetailColumnDefs(node.data)}
                              />
                            )}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {pinnedBottomNodes.length > 0 && (
            <div className="agx-pinned-bottom" style={{ minWidth: gridTotalWidth }}>
              {pinnedBottomNodes.map((node, i) => renderPinnedRow(node, 'bottom', i))}
            </div>
          )}
          {grandTotalNode && (
            <div className="agx-pinned-bottom agx-grand-total" style={{ minWidth: gridTotalWidth }}>
              <div className="agx-row agx-row-footer" style={{ height: rowHeight, minWidth: gridTotalWidth }} role="row">
                {renderRowColumns(grandTotalNode, -1)}
              </div>
            </div>
          )}
        </div>

        {sidePanel && ent('toolPanels') && (
          <aside className="agx-sidebar">
            {sidePanel === 'columns' && (
              <ColumnsToolPanel
                columns={columnDefs}
                onChange={setColumnDefs}
              />
            )}
            {sidePanel === 'filters' && (
              <FiltersToolPanel
                columns={columnDefs}
                filterModel={pipeline.filterModel}
                onChange={pipeline.setFilterModel}
              />
            )}
          </aside>
        )}
      </div>

      {statusBar && ent('statusBar') && (
        <StatusBar
          total={totalRows}
          selected={selection.selectedIds.size}
          filtered={pipeline.filterModel.length > 0 || !!pipeline.quickFilter}
          selectionStats={selectionStats}
          translate={translate}
        />
      )}

      {pagination && (
        <div className="agx-pagination">
          <button type="button" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
            {translate('previous', 'Prev')}
          </button>
          <span>
            {translate('page', 'Page')} {page + 1} {translate('of', 'of')} {pageCount}
          </span>
          <button
            type="button"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((p) => p + 1)}
          >
            {translate('next', 'Next')}
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
          >
            {paginationPageSizeSelector.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      )}

      {contextMenu &&
        renderInPopupParent(
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={contextMenu.items}
            onClose={() => setContextMenu(null)}
          />
        )}

      {columnMenu &&
        columnMenuColumn &&
        renderInPopupParent(
          <ColumnMenu
            x={columnMenu.x}
            y={columnMenu.y}
            colId={columnMenu.colId}
            column={columnMenuColumn}
            filterModelItem={pipeline.filterModel.find((f) => f.colId === columnMenu.colId)}
            filterValues={filterValuesByCol.get(columnMenu.colId) ?? []}
            onClose={() => setColumnMenu(null)}
            onSortAsc={() => pipeline.setSortModel([{ colId: columnMenu.colId, sort: 'asc' }])}
            onSortDesc={() => pipeline.setSortModel([{ colId: columnMenu.colId, sort: 'desc' }])}
            onPin={(side) =>
              setColumnDefs((cols) =>
                cols.map((c, i) => (resolveColId(c, i) === columnMenu.colId ? { ...c, pinned: side } : c))
              )
            }
            onHide={() =>
              setColumnDefs((cols) =>
                cols.map((c, i) => (resolveColId(c, i) === columnMenu.colId ? { ...c, hide: true } : c))
              )
            }
            onAutoSize={() =>
              setColumnDefs((cols) =>
                cols.map((c, i) =>
                  resolveColId(c, i) === columnMenu.colId
                    ? { ...c, width: Math.min(320, Math.max(100, String(c.headerName ?? c.field ?? '').length * 10 + 40)) }
                    : c
                )
              )
            }
            onFilterChange={(patch) => applyFilterPatch(columnMenu.colId, patch)}
          />
        )}

      {tooltip && renderInPopupParent(<Tooltip x={tooltip.x} y={tooltip.y} content={tooltip.content} />)}
    </div>
  );
}

export const DbGrid = forwardRef(DbGridInner) as <TData = any>(
  props: DbGridProps<TData> & { ref?: React.Ref<DbGridApi<TData>> }
) => React.ReactElement | null;

export default DbGrid;
