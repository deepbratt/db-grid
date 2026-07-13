export function computeColSpan(col: { colSpan?: (p: any) => number }, params: any): number {
  if (!col.colSpan) return 1;
  try {
    const span = col.colSpan(params);
    if (typeof span !== 'number' || !Number.isFinite(span)) return 1;
    return Math.max(1, Math.floor(span));
  } catch {
    return 1;
  }
}
