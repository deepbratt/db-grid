import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils/cx';

export type PaperProps = HTMLAttributes<HTMLDivElement> & {
  elevation?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 24;
  square?: boolean;
  children?: ReactNode;
};

const elevationClass: Record<NonNullable<PaperProps['elevation']>, string> = {
  0: 'shadow-none',
  1: 'shadow-sm',
  2: 'shadow',
  3: 'shadow-md',
  4: 'shadow-lg',
  6: 'shadow-xl',
  8: 'shadow-2xl',
  12: 'shadow-2xl',
  16: 'shadow-2xl',
  24: 'shadow-2xl',
};

export function Paper({
  elevation = 1,
  square,
  className,
  children,
  ...rest
}: PaperProps) {
  return (
    <div
      className={cx(
        'bg-[var(--mui-paper)] text-[var(--mui-text)] border border-[var(--mui-divider)]/70',
        !square && 'rounded-2xl',
        elevationClass[elevation],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
