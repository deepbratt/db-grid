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
