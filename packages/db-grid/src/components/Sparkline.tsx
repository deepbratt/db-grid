export type SparklineType = 'line' | 'bar' | 'area';

interface Props {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  type?: SparklineType;
}

export function Sparkline({
  values,
  width = 100,
  height = 24,
  color = 'var(--agx-accent-color, #6b7280)',
  type = 'line',
}: Props) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const coords = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * (width - 2) + 1;
    const y = height - 2 - ((v - min) / span) * (height - 4);
    return { x, y, v };
  });
  const pts = coords.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath =
    coords.length > 0
      ? `M ${coords[0].x} ${height - 1} L ${coords.map((p) => `${p.x} ${p.y}`).join(' L ')} L ${coords[coords.length - 1].x} ${height - 1} Z`
      : '';

  const barW = Math.max(1, (width - 2) / values.length - 1);

  return (
    <svg width={width} height={height} className="agx-sparkline" aria-hidden>
      {type === 'area' && <path d={areaPath} fill={color} opacity={0.25} />}
      {type === 'bar'
        ? coords.map((p, i) => {
            const bh = height - 2 - p.y;
            return (
              <rect
                key={i}
                x={p.x - barW / 2}
                y={p.y}
                width={barW}
                height={Math.max(0, bh)}
                fill={color}
                rx={0.5}
              />
            );
          })
        : (type === 'line' || type === 'area') && (
            <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
          )}
    </svg>
  );
}
