import type { HTMLAttributes } from 'react';
import { cx } from '../utils/cx';

export function CircularProgress({
  size = 40,
  thickness = 4,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { size?: number; thickness?: number }) {
  return (
    <div
      role="progressbar"
      className={cx('inline-block animate-spin rounded-full border-solid border-[var(--mui-divider)] border-t-[var(--mui-primary)]', className)}
      style={{ width: size, height: size, borderWidth: thickness }}
      {...rest}
    />
  );
}

export function LinearProgress({
  value,
  variant = 'indeterminate',
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { value?: number; variant?: 'determinate' | 'indeterminate' }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      role="progressbar"
      aria-valuenow={variant === 'determinate' ? pct : undefined}
      className={cx('relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--mui-divider)]', className)}
      {...rest}
    >
      <div
        className={cx(
          'absolute inset-y-0 left-0 rounded-full bg-[var(--mui-primary)]',
          variant === 'indeterminate' && 'w-1/3 animate-pulse'
        )}
        style={variant === 'determinate' ? { width: `${pct}%` } : undefined}
      />
    </div>
  );
}
