import { useEffect, useRef, type ReactNode } from 'react';

export function ClickAwayListener({
  onClickAway,
  children,
}: {
  onClickAway: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClickAway();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClickAway]);
  return <div ref={ref}>{children}</div>;
}
