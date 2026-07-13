import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ColumnDef, FilterModelItem, FilterType } from '../types';
import { SetFilter } from './SetFilter';

export interface FloatingFilterRowProps<T = any> {
  columns: ColumnDef<T>[];
  widths: number[];
  filterModel: FilterModelItem[];
  onChangeFilter: (colId: string, patch: Partial<FilterModelItem> | null) => void;
  resolveColId: (col: ColumnDef<T>, i: number) => string;
  /** Distinct values per column for set filters */
  getFilterValues: (colId: string) => Array<string | number | boolean>;
  height?: number;
}

function FloatingSetFilterButton({
  values,
  selected,
  onChange,
  onClear,
}: {
  values: Array<string | number | boolean>;
  selected: Array<string | number | boolean> | undefined;
  onChange: (selected: Array<string | number | boolean>) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const active = selected != null && selected.length < values.length;
  const label = !active
    ? 'All'
    : selected.length === 0
      ? 'None'
      : selected.length === 1
        ? String(selected[0])
        : `${selected.length} selected`;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`agx-floating-set-btn ${active ? 'active' : ''}`}
        title={label}
        onClick={() => {
          const rect = btnRef.current?.getBoundingClientRect();
          if (rect) {
            const left = Math.min(rect.left, window.innerWidth - 260);
            setPos({ top: rect.bottom + 2, left: Math.max(8, left) });
          }
          setOpen((v) => !v);
        }}
      >
        <span>{label}</span>
        <span aria-hidden>▾</span>
      </button>
      {open &&
        createPortal(
          <div
            ref={popRef}
            className="agx-floating-set-popup"
            style={{ top: pos.top, left: pos.left }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <SetFilter values={values} selected={selected} onChange={onChange} onClear={onClear} />
          </div>,
          document.body
        )}
    </>
  );
}

export function FloatingFilterRow<T>({
  columns,
  widths,
  filterModel,
  onChangeFilter,
  resolveColId,
  getFilterValues,
  height = 32,
}: FloatingFilterRowProps<T>) {
  return (
    <div className="agx-floating-filter-row" style={{ height, minHeight: height }} role="row">
      {columns.map((col, i) => {
        const colId = resolveColId(col, i);
        const filterEnabled = col.filter !== false;
        const filterType: FilterType = typeof col.filter === 'string' ? col.filter : 'text';
        const model = filterModel.find((f) => f.colId === colId);
        const width = widths[i] ?? col.width ?? 120;

        return (
          <div
            key={colId}
            className="agx-floating-filter-cell"
            style={{ width, minWidth: width, maxWidth: width }}
          >
            {!filterEnabled ? null : filterType === 'set' ? (
              <FloatingSetFilterButton
                values={getFilterValues(colId)}
                selected={model?.values}
                onChange={(values) =>
                  onChangeFilter(colId, { type: 'set', values, operator: 'equals' })
                }
                onClear={() => onChangeFilter(colId, null)}
              />
            ) : filterType === 'date' ? (
              <input
                className="agx-floating-input"
                type="date"
                value={model?.filter == null ? '' : String(model.filter)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) onChangeFilter(colId, null);
                  else
                    onChangeFilter(colId, {
                      type: 'date',
                      operator: model?.operator ?? 'equals',
                      filter: v,
                    });
                }}
              />
            ) : filterType === 'boolean' ? (
              <select
                className="agx-floating-input"
                value={model?.filter == null ? '' : String(model.filter)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) onChangeFilter(colId, null);
                  else
                    onChangeFilter(colId, {
                      type: 'boolean',
                      operator: 'equals',
                      filter: v === 'true',
                    });
                }}
              >
                <option value="">All</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : filterType === 'number' ? (
              <input
                className="agx-floating-input"
                type="number"
                placeholder="Filter…"
                value={model?.filter == null ? '' : String(model.filter)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) onChangeFilter(colId, null);
                  else
                    onChangeFilter(colId, {
                      type: 'number',
                      operator: model?.operator ?? 'equals',
                      filter: Number(v),
                    });
                }}
              />
            ) : (
              <input
                className="agx-floating-input"
                type="text"
                placeholder="Filter…"
                value={model?.filter == null ? '' : String(model.filter)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) onChangeFilter(colId, null);
                  else
                    onChangeFilter(colId, {
                      type: 'text',
                      operator: model?.operator ?? 'contains',
                      filter: v,
                    });
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
