import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export function FormControl({
  fullWidth,
  error,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { fullWidth?: boolean; error?: boolean; children?: ReactNode }) {
  return (
    <div
      className={cx('flex flex-col gap-1.5', fullWidth && 'w-full', error && 'text-[var(--mui-error)]', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function FormLabel({ className, children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cx('text-xs font-semibold tracking-wide text-[var(--mui-text-secondary)]', className)} {...rest}>
      {children}
    </label>
  );
}

export function FormHelperText({
  error,
  className,
  children,
}: {
  error?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <p className={cx('m-0 text-xs', error ? 'text-[var(--mui-error)]' : 'text-[var(--mui-text-secondary)]', className)}>
      {children}
    </p>
  );
}

export function FormGroup({
  row,
  className,
  children,
}: {
  row?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return <div className={cx('flex gap-2', row ? 'flex-row flex-wrap' : 'flex-col', className)}>{children}</div>;
}

export function FormControlLabel({
  control,
  label,
  className,
}: {
  control: ReactNode;
  label: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx('inline-flex items-center gap-2 text-sm text-[var(--mui-text)] cursor-pointer', className)}>
      {control}
      <span>{label}</span>
    </label>
  );
}
