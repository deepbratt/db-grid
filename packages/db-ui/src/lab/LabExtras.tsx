import { useMemo, useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { Paper } from '../Paper';
import { Stack } from '../Stack';
import { Typography } from '../Typography';
import { List, ListItemButton, ListItemText } from '../data-display/List';
import { cx } from '../utils/cx';

export type TransferListProps = {
  leftTitle?: string;
  rightTitle?: string;
  left: string[];
  right: string[];
  onChange?: (next: { left: string[]; right: string[] }) => void;
  className?: string;
};

/** MUI Transfer List */
export function TransferList({
  leftTitle = 'Choices',
  rightTitle = 'Chosen',
  left: leftProp,
  right: rightProp,
  onChange,
  className,
}: TransferListProps) {
  const [left, setLeft] = useState(leftProp);
  const [right, setRight] = useState(rightProp);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (v: string) => {
    setChecked((prev) => {
      const n = new Set(prev);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });
  };

  const move = (from: 'left' | 'right') => {
    const source = from === 'left' ? left : right;
    const moving = source.filter((x) => checked.has(x));
    if (!moving.length) return;
    const nextLeft =
      from === 'left' ? left.filter((x) => !checked.has(x)) : [...left, ...moving];
    const nextRight =
      from === 'right' ? right.filter((x) => !checked.has(x)) : [...right, ...moving];
    setLeft(nextLeft);
    setRight(nextRight);
    setChecked(new Set());
    onChange?.({ left: nextLeft, right: nextRight });
  };

  const pane = (title: string, items: string[]) => (
    <Paper elevation={1} className="min-w-[200px] flex-1 overflow-hidden">
      <Typography variant="subtitle2" className="border-b border-[var(--mui-divider)] px-3 py-2">
        {title}
      </Typography>
      <List dense>
        {items.map((item) => (
          <ListItemButton
            key={item}
            className={cx(checked.has(item) && '!bg-[color-mix(in_srgb,var(--mui-primary)_14%,transparent)]')}
            onClick={() => toggle(item)}
          >
            <ListItemText primary={item} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );

  return (
    <Stack direction="row" spacing={2} alignItems="center" className={cx('flex-wrap', className)}>
      {pane(leftTitle, left)}
      <Stack spacing={1}>
        <Button size="small" variant="outlined" onClick={() => move('left')}>
          &gt;
        </Button>
        <Button size="small" variant="outlined" onClick={() => move('right')}>
          &lt;
        </Button>
      </Stack>
      {pane(rightTitle, right)}
    </Stack>
  );
}

export function Timeline({ children, className }: { children?: ReactNode; className?: string }) {
  return <ol className={cx('m-0 list-none border-l-2 border-[var(--mui-primary)] pl-0', className)}>{children}</ol>;
}

export function TimelineItem({
  oppositeContent,
  children,
  className,
}: {
  oppositeContent?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <li className={cx('relative ml-4 py-3 pl-6', className)}>
      <span className="absolute -left-[9px] top-5 h-4 w-4 rounded-full border-2 border-[var(--mui-primary)] bg-[var(--mui-paper)]" />
      {oppositeContent != null && (
        <Typography variant="caption" color="secondary" className="mb-1 block">
          {oppositeContent}
        </Typography>
      )}
      <div>{children}</div>
    </li>
  );
}

export function TimelineSeparator({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function TimelineConnector() {
  return null;
}

export function TimelineContent({ children }: { children?: ReactNode }) {
  return <div>{children}</div>;
}

export function TimelineDot() {
  return null;
}

export function Masonry({
  columns = 3,
  spacing = 2,
  children,
  className,
}: {
  columns?: number;
  spacing?: number;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(className)}
      style={{
        columnCount: columns,
        columnGap: `${spacing * 0.5}rem`,
      }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div key={i} className="mb-3 break-inside-avoid">
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
