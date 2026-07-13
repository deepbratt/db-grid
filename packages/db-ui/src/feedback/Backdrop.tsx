import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type BackdropProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  children?: ReactNode;
  invisible?: boolean;
};

export function Backdrop({ open, invisible, className, children, ...rest }: BackdropProps) {
  if (!open) return null;
  return (
    <div
      className={cx(
        'fixed inset-0 z-[90] flex items-center justify-center',
        invisible ? 'bg-transparent' : 'bg-black/45 backdrop-blur-[1px]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
