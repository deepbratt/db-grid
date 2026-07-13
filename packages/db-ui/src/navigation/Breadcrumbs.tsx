import type { ReactNode } from 'react';
import { cx } from '../utils/cx';

export function Breadcrumbs({
  separator = '/',
  children,
  className,
}: {
  separator?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const items = Array.isArray(children) ? children : children != null ? [children] : [];
  return (
    <nav aria-label="breadcrumb" className={cx('text-sm text-[var(--mui-text-secondary)]', className)}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
        {items.map((child, i) => (
          <li key={i} className="inline-flex items-center gap-2">
            {i > 0 && <span aria-hidden>{separator}</span>}
            {child}
          </li>
        ))}
      </ol>
    </nav>
  );
}
