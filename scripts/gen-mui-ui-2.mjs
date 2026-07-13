/**
 * Batch 2: data-display, feedback, surfaces, navigation, utils
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

w('data-display/Avatar.tsx', `
import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  src?: string;
  alt?: string;
  children?: ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'rounded' | 'square';
};

const sizes = { small: 'h-8 w-8 text-xs', medium: 'h-10 w-10 text-sm', large: 'h-14 w-14 text-lg' };

export function Avatar({ src, alt, children, size = 'medium', variant = 'circular', className, ...rest }: AvatarProps) {
  return (
    <div
      className={cx(
        'inline-flex items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--mui-primary)_20%,transparent)] text-[var(--mui-primary)] font-semibold',
        sizes[size],
        variant === 'circular' && 'rounded-full',
        variant === 'rounded' && 'rounded-xl',
        variant === 'square' && 'rounded-none',
        className
      )}
      {...rest}
    >
      {src ? <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" /> : children}
    </div>
  );
}

export function AvatarGroup({ max = 3, children, className }: { max?: number; children: ReactNode; className?: string }) {
  const items = Array.isArray(children) ? children : [children];
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <div className={cx('flex -space-x-2', className)}>
      {shown}
      {extra > 0 && <Avatar size="small">+{extra}</Avatar>}
    </div>
  );
}

export type AvatarImgProps = ImgHTMLAttributes<HTMLImageElement>;
`);

w('data-display/Badge.tsx', `
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  badgeContent?: ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | 'default';
  variant?: 'standard' | 'dot';
  invisible?: boolean;
  max?: number;
  children?: ReactNode;
};

const colors = {
  primary: 'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)]',
  secondary: 'bg-[var(--mui-secondary)] text-white',
  error: 'bg-[var(--mui-error)] text-white',
  success: 'bg-[var(--mui-success)] text-white',
  warning: 'bg-[var(--mui-warning)] text-white',
  info: 'bg-[var(--mui-info)] text-white',
  default: 'bg-[var(--mui-text-secondary)] text-white',
};

export function Badge({
  badgeContent,
  color = 'error',
  variant = 'standard',
  invisible,
  max = 99,
  children,
  className,
  ...rest
}: BadgeProps) {
  const content =
    typeof badgeContent === 'number' && badgeContent > max ? \`\${max}+\` : badgeContent;
  const show = !invisible && (variant === 'dot' || content != null && content !== '');

  return (
    <span className={cx('relative inline-flex', className)} {...rest}>
      {children}
      {show && (
        <span
          className={cx(
            'absolute -right-1 -top-1 z-10 flex items-center justify-center rounded-full',
            colors[color],
            variant === 'dot' ? 'h-2.5 w-2.5' : 'min-h-5 min-w-5 px-1 text-[0.65rem] font-bold'
          )}
        >
          {variant === 'standard' ? content : null}
        </span>
      )}
    </span>
  );
}
`);

w('data-display/Tooltip.tsx', `
import { useState, type ReactNode } from 'react';
import { cx } from '../utils/cx';

export type TooltipProps = {
  title: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  className?: string;
};

export function Tooltip({ title, placement = 'top', children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const pos =
    placement === 'top'
      ? 'bottom-full left-1/2 mb-2 -translate-x-1/2'
      : placement === 'bottom'
        ? 'top-full left-1/2 mt-2 -translate-x-1/2'
        : placement === 'left'
          ? 'right-full top-1/2 mr-2 -translate-y-1/2'
          : 'left-full top-1/2 ml-2 -translate-y-1/2';

  return (
    <span
      className={cx('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && title != null && title !== '' && (
        <span
          role="tooltip"
          className={cx(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-[#1b3a4b] px-2 py-1 text-xs text-white shadow-lg',
            pos
          )}
        >
          {title}
        </span>
      )}
    </span>
  );
}
`);

w('data-display/List.tsx', `
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export function List({ dense, className, children, ...rest }: HTMLAttributes<HTMLUListElement> & { dense?: boolean; children?: ReactNode }) {
  return (
    <ul className={cx('m-0 list-none p-0', dense ? 'py-1' : 'py-2', className)} {...rest}>
      {children}
    </ul>
  );
}

export function ListSubheader({ className, children, ...rest }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cx('px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--mui-text-secondary)]', className)} {...rest}>
      {children}
    </li>
  );
}

export function ListItem({ className, children, ...rest }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cx('flex items-center gap-3 px-4 py-2', className)} {...rest}>
      {children}
    </li>
  );
}

export function ListItemButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cx(
        'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition',
        'hover:bg-[color-mix(in_srgb,var(--mui-primary)_10%,transparent)]',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ListItemIcon({ className, children }: { className?: string; children?: ReactNode }) {
  return <span className={cx('inline-flex w-8 shrink-0 text-[var(--mui-text-secondary)]', className)}>{children}</span>;
}

export function ListItemAvatar({ className, children }: { className?: string; children?: ReactNode }) {
  return <span className={cx('shrink-0', className)}>{children}</span>;
}

export function ListItemText({
  primary,
  secondary,
  className,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx('min-w-0 flex-1', className)}>
      <span className="block text-sm font-medium text-[var(--mui-text)]">{primary}</span>
      {secondary != null && <span className="block text-xs text-[var(--mui-text-secondary)]">{secondary}</span>}
    </span>
  );
}
`);

w('data-display/Table.tsx', `
import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cx } from '../utils/cx';

export function TableContainer({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('w-full overflow-auto rounded-xl border border-[var(--mui-divider)]', className)} {...rest}>
      {children}
    </div>
  );
}

export function Table({ className, children, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table className={cx('w-full border-collapse text-sm', className)} {...rest}>
      {children}
    </table>
  );
}

export function TableHead({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cx('bg-[color-mix(in_srgb,var(--mui-text)_4%,var(--mui-paper))]', className)} {...rest}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...rest}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, hover, selected, children, ...rest }: HTMLAttributes<HTMLTableRowElement> & { hover?: boolean; selected?: boolean }) {
  return (
    <tr
      className={cx(
        'border-b border-[var(--mui-divider)]',
        hover && 'hover:bg-[color-mix(in_srgb,var(--mui-primary)_6%,transparent)]',
        selected && 'bg-[color-mix(in_srgb,var(--mui-primary)_12%,transparent)]',
        className
      )}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  align = 'left',
  className,
  children,
  ...rest
}: (TdHTMLAttributes<HTMLTableCellElement> | ThHTMLAttributes<HTMLTableCellElement>) & {
  align?: 'left' | 'center' | 'right';
  children?: ReactNode;
}) {
  return (
    <td
      className={cx(
        'px-3 py-2.5 text-[var(--mui-text)]',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      {...(rest as TdHTMLAttributes<HTMLTableCellElement>)}
    >
      {children}
    </td>
  );
}

export function TablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25],
  className,
}: {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (n: number) => void;
  rowsPerPageOptions?: number[];
  className?: string;
}) {
  const from = count === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min(count, (page + 1) * rowsPerPage);
  const last = Math.max(0, Math.ceil(count / rowsPerPage) - 1);
  return (
    <div className={cx('flex flex-wrap items-center justify-end gap-3 px-3 py-2 text-sm text-[var(--mui-text-secondary)]', className)}>
      <label className="inline-flex items-center gap-2">
        Rows
        <select
          className="rounded-md border border-[var(--mui-divider)] bg-[var(--mui-paper)] px-2 py-1"
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
        >
          {rowsPerPageOptions.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      <span>{from}–{to} of {count}</span>
      <button type="button" className="px-2 disabled:opacity-40" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>‹</button>
      <button type="button" className="px-2 disabled:opacity-40" disabled={page >= last} onClick={() => onPageChange(page + 1)}>›</button>
    </div>
  );
}
`);

w('data-display/Skeleton.tsx', `
import type { HTMLAttributes } from 'react';
import { cx } from '../utils/cx';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
};

export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className,
  style,
  ...rest
}: SkeletonProps) {
  return (
    <div
      className={cx(
        'bg-[color-mix(in_srgb,var(--mui-text)_12%,transparent)]',
        animation === 'pulse' && 'animate-pulse',
        variant === 'text' && 'my-1 h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-none',
        variant === 'rounded' && 'rounded-xl',
        className
      )}
      style={{ width, height: height ?? (variant === 'text' ? undefined : 40), ...style }}
      {...rest}
    />
  );
}
`);

w('feedback/Progress.tsx', `
import type { HTMLAttributes } from 'react';
import { cx } from '../utils/cx';

export function CircularProgress({
  size = 40,
  thickness = 4,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { size?: number; thickness?: number }) {
  return (
    <div
      role="progressbar"
      className={cx('inline-block animate-spin rounded-full border-solid border-[var(--mui-divider)] border-t-[var(--mui-primary)]', className)}
      style={{ width: size, height: size, borderWidth: thickness }}
      {...rest}
    />
  );
}

export function LinearProgress({
  value,
  variant = 'indeterminate',
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { value?: number; variant?: 'determinate' | 'indeterminate' }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      role="progressbar"
      aria-valuenow={variant === 'determinate' ? pct : undefined}
      className={cx('relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--mui-divider)]', className)}
      {...rest}
    >
      <div
        className={cx(
          'absolute inset-y-0 left-0 rounded-full bg-[var(--mui-primary)]',
          variant === 'indeterminate' && 'w-1/3 animate-pulse'
        )}
        style={variant === 'determinate' ? { width: \`\${pct}%\` } : undefined}
      />
    </div>
  );
}
`);

w('feedback/Backdrop.tsx', `
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type BackdropProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  children?: ReactNode;
  invisible?: boolean;
};

export function Backdrop({ open, invisible, className, children, ...rest }: BackdropProps) {
  if (!open) return null;
  return (
    <div
      className={cx(
        'fixed inset-0 z-[90] flex items-center justify-center',
        invisible ? 'bg-transparent' : 'bg-black/45 backdrop-blur-[1px]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
`);

w('feedback/Snackbar.tsx', `
import { useEffect, type ReactNode } from 'react';
import { Alert } from '../Alert';
import { cx } from '../utils/cx';

export type SnackbarProps = {
  open: boolean;
  onClose?: () => void;
  autoHideDuration?: number;
  message?: ReactNode;
  severity?: 'success' | 'info' | 'warning' | 'error';
  anchorOrigin?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' };
  children?: ReactNode;
  className?: string;
};

export function Snackbar({
  open,
  onClose,
  autoHideDuration = 4000,
  message,
  severity = 'info',
  anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
  children,
  className,
}: SnackbarProps) {
  useEffect(() => {
    if (!open || !autoHideDuration) return;
    const t = window.setTimeout(() => onClose?.(), autoHideDuration);
    return () => window.clearTimeout(t);
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  const pos = cx(
    'fixed z-[110]',
    anchorOrigin.vertical === 'top' ? 'top-4' : 'bottom-4',
    anchorOrigin.horizontal === 'left' && 'left-4',
    anchorOrigin.horizontal === 'right' && 'right-4',
    anchorOrigin.horizontal === 'center' && 'left-1/2 -translate-x-1/2'
  );

  return (
    <div className={cx(pos, 'min-w-[280px] max-w-md', className)}>
      {children ?? <Alert severity={severity}>{message}</Alert>}
    </div>
  );
}
`);

w('surfaces/Accordion.tsx', `
import { useState, type ReactNode } from 'react';
import { cx } from '../utils/cx';

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
      data-open={open ? 'true' : 'false'}
      className={cx(
        'border-b border-[var(--mui-divider)] bg-[var(--mui-paper)]',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {/* clone-like: children read open via CSS data attr + AccordionSummary callback */}
      <AccordionContext open={open} setOpen={setOpen}>
        {children}
      </AccordionContext>
    </div>
  );
}

