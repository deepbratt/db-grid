import type { ReactNode } from 'react';
import { cx } from '../utils/cx';

export function Collapse({
  in: inProp,
  children,
  className,
}: {
  in: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'grid transition-[grid-template-rows] duration-200 ease-out',
        inProp ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
