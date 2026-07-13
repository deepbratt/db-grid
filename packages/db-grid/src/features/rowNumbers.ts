import type { ColumnDef } from '../types';

export function createRowNumberColDef<TData = unknown>(): ColumnDef<TData> {
  return {
    colId: '__rowNum',
    headerName: '#',
    width: 56,
    minWidth: 48,
    maxWidth: 80,
    pinned: 'left',
    sortable: false,
    filter: false,
    editable: false,
    resizable: false,
    suppressMovable: true,
    lockPosition: 'left',
    cellRenderer: ({ rowIndex }) => String(rowIndex + 1),
    cellStyle: {
      textAlign: 'right',
      color: 'var(--agx-muted, #666)',
      fontVariantNumeric: 'tabular-nums',
    },
  };
}
