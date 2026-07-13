import { cx } from '../utils/cx';

export type PaginationProps = {
  count: number;
  page: number;
  onChange?: (page: number) => void;
  siblingCount?: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'standard';
};

export function Pagination({
  count,
  page,
  onChange,
  className,
  size = 'medium',
  color = 'primary',
}: PaginationProps) {
  const pages = Array.from({ length: count }, (_, i) => i + 1);
  const pad = size === 'small' ? 'h-8 w-8 text-xs' : size === 'large' ? 'h-11 w-11 text-base' : 'h-9 w-9 text-sm';

  return (
    <nav className={cx('inline-flex items-center gap-1', className)} aria-label="pagination">
      <button
        type="button"
        className={cx(pad, 'rounded-lg disabled:opacity-40')}
        disabled={page <= 1}
        onClick={() => onChange?.(page - 1)}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          className={cx(
            pad,
            'rounded-lg font-semibold transition',
            p === page
              ? color === 'primary'
                ? 'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)]'
                : 'bg-[color-mix(in_srgb,var(--mui-text)_12%,transparent)]'
              : 'hover:bg-[color-mix(in_srgb,var(--mui-text)_8%,transparent)]'
          )}
          onClick={() => onChange?.(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className={cx(pad, 'rounded-lg disabled:opacity-40')}
        disabled={page >= count}
        onClick={() => onChange?.(page + 1)}
      >
        ›
      </button>
    </nav>
  );
}
