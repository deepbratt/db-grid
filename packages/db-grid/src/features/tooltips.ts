import type { DbGridApi, CellValueParams, ColumnDef, RowNode } from '../types';

export function getTooltipText<TData = any>(
  col: ColumnDef<TData>,
  data: TData | null,
  node: RowNode<TData>,
  api: DbGridApi<TData>
): string | undefined {
  if (!col || data == null) return undefined;

  if (col.tooltipValueGetter) {
    const value =
      col.valueGetter && typeof col.valueGetter === 'function'
        ? col.valueGetter({ data, value: (data as any)[col.field as string], node, column: col, api })
        : col.field
          ? (data as any)[col.field]
          : undefined;
    const text = col.tooltipValueGetter({ data, value, node, column: col, api } as CellValueParams<TData>);
    return text != null && text !== '' ? String(text) : undefined;
  }

  if (col.tooltipField) {
    const text = (data as any)[col.tooltipField];
    return text != null && text !== '' ? String(text) : undefined;
  }

  return undefined;
}
