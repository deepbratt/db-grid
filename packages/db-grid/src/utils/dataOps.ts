import type { ColumnDef, FilterModelItem, RowId, RowNode, SortModelItem } from '../types';
import { getAggFunc } from '../aggregation/registry';

export function resolveColId<T>(col: ColumnDef<T>, index: number): string {
  return col.colId ?? col.field ?? `col_${index}`;
}

export function getCellValue<T>(
  data: T | null,
  col: ColumnDef<T>,
  node: RowNode<T>,
  api: any
): any {
  if (!data && !node.group) return null;
  if (node.group && node.aggData && col.field) {
    const agg = node.aggData[col.field];
    if (agg !== undefined) return agg;
  }
  if (col.valueGetter) {
    if (typeof col.valueGetter === 'string') {
      return evaluateFormula(col.valueGetter, (data as Record<string, any>) ?? {});
    }
    return col.valueGetter({
      data: data as T,
      value: col.field ? (data as any)?.[col.field] : undefined,
      node,
      column: col,
      api,
    });
  }
  if (col.formula && data) {
    return evaluateFormula(col.formula, data as Record<string, any>);
  }
  if (col.field && data) return (data as any)[col.field];
  return null;
}

/** Distinct values for set filters (sorted). Skips arrays/objects. */
export function collectUniqueColumnValues<T>(
  rows: T[],
  col: ColumnDef<T>
): Array<string | number | boolean> {
  const seen = new Set<string>();
  const out: Array<string | number | boolean> = [];
  for (const row of rows) {
    const raw = col.field ? (row as any)?.[col.field] : undefined;
    if (raw == null || raw === '') continue;
    if (typeof raw === 'object') continue;
    const key = String(raw);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(raw as string | number | boolean);
  }
  out.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  return out;
}

export function formatCellValue<T>(
  value: any,
  data: T | null,
  col: ColumnDef<T>,
  node: RowNode<T>,
  api: any
): string {
  if (col.valueFormatter) {
    return col.valueFormatter({ data: data as T, value, node, column: col, api });
  }
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}

function expandFormulaFunctions(expr: string): string {
  let prev = '';
  let guard = 0;
  while (expr !== prev && guard++ < 32) {
    prev = expr;
    expr = expr.replace(/SUM\(([^()]*(?:\([^()]*\)[^()]*)*)\)/gi, (_, args: string) => {
      const parts = args.split(',').map((s: string) => Number(s.trim()) || 0);
      return String(parts.reduce((a, b) => a + b, 0));
    });
    expr = expr.replace(/AVG\(([^()]*(?:\([^()]*\)[^()]*)*)\)/gi, (_, args: string) => {
      const parts = args.split(',').map((s: string) => Number(s.trim()) || 0);
      return String(parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0);
    });
    expr = expr.replace(/IF\(([^,]+),\s*([^,]+),\s*([^)]+)\)/gi, (_, cond, t, f) => {
      return `((${cond.trim()}) ? (${t.trim()}) : (${f.trim()}))`;
    });
    expr = expr.replace(/ROUND\(([^,]+),\s*([^)]+)\)/gi, (_, v, d) => {
      return `(Math.round((${v.trim()}) * Math.pow(10, ${d.trim()})) / Math.pow(10, ${d.trim()}))`;
    });
    expr = expr.replace(/ABS\(([^)]+)\)/gi, (_, v) => `Math.abs(${v.trim()})`);
    expr = expr.replace(/MIN\(([^)]+)\)/gi, (_, args) => `Math.min(${args.trim()})`);
    expr = expr.replace(/MAX\(([^)]+)\)/gi, (_, args) => `Math.max(${args.trim()})`);
  }
  return expr;
}

/** Lightweight Excel-like formula evaluator: =[field]+[field]*2, SUM(), AVG(), IF(), ROUND(), ABS(), MIN(), MAX() */
export function evaluateFormula(formula: string, row: Record<string, any>): any {
  let expr = formula.trim();
  if (expr.startsWith('=')) expr = expr.slice(1);

  expr = expr.replace(/\[([^\]]+)\]/g, (_, field: string) => {
    const v = row[field];
    return typeof v === 'number' ? String(v) : JSON.stringify(v ?? 0);
  });

  expr = expandFormulaFunctions(expr);

  if (/[a-zA-Z_$]/.test(expr.replace(/Math\.\w+/g, ''))) return expr;
  try {
    // eslint-disable-next-line no-new-func
    return Function('Math', `"use strict"; return (${expr});`)(Math);
  } catch {
    return null;
  }
}

