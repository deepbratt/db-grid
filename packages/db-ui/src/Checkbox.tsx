import type { InputHTMLAttributes } from 'react';
import { cx } from './utils/cx';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
};

export function Checkbox({ label, className, disabled, ...rest }: CheckboxProps) {
  return (
    <label
      className={cx(
        'inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-[var(--mui-text)]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input
        type="checkbox"
        disabled={disabled}
        className="h-4 w-4 accent-[var(--mui-primary)] rounded border-[var(--mui-divider)]"
        {...rest}
      />
      {label}
    </label>
  );
}
