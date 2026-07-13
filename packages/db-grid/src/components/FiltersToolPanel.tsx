import type { ColumnDef, FilterModelItem, FilterType } from '../types';
import { resolveColId } from '../utils/dataOps';

interface Props<T> {
  columns: ColumnDef<T>[];
  filterModel: FilterModelItem[];
  onChange: (model: FilterModelItem[]) => void;
}

export function FiltersToolPanel<T>({ columns, filterModel, onChange }: Props<T>) {
  const setFilter = (colId: string, patch: Partial<FilterModelItem> | null) => {
    const rest = filterModel.filter((f) => f.colId !== colId);
    if (!patch) {
      onChange(rest);
      return;
    }
    const existing = filterModel.find((f) => f.colId === colId);
    onChange([...rest, { colId, type: 'text', operator: 'contains', ...existing, ...patch }]);
  };

  return (
    <div className="agx-toolpanel">
      <h3>Filters</h3>
      <button type="button" className="agx-linkish" onClick={() => onChange([])}>
        Clear all
      </button>
      <ul className="agx-filter-list">
        {columns
          .filter((c) => c.filter !== false)
          .map((col, i) => {
            const colId = resolveColId(col, i);
            const f = filterModel.find((x) => x.colId === colId);
            const type: FilterType =
              typeof col.filter === 'string' ? col.filter : 'text';
            return (
              <li key={colId}>
                <div className="agx-filter-label">{col.headerName ?? col.field ?? colId}</div>
                <select
                  value={f?.operator ?? 'contains'}
                  onChange={(e) =>
                    setFilter(colId, { operator: e.target.value as FilterModelItem['operator'], type })
                  }
                >
                  <option value="contains">contains</option>
                  <option value="equals">equals</option>
                  <option value="notEqual">not equal</option>
                  <option value="startsWith">starts with</option>
                  <option value="endsWith">ends with</option>
                  <option value="greaterThan">greater than</option>
                  <option value="lessThan">less than</option>
                  <option value="blank">blank</option>
                  <option value="notBlank">not blank</option>
                </select>
                <input
                  value={f?.filter == null ? '' : String(f.filter)}
                  placeholder="Filter value"
                  onChange={(e) =>
                    setFilter(colId, {
                      type,
                      filter: type === 'number' ? Number(e.target.value) : e.target.value,
                    })
                  }
                />
              </li>
            );
          })}
      </ul>
    </div>
  );
}
