import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  children?: ReactNode;
};

const maxMap = {
  xs: 'max-w-sm',
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
};

export function Container({
  maxWidth = 'lg',
  disableGutters,
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={cx(
        'mx-auto w-full',
        !disableGutters && 'px-4 sm:px-6',
        maxWidth !== false && maxMap[maxWidth],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
