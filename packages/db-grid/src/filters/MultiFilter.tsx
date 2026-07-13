import type { FilterModelItem } from '../types';
import { SetFilter } from './SetFilter';
import { TextFilter } from './TextFilter';

export interface MultiFilterProps {
  colId: string;
  values: Array<string | number | boolean>;
  textFilter?: Partial<Pick<FilterModelItem, 'operator' | 'filter'>>;
  setValues?: Array<string | number | boolean>;
  onChange: (patch: {
    text?: Partial<Pick<FilterModelItem, 'operator' | 'filter'>>;
    set?: Array<string | number | boolean> | null;
  }) => void;
}

export function MultiFilter({
  values,
  textFilter,
  setValues,
  onChange,
}: MultiFilterProps) {
  return (
    <div
      className="agx-multi-filter"
      style={{ display: 'flex', gap: 8, padding: 8, minWidth: 420 }}
    >
      <div style={{ flex: 1, minWidth: 180 }}>
        <TextFilter
          value={textFilter?.filter == null ? null : String(textFilter.filter)}
          operator={textFilter?.operator ?? 'contains'}
          onChange={(patch) =>
            onChange({
              text: {
                operator: patch.operator,
                filter: patch.filter,
              },
            })
          }
        />
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <SetFilter
          values={values}
          selected={setValues}
          onChange={(selected) => onChange({ set: selected })}
          onClear={() => onChange({ set: null })}
        />
      </div>
    </div>
  );
}
