import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const OVERSCAN = 8;

export function useVirtualRows(
  rowCount: number,
  rowHeight: number,
  containerHeight: number,
  overscan: number = OVERSCAN
) {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = rowCount * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / rowHeight) + overscan * 2;
  const endIndex = Math.min(rowCount, startIndex + visibleCount);
  const offsetY = startIndex * rowHeight;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return { startIndex, endIndex, offsetY, totalHeight, onScroll, scrollTop };
}

export function useContainerSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 400 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) setSize({ width: cr.width, height: cr.height });
    });
    ro.observe(el);
    setSize({ width: el.clientWidth, height: el.clientHeight || 400 });
    return () => ro.disconnect();
  }, []);

  return { ref, ...size };
}
