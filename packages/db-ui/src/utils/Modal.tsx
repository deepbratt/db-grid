import { useEffect, type ReactNode } from 'react';
import { Backdrop } from '../feedback/Backdrop';
import { cx } from '../utils/cx';

export function Modal({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <Backdrop open onClick={onClose}>
      <div
        role="presentation"
        className={cx('relative z-[1]', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </Backdrop>
  );
}
