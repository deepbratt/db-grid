import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type AppBarProps = HTMLAttributes<HTMLElement> & {
  position?: 'fixed' | 'sticky' | 'static' | 'absolute' | 'relative';
  color?: 'primary' | 'secondary' | 'transparent' | 'default';
  children?: ReactNode;
};

export function AppBar({
  position = 'sticky',
  color = 'primary',
  className,
  children,
  ...rest
}: AppBarProps) {
  return (
    <header
      className={cx(
        'z-40 w-full',
        position === 'fixed' && 'fixed inset-x-0 top-0',
        position === 'sticky' && 'sticky top-0',
        position === 'absolute' && 'absolute inset-x-0 top-0',
        color === 'primary' && 'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)]',
        color === 'secondary' && 'bg-[var(--mui-secondary)] text-white',
        color === 'default' && 'bg-[var(--mui-paper)] text-[var(--mui-text)] border-b border-[var(--mui-divider)]',
        color === 'transparent' && 'bg-transparent',
        className
      )}
      {...rest}
    >
      {children}
    </header>
  );
}

export function Toolbar({
  dense,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { dense?: boolean; children?: ReactNode }) {
  return (
    <div className={cx('mx-auto flex w-full max-w-7xl items-center gap-3 px-4', dense ? 'min-h-12' : 'min-h-16', className)} {...rest}>
      {children}
    </div>
  );
}
