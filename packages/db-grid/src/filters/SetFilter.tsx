import { useMemo, useState } from 'react';

export interface SetFilterProps {
  values: Array<string | number | boolean>;
  selected: Array<string | number | boolean> | undefined;
  onChange: (selected: Array<string | number | boolean>) => void;
  onClear: () => void;
}

function valueKey(v: string | number | boolean): string {
  return String(v);
}

export function SetFilter({ values, selected, onChange, onClear }: SetFilterProps) {
  const [search, setSearch] = useState('');
  const selectedSet = useMemo(
    () => new Set((selected ?? values).map(valueKey)),
    [selected, values]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return values;
    return values.filter((v) => valueKey(v).toLowerCase().includes(q));
  }, [values, search]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((v) => selectedSet.has(valueKey(v)));

  const toggle = (v: string | number | boolean) => {
    const key = valueKey(v);
    const next = new Set(selectedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(values.filter((val) => next.has(valueKey(val))));
  };

  const selectAll = () => {
    const next = new Set(selectedSet);
    filtered.forEach((v) => next.add(valueKey(v)));
    onChange(values.filter((val) => next.has(valueKey(val))));
  };

  const deselectAll = () => {
    const next = new Set(selectedSet);
    filtered.forEach((v) => next.delete(valueKey(v)));
    onChange(values.filter((val) => next.has(valueKey(val))));
  };

  return (
    <div className="agx-set-filter">
      <input
        type="search"
        className="agx-set-filter-search"
        placeholder="Search…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="agx-set-filter-actions">
        <button type="button" className="agx-linkish" onClick={allFilteredSelected ? deselectAll : selectAll}>
          {allFilteredSelected ? 'Deselect all' : 'Select all'}
        </button>
        <button type="button" className="agx-linkish" onClick={onClear}>
          Clear filter
        </button>
      </div>
      <div className="agx-set-filter-list">
        {filtered.length === 0 ? (
          <div className="agx-set-filter-empty">No matches</div>
        ) : (
          filtered.map((v) => {
            const key = valueKey(v);
            const checked = selectedSet.has(key);
            return (
              <label key={key} className="agx-set-filter-item">
                <input type="checkbox" checked={checked} onChange={() => toggle(v)} />
                <span>{key}</span>
              </label>
            );
          })
        )}
      </div>
      <div className="agx-set-filter-footer">
        {selectedSet.size} of {values.length} selected
      </div>
    </div>
  );
}
