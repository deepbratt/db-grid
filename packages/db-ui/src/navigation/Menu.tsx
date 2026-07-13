import { useEffect, useRef, type ReactNode } from 'react';
import { Paper } from '../Paper';
import { cx } from '../utils/cx';

export function Menu({
  open,
  onClose,
  anchorEl,
  children,
  className,
}: {
  open: boolean;
  onClose?: () => void;
  anchorEl?: HTMLElement | null;
  children?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node) && e.target !== anchorEl) onClose?.();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onClose, anchorEl]);

  if (!open) return null;

  const rect = anchorEl?.getBoundingClientRect();
  const style = rect
    ? { top: rect.bottom + 4 + window.scrollY, left: rect.left + window.scrollX }
    : { top: 80, left: 24 };

  return (
    <div ref={ref} className={cx('absolute z-[100]', className)} style={style}>
      <Paper elevation={6} className="min-w-[180px] overflow-hidden py-1">
        {children}
      </Paper>
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  selected,
  dense,
  className,
}: {
  children?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  dense?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx(
        'flex w-full items-center px-4 text-left text-sm transition',
        dense ? 'py-1.5' : 'py-2.5',
        selected
          ? 'bg-[color-mix(in_srgb,var(--mui-primary)_14%,transparent)] text-[var(--mui-primary)]'
          : 'hover:bg-[color-mix(in_srgb,var(--mui-text)_6%,transparent)]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function MenuList({ children, className }: { children?: ReactNode; className?: string }) {
  return <div role="menu" className={className}>{children}</div>;
}
