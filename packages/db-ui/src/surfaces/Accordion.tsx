import { createContext, useContext, useState, type ReactNode } from 'react';
import { cx } from '../utils/cx';

const AccCtx = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: false,
  setOpen: () => undefined,
});

export function Accordion({
  defaultExpanded,
  disabled,
  className,
  children,
}: {
  defaultExpanded?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultExpanded);
  return (
    <div
      className={cx(
        'border-b border-[var(--mui-divider)] bg-[var(--mui-paper)]',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      <AccCtx.Provider value={{ open, setOpen }}>{children}</AccCtx.Provider>
    </div>
  );
}

export function AccordionSummary({ children, className }: { children?: ReactNode; className?: string }) {
  const { open, setOpen } = useContext(AccCtx);
  return (
    <button
      type="button"
      className={cx(
        'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold',
        className
      )}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
    >
      <span>{children}</span>
      <span className={cx('transition', open && 'rotate-180')}>▾</span>
    </button>
  );
}

export function AccordionDetails({ children, className }: { children?: ReactNode; className?: string }) {
  const { open } = useContext(AccCtx);
  if (!open) return null;
  return <div className={cx('px-4 pb-4 text-sm text-[var(--mui-text-secondary)]', className)}>{children}</div>;
}
