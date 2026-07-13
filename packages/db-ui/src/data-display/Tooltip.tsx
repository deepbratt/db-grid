import { useState, type ReactNode } from 'react';
import { cx } from '../utils/cx';

export type TooltipProps = {
  title: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  className?: string;
};

export function Tooltip({ title, placement = 'top', children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const pos =
    placement === 'top'
      ? 'bottom-full left-1/2 mb-2 -translate-x-1/2'
      : placement === 'bottom'
        ? 'top-full left-1/2 mt-2 -translate-x-1/2'
        : placement === 'left'
          ? 'right-full top-1/2 mr-2 -translate-y-1/2'
          : 'left-full top-1/2 ml-2 -translate-y-1/2';

  return (
    <span
      className={cx('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && title != null && title !== '' && (
        <span
          role="tooltip"
          className={cx(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-[var(--mui-secondary)] px-2 py-1 text-xs text-[var(--mui-primary-contrast)] shadow-lg',
            pos
          )}
        >
          {title}
        </span>
      )}
    </span>
  );
}
