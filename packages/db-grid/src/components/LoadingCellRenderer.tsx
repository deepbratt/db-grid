import type { CellRendererParams } from '../types';

export interface LoadingCellRendererProps extends Partial<CellRendererParams> {
  variant?: 'spinner' | 'skeleton';
}

export function LoadingCellRenderer({ variant = 'skeleton' }: LoadingCellRendererProps) {
  if (variant === 'spinner') {
    return (
      <span
        className="agx-loading-cell agx-loading-cell-spinner"
        role="status"
        aria-label="Loading"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            border: '2px solid var(--agx-line, #ccc)',
            borderTopColor: 'var(--agx-accent, #2196f3)',
            borderRadius: '50%',
            animation: 'agx-spin 0.8s linear infinite',
          }}
        />
      </span>
    );
  }

  return (
    <span
      className="agx-loading-cell agx-loading-cell-skeleton"
      role="status"
      aria-label="Loading"
      style={{
        display: 'block',
        width: '70%',
        height: '0.85em',
        marginTop: '0.15em',
        borderRadius: 3,
        background:
          'linear-gradient(90deg, var(--agx-line, #e0e0e0) 25%, var(--agx-header-bg, #f0f0f0) 50%, var(--agx-line, #e0e0e0) 75%)',
        backgroundSize: '200% 100%',
        animation: 'agx-shimmer 1.2s ease-in-out infinite',
      }}
    />
  );
}

/** Factory for use as column `cellRenderer`. */
export function createLoadingCellRenderer(variant: 'spinner' | 'skeleton' = 'skeleton') {
  return () => <LoadingCellRenderer variant={variant} />;
}
