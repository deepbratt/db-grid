import type { FilterModelItem } from '../types';

export interface TextFilterProps {
  value?: string | null;
  operator?: FilterModelItem['operator'];
  onChange: (patch: { filter?: string | null; operator?: FilterModelItem['operator'] }) => void;
}

const OPERATORS: Array<{ value: NonNullable<FilterModelItem['operator']>; label: string }> = [
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Not contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'notEqual', label: 'Not equal' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'blank', label: 'Blank' },
  { value: 'notBlank', label: 'Not blank' },
];

export function TextFilter({ value, operator = 'contains', onChange }: TextFilterProps) {
  const hideValue = operator === 'blank' || operator === 'notBlank';

  return (
    <div className="agx-text-filter" style={{ padding: 8, minWidth: 220 }}>
      <select
        value={operator}
        onChange={(e) =>
          onChange({
            operator: e.target.value as FilterModelItem['operator'],
            filter: hideValue ? null : value ?? null,
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
        <input
          type="text"
          placeholder="Filter value"
          value={value ?? ''}
          onChange={(e) =>
            onChange({
              operator,
              filter: e.target.value || null,
            })
          }
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
      )}
    </div>
  );
}
