import { createContext, useContext, type ReactNode } from 'react';
import { cx } from '../utils/cx';

const Ctx = createContext<{ value?: string; onChange?: (v: string) => void }>({});

export function BottomNavigation({
  value,
  onChange,
  showLabels,
  children,
  className,
}: {
  value?: string;
  onChange?: (value: string) => void;
  showLabels?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Ctx.Provider value={{ value, onChange }}>
      <nav
        data-show-labels={showLabels ? 'true' : 'false'}
        className={cx(
          'flex w-full items-stretch justify-around border-t border-[var(--mui-divider)] bg-[var(--mui-paper)]',
          className
        )}
      >
        {children}
      </nav>
    </Ctx.Provider>
  );
}

export function BottomNavigationAction({
  value,
  label,
  icon,
  className,
}: {
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  const ctx = useContext(Ctx);
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      className={cx(
        'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-semibold transition',
        selected ? 'text-[var(--mui-primary)]' : 'text-[var(--mui-text-secondary)]',
        className
      )}
      onClick={() => ctx.onChange?.(value)}
    >
      <span className="text-lg">{icon}</span>
      {label != null && <span>{label}</span>}
    </button>
  );
}
