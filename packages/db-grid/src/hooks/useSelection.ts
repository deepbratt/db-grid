import { useCallback, useState } from 'react';
import type { GridRange, RowId } from '../types';

export function useSelection(mode: 'single' | 'multiple' | false) {
  const [selectedIds, setSelectedIds] = useState<Set<RowId>>(new Set());
  const [ranges, setRanges] = useState<GridRange[]>([]);
  const [anchor, setAnchor] = useState<{ row: number; colId: string } | null>(null);

  const toggleRow = useCallback(
    (id: RowId, additive: boolean) => {
      if (!mode) return;
      setSelectedIds((prev) => {
        const next = new Set(mode === 'multiple' && additive ? prev : []);
        if (prev.has(id) && additive) next.delete(id);
        else next.add(id);
        if (mode === 'single') {
          next.clear();
          next.add(id);
        }
        return next;
      });
    },
    [mode]
  );

  const selectAll = useCallback((ids: RowId[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => setSelectedIds(new Set()), []);

  const setRange = useCallback((range: GridRange | null) => {
    setRanges(range ? [range] : []);
  }, []);

  const extendRange = useCallback((row: number, colId: string) => {
    setAnchor((a) => {
      if (!a) {
        setRanges([{ startRow: row, endRow: row, startCol: colId, endCol: colId }]);
        return { row, colId };
      }
      setRanges([
        {
          startRow: Math.min(a.row, row),
          endRow: Math.max(a.row, row),
          startCol: a.colId,
          endCol: colId,
        },
      ]);
      return a;
    });
  }, []);

  return {
    selectedIds,
    ranges,
    toggleRow,
    selectAll,
    deselectAll,
    setRange,
    extendRange,
    setAnchor,
    setSelectedIds,
  };
}
