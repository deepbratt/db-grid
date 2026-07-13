import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './utils/cx';

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled';
};

export function TextField({
  label,
  helperText,
  error,
  fullWidth,
  size = 'medium',
  variant = 'outlined',
  className,
  id,
  disabled,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      className={cx('flex flex-col gap-1.5 text-left', fullWidth && 'w-full', className)}
      htmlFor={inputId}
    >
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
      <input
        id={inputId}
        disabled={disabled}
        className={cx(
          'w-full rounded-lg border text-[var(--mui-text)] transition',
          'placeholder:text-[var(--mui-text-secondary)]/70',
          'focus:outline-none focus:ring-2 focus:ring-[var(--mui-primary)]/35 focus:border-[var(--mui-primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          size === 'small' ? 'h-9 px-3 text-sm' : 'h-11 px-3.5 text-sm',
          variant === 'filled'
            ? 'border-transparent bg-[color-mix(in_srgb,var(--mui-text)_6%,var(--mui-paper))]'
            : 'border-[var(--mui-divider)] bg-[var(--mui-paper)]',
          error && 'border-[var(--mui-error)] focus:ring-[var(--mui-error)]/30 focus:border-[var(--mui-error)]'
        )}
        {...rest}
      />
      {helperText != null && (
        <span
          className={cx(
            'text-xs',
            error ? 'text-[var(--mui-error)]' : 'text-[var(--mui-text-secondary)]'
          )}
        >
          {helperText}
        </span>
      )}
    </label>
  );
}
