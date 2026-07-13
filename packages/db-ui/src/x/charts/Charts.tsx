import { useMemo, type ReactNode } from 'react';
import { Paper } from '../../Paper';
import { Typography } from '../../Typography';
import { Stack } from '../../Stack';
import { cx } from '../../utils/cx';

const PALETTE = [
  'var(--mui-primary, #f97316)',
  'var(--mui-accent, #facc15)',
  'var(--mui-secondary, #c2410c)',
  'var(--mui-warning, #eab308)',
  'var(--mui-info, #fb923c)',
  'var(--mui-success, #16a34a)',
  'var(--mui-error, #dc2626)',
  '#fbbf24',
];

export type ChartSeries = {
  id?: string;
  label: string;
  data: number[];
  color?: string;
};

export type ChartDataset = {
  labels: string[];
  series: ChartSeries[];
};

function useSeriesColors(series: ChartSeries[]) {
  return series.map((s, i) => s.color ?? PALETTE[i % PALETTE.length]);
}

function ChartFrame({
  title,
  badge,
  children,
  className,
  height = 260,
}: {
  title?: ReactNode;
  badge?: string;
  children: ReactNode;
  className?: string;
  height?: number;
}) {
  return (
    <Paper elevation={1} className={cx('p-4', className)}>
      <Stack direction="row" justifyContent="between" alignItems="center" className="mb-3">
        {title != null && <Typography variant="subtitle2">{title}</Typography>}
        {badge && (
          <span className="rounded-md bg-[color-mix(in_srgb,var(--mui-primary)_14%,transparent)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[var(--mui-primary)]">
            {badge}
          </span>
        )}
      </Stack>
      <div style={{ height }}>{children}</div>
    </Paper>
  );
}

/** MUI X Charts — Bar */
export function BarChart({
  dataset,
  title,
  stacked,
  className,
}: {
  dataset: ChartDataset;
  title?: ReactNode;
  stacked?: boolean;
  className?: string;
}) {
  const colors = useSeriesColors(dataset.series);
  const max = Math.max(
    1,
    ...dataset.labels.map((_, i) =>
      stacked
        ? dataset.series.reduce((s, ser) => s + (ser.data[i] ?? 0), 0)
        : Math.max(...dataset.series.map((ser) => ser.data[i] ?? 0))
    )
  );
  const w = 100 / dataset.labels.length;

  return (
    <ChartFrame title={title} badge={stacked ? 'Pro' : 'Community'} className={className}>
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
        {dataset.labels.map((_, i) => {
          let y = 100;
          return dataset.series.map((ser, si) => {
            const v = ser.data[i] ?? 0;
            const h = (v / max) * 88;
            const x = i * w + w * 0.15;
            const barW = stacked ? w * 0.7 : (w * 0.7) / dataset.series.length;
            const bx = stacked ? x : x + si * barW;
            y = stacked ? y - h : 100 - h;
            const top = stacked ? y : 100 - h;
            return (
              <rect
                key={`${i}-${si}`}
                x={bx}
                y={top}
                width={barW}
                height={h}
                fill={colors[si]}
                rx={0.6}
              />
            );
          });
        })}
      </svg>
    </ChartFrame>
  );
}

