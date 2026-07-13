import type { HTMLAttributes } from 'react';
import { cx } from './utils/cx';

export type DividerProps = HTMLAttributes<HTMLHRElement> & {
  orientation?: 'horizontal' | 'vertical';
  flexItem?: boolean;
};

export function Divider({
  orientation = 'horizontal',
  flexItem,
  className,
  ...rest
}: DividerProps) {
  return (
    <hr
      className={cx(
        'border-0 bg-[var(--mui-divider)]',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-auto w-px self-stretch',
        flexItem && 'self-stretch',
        className
      )}
      {...rest}
    />
  );
}