import { createContext, useContext } from 'react';
const AccCtx = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });
function AccordionContext({ open, setOpen, children }: { open: boolean; setOpen: (v: boolean) => void; children?: ReactNode }) {
  return <AccCtx.Provider value={{ open, setOpen }}>{children}</AccCtx.Provider>;
}

export function AccordionSummary({ children, className }: { children?: ReactNode; className?: string }) {
  const { open, setOpen } = useContext(AccCtx);
  return (
    <button
      type="button"
      className={cx('flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold', className)}
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

w('surfaces/AppBar.tsx', `
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type AppBarProps = HTMLAttributes<HTMLElement> & {
  position?: 'fixed' | 'sticky' | 'static' | 'absolute' | 'relative';
  color?: 'primary' | 'secondary' | 'transparent' | 'default';
  children?: ReactNode;
};

export function AppBar({
  position = 'sticky',
  color = 'primary',
  className,
  children,
  ...rest
}: AppBarProps) {
  return (
    <header
      className={cx(
        'z-40 w-full',
        position === 'fixed' && 'fixed inset-x-0 top-0',
        position === 'sticky' && 'sticky top-0',
        position === 'absolute' && 'absolute inset-x-0 top-0',
        color === 'primary' && 'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)]',
        color === 'secondary' && 'bg-[var(--mui-secondary)] text-white',
        color === 'default' && 'bg-[var(--mui-paper)] text-[var(--mui-text)] border-b border-[var(--mui-divider)]',
        color === 'transparent' && 'bg-transparent',
        className
      )}
      {...rest}
    >
      {children}
    </header>
  );
}

export function Toolbar({
  dense,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { dense?: boolean; children?: ReactNode }) {
  return (
    <div className={cx('mx-auto flex w-full max-w-7xl items-center gap-3 px-4', dense ? 'min-h-12' : 'min-h-16', className)} {...rest}>
      {children}
    </div>
  );
}
`);

w('surfaces/Drawer.tsx', `
import type { ReactNode } from 'react';
import { Backdrop } from '../feedback/Backdrop';
import { cx } from '../utils/cx';

export type DrawerProps = {
  open: boolean;
  onClose?: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  variant?: 'temporary' | 'permanent';
  children?: ReactNode;
  className?: string;
};

export function Drawer({
  open,
  onClose,
  anchor = 'left',
  variant = 'temporary',
  children,
  className,
}: DrawerProps) {
  const panel =
    anchor === 'left'
      ? 'left-0 top-0 h-full w-80 translate-x-0'
      : anchor === 'right'
        ? 'right-0 top-0 h-full w-80'
        : anchor === 'top'
          ? 'left-0 top-0 w-full'
          : 'left-0 bottom-0 w-full';

  if (variant === 'permanent') {
    return <aside className={cx('h-full w-72 border-r border-[var(--mui-divider)] bg-[var(--mui-paper)]', className)}>{children}</aside>;
  }

  return (
    <>
      <Backdrop open={open} onClick={onClose} />
      <aside
        className={cx(
          'fixed z-[95] bg-[var(--mui-paper)] text-[var(--mui-text)] shadow-2xl transition-transform',
          panel,
          !open && (anchor === 'left' ? '-translate-x-full' : anchor === 'right' ? 'translate-x-full' : anchor === 'top' ? '-translate-y-full' : 'translate-y-full'),
          className
        )}
      >
        {children}
      </aside>
    </>
  );
}
`);

console.log('batch2a done');
