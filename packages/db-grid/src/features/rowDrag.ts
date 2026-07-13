/** Reorders rows by moving the item at fromIndex to toIndex (used by row-drag managed reordering). */
export function reorderRows<T>(rows: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return rows;
  if (fromIndex >= rows.length || toIndex >= rows.length) return rows;
  const next = rows.slice();
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
