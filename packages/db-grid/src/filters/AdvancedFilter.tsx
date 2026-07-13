import { useCallback, useState } from 'react';
import type { FilterModelItem } from '../types';

export interface AdvancedFilterCondition {
  colId: string;
  operator: NonNullable<FilterModelItem['operator']>;
  value: string;
}

export interface AdvancedFilterColumn {
  colId: string;
  headerName?: string;
}

export interface AdvancedFilterProps {
  columns: AdvancedFilterColumn[];
  model: AdvancedFilterCondition[];
  onApply: (model: AdvancedFilterCondition[]) => void;
  onClear: () => void;
}

const OPERATORS: Array<{ value: NonNullable<FilterModelItem['operator']>; label: string }> = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'notEqual', label: 'Not equal' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'greaterThan', label: 'Greater than' },
  { value: 'lessThan', label: 'Less than' },
  { value: 'blank', label: 'Blank' },
  { value: 'notBlank', label: 'Not blank' },
];

function emptyCondition(columns: AdvancedFilterColumn[]): AdvancedFilterCondition {
  const first = columns[0];
  return {
    colId: first?.colId ?? '',
    operator: 'contains',
    value: '',
  };
}

export function AdvancedFilter({ columns, model, onApply, onClear }: AdvancedFilterProps) {
  const [draft, setDraft] = useState<AdvancedFilterCondition[]>(
    model.length > 0 ? model : [emptyCondition(columns)]
  );

  const updateCondition = useCallback(
    (index: number, patch: Partial<AdvancedFilterCondition>) => {
      setDraft((prev) =>
        prev.map((cond, i) => (i === index ? { ...cond, ...patch } : cond))
      );
    },
    []
  );

  const addCondition = useCallback(() => {
    setDraft((prev) => [...prev, emptyCondition(columns)]);
  }, [columns]);

  const removeCondition = useCallback((index: number) => {
    setDraft((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  return (
    <div className="agx-advanced-filter" style={{ padding: 8, minWidth: 480 }}>
      {draft.map((cond, index) => {
        const hideValue = cond.operator === 'blank' || cond.operator === 'notBlank';
        return (
          <div key={index}>
            {index > 0 && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--agx-muted, #666)',
                  margin: '6px 0',
                }}
              >
                AND
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <select
                value={cond.colId}
                onChange={(e) => updateCondition(index, { colId: e.target.value })}
                style={{ flex: 1 }}
              >
                {columns.map((col) => (
                  <option key={col.colId} value={col.colId}>
                    {col.headerName ?? col.colId}
                  </option>
                ))}
              </select>
              <select
                value={cond.operator}
                onChange={(e) => {
                  const nextOp = e.target.value as AdvancedFilterCondition['operator'];
                  updateCondition(index, {
                    operator: nextOp,
                    value: nextOp === 'blank' || nextOp === 'notBlank' ? '' : cond.value,
                  });
                }}
                style={{ flex: 1 }}
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
                  value={cond.value}
                  placeholder="Value"
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  style={{ flex: 1, boxSizing: 'border-box' }}
                />
              )}
              {draft.length > 1 && (
                <button type="button" onClick={() => removeCondition(index)} aria-label="Remove">
                  ×
                </button>
              )}
            </div>
          </div>
        );
      })}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="button" className="agx-linkish" onClick={addCondition}>
          Add condition
        </button>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={onClear}>
          Clear
        </button>
        <button type="button" onClick={() => onApply(draft.filter((c) => c.colId))}>
          Apply
        </button>
      </div>
    </div>
  );
}
