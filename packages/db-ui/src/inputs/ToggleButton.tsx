import { createContext, useContext, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';

type ToggleCtx = {
  value?: string | string[];
  exclusive?: boolean;
  onChange?: (value: string | string[] | null) => void;
};

const Ctx = createContext<ToggleCtx>({});

export function ToggleButtonGroup({
  value,
  exclusive,
  onChange,
  children,
  className,
}: {
  value?: string | string[];
  exclusive?: boolean;
  onChange?: (value: string | string[] | null) => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Ctx.Provider value={{ value, exclusive, onChange }}>
      <div role="group" className={cx('inline-flex overflow-hidden rounded-lg border border-[var(--mui-divider)]', className)}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export type ToggleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  children?: ReactNode;
};

export function ToggleButton({ value, className, children, ...rest }: ToggleButtonProps) {
  const ctx = useContext(Ctx);
  const selected = Array.isArray(ctx.value) ? ctx.value.includes(value) : ctx.value === value;

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        'px-3 py-2 text-sm font-semibold transition border-r border-[var(--mui-divider)] last:border-r-0',
        selected
          ? 'bg-[color-mix(in_srgb,var(--mui-primary)_18%,transparent)] text-[var(--mui-primary)]'
          : 'bg-[var(--mui-paper)] text-[var(--mui-text)] hover:bg-[color-mix(in_srgb,var(--mui-text)_6%,transparent)]',
        className
      )}
      onClick={(e) => {
        rest.onClick?.(e);
        if (!ctx.onChange) return;
        if (ctx.exclusive) {
          ctx.onChange(selected ? null : value);
        } else {
          const cur = Array.isArray(ctx.value) ? ctx.value : ctx.value ? [ctx.value] : [];
          ctx.onChange(selected ? cur.filter((v) => v !== value) : [...cur, value]);
        }
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