export function compareValues(a: any, b: any, dir: 'asc' | 'desc'): number {
  const mul = dir === 'asc' ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return 1 * mul;
  if (b == null) return -1 * mul;
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * mul;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }) * mul;
}

export function applySorts<T>(
  rows: T[],
  sortModel: SortModelItem[],
  columns: ColumnDef<T>[],
  getValue: (row: T, colId: string) => any
): T[] {
  if (!sortModel.length) return rows;
  return [...rows].sort((ra, rb) => {
    for (const s of sortModel) {
      const cmp = compareValues(getValue(ra, s.colId), getValue(rb, s.colId), s.sort);
      if (cmp !== 0) return cmp;
    }
    return 0;
  });
}

export function matchesFilter(value: any, filter: FilterModelItem): boolean {
  const op = filter.operator ?? 'contains';
  if (op === 'blank') return value == null || value === '';
  if (op === 'notBlank') return value != null && value !== '';

  if (filter.type === 'set' && filter.values) {
    return filter.values.map(String).includes(String(value));
  }

  const sv = value == null ? '' : String(value).toLowerCase();
  const fv = filter.filter == null ? '' : String(filter.filter).toLowerCase();

  switch (op) {
    case 'contains':
      return sv.includes(fv);
    case 'notContains':
      return !sv.includes(fv);
    case 'equals':
      return filter.type === 'number'
        ? Number(value) === Number(filter.filter)
        : sv === fv;
    case 'notEqual':
      return filter.type === 'number'
        ? Number(value) !== Number(filter.filter)
        : sv !== fv;
    case 'startsWith':
      return sv.startsWith(fv);
    case 'endsWith':
      return sv.endsWith(fv);
    case 'greaterThan':
      return Number(value) > Number(filter.filter);
    case 'lessThan':
      return Number(value) < Number(filter.filter);
    case 'greaterThanOrEqual':
      return Number(value) >= Number(filter.filter);
    case 'lessThanOrEqual':
      return Number(value) <= Number(filter.filter);
    case 'inRange':
      return (
        Number(value) >= Number(filter.filter) && Number(value) <= Number(filter.filterTo)
      );
    default:
      return true;
  }
}

export function applyFilters<T>(
  rows: T[],
  filterModel: FilterModelItem[],
  getValue: (row: T, colId: string) => any,
  quickFilter?: string
): T[] {
  let result = rows;
  if (filterModel.length) {
    result = result.filter((row) =>
      filterModel.every((f) => matchesFilter(getValue(row, f.colId), f))
    );
  }
  if (quickFilter?.trim()) {
    const q = quickFilter.trim().toLowerCase();
    result = result.filter((row) =>
      Object.values(row as object).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }
  return result;
}

export function aggregate(values: any[], func: string): any {
  const nums = values.filter((v) => v != null && !Number.isNaN(Number(v))).map(Number);
  switch (func) {
    case 'sum':
      return nums.reduce((a, b) => a + b, 0);
    case 'avg':
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    case 'min':
      return nums.length ? Math.min(...nums) : null;
    case 'max':
      return nums.length ? Math.max(...nums) : null;
    case 'count':
      return values.filter((v) => v != null && v !== '').length;
    case 'first':
      return values[0] ?? null;
    case 'last':
      return values[values.length - 1] ?? null;
    default: {
      const custom = getAggFunc(func);
      return custom ? custom(values) : null;
    }
  }
}

export function buildGroupTree<T>(
  rows: T[],
  groupCols: ColumnDef<T>[],
  valueCols: ColumnDef<T>[],
  getRowId: (data: T, index: number) => RowId,
  getValue: (row: T, col: ColumnDef<T>) => any,
  level = 0,
  parent: RowNode<T> | null = null
): RowNode<T>[] {
  if (!groupCols.length || level >= groupCols.length) {
    return rows.map((data, i) => ({
      id: getRowId(data, i),
      data,
      level,
      group: false,
      expanded: false,
      parent,
      leaf: true,
    }));
  }

  const col = groupCols[level];
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const key = String(getValue(row, col) ?? '(blank)');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }

  const nodes: RowNode<T>[] = [];
  for (const [key, children] of map) {
    const node: RowNode<T> = {
      id: `group-${level}-${key}-${parent?.id ?? 'root'}`,
      data: null,
      level,
      group: true,
      expanded: false,
      parent,
      key,
      field: col.field,
      leaf: false,
      childrenAfterGroup: [],
      aggData: {},
    };
    node.childrenAfterGroup = buildGroupTree(
      children,
      groupCols,
      valueCols,
      getRowId,
      getValue,
      level + 1,
      node
    );
    for (const vc of valueCols) {
      if (!vc.aggFunc || !vc.field) continue;
      const leafValues: any[] = [];
      const walk = (n: RowNode<T>) => {
        if (n.leaf && n.data) leafValues.push(getValue(n.data, vc));
        n.childrenAfterGroup?.forEach(walk);
      };
      walk(node);
      node.aggData![vc.field] = aggregate(leafValues, vc.aggFunc);
    }
    nodes.push(node);
  }
  return nodes;
}

