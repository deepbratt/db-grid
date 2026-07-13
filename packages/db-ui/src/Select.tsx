import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from './utils/cx';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
};

export function Select({
  label,
  helperText,
  error,
  fullWidth,
  options,
  className,
  id,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <label className={cx('flex flex-col gap-1.5', fullWidth && 'w-full', className)} htmlFor={selectId}>
      {label != null && (
        <span
          className={cx(
            'text-xs font-semibold tracking-wide',
            error ? 'text-[var(--mui-error)]' : 'text-[var(--mui-text-secondary)]'
          )}
        >
          {label}
        </span>
      )}
      <select
        id={selectId}
        className={cx(
          'h-11 w-full rounded-lg border border-[var(--mui-divider)] bg-[var(--mui-paper)] px-3.5 text-sm text-[var(--mui-text)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--mui-primary)]/35 focus:border-[var(--mui-primary)]',
          error && 'border-[var(--mui-error)]'
        )}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText != null && (
        <span className={cx('text-xs', error ? 'text-[var(--mui-error)]' : 'text-[var(--mui-text-secondary)]')}>
          {helperText}
        </span>
      )}
    </label>
  );
}
