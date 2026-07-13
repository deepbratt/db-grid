export interface NumericRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export type ExpandDirection = 'up' | 'down' | 'left' | 'right';

/** Expand a numeric cell range by one step in the given direction, clamped to grid bounds. */
export function expandRange(
  range: NumericRange,
  direction: ExpandDirection,
  maxRow: number,
  colIds: string[]
): NumericRange {
  const maxCol = Math.max(0, colIds.length - 1);
  let { startRow, endRow, startCol, endCol } = range;

  switch (direction) {
    case 'up':
      startRow = Math.max(0, startRow - 1);
      break;
    case 'down':
      endRow = Math.min(maxRow, endRow + 1);
      break;
    case 'left':
      startCol = Math.max(0, startCol - 1);
      break;
    case 'right':
      endCol = Math.min(maxCol, endCol + 1);
      break;
  }

  return { startRow, endRow, startCol, endCol };
}
