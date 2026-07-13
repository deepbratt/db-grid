import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type FabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: 'primary' | 'secondary' | 'default';
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'extended';
  children?: ReactNode;
};

const sizes = {
  small: 'h-10 min-w-10 px-0 text-sm',
  medium: 'h-14 min-w-14 px-0 text-base',
  large: 'h-16 min-w-16 px-0 text-lg',
};

export function Fab({
  color = 'primary',
  size = 'medium',
  variant = 'circular',
  className,
  children,
  type = 'button',
  ...rest
}: FabProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 font-semibold shadow-lg transition hover:brightness-110',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mui-primary)]',
        variant === 'circular' ? 'rounded-full' : 'rounded-full px-5',
        variant === 'extended' && size === 'medium' && 'h-12 min-w-[auto] px-5',
        sizes[size],
        color === 'primary' && 'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)]',
        color === 'secondary' && 'bg-[var(--mui-secondary)] text-white',
        color === 'default' && 'bg-[var(--mui-paper)] text-[var(--mui-text)] border border-[var(--mui-divider)]',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
