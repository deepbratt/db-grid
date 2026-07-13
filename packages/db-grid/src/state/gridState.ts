import type { FilterModelItem, SortModelItem } from '../types';

export interface ColumnStateItem {
  colId: string;
  width?: number;
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  sort?: 'asc' | 'desc' | null;
}

export type GridState = {
  filterModel: FilterModelItem[];
  sortModel: SortModelItem[];
  columnState: ColumnStateItem[];
  pivotMode?: boolean;
};

export function serializeGridState(state: GridState): string {
  return JSON.stringify({
    version: 1,
    filterModel: state.filterModel,
    sortModel: state.sortModel,
    columnState: state.columnState,
    pivotMode: state.pivotMode ?? false,
  });
}

export function parseGridState(raw: string | null | undefined): GridState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      filterModel: Array.isArray(parsed.filterModel) ? parsed.filterModel : [],
      sortModel: Array.isArray(parsed.sortModel) ? parsed.sortModel : [],
      columnState: Array.isArray(parsed.columnState) ? parsed.columnState : [],
      pivotMode: Boolean(parsed.pivotMode),
    };
  } catch {
    return null;
  }
}
