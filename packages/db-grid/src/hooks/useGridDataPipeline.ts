import { useMemo, useState, useCallback } from 'react';
import type { ColumnDef, FilterModelItem, SortModelItem } from '../types';
import { applyFilters, applySorts, getCellValue, resolveColId } from '../utils/dataOps';

export function useGridDataPipeline<T>(
  rowData: T[],
  columns: ColumnDef<T>[],
  getRowId: (data: T, index: number) => import('../types').RowId,
  apiRef: React.MutableRefObject<any>
) {
  const [sortModel, setSortModel] = useState<SortModelItem[]>([]);
  const [filterModel, setFilterModel] = useState<FilterModelItem[]>([]);
  const [quickFilter, setQuickFilter] = useState('');

  const getValueByColId = useCallback(
    (row: T, colId: string) => {
      const col = columns.find((c, i) => resolveColId(c, i) === colId);
      if (!col) return null;
      const node = {
        id: 0,
        data: row,
        level: 0,
        group: false,
        expanded: false,
        parent: null,
      };
      return getCellValue(row, col, node as any, apiRef.current);
    },
    [columns, apiRef]
  );

  const processed = useMemo(() => {
    let rows = applyFilters(rowData, filterModel, getValueByColId, quickFilter);
    rows = applySorts(rows, sortModel, columns, getValueByColId);
    return rows;
  }, [rowData, filterModel, sortModel, quickFilter, columns, getValueByColId]);

  const toggleSort = useCallback((colId: string, multi: boolean) => {
    setSortModel((prev) => {
      const existing = prev.find((s) => s.colId === colId);
      if (!multi) {
        if (!existing) return [{ colId, sort: 'asc' }];
        if (existing.sort === 'asc') return [{ colId, sort: 'desc' }];
        return [];
      }
      if (!existing) return [...prev, { colId, sort: 'asc' }];
      if (existing.sort === 'asc') {
        return prev.map((s) => (s.colId === colId ? { ...s, sort: 'desc' as const } : s));
      }
      return prev.filter((s) => s.colId !== colId);
    });
  }, []);

  return {
    processed,
    sortModel,
    setSortModel,
    filterModel,
    setFilterModel,
    quickFilter,
    setQuickFilter,
    toggleSort,
    getValueByColId,
    getRowId,
  };
}
