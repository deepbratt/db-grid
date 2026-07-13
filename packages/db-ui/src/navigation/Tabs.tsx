import { createContext, useContext, type ReactNode } from 'react';
import { cx } from '../utils/cx';

const TabsCtx = createContext<{ value: string; onChange?: (v: string) => void }>({ value: '' });

export function Tabs({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange?: (value: string) => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <TabsCtx.Provider value={{ value, onChange }}>
      <div role="tablist" className={cx('flex gap-1 border-b border-[var(--mui-divider)]', className)}>
        {children}
      </div>
    </TabsCtx.Provider>
  );
}

export function Tab({
  value,
  label,
  disabled,
  className,
}: {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const ctx = useContext(TabsCtx);
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      className={cx(
        '-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition',
        selected
          ? 'border-[var(--mui-primary)] text-[var(--mui-primary)]'
          : 'border-transparent text-[var(--mui-text-secondary)] hover:text-[var(--mui-text)]',
        disabled && 'opacity-40',
        className
      )}
      onClick={() => ctx.onChange?.(value)}
    >
      {label}
    </button>
  );
}

export function TabPanel({
  value,
  current,
  children,
  className,
}: {
  value: string;
  current: string;
  children?: ReactNode;
  className?: string;
}) {
  if (value !== current) return null;
  return (
    <div role="tabpanel" className={cx('py-4', className)}>
      {children}
    </div>
  );
}
