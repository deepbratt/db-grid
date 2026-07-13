export type CellDataType = 'text' | 'number' | 'boolean' | 'date';

export function inferCellDataType(value: any): CellDataType {
  if (value == null || value === '') return 'text';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number' && !Number.isNaN(value)) return 'number';
  if (value instanceof Date && !Number.isNaN(value.getTime())) return 'date';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === 'true' || trimmed === 'false') return 'boolean';
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return 'number';
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed) && !Number.isNaN(Date.parse(trimmed))) return 'date';
  }
  return 'text';
}
