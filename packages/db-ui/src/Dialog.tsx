import { useEffect, type ReactNode } from 'react';
import { Paper } from './Paper';
import { Typography } from './Typography';
import { IconButton } from './IconButton';
import { cx } from './utils/cx';

export type DialogProps = {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md';
};

const maxW = {
  xs: 'max-w-sm',
  sm: 'max-w-md',
  md: 'max-w-lg',
};

export function Dialog({ open, onClose, title, children, actions, maxWidth = 'sm' }: DialogProps) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <Paper
        elevation={8}
        role="dialog"
        aria-modal="true"
        className={cx('relative z-10 w-full overflow-hidden', maxW[maxWidth])}
      >
        {(title != null || onClose) && (
          <div className="flex items-start justify-between gap-3 border-b border-[var(--mui-divider)] px-5 py-4">
            <Typography variant="h6">{title}</Typography>
            {onClose && (
              <IconButton aria-label="Close" onClick={onClose} size="small">
                ×
              </IconButton>
            )}
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {actions != null && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--mui-divider)] px-5 py-3">
            {actions}
          </div>
        )}
      </Paper>
    </div>
  );
}
