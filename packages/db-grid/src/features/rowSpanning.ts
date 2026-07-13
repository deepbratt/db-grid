/** Compute row spans for consecutive equal values in a column. */
export function computeRowSpans<T>(
  rows: T[],
  getValue: (row: T, index: number) => unknown,
  _colId: string
): Map<number, number> {
  const spans = new Map<number, number>();
  if (rows.length === 0) return spans;

  let start = 0;
  let current = getValue(rows[0], 0);

  for (let i = 1; i <= rows.length; i++) {
    const next = i < rows.length ? getValue(rows[i], i) : Symbol('end');
    if (next !== current) {
      const span = i - start;
      spans.set(start, span);
      for (let j = start + 1; j < i; j++) {
        spans.set(j, 0);
      }
      start = i;
      if (i < rows.length) current = getValue(rows[i], i);
    }
  }

  return spans;
}
