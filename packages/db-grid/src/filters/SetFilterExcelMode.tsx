import { useMemo, useState } from 'react';
import { SetFilter, type SetFilterProps } from './SetFilter';

export interface SetFilterTreeNode {
  label: string;
  value?: string | number | boolean;
  children?: SetFilterTreeNode[];
}

export interface SetFilterExcelModeProps extends Omit<SetFilterProps, 'values'> {
  values?: Array<string | number | boolean>;
  excelMode?: boolean;
  treeData?: SetFilterTreeNode[];
}

function flattenTree(nodes: SetFilterTreeNode[]): Array<string | number | boolean> {
  const out: Array<string | number | boolean> = [];
  for (const node of nodes) {
    if (node.children?.length) {
      out.push(...flattenTree(node.children));
    } else if (node.value !== undefined) {
      out.push(node.value);
    } else {
      out.push(node.label);
    }
  }
  return out;
}

function valueKey(v: string | number | boolean): string {
  return String(v);
}

interface TreeGroupProps {
  node: SetFilterTreeNode;
  depth: number;
  selectedSet: Set<string>;
  onToggle: (v: string | number | boolean) => void;
}

function TreeGroup({ node, depth, selectedSet, onToggle }: TreeGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = !!node.children?.length;

  if (hasChildren) {
    const childValues = flattenTree(node.children!);
    const allSelected = childValues.length > 0 && childValues.every((v) => selectedSet.has(valueKey(v)));
    const someSelected = childValues.some((v) => selectedSet.has(valueKey(v)));

    const toggleGroup = () => {
      for (const v of childValues) {
        const key = valueKey(v);
        const checked = selectedSet.has(key);
        if (allSelected && checked) onToggle(v);
        else if (!allSelected && !checked) onToggle(v);
      }
    };

    return (
      <div className="agx-set-filter-tree-group">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            paddingLeft: 8 + depth * 14,
            fontSize: 13,
          }}
        >
          <button
            type="button"
            className="agx-linkish"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, width: 14 }}
          >
            {expanded ? '▾' : '▸'}
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flex: 1 }}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = !allSelected && someSelected;
              }}
              onChange={toggleGroup}
            />
            <span>{node.label}</span>
          </label>
        </div>
        {expanded &&
          node.children!.map((child, i) => (
            <TreeGroup
              key={`${node.label}-${i}`}
              node={child}
              depth={depth + 1}
              selectedSet={selectedSet}
              onToggle={onToggle}
            />
          ))}
      </div>
    );
  }

  const v = node.value ?? node.label;
  const key = valueKey(v);
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        paddingLeft: 8 + depth * 14,
        cursor: 'pointer',
        fontSize: 13,
      }}
    >
      <input type="checkbox" checked={selectedSet.has(key)} onChange={() => onToggle(v)} />
      <span>{node.label}</span>
    </label>
  );
}

export function SetFilterExcelMode({
  values: valuesProp,
  selected,
  onChange,
  onClear,
  excelMode = true,
  treeData,
}: SetFilterExcelModeProps) {
  const values = useMemo(() => {
    if (valuesProp?.length) return valuesProp;
    if (treeData?.length) return flattenTree(treeData);
    return [];
  }, [valuesProp, treeData]);

  const selectedSet = useMemo(
    () => new Set((selected ?? values).map(valueKey)),
    [selected, values]
  );

  const allSelected = values.length > 0 && values.every((v) => selectedSet.has(valueKey(v)));
  const selectAllLabel = excelMode ? '(Select All)' : 'Select all';

  const toggle = (v: string | number | boolean) => {
    const key = valueKey(v);
    const next = new Set(selectedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(values.filter((val) => next.has(valueKey(val))));
  };

  if (treeData?.length) {
    return (
      <div className="agx-set-filter agx-set-filter-excel" style={{ minWidth: 220, padding: 8 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12 }}>
          <button
            type="button"
            className="agx-linkish"
            onClick={() => onChange(allSelected ? [] : [...values])}
          >
            {selectAllLabel}
          </button>
          <button type="button" className="agx-linkish" onClick={onClear}>
            Clear filter
          </button>
        </div>
        <div
          className="agx-set-filter-list"
          style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid var(--agx-line, #ccc)' }}
        >
          {treeData.map((node, i) => (
            <TreeGroup
              key={`${node.label}-${i}`}
              node={node}
              depth={0}
              selectedSet={selectedSet}
              onToggle={toggle}
            />
          ))}
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--agx-muted, #666)' }}>
          {selectedSet.size} of {values.length} selected
        </div>
      </div>
    );
  }

  return (
    <div className="agx-set-filter agx-set-filter-excel" style={{ minWidth: 200, padding: 8 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12 }}>
        <button
          type="button"
          className="agx-linkish"
          onClick={() => onChange(allSelected ? [] : [...values])}
        >
          {selectAllLabel}
        </button>
        <button type="button" className="agx-linkish" onClick={onClear}>
          Clear filter
        </button>
      </div>
      <SetFilter values={values} selected={selected} onChange={onChange} onClear={onClear} />
    </div>
  );
}
