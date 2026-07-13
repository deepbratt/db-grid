import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'contained' | 'outlined' | 'text';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  children?: ReactNode;
};

export function ButtonGroup({
  orientation = 'horizontal',
  fullWidth,
  className,
  children,
  ...rest
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={cx(
        'inline-flex overflow-hidden rounded-lg border border-[var(--mui-divider)]',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
