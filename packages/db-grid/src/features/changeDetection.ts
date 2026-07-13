export function shallowEqualRow(
  a: Record<string, unknown> | null | undefined,
  b: Record<string, unknown> | null | undefined,
  fields?: string[]
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  const keys = fields ?? [...new Set([...Object.keys(a), ...Object.keys(b)])];
  for (const key of keys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function detectChangedFields(
  oldRow: Record<string, unknown> | null | undefined,
  newRow: Record<string, unknown> | null | undefined
): string[] {
  if (oldRow === newRow) return [];
  if (!oldRow && !newRow) return [];
  if (!oldRow) return Object.keys(newRow ?? {});
  if (!newRow) return Object.keys(oldRow);

  const changed: string[] = [];
  const keys = new Set([...Object.keys(oldRow), ...Object.keys(newRow)]);
  for (const key of keys) {
    if (oldRow[key] !== newRow[key]) changed.push(key);
  }
  return changed;
}
