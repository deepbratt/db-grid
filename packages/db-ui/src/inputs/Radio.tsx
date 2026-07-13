import { createContext, useContext, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';

const RadioCtx = createContext<{ name?: string; value?: string; onChange?: (v: string) => void }>({});

export function RadioGroup({
  name,
  value,
  onChange,
  row,
  children,
  className,
}: {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  row?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <RadioCtx.Provider value={{ name, value, onChange }}>
      <div role="radiogroup" className={cx('flex gap-3', row ? 'flex-row flex-wrap' : 'flex-col', className)}>
        {children}
      </div>
    </RadioCtx.Provider>
  );
}

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  label?: ReactNode;
  value: string;
};

export function Radio({ label, value, className, disabled, ...rest }: RadioProps) {
  const ctx = useContext(RadioCtx);
  const checked = ctx.value != null ? ctx.value === value : rest.checked;
  return (
    <label className={cx('inline-flex items-center gap-2 text-sm cursor-pointer', disabled && 'opacity-50', className)}>
      <input
        type="radio"
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={disabled}
        className="accent-[var(--mui-primary)]"
        onChange={() => ctx.onChange?.(value)}
        {...rest}
      />
      {label}
    </label>
  );
}
