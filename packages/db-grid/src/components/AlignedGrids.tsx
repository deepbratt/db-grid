import { useCallback, useRef, type ReactNode } from 'react';

export type RegisterAlignedGrid = (index: number, element: HTMLElement | null) => void;

interface DbAlignedGridsProps {
  children: (register: RegisterAlignedGrid) => ReactNode;
  className?: string;
}

export function DbAlignedGrids({ children, className }: DbAlignedGridsProps) {
  const containersRef = useRef<Map<number, HTMLElement>>(new Map());
  const listenersRef = useRef<Map<number, () => void>>(new Map());
  const syncingRef = useRef(false);

  const register = useCallback<RegisterAlignedGrid>((index, element) => {
    const cleanup = listenersRef.current.get(index);
    cleanup?.();
    listenersRef.current.delete(index);

    if (!element) {
      containersRef.current.delete(index);
      return;
    }

    containersRef.current.set(index, element);

    const onScroll = () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      const left = element.scrollLeft;
      containersRef.current.forEach((el, i) => {
        if (i !== index && el.scrollLeft !== left) {
          el.scrollLeft = left;
        }
      });
      syncingRef.current = false;
    };

    element.addEventListener('scroll', onScroll, { passive: true });
    listenersRef.current.set(index, () => element.removeEventListener('scroll', onScroll));
  }, []);

  return (
    <div className={['agx-aligned-grids', className].filter(Boolean).join(' ')} data-aligned-grids>
      {children(register)}
    </div>
  );
}

export function useAlignedGridRef(register: RegisterAlignedGrid, index: number) {
  return useCallback(
    (element: HTMLElement | null) => {
      register(index, element);
    },
    [register, index]
  );
}
