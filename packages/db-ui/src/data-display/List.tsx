import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export function List({ dense, className, children, ...rest }: HTMLAttributes<HTMLUListElement> & { dense?: boolean; children?: ReactNode }) {
  return (
    <ul className={cx('m-0 list-none p-0', dense ? 'py-1' : 'py-2', className)} {...rest}>
      {children}
    </ul>
  );
}

export function ListSubheader({ className, children, ...rest }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cx('px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--mui-text-secondary)]', className)} {...rest}>
      {children}
    </li>
  );
}

export function ListItem({ className, children, ...rest }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cx('flex items-center gap-3 px-4 py-2', className)} {...rest}>
      {children}
    </li>
  );
}

export function ListItemButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cx(
        'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition',
        'hover:bg-[color-mix(in_srgb,var(--mui-primary)_10%,transparent)]',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ListItemIcon({ className, children }: { className?: string; children?: ReactNode }) {
  return <span className={cx('inline-flex w-8 shrink-0 text-[var(--mui-text-secondary)]', className)}>{children}</span>;
}

export function ListItemAvatar({ className, children }: { className?: string; children?: ReactNode }) {
  return <span className={cx('shrink-0', className)}>{children}</span>;
}

export function ListItemText({
  primary,
  secondary,
  className,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx('min-w-0 flex-1', className)}>
      <span className="block text-sm font-medium text-[var(--mui-text)]">{primary}</span>
      {secondary != null && <span className="block text-xs text-[var(--mui-text-secondary)]">{secondary}</span>}
    </span>
  );
}