/** MUI X Charts — Line */
export function LineChart({
  dataset,
  title,
  className,
}: {
  dataset: ChartDataset;
  title?: ReactNode;
  className?: string;
}) {
  const colors = useSeriesColors(dataset.series);
  const max = Math.max(1, ...dataset.series.flatMap((s) => s.data));
  const n = dataset.labels.length;

  return (
    <ChartFrame title={title} badge="Community" className={className}>
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
        {dataset.series.map((ser, si) => {
          const pts = ser.data
            .map((v, i) => {
              const x = n <= 1 ? 50 : (i / (n - 1)) * 100;
              const y = 100 - (v / max) * 88 - 4;
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polyline
              key={ser.label}
              fill="none"
              stroke={colors[si]}
              strokeWidth="1.5"
              points={pts}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
    </ChartFrame>
  );
}

/** MUI X Charts — Pie / Donut */
export function PieChart({
  series,
  title,
  innerRadius = 0,
  className,
}: {
  series: Array<{ label: string; value: number; color?: string }>;
  title?: ReactNode;
  innerRadius?: number;
  className?: string;
}) {
  const total = series.reduce((s, x) => s + x.value, 0) || 1;
  let angle = -Math.PI / 2;
  const cx0 = 50;
  const cy0 = 50;
  const r = 40;
  const ir = innerRadius;

  const arcs = series.map((s, i) => {
    const slice = (s.value / total) * Math.PI * 2;
    const a0 = angle;
    const a1 = angle + slice;
    angle = a1;
    const large = slice > Math.PI ? 1 : 0;
    const x0 = cx0 + r * Math.cos(a0);
    const y0 = cy0 + r * Math.sin(a0);
    const x1 = cx0 + r * Math.cos(a1);
    const y1 = cy0 + r * Math.sin(a1);
    const color = s.color ?? PALETTE[i % PALETTE.length];
    if (ir > 0) {
      const xi0 = cx0 + ir * Math.cos(a1);
      const yi0 = cy0 + ir * Math.sin(a1);
      const xi1 = cx0 + ir * Math.cos(a0);
      const yi1 = cy0 + ir * Math.sin(a0);
      return (
        <path
          key={s.label}
          d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi0} ${yi0} A ${ir} ${ir} 0 ${large} 0 ${xi1} ${yi1} Z`}
          fill={color}
        />
      );
    }
    return (
      <path
        key={s.label}
        d={`M ${cx0} ${cy0} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`}
        fill={color}
      />
    );
  });

  return (
    <ChartFrame title={title} badge="Community" className={className}>
      <div className="flex h-full gap-4">
        <svg viewBox="0 0 100 100" className="h-full flex-1">
          {arcs}
        </svg>
        <ul className="m-0 flex list-none flex-col justify-center gap-1 p-0 text-xs">
          {series.map((s, i) => (
            <li key={s.label} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: s.color ?? PALETTE[i % PALETTE.length] }}
              />
              {s.label}
            </li>
          ))}
        </ul>
      </div>
    </ChartFrame>
  );
}

/** MUI X Charts — Scatter */
export function ScatterChart({
  points,
  title,
  className,
}: {
  points: Array<{ x: number; y: number; id?: string }>;
  title?: ReactNode;
  className?: string;
}) {
  const maxX = Math.max(1, ...points.map((p) => p.x));
  const maxY = Math.max(1, ...points.map((p) => p.y));
  return (
    <ChartFrame title={title} badge="Community" className={className}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {points.map((p, i) => (
          <circle
            key={p.id ?? i}
            cx={(p.x / maxX) * 92 + 4}
            cy={100 - ((p.y / maxY) * 88 + 4)}
            r="1.8"
            fill={PALETTE[i % PALETTE.length]}
          />
        ))}
      </svg>
    </ChartFrame>
  );
}

/** MUI X Charts Pro — Funnel */
export function FunnelChart({
  data,
  title,
  className,
}: {
  data: Array<{ label: string; value: number }>;
  title?: ReactNode;
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ChartFrame title={title} badge="Pro" className={className} height={280}>
      <div className="flex h-full flex-col justify-center gap-2">
        {data.map((d, i) => {
          const w = (d.value / max) * 100;
          return (
            <div key={d.label} className="flex items-center gap-3">
              <div
                className="h-9 rounded-md transition"
                style={{
                  width: `${w}%`,
                  background: PALETTE[i % PALETTE.length],
                  marginLeft: `${(100 - w) / 2}%`,
                }}
              />
              <span className="w-28 shrink-0 text-xs font-medium">
                {d.label} ({d.value})
              </span>
            </div>
          );
        })}
      </div>
    </ChartFrame>
  );
}

/** MUI X Charts Pro — Sankey (simplified flow) */
export function SankeyChart({
  nodes,
  links,
  title,
  className,
}: {
  nodes: string[];
  links: Array<{ source: string; target: string; value: number }>;
  title?: ReactNode;
  className?: string;
}) {
  return (
    <ChartFrame title={title} badge="Pro" className={className}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {nodes.map((n, i) => (
          <g key={n}>
            <rect
              x={i % 2 === 0 ? 4 : 82}
              y={8 + (Math.floor(i / 2) % 4) * 22}
              width="14"
              height="14"
              rx="2"
              fill={PALETTE[i % PALETTE.length]}
            />
            <text
              x={i % 2 === 0 ? 6 : 84}
              y={8 + (Math.floor(i / 2) % 4) * 22 + 9}
              fontSize="3.5"
              fill="white"
            >
              {n.slice(0, 6)}
            </text>
          </g>
        ))}
        {links.map((l, i) => {
          const si = nodes.indexOf(l.source);
          const ti = nodes.indexOf(l.target);
          const y1 = 15 + (Math.floor(si / 2) % 4) * 22;
          const y2 = 15 + (Math.floor(ti / 2) % 4) * 22;
          return (
            <path
              key={i}
              d={`M 18 ${y1} C 50 ${y1}, 50 ${y2}, 82 ${y2}`}
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeOpacity="0.45"
              strokeWidth={Math.max(1, l.value / 10)}
            />
          );
        })}
      </svg>
    </ChartFrame>
  );
}

/** MUI X Charts Premium — Heatmap */
export function HeatmapChart({
  rows,
  cols,
  data,
  title,
  className,
}: {
  rows: string[];
  cols: string[];
  data: number[][];
  title?: ReactNode;
  className?: string;
}) {
  const flat = data.flat();
  const max = Math.max(1, ...flat);
  const cellW = 100 / cols.length;
  const cellH = 100 / rows.length;
  return (
    <ChartFrame title={title} badge="Premium" className={className}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {rows.map((r, ri) =>
          cols.map((c, ci) => {
            const v = data[ri]?.[ci] ?? 0;
            const alpha = 0.15 + (v / max) * 0.85;
            return (
              <rect
                key={`${r}-${c}`}
                x={ci * cellW}
                y={ri * cellH}
                width={cellW - 0.4}
                height={cellH - 0.4}
                fill={`color-mix(in srgb, var(--mui-primary, #f97316) ${alpha * 100}%, var(--mui-bg, #fffbf5))`}
              >
                <title>
                  {r} / {c}: {v}
                </title>
              </rect>
            );
          })
        )}
      </svg>
    </ChartFrame>
  );
}

/** MUI X Charts Premium — Candlestick */
export function CandlestickChart({
  data,
  title,
  className,
}: {
  data: Array<{ label: string; open: number; high: number; low: number; close: number }>;
  title?: ReactNode;
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.high));
  const min = Math.min(...data.map((d) => d.low));
  const span = max - min || 1;
  const w = 100 / data.length;
  return (
    <ChartFrame title={title} badge="Premium" className={className}>
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
        {data.map((d, i) => {
          const x = i * w + w / 2;
          const yHigh = 100 - ((d.high - min) / span) * 88 - 4;
          const yLow = 100 - ((d.low - min) / span) * 88 - 4;
          const yOpen = 100 - ((d.open - min) / span) * 88 - 4;
          const yClose = 100 - ((d.close - min) / span) * 88 - 4;
          const up = d.close >= d.open;
          const bodyTop = Math.min(yOpen, yClose);
          const bodyH = Math.max(1.2, Math.abs(yClose - yOpen));
          return (
            <g key={d.label}>
              <line x1={x} x2={x} y1={yHigh} y2={yLow} stroke="#64748b" strokeWidth="0.4" />
              <rect
                x={x - w * 0.25}
                y={bodyTop}
                width={w * 0.5}
                height={bodyH}
                fill={up ? '#2e7d32' : '#d32f2f'}
              />
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}

export function SparkLineChart({
  data,
  color = 'var(--mui-primary, #f97316)',
  className,
}: {
  data: number[];
  color?: string;
  className?: string;
}) {
  const max = Math.max(1, ...data);
  const pts = data
    .map((v, i) => `${data.length <= 1 ? 50 : (i / (data.length - 1)) * 100},${100 - (v / max) * 90}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" className={cx('h-10 w-28', className)} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
