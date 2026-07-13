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
