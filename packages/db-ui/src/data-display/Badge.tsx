import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  badgeContent?: ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | 'default';
  variant?: 'standard' | 'dot';
  invisible?: boolean;
  max?: number;
  children?: ReactNode;
};

const colors = {
  primary: 'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)]',
  secondary: 'bg-[var(--mui-secondary)] text-white',
  error: 'bg-[var(--mui-error)] text-white',
  success: 'bg-[var(--mui-success)] text-white',
  warning: 'bg-[var(--mui-warning)] text-white',
  info: 'bg-[var(--mui-info)] text-white',
  default: 'bg-[var(--mui-text-secondary)] text-white',
};

export function Badge({
  badgeContent,
  color = 'error',
  variant = 'standard',
  invisible,
  max = 99,
  children,
  className,
  ...rest
}: BadgeProps) {
  const content =
    typeof badgeContent === 'number' && badgeContent > max ? `${max}+` : badgeContent;
  const show = !invisible && (variant === 'dot' || content != null && content !== '');

  return (
    <span className={cx('relative inline-flex', className)} {...rest}>
      {children}
      {show && (
        <span
          className={cx(
            'absolute -right-1 -top-1 z-10 flex items-center justify-center rounded-full',
            colors[color],
            variant === 'dot' ? 'h-2.5 w-2.5' : 'min-h-5 min-w-5 px-1 text-[0.65rem] font-bold'
          )}
        >
          {variant === 'standard' ? content : null}
        </span>
      )}
    </span>
  );
}
