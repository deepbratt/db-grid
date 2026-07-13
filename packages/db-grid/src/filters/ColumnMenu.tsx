import { useEffect, useRef } from 'react';
import type { ColumnDef, FilterModelItem } from '../types';
import { DateFilter } from './DateFilter';
import { SetFilter } from './SetFilter';

export interface ColumnMenuProps<T = any> {
  x: number;
  y: number;
  colId: string;
  column: ColumnDef<T>;
  onClose: () => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  onPin: (side: 'left' | 'right' | null) => void;
  onHide: () => void;
  onAutoSize: () => void;
  onFilterChange: (patch: Partial<FilterModelItem> | null) => void;
  filterModelItem?: FilterModelItem;
  filterValues?: Array<string | number | boolean>;
}

export function ColumnMenu<T>({
  x,
  y,
  colId,
  column,
  onClose,
  onSortAsc,
  onSortDesc,
  onPin,
  onHide,
  onAutoSize,
  onFilterChange,
  filterModelItem,
  filterValues = [],
}: ColumnMenuProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [onClose]);

  const filterType = typeof column.filter === 'string' ? column.filter : 'text';
  const showFilter = column.filter !== false;

  const run = (fn: () => void) => {
    fn();
    onClose();
  };

  return (
    <div
      ref={ref}
      className="agx-column-menu agx-context-menu"
      style={{ left: x, top: y, minWidth: 200 }}
      onClick={(e) => e.stopPropagation()}
    >
      <ul>
        {column.sortable !== false && (
          <>
            <li onClick={() => run(onSortAsc)}>Sort ascending</li>
            <li onClick={() => run(onSortDesc)}>Sort descending</li>
            <li className="agx-sep" />
          </>
        )}
        <li onClick={() => run(() => onPin('left'))}>Pin left</li>
        <li onClick={() => run(() => onPin('right'))}>Pin right</li>
        <li onClick={() => run(() => onPin(null))}>No pin</li>
        <li className="agx-sep" />
        <li onClick={() => run(onAutoSize)}>Autosize column</li>
        <li onClick={() => run(onHide)}>Hide column</li>
      </ul>
      {showFilter && (
        <div className="agx-column-menu-filter">
          <div className="agx-column-menu-filter-title">Filter</div>
          {filterType === 'set' ? (
            <SetFilter
              values={filterValues}
              selected={filterModelItem?.values}
              onChange={(values) =>
                onFilterChange({ colId, type: 'set', values, operator: 'equals' })
              }
              onClear={() => onFilterChange(null)}
            />
          ) : filterType === 'date' ? (
            <DateFilter
              value={
                filterModelItem?.filter == null ? null : String(filterModelItem.filter)
              }
              valueTo={
                filterModelItem?.filterTo == null ? null : String(filterModelItem.filterTo)
              }
              operator={filterModelItem?.operator ?? 'equals'}
              onChange={(patch) =>
                onFilterChange({
                  colId,
                  type: 'date',
                  operator: patch.operator as FilterModelItem['operator'],
                  filter: patch.filter,
                  filterTo: patch.filterTo,
                })
              }
            />
          ) : (
            <div style={{ padding: 8 }}>
              <select
                value={filterModelItem?.operator ?? 'contains'}
                onChange={(e) =>
                  onFilterChange({
                    colId,
                    type: filterType as FilterModelItem['type'],
                    operator: e.target.value as FilterModelItem['operator'],
                    filter: filterModelItem?.filter ?? '',
                  })
                }
                style={{ width: '100%', marginBottom: 6 }}
              >
                <option value="contains">Contains</option>
                <option value="equals">Equals</option>
                <option value="notEqual">Not equal</option>
                <option value="startsWith">Starts with</option>
                <option value="endsWith">Ends with</option>
                <option value="greaterThan">Greater than</option>
                <option value="lessThan">Less than</option>
                <option value="blank">Blank</option>
                <option value="notBlank">Not blank</option>
              </select>
              <input
                type={filterType === 'number' ? 'number' : 'text'}
                placeholder="Filter value"
                value={filterModelItem?.filter == null ? '' : String(filterModelItem.filter)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) onFilterChange(null);
                  else
                    onFilterChange({
                      colId,
                      type: filterType as FilterModelItem['type'],
                      operator: filterModelItem?.operator ?? 'contains',
                      filter: filterType === 'number' ? Number(v) : v,
                    });
                }}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                className="agx-linkish"
                style={{ marginTop: 6, fontSize: 12 }}
                onClick={() => onFilterChange(null)}
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
