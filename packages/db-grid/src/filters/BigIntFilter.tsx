import type { FilterModelItem } from '../types';

export interface BigIntFilterProps {
  value?: bigint | null;
  valueTo?: bigint | null;
  operator?: FilterModelItem['operator'];
  onChange: (patch: {
    filter?: string | null;
    filterTo?: string | null;
    operator?: FilterModelItem['operator'];
  }) => void;
}

const OPERATORS: Array<{ value: NonNullable<FilterModelItem['operator']>; label: string }> = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEqual', label: 'Not equal' },
  { value: 'greaterThan', label: 'Greater than' },
  { value: 'lessThan', label: 'Less than' },
  { value: 'greaterThanOrEqual', label: 'Greater than or equal' },
  { value: 'lessThanOrEqual', label: 'Less than or equal' },
  { value: 'inRange', label: 'In range' },
  { value: 'blank', label: 'Blank' },
  { value: 'notBlank', label: 'Not blank' },
];

function parseBigIntInput(raw: string): bigint | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return BigInt(trimmed);
  } catch {
    return null;
  }
}

function formatBigInt(v: bigint | null | undefined): string {
  if (v == null) return '';
  return String(v);
}

export function BigIntFilter({
  value,
  valueTo,
  operator = 'equals',
  onChange,
}: BigIntFilterProps) {
  const isRange = operator === 'inRange';
  const hideValue = operator === 'blank' || operator === 'notBlank';

  return (
    <div className="agx-bigint-filter" style={{ padding: 8, minWidth: 220 }}>
      <select
        value={operator}
        onChange={(e) =>
          onChange({
            operator: e.target.value as FilterModelItem['operator'],
            filter: hideValue ? null : formatBigInt(value ?? null) || null,
            filterTo: isRange ? formatBigInt(valueTo ?? null) || null : null,
          })
        }
        style={{ width: '100%', marginBottom: 8 }}
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      {!hideValue && (
        <>
          <label style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>
            {isRange ? 'From' : 'Value'}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={formatBigInt(value ?? null)}
            onChange={(e) => {
              const parsed = parseBigIntInput(e.target.value);
              onChange({
                operator,
                filter: e.target.value === '' ? null : formatBigInt(parsed),
                filterTo: isRange ? formatBigInt(valueTo ?? null) || null : null,
              });
            }}
            style={{ width: '100%', marginBottom: isRange ? 8 : 0, boxSizing: 'border-box' }}
          />
        </>
      )}
      {isRange && !hideValue && (
        <>
          <label style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>To</label>
          <input
            type="text"
            inputMode="numeric"
            value={formatBigInt(valueTo ?? null)}
            onChange={(e) => {
              const parsed = parseBigIntInput(e.target.value);
              onChange({
                operator,
                filter: formatBigInt(value ?? null) || null,
                filterTo: e.target.value === '' ? null : formatBigInt(parsed),
              });
            }}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </>
      )}
    </div>
  );
}

/** Parse filter model strings into bigint for comparison. */
export function parseBigIntFilterValue(raw: string | number | null | undefined): bigint | null {
  if (raw == null || raw === '') return null;
  try {
    return BigInt(String(raw));
  } catch {
    return null;
  }
}

/** Compare a cell bigint value against a filter model item. */
export function matchesBigIntFilter(
  cellValue: unknown,
  filter: string | number | null | undefined,
  filterTo: string | number | null | undefined,
  operator: FilterModelItem['operator'] = 'equals'
): boolean {
  const op = operator ?? 'equals';
  if (op === 'blank') return cellValue == null || cellValue === '';
  if (op === 'notBlank') return cellValue != null && cellValue !== '';

  let value: bigint | null = null;
  try {
    value = cellValue == null || cellValue === '' ? null : BigInt(String(cellValue));
  } catch {
    return false;
  }
  if (value == null) return false;

  const a = parseBigIntFilterValue(filter);
  const b = parseBigIntFilterValue(filterTo);
  if (a == null) return false;

  switch (op) {
    case 'equals':
      return a != null && value === a;
    case 'notEqual':
      return a != null && value !== a;
    case 'greaterThan':
      return a != null && value > a;
    case 'lessThan':
      return a != null && value < a;
    case 'greaterThanOrEqual':
      return a != null && value >= a;
    case 'lessThanOrEqual':
      return a != null && value <= a;
    case 'inRange':
      return a != null && b != null && value >= a && value <= b;
    default:
      return true;
  }
}
