import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils/cx';

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  severity?: 'success' | 'info' | 'warning' | 'error';
  children?: ReactNode;
};

const styles: Record<NonNullable<AlertProps['severity']>, string> = {
  success:
    'bg-[color-mix(in_srgb,var(--mui-success)_14%,var(--mui-paper))] text-[var(--mui-success)] border-[color-mix(in_srgb,var(--mui-success)_35%,transparent)]',
  info: 'bg-[color-mix(in_srgb,var(--mui-info)_14%,var(--mui-paper))] text-[var(--mui-info)] border-[color-mix(in_srgb,var(--mui-info)_35%,transparent)]',
  warning:
    'bg-[color-mix(in_srgb,var(--mui-warning)_14%,var(--mui-paper))] text-[var(--mui-warning)] border-[color-mix(in_srgb,var(--mui-warning)_35%,transparent)]',
  error:
    'bg-[color-mix(in_srgb,var(--mui-error)_14%,var(--mui-paper))] text-[var(--mui-error)] border-[color-mix(in_srgb,var(--mui-error)_35%,transparent)]',
};

export function Alert({ severity = 'info', className, children, ...rest }: AlertProps) {
  return (
    <div
      role="alert"
      className={cx('rounded-xl border px-4 py-3 text-sm font-medium', styles[severity], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
