import type { InputHTMLAttributes } from 'react';
import { cx } from './utils/cx';

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: string;
};

export function Switch({ label, className, checked, disabled, ...rest }: SwitchProps) {
  return (
    <label
      className={cx(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span className="relative inline-flex h-6 w-11 items-center">
        <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} {...rest} />
        <span className="absolute inset-0 rounded-full bg-[var(--mui-divider)] transition peer-checked:bg-[var(--mui-primary)]" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
      {label != null && <span className="text-sm text-[var(--mui-text)]">{label}</span>}
    </label>
  );
}
