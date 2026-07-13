import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils/cx';

export type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  label: ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  onDelete?: () => void;
};

const filled: Record<NonNullable<ChipProps['color']>, string> = {
  default: 'bg-[color-mix(in_srgb,var(--mui-text)_10%,transparent)] text-[var(--mui-text)]',
  primary: 'bg-[color-mix(in_srgb,var(--mui-primary)_18%,transparent)] text-[var(--mui-primary)]',
  secondary: 'bg-[color-mix(in_srgb,var(--mui-secondary)_18%,transparent)] text-[var(--mui-secondary)]',
  success: 'bg-[color-mix(in_srgb,var(--mui-success)_18%,transparent)] text-[var(--mui-success)]',
  warning: 'bg-[color-mix(in_srgb,var(--mui-warning)_18%,transparent)] text-[var(--mui-warning)]',
  error: 'bg-[color-mix(in_srgb,var(--mui-error)_18%,transparent)] text-[var(--mui-error)]',
  info: 'bg-[color-mix(in_srgb,var(--mui-info)_18%,transparent)] text-[var(--mui-info)]',
};

const outlined: Record<NonNullable<ChipProps['color']>, string> = {
  default: 'border border-[var(--mui-divider)] text-[var(--mui-text)]',
  primary: 'border border-[var(--mui-primary)] text-[var(--mui-primary)]',
  secondary: 'border border-[var(--mui-secondary)] text-[var(--mui-secondary)]',
  success: 'border border-[var(--mui-success)] text-[var(--mui-success)]',
  warning: 'border border-[var(--mui-warning)] text-[var(--mui-warning)]',
  error: 'border border-[var(--mui-error)] text-[var(--mui-error)]',
  info: 'border border-[var(--mui-info)] text-[var(--mui-info)]',
};

export function Chip({
  label,
  color = 'default',
  variant = 'filled',
  size = 'medium',
  onDelete,
  className,
  ...rest
}: ChipProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 font-semibold',
        size === 'small' ? 'h-6 px-2 text-[0.7rem] rounded-md' : 'h-7 px-2.5 text-xs rounded-lg',
        variant === 'filled' ? filled[color] : outlined[color],
        className
      )}
      {...rest}
    >
      {label}
      {onDelete && (
        <button
          type="button"
          aria-label="Delete"
          className="ml-0.5 rounded-full px-1 hover:bg-black/10"
          onClick={onDelete}
        >
          ×
        </button>
      )}
    </span>
  );
}
