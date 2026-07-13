export interface SelectionStats {
  sum?: number;
  avg?: number;
  min?: number;
  max?: number;
  count?: number;
}

interface Props {
  total: number;
  selected: number;
  filtered: boolean;
  selectionStats?: SelectionStats;
  translate?: (key: string, fallback?: string) => string;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function StatusBar({ total, selected, filtered, selectionStats, translate }: Props) {
  const t = translate ?? ((_: string, fallback?: string) => fallback ?? '');
  return (
    <div className="agx-status-bar" role="status">
      <span>{t('rowsLabel', 'Rows')}: {total.toLocaleString()}</span>
      <span>{t('selectedLabel', 'Selected')}: {selected}</span>
      <span>{filtered ? t('filteredLabel', 'Filtered') : t('allDataLabel', 'All data')}</span>
      {selectionStats?.count != null && <span>Count: {fmt(selectionStats.count)}</span>}
      {selectionStats?.sum != null && <span>Sum: {fmt(selectionStats.sum)}</span>}
      {selectionStats?.avg != null && <span>Avg: {fmt(selectionStats.avg)}</span>}
      {selectionStats?.min != null && <span>Min: {fmt(selectionStats.min)}</span>}
      {selectionStats?.max != null && <span>Max: {fmt(selectionStats.max)}</span>}
      <span className="agx-status-brand">db-grid</span>
    </div>
  );
}
