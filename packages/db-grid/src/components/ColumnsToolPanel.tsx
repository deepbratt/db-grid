import type { ColumnDef } from '../types';
import { resolveColId } from '../utils/dataOps';

interface Props<T> {
  columns: ColumnDef<T>[];
  onChange: (cols: ColumnDef<T>[]) => void;
}

function colLabel<T>(col: ColumnDef<T>, index: number): string {
  return col.headerName ?? col.field ?? resolveColId(col, index);
}

function colIndexById<T>(columns: ColumnDef<T>[], id: string): number {
  return columns.findIndex((c, i) => resolveColId(c, i) === id);
}

interface DropZoneProps {
  title: string;
  emptyHint: string;
  items: { id: string; label: string; detail?: string }[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function DropZone({ title, emptyHint, items, onRemove, onClear }: DropZoneProps) {
  return (
    <section className="agx-drop-zone">
      <div className="agx-drop-zone-header">
        <h4>{title}</h4>
        {items.length > 0 && (
          <button type="button" className="agx-drop-zone-clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      <div className="agx-drop-zone-body">
        {items.length === 0 ? (
          <span className="agx-drop-zone-empty">{emptyHint}</span>
        ) : (
          items.map((item) => (
            <span key={item.id} className="agx-drop-zone-chip">
              <span>{item.label}</span>
              {item.detail && <span className="agx-drop-zone-detail">{item.detail}</span>}
              <button
                type="button"
                className="agx-drop-zone-remove"
                title={`Remove ${item.label}`}
                onClick={() => onRemove(item.id)}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
    </section>
  );
}

export function ColumnsToolPanel<T>({ columns, onChange }: Props<T>) {
  const rowGroupCols = columns
    .map((col, i) => ({ col, i, id: resolveColId(col, i) }))
    .filter(({ col }) => col.rowGroup)
    .sort((a, b) => (a.col.rowGroupIndex ?? 0) - (b.col.rowGroupIndex ?? 0));

  const valueCols = columns
    .map((col, i) => ({ col, i, id: resolveColId(col, i) }))
    .filter(({ col }) => col.aggFunc || col.enableValue);

  const pivotCols = columns
    .map((col, i) => ({ col, i, id: resolveColId(col, i) }))
    .filter(({ col }) => col.pivot);

  const clearRowGroups = () =>
    onChange(columns.map((c) => ({ ...c, rowGroup: false, rowGroupIndex: undefined })));

  const clearValues = () =>
    onChange(columns.map((c) => ({ ...c, aggFunc: undefined, enableValue: false })));

  const clearPivot = () => onChange(columns.map((c) => ({ ...c, pivot: false })));

  const removeRowGroup = (id: string) => {
    const idx = colIndexById(columns, id);
    if (idx >= 0) {
      onChange(
        columns.map((c, i) =>
          i === idx ? { ...c, rowGroup: false, rowGroupIndex: undefined } : c
        )
      );
    }
  };

  const removeValue = (id: string) => {
    const idx = colIndexById(columns, id);
    if (idx >= 0) {
      onChange(
        columns.map((c, i) =>
          i === idx ? { ...c, aggFunc: undefined, enableValue: false } : c
        )
      );
    }
  };

  const removePivot = (id: string) => {
    const idx = colIndexById(columns, id);
    if (idx >= 0) {
      onChange(columns.map((c, i) => (i === idx ? { ...c, pivot: false } : c)));
    }
  };

  return (
    <div className="agx-toolpanel">
      <h3>Columns</h3>
      <p className="agx-muted">Drag toggles · pin · group · pivot · agg</p>

      <DropZone
        title="Row Groups"
        emptyHint="Drop columns here to group rows"
        items={rowGroupCols.map(({ col, i, id }) => ({
          id,
          label: colLabel(col, i),
        }))}
        onRemove={removeRowGroup}
        onClear={clearRowGroups}
      />

      <DropZone
        title="Values"
        emptyHint="Drop columns here to aggregate"
        items={valueCols.map(({ col, i, id }) => ({
          id,
          label: colLabel(col, i),
          detail: col.aggFunc,
        }))}
        onRemove={removeValue}
        onClear={clearValues}
      />

      <DropZone
        title="Pivot Columns"
        emptyHint="Drop columns here to pivot"
        items={pivotCols.map(({ col, i, id }) => ({
          id,
          label: colLabel(col, i),
        }))}
        onRemove={removePivot}
        onClear={clearPivot}
      />

      <ul className="agx-col-list">
        {columns.map((col, i) => {
          const id = resolveColId(col, i);
          return (
            <li key={id} className="agx-col-item">
              <label>
                <input
                  type="checkbox"
                  checked={!col.hide}
                  onChange={(e) =>
                    onChange(
                      columns.map((c, idx) =>
                        idx === i ? { ...c, hide: !e.target.checked } : c
                      )
                    )
                  }
                />
                {col.headerName ?? col.field ?? id}
              </label>
              <div className="agx-col-actions">
                <button
                  type="button"
                  title="Pin left"
                  onClick={() =>
                    onChange(
                      columns.map((c, idx) =>
                        idx === i ? { ...c, pinned: c.pinned === 'left' ? null : 'left' } : c
                      )
                    )
                  }
                >
                  Pinned
                </button>
                <button
                  type="button"
                  title="Row group"
                  onClick={() =>
                    onChange(
                      columns.map((c, idx) =>
                        idx === i ? { ...c, rowGroup: !c.rowGroup, enableRowGroup: true } : c
                      )
                    )
                  }
                >
                  {col.rowGroup ? 'Grouped' : 'Group'}
                </button>
                <button
                  type="button"
                  title="Pivot"
                  onClick={() =>
                    onChange(
                      columns.map((c, idx) =>
                        idx === i ? { ...c, pivot: !c.pivot, enablePivot: true } : c
                      )
                    )
                  }
                >
                  {col.pivot ? 'Pivot ✓' : 'Pivot'}
                </button>
                <select
                  value={col.aggFunc ?? ''}
                  onChange={(e) =>
                    onChange(
                      columns.map((c, idx) =>
                        idx === i
                          ? {
                              ...c,
                              aggFunc: (e.target.value || undefined) as any,
                              enableValue: !!e.target.value,
                            }
                          : c
                      )
                    )
                  }
                >
                  <option value="">Agg</option>
                  <option value="sum">sum</option>
                  <option value="avg">avg</option>
                  <option value="min">min</option>
                  <option value="max">max</option>
                  <option value="count">count</option>
                </select>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
