import { useEffect, type ReactNode } from 'react';
import { Alert } from '../Alert';
import { cx } from '../utils/cx';

export type SnackbarProps = {
  open: boolean;
  onClose?: () => void;
  autoHideDuration?: number;
  message?: ReactNode;
  severity?: 'success' | 'info' | 'warning' | 'error';
  anchorOrigin?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' };
  children?: ReactNode;
  className?: string;
};

export function Snackbar({
  open,
  onClose,
  autoHideDuration = 4000,
  message,
  severity = 'info',
  anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
  children,
  className,
}: SnackbarProps) {
  useEffect(() => {
    if (!open || !autoHideDuration) return;
    const t = window.setTimeout(() => onClose?.(), autoHideDuration);
    return () => window.clearTimeout(t);
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  const pos = cx(
    'fixed z-[110]',
    anchorOrigin.vertical === 'top' ? 'top-4' : 'bottom-4',
    anchorOrigin.horizontal === 'left' && 'left-4',
    anchorOrigin.horizontal === 'right' && 'right-4',
    anchorOrigin.horizontal === 'center' && 'left-1/2 -translate-x-1/2'
  );

  return (
    <div className={cx(pos, 'min-w-[280px] max-w-md', className)}>
      {children ?? <Alert severity={severity}>{message}</Alert>}
    </div>
  );
}
