/**
 * Batch 3: navigation + utils + fix accordion + full index
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'packages', 'db-ui', 'src');
function w(rel, content) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content.trimStart());
  console.log('wrote', rel);
}

w('surfaces/Accordion.tsx', `
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
`);

w('navigation/Breadcrumbs.tsx', `
import type { ReactNode } from 'react';
import { cx } from '../utils/cx';

export function Breadcrumbs({
  separator = '/',
  children,
  className,
}: {
  separator?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const items = Array.isArray(children) ? children : children != null ? [children] : [];
  return (
    <nav aria-label="breadcrumb" className={cx('text-sm text-[var(--mui-text-secondary)]', className)}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
        {items.map((child, i) => (
          <li key={i} className="inline-flex items-center gap-2">
            {i > 0 && <span aria-hidden>{separator}</span>}
            {child}
          </li>
        ))}
      </ol>
    </nav>
  );
}
`);

w('navigation/Link.tsx', `
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  underline?: 'always' | 'hover' | 'none';
  color?: 'primary' | 'inherit' | 'secondary';
  children?: ReactNode;
};

export function Link({
  underline = 'hover',
  color = 'primary',
  className,
  children,
  ...rest
}: LinkProps) {
  return (
    <a
      className={cx(
        'cursor-pointer transition',
        color === 'primary' && 'text-[var(--mui-primary)]',
        color === 'secondary' && 'text-[var(--mui-text-secondary)]',
        underline === 'always' && 'underline',
        underline === 'hover' && 'hover:underline',
        underline === 'none' && 'no-underline',
        className
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
`);

w('navigation/Menu.tsx', `
import { useEffect, useRef, type ReactNode } from 'react';
import { Paper } from '../Paper';
import { cx } from '../utils/cx';

export function Menu({
  open,
  onClose,
  anchorEl,
  children,
  className,
}: {
  open: boolean;
  onClose?: () => void;
  anchorEl?: HTMLElement | null;
  children?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node) && e.target !== anchorEl) onClose?.();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onClose, anchorEl]);

  if (!open) return null;

  const rect = anchorEl?.getBoundingClientRect();
  const style = rect
    ? { top: rect.bottom + 4 + window.scrollY, left: rect.left + window.scrollX }
    : { top: 80, left: 24 };

  return (
    <div ref={ref} className={cx('absolute z-[100]', className)} style={style}>
      <Paper elevation={6} className="min-w-[180px] overflow-hidden py-1">
        {children}
      </Paper>
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  selected,
  dense,
  className,
}: {
  children?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  dense?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx(
        'flex w-full items-center px-4 text-left text-sm transition',
        dense ? 'py-1.5' : 'py-2.5',
        selected
          ? 'bg-[color-mix(in_srgb,var(--mui-primary)_14%,transparent)] text-[var(--mui-primary)]'
          : 'hover:bg-[color-mix(in_srgb,var(--mui-text)_6%,transparent)]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function MenuList({ children, className }: { children?: ReactNode; className?: string }) {
  return <div role="menu" className={className}>{children}</div>;
}
`);

w('navigation/Pagination.tsx', `
import { cx } from '../utils/cx';

export type PaginationProps = {
  count: number;
  page: number;
  onChange?: (page: number) => void;
  siblingCount?: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'standard';
};

export function Pagination({
  count,
  page,
  onChange,
  className,
  size = 'medium',
  color = 'primary',
}: PaginationProps) {
  const pages = Array.from({ length: count }, (_, i) => i + 1);
  const pad = size === 'small' ? 'h-8 w-8 text-xs' : size === 'large' ? 'h-11 w-11 text-base' : 'h-9 w-9 text-sm';

  return (
    <nav className={cx('inline-flex items-center gap-1', className)} aria-label="pagination">
      <button
        type="button"
        className={cx(pad, 'rounded-lg disabled:opacity-40')}
        disabled={page <= 1}
        onClick={() => onChange?.(page - 1)}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          className={cx(
            pad,
            'rounded-lg font-semibold transition',
            p === page
              ? color === 'primary'
                ? 'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)]'
                : 'bg-[color-mix(in_srgb,var(--mui-text)_12%,transparent)]'
              : 'hover:bg-[color-mix(in_srgb,var(--mui-text)_8%,transparent)]'
          )}
          onClick={() => onChange?.(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className={cx(pad, 'rounded-lg disabled:opacity-40')}
        disabled={page >= count}
        onClick={() => onChange?.(page + 1)}
      >
        ›
      </button>
    </nav>
  );
}
`);

w('navigation/Tabs.tsx', `
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
`);

w('navigation/Stepper.tsx', `
import type { ReactNode } from 'react';
import { cx } from '../utils/cx';

export function Stepper({
  activeStep = 0,
  alternativeLabel,
  children,
  className,
}: {
  activeStep?: number;
  alternativeLabel?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const steps = Array.isArray(children) ? children : children != null ? [children] : [];
  return (
    <div className={cx('flex w-full', alternativeLabel ? 'justify-between' : 'items-center gap-2', className)}>
      {steps.map((child, i) => (
        <div key={i} className={cx('flex items-center gap-2', alternativeLabel && 'flex-1 flex-col text-center')}>
          <div
            className={cx(
              'grid h-8 w-8 place-items-center rounded-full text-sm font-bold',
              i <= activeStep
                ? 'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)]'
                : 'bg-[var(--mui-divider)] text-[var(--mui-text-secondary)]'
            )}
          >
            {i + 1}
          </div>
          <div className="text-sm">{child}</div>
          {!alternativeLabel && i < steps.length - 1 && (
            <div className="mx-2 h-px flex-1 bg-[var(--mui-divider)]" />
          )}
        </div>
      ))}
    </div>
  );
}

export function Step({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function StepLabel({ children }: { children?: ReactNode }) {
  return <span className="font-medium text-[var(--mui-text)]">{children}</span>;
}

export function StepContent({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cx('ml-4 border-l border-[var(--mui-divider)] py-2 pl-4 text-sm', className)}>{children}</div>;
}
`);

w('navigation/BottomNavigation.tsx', `
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
`);

w('navigation/SpeedDial.tsx', `
import { useState, type ReactNode } from 'react';
import { Fab } from '../inputs/Fab';
import { cx } from '../utils/cx';

export function SpeedDial({
  ariaLabel,
  icon = '+',
  openIcon = '×',
  children,
  className,
}: {
  ariaLabel: string;
  icon?: ReactNode;
  openIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cx('fixed bottom-6 right-6 z-40 flex flex-col-reverse items-center gap-3', className)}>
      <Fab aria-label={ariaLabel} onClick={() => setOpen((v) => !v)}>
        {open ? openIcon : icon}
      </Fab>
      {open && <div className="flex flex-col-reverse items-center gap-2">{children}</div>}
    </div>
  );
}

export function SpeedDialAction({
  icon,
  tooltipTitle,
  onClick,
}: {
  icon: ReactNode;
  tooltipTitle?: string;
  onClick?: () => void;
}) {
  return (
    <Fab size="small" color="default" title={tooltipTitle} onClick={onClick}>
      {icon}
    </Fab>
  );
}
`);

w('utils/Modal.tsx', `
import { useEffect, type ReactNode } from 'react';
import { Backdrop } from '../feedback/Backdrop';
import { cx } from '../utils/cx';

export function Modal({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <Backdrop open onClick={onClose}>
      <div
        role="presentation"
        className={cx('relative z-[1]', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </Backdrop>
  );
}
`);

w('utils/Popover.tsx', `
import type { ReactNode } from 'react';
import { Paper } from '../Paper';
import { cx } from '../utils/cx';

export function Popover({
  open,
  onClose,
  anchorEl,
  children,
  className,
}: {
  open: boolean;
  onClose?: () => void;
  anchorEl?: HTMLElement | null;
  children?: ReactNode;
  className?: string;
}) {
  if (!open) return null;
  const rect = anchorEl?.getBoundingClientRect();
  return (
    <>
      <button type="button" aria-label="Close popover" className="fixed inset-0 z-[90] cursor-default" onClick={onClose} />
      <div
        className={cx('absolute z-[100]', className)}
        style={
          rect
            ? { top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX }
            : { top: 100, left: 100 }
        }
      >
        <Paper elevation={8} className="p-3">
          {children}
        </Paper>
      </div>
    </>
  );
}
`);

w('utils/Collapse.tsx', `
import type { ReactNode } from 'react';
import { cx } from '../utils/cx';

export function Collapse({
  in: inProp,
  children,
  className,
}: {
  in: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'grid transition-[grid-template-rows] duration-200 ease-out',
        inProp ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
`);

w('utils/ClickAwayListener.tsx', `
import { useEffect, useRef, type ReactNode } from 'react';

export function ClickAwayListener({
  onClickAway,
  children,
}: {
  onClickAway: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClickAway();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClickAway]);
  return <div ref={ref}>{children}</div>;
}
`);

console.log('batch3 done');
