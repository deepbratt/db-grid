import type { ReactNode } from 'react';
import { Backdrop } from '../feedback/Backdrop';
import { cx } from '../utils/cx';

export type DrawerProps = {
  open: boolean;
  onClose?: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  variant?: 'temporary' | 'permanent';
  children?: ReactNode;
  className?: string;
};

export function Drawer({
  open,
  onClose,
  anchor = 'left',
  variant = 'temporary',
  children,
  className,
}: DrawerProps) {
  if (variant === 'permanent') {
    return (
      <aside
        className={cx(
          'h-full w-72 border-r border-[var(--mui-divider)] bg-[var(--mui-paper)]',
          className
        )}
      >
        {children}
      </aside>
    );
  }

  if (!open) return null;

  const panel =
    anchor === 'left'
      ? 'left-0 top-0 h-full w-80'
      : anchor === 'right'
        ? 'right-0 top-0 h-full w-80'
        : anchor === 'top'
          ? 'left-0 top-0 w-full'
          : 'left-0 bottom-0 w-full';

  return (
    <>
      <Backdrop open onClick={onClose} />
      <aside
        className={cx(
          'fixed z-[95] bg-[var(--mui-paper)] text-[var(--mui-text)] shadow-2xl',
          panel,
          className
        )}
      >
        {children}
      </aside>
    </>
  );
}
