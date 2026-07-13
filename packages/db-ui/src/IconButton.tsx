import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './utils/cx';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'small' | 'medium' | 'large';
  color?: 'default' | 'primary' | 'error';
  children: ReactNode;
};

const sizes = {
  small: 'h-8 w-8 text-sm',
  medium: 'h-10 w-10 text-base',
  large: 'h-12 w-12 text-lg',
};

const colors = {
  default: 'text-[var(--mui-text-secondary)] hover:bg-[color-mix(in_srgb,var(--mui-text)_8%,transparent)]',
  primary: 'text-[var(--mui-primary)] hover:bg-[color-mix(in_srgb,var(--mui-primary)_12%,transparent)]',
  error: 'text-[var(--mui-error)] hover:bg-[color-mix(in_srgb,var(--mui-error)_12%,transparent)]',
};

export function IconButton({
  size = 'medium',
  color = 'default',
  className,
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center rounded-full transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mui-primary)]',
        'disabled:opacity-40 disabled:pointer-events-none',
        sizes[size],
        colors[color],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
