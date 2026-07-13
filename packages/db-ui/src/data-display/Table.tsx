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
