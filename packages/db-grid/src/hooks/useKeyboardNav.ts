import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';

export interface KeyboardNavFocused {
  row: number;
  col: number;
}

export interface UseKeyboardNavOptions {
  rowCount: number;
  colCount: number;
  onEdit: (focused: KeyboardNavFocused) => void;
  onCommit: (focused: KeyboardNavFocused) => void;
  enabled: boolean;
}

export function useKeyboardNav({
  rowCount,
  colCount,
  onEdit,
  onCommit,
  enabled,
}: UseKeyboardNavOptions) {
  const [focused, setFocusedState] = useState<KeyboardNavFocused | null>(null);
  const focusedRef = useRef(focused);
  focusedRef.current = focused;

  const onEditRef = useRef(onEdit);
  const onCommitRef = useRef(onCommit);
  onEditRef.current = onEdit;
  onCommitRef.current = onCommit;

  const clamp = useCallback(
    (row: number, col: number): KeyboardNavFocused => ({
      row: Math.max(0, Math.min(Math.max(rowCount - 1, 0), row)),
      col: Math.max(0, Math.min(Math.max(colCount - 1, 0), col)),
    }),
    [rowCount, colCount]
  );

  const setFocused = useCallback(
    (next: KeyboardNavFocused | null) => {
      if (next && (rowCount === 0 || colCount === 0)) return;
      setFocusedState((cur) => {
        if (!next) return cur === null ? cur : null;
        const clamped = clamp(next.row, next.col);
        if (cur && cur.row === clamped.row && cur.col === clamped.col) return cur;
        return clamped;
      });
    },
    [clamp, rowCount, colCount]
  );

  // Re-clamp when grid size changes — never depend on `focused` or this loops
  // (clamp() always returns a new object reference).
  useEffect(() => {
    setFocusedState((cur) => {
      if (!cur) return cur;
      if (rowCount === 0 || colCount === 0) return null;
      const next = clamp(cur.row, cur.col);
      if (next.row === cur.row && next.col === cur.col) return cur;
      return next;
    });
  }, [rowCount, colCount, clamp]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || colCount === 0 || rowCount === 0) return;

      let cur = focusedRef.current;
      if (!cur) {
        if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', 'F2'].includes(e.key)) {
          cur = { row: 0, col: 0 };
          setFocusedState(cur);
          e.preventDefault();
        }
        return;
      }

      const { row, col } = cur;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedState(clamp(row - 1, col));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedState(clamp(row + 1, col));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedState(clamp(row, col - 1));
          break;
        case 'ArrowRight':
        case 'Tab':
          e.preventDefault();
          setFocusedState(clamp(row, col + (e.shiftKey ? -1 : 1)));
          break;
        case 'Home':
          e.preventDefault();
          setFocusedState(clamp(row, 0));
          break;
        case 'End':
          e.preventDefault();
          setFocusedState(clamp(row, colCount - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (e.shiftKey) onCommitRef.current(cur);
          else onEditRef.current(cur);
          break;
        case 'F2':
          e.preventDefault();
          onEditRef.current(cur);
          break;
        case 'Escape':
          e.preventDefault();
          setFocusedState(null);
          break;
        default:
          break;
      }
    },
    [enabled, colCount, rowCount, clamp]
  );

  return { focused, setFocused, onKeyDown };
}
