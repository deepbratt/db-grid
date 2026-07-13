import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  container?: boolean;
  item?: boolean;
  spacing?: number;
  columns?: number;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  children?: ReactNode;
};

export function Grid({
  container,
  item,
  spacing = 2,
  columns = 12,
  xs,
  className,
  children,
  style,
  ...rest
}: GridProps) {
  if (container) {
    return (
      <div
        className={cx('grid w-full', className)}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: `${spacing * 0.5}rem`,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }

  const span = xs === 'auto' ? 'auto' : xs != null ? `span ${xs}` : undefined;

  return (
    <div
      className={cx(item && 'min-w-0', className)}
      style={{ gridColumn: span, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
