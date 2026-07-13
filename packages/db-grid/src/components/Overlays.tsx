import type { ReactNode } from 'react';

interface OverlayProps {
  template?: string | ReactNode;
  className?: string;
}

export function LoadingOverlay({ template = 'Loading…', className }: OverlayProps) {
  return (
    <div className={['agx-overlay', 'agx-overlay-loading', className].filter(Boolean).join(' ')} role="status">
      {template}
    </div>
  );
}

export function NoRowsOverlay({ template = 'No Rows To Show', className }: OverlayProps) {
  return (
    <div className={['agx-overlay', 'agx-overlay-no-rows', className].filter(Boolean).join(' ')} role="status">
      {template}
    </div>
  );
}