/** Leaf rows under a group (excludes nested group/footer nodes). */
export function countLeafDescendants<T>(node: RowNode<T>): number {
  if (!node.childrenAfterGroup?.length) return node.leaf ? 1 : 0;
  let total = 0;
  for (const child of node.childrenAfterGroup) {
    if (child.footer) continue;
    if (child.group) total += countLeafDescendants(child);
    else total += 1;
  }
  return total;
}

export function flattenVisibleNodes<T>(
  nodes: RowNode<T>[],
  expandedIds: Set<RowId>
): RowNode<T>[] {
  const out: RowNode<T>[] = [];
  const walk = (list: RowNode<T>[]) => {
    for (const n of list) {
      out.push(n);
      if (n.group && n.childrenAfterGroup && expandedIds.has(n.id)) {
        walk(n.childrenAfterGroup);
      }
    }
  };
  walk(nodes);
  return out;
}

export function buildTreeDataNodes<T>(
  rows: T[],
  getDataPath: (data: T) => string[],
  getRowId: (data: T, index: number) => RowId
): RowNode<T>[] {
  type TreeAcc = {
    children: Map<string, TreeAcc>;
    data?: T;
    path: string[];
  };
  const root: TreeAcc = { children: new Map(), path: [] };

  rows.forEach((data, index) => {
    const path = getDataPath(data);
    let cur = root;
    path.forEach((seg, i) => {
      if (!cur.children.has(seg)) {
        cur.children.set(seg, { children: new Map(), path: path.slice(0, i + 1) });
      }
      cur = cur.children.get(seg)!;
      if (i === path.length - 1) cur.data = data;
    });
  });

  const toNodes = (acc: TreeAcc, level: number, parent: RowNode<T> | null): RowNode<T>[] => {
    const nodes: RowNode<T>[] = [];
    for (const [key, child] of acc.children) {
      const hasKids = child.children.size > 0;
      const node: RowNode<T> = {
        id: child.data ? getRowId(child.data, 0) : `tree-${child.path.join('/')}`,
        data: child.data ?? null,
        level,
        group: hasKids,
        expanded: false,
        parent,
        key,
        leaf: !hasKids,
        childrenAfterGroup: [],
      };
      node.childrenAfterGroup = toNodes(child, level + 1, node);
      nodes.push(node);
    }
    return nodes;
  };

  return toNodes(root, 0, null);
}

export function pivotData<T>(
  rows: T[],
  rowGroupFields: string[],
  pivotField: string,
  valueField: string,
  aggFunc: string,
  getVal: (row: T, field: string) => any
): { columns: string[]; rows: Record<string, any>[] } {
  const pivotKeys = [...new Set(rows.map((r) => String(getVal(r, pivotField) ?? '')))].sort();
  const groupMap = new Map<string, Record<string, any>>();

  for (const row of rows) {
    const gKey = rowGroupFields.map((f) => String(getVal(row, f) ?? '')).join('||') || '__all__';
    if (!groupMap.has(gKey)) {
      const base: Record<string, any> = {};
      rowGroupFields.forEach((f, i) => {
        base[f] = getVal(row, f);
        base[`__g${i}`] = getVal(row, f);
      });
      pivotKeys.forEach((pk) => {
        base[pk] = [];
      });
      groupMap.set(gKey, base);
    }
    const bucket = groupMap.get(gKey)!;
    const pk = String(getVal(row, pivotField) ?? '');
    bucket[pk].push(getVal(row, valueField));
  }

  const outRows = [...groupMap.values()].map((b) => {
    const row = { ...b };
    for (const pk of pivotKeys) {
      row[pk] = aggregate(b[pk] as any[], aggFunc);
    }
    return row;
  });

  return { columns: [...rowGroupFields, ...pivotKeys], rows: outRows };
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let t: ReturnType<typeof setTimeout> | undefined;
  return ((...args: any[]) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  }) as T;
}
