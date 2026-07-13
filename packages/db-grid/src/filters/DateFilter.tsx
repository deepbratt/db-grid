import type { FilterModelItem } from '../types';

export interface DateFilterProps {
  value?: string | null;
  valueTo?: string | null;
  operator?: string;
  onChange: (patch: {
    filter?: string | null;
    filterTo?: string | null;
    operator?: string;
  }) => void;
}

const OPERATORS: Array<{ value: FilterModelItem['operator']; label: string }> = [
  { value: 'equals', label: 'Equals' },
  { value: 'greaterThan', label: 'After' },
  { value: 'lessThan', label: 'Before' },
  { value: 'inRange', label: 'In range' },
];

export function DateFilter({ value, valueTo, operator = 'equals', onChange }: DateFilterProps) {
  const isRange = operator === 'inRange';

  return (
    <div className="agx-date-filter" style={{ padding: 8, minWidth: 220 }}>
      <select
        value={operator}
        onChange={(e) =>
          onChange({
            operator: e.target.value,
            filter: value ?? null,
            filterTo: isRange ? valueTo ?? null : null,
          })
        }
        style={{ width: '100%', marginBottom: 8 }}
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value!}>
            {op.label}
          </option>
        ))}
      </select>
      <label style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>
        {isRange ? 'From' : 'Date'}
      </label>
      <input
        type="date"
        value={value ?? ''}
        onChange={(e) =>
          onChange({
            operator,
            filter: e.target.value || null,
            filterTo: isRange ? valueTo ?? null : null,
          })
        }
        style={{ width: '100%', marginBottom: isRange ? 8 : 0 }}
      />
      {isRange && (
        <>
          <label style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>To</label>
          <input
            type="date"
            value={valueTo ?? ''}
            onChange={(e) =>
              onChange({
                operator,
                filter: value ?? null,
                filterTo: e.target.value || null,
              })
            }
            style={{ width: '100%' }}
          />
        </>
      )}
    </div>
  );
}
