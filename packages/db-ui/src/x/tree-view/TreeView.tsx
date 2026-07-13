import { useMemo, useState, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Checkbox } from '../../Checkbox';
import { Typography } from '../../Typography';

export type TreeNode = {
  id: string;
  label: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
};

function flatten(nodes: TreeNode[], acc: TreeNode[] = []): TreeNode[] {
  for (const n of nodes) {
    acc.push(n);
    if (n.children) flatten(n.children, acc);
  }
  return acc;
}

function collectIds(nodes: TreeNode[]): string[] {
  return flatten(nodes).map((n) => n.id);
}

export type RichTreeViewProps = {
  items: TreeNode[];
  multiSelect?: boolean;
  checkboxSelection?: boolean;
  defaultExpandedItems?: string[];
  selectedItems?: string | string[];
  onSelectedItemsChange?: (ids: string | string[] | null) => void;
  /** Pro: drag reorder within siblings */
  itemsReordering?: boolean;
  onItemPositionChange?: (items: TreeNode[]) => void;
  className?: string;
};

/** MUI X Pro — Rich Tree View (checkboxes, multi-select, DnD reorder) */
export function RichTreeView({
  items: itemsProp,
  multiSelect,
  checkboxSelection,
  defaultExpandedItems = [],
  selectedItems,
  onSelectedItemsChange,
  itemsReordering,
  onItemPositionChange,
  className,
}: RichTreeViewProps) {
  const [items, setItems] = useState(itemsProp);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpandedItems));
  const [dragId, setDragId] = useState<string | null>(null);

  const selected = useMemo(() => {
    if (selectedItems == null) return new Set<string>();
    return new Set(Array.isArray(selectedItems) ? selectedItems : [selectedItems]);
  }, [selectedItems]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    if (!onSelectedItemsChange) return;
    if (multiSelect || checkboxSelection) {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectedItemsChange([...next]);
    } else {
      onSelectedItemsChange(selected.has(id) ? null : id);
    }
  };

  const moveSibling = (parentList: TreeNode[], fromId: string, toId: string) => {
    const from = parentList.findIndex((n) => n.id === fromId);
    const to = parentList.findIndex((n) => n.id === toId);
    if (from < 0 || to < 0 || from === to) return parentList;
    const copy = [...parentList];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  };

  const renderNodes = (nodes: TreeNode[], depth = 0): ReactNode =>
    nodes.map((node) => {
      const hasKids = !!node.children?.length;
      const isOpen = expanded.has(node.id);
      const isSelected = selected.has(node.id);
      return (
        <div key={node.id}>
          <div
            draggable={!!itemsReordering && !node.disabled}
            onDragStart={() => setDragId(node.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (!itemsReordering || !dragId || dragId === node.id) return;
              const next = moveSibling(items, dragId, node.id);
              setItems(next);
              onItemPositionChange?.(next);
              setDragId(null);
            }}
            className={cx(
              'flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition',
              isSelected && 'bg-[color-mix(in_srgb,var(--mui-primary)_14%,transparent)]',
              node.disabled && 'opacity-40',
              !node.disabled && 'hover:bg-[color-mix(in_srgb,var(--mui-text)_6%,transparent)]'
            )}
            style={{ paddingLeft: 8 + depth * 16 }}
          >
            <button
              type="button"
              className={cx('w-5 text-xs', !hasKids && 'invisible')}
              onClick={() => toggleExpand(node.id)}
              aria-label="Toggle"
            >
              {isOpen ? '▾' : '▸'}
            </button>
            {checkboxSelection && (
              <Checkbox
                checked={isSelected}
                disabled={node.disabled}
                onChange={() => toggleSelect(node.id)}
              />
            )}
            <button
              type="button"
              className="flex-1 text-left"
              disabled={node.disabled}
              onClick={() => toggleSelect(node.id)}
            >
              {node.label}
            </button>
            {itemsReordering && <span className="text-[var(--mui-text-secondary)]">⠿</span>}
          </div>
          {hasKids && isOpen && renderNodes(node.children!, depth + 1)}
        </div>
      );
    });

  return (
    <div className={cx('rounded-xl border border-[var(--mui-divider)] bg-[var(--mui-paper)] p-2', className)}>
      <Typography variant="caption" color="secondary" className="mb-2 block px-2">
        Rich Tree View · Pro {itemsReordering ? '· DnD' : ''}
      </Typography>
      {renderNodes(items)}
    </div>
  );
}

/** MUI X Community — Simple Tree View */
export function SimpleTreeView(props: Omit<RichTreeViewProps, 'checkboxSelection' | 'itemsReordering' | 'multiSelect'>) {
  return <RichTreeView {...props} />;
}

export { collectIds };
