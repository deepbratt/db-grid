import type { FilterModelItem } from '../types';

export interface NumberFilterProps {
  value?: number | null;
  valueTo?: number | null;
  operator?: FilterModelItem['operator'];
  onChange: (patch: {
    filter?: number | null;
    filterTo?: number | null;
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

export function NumberFilter({
  value,
  valueTo,
  operator = 'equals',
  onChange,
}: NumberFilterProps) {
  const isRange = operator === 'inRange';
  const hideValue = operator === 'blank' || operator === 'notBlank';

  return (
    <div className="agx-number-filter" style={{ padding: 8, minWidth: 220 }}>
      <select
        value={operator}
        onChange={(e) =>
          onChange({
            operator: e.target.value as FilterModelItem['operator'],
            filter: hideValue ? null : value ?? null,
            filterTo: isRange ? valueTo ?? null : null,
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
            type="number"
            value={value == null ? '' : String(value)}
            onChange={(e) =>
              onChange({
                operator,
                filter: e.target.value === '' ? null : Number(e.target.value),
                filterTo: isRange ? valueTo ?? null : null,
              })
            }
            style={{ width: '100%', marginBottom: isRange ? 8 : 0, boxSizing: 'border-box' }}
          />
        </>
      )}
      {isRange && !hideValue && (
        <>
          <label style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>To</label>
          <input
            type="number"
            value={valueTo == null ? '' : String(valueTo)}
            onChange={(e) =>
              onChange({
                operator,
                filter: value ?? null,
                filterTo: e.target.value === '' ? null : Number(e.target.value),
              })
            }
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </>
      )}
    </div>
  );
}
