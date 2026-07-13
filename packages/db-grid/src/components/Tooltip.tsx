import type { ReactNode } from 'react';

export interface TooltipProps {
  x: number;
  y: number;
  content: ReactNode;
}

/** Minimal fixed-position tooltip shown on cell hover (tooltipField / tooltipValueGetter). */
export function Tooltip({ x, y, content }: TooltipProps) {
  if (content == null || content === '') return null;
  return (
    <div className="agx-tooltip" style={{ left: x, top: y }} role="tooltip">
      {content}
    </div>
  );
}
