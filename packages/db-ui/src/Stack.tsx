import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils/cx';

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: 'row' | 'column';
  spacing?: number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between';
  children?: ReactNode;
};

const gap = ['gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6', 'gap-7', 'gap-8'] as const;

export function Stack({
  direction = 'column',
  spacing = 2,
  alignItems = 'stretch',
  justifyContent = 'start',
  className,
  children,
  ...rest
}: StackProps) {
  return (
    <div
      className={cx(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        gap[Math.min(Math.max(spacing, 0), 8)],
        alignItems === 'start' && 'items-start',
        alignItems === 'center' && 'items-center',
        alignItems === 'end' && 'items-end',
        alignItems === 'stretch' && 'items-stretch',
        justifyContent === 'start' && 'justify-start',
        justifyContent === 'center' && 'justify-center',
        justifyContent === 'end' && 'justify-end',
        justifyContent === 'between' && 'justify-between',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
