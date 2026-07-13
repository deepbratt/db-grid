import type { ReactNode } from 'react';
import { Paper } from '../Paper';
import { cx } from '../utils/cx';

export function Popover({
  open,
  onClose,
  anchorEl,
  children,
  className,
}: {
  open: boolean;
  onClose?: () => void;
  anchorEl?: HTMLElement | null;
  children?: ReactNode;
  className?: string;
}) {
  if (!open) return null;
  const rect = anchorEl?.getBoundingClientRect();
  return (
    <>
      <button type="button" aria-label="Close popover" className="fixed inset-0 z-[90] cursor-default" onClick={onClose} />
      <div
        className={cx('absolute z-[100]', className)}
        style={
          rect
            ? { top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX }
            : { top: 100, left: 100 }
        }
      >
        <Paper elevation={8} className="p-3">
          {children}
        </Paper>
      </div>
    </>
  );
}
