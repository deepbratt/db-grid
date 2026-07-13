import { useMemo } from 'react';

const OVERSCAN = 2;

export interface ColumnVirtualizationResult {
  startCol: number;
  endCol: number;
  offsetX: number;
  totalWidth: number;
}

export function useColumnVirtualization(
  colWidths: number[],
  scrollLeft: number,
  viewportWidth: number
): ColumnVirtualizationResult {
  return useMemo(() => {
    const totalWidth = colWidths.reduce((sum, w) => sum + w, 0);
    if (colWidths.length === 0 || viewportWidth <= 0) {
      return { startCol: 0, endCol: 0, offsetX: 0, totalWidth };
    }

    let offsetX = 0;
    let startCol = 0;
    for (let i = 0; i < colWidths.length; i++) {
      if (offsetX + colWidths[i] > scrollLeft) {
        startCol = Math.max(0, i - OVERSCAN);
        break;
      }
      offsetX += colWidths[i];
      if (i === colWidths.length - 1) {
        startCol = colWidths.length;
      }
    }

    let x = colWidths.slice(0, startCol).reduce((a, b) => a + b, 0);
    offsetX = x;

    let endCol = startCol;
    let visible = 0;
    while (endCol < colWidths.length && visible < viewportWidth + OVERSCAN * 120) {
      visible += colWidths[endCol];
      endCol++;
    }
    endCol = Math.min(colWidths.length, endCol + OVERSCAN);

    return { startCol, endCol, offsetX, totalWidth };
  }, [colWidths, scrollLeft, viewportWidth]);
}
