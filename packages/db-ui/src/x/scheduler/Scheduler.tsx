import { useMemo, useState, type ReactNode } from 'react';
import { Button } from '../../Button';
import { Chip } from '../../Chip';
import { IconButton } from '../../IconButton';
import { Paper } from '../../Paper';
import { Stack } from '../../Stack';
import { Typography } from '../../Typography';
import { cx } from '../../utils/cx';

export type SchedulerEvent = {
  id: string;
  title: string;
  start: string; // ISO date or datetime
  end?: string;
  color?: string;
};

export type DigitalClockProps = {
  value?: string | null;
  onChange?: (value: string) => void;
  ampm?: boolean;
  className?: string;
};

/** MUI X — Digital Clock */
export function DigitalClock({ value = '09:00', onChange, className }: DigitalClockProps) {
  const [h, m] = (value ?? '09:00').split(':').map((x) => Number(x) || 0);
  return (
    <Paper elevation={1} className={cx('inline-flex gap-2 p-3', className)}>
      <select
        className="h-10 rounded-lg border border-[var(--mui-divider)] bg-[var(--mui-paper)] px-2 text-lg font-semibold"
        value={h}
        onChange={(e) => onChange?.(`${String(Number(e.target.value)).padStart(2, '0')}:${String(m).padStart(2, '0')}`)}
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>
            {String(i).padStart(2, '0')}
          </option>
        ))}
      </select>
      <span className="self-center text-xl font-bold">:</span>
      <select
        className="h-10 rounded-lg border border-[var(--mui-divider)] bg-[var(--mui-paper)] px-2 text-lg font-semibold"
        value={m}
        onChange={(e) => onChange?.(`${String(h).padStart(2, '0')}:${String(Number(e.target.value)).padStart(2, '0')}`)}
      >
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={i}>
            {String(i).padStart(2, '0')}
          </option>
        ))}
      </select>
    </Paper>
  );
}

/**
 * MUI X Scheduler Premium (alpha clone) —
 * month / week / day views with events.
 */
export function Scheduler({
  events,
  onEventClick,
  defaultView = 'month',
  className,
}: {
  events: SchedulerEvent[];
  onEventClick?: (e: SchedulerEvent) => void;
  defaultView?: 'month' | 'week' | 'day';
  className?: string;
}) {
  const [view, setView] = useState(defaultView);
  const [cursor, setCursor] = useState(() => new Date());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthCells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date; inMonth: boolean }> = [];
    for (let i = 0; i < startPad; i++) {
      cells.push({ date: new Date(year, month, -startPad + i + 1), inMonth: false });
    }
    for (let d = 1; d <= days; d++) cells.push({ date: new Date(year, month, d), inMonth: true });
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1].date;
      cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
    }
    return cells;
  }, [year, month]);

  const dayKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const eventsByDay = useMemo(() => {
    const map = new Map<string, SchedulerEvent[]>();
    for (const ev of events) {
      const key = ev.start.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const shift = (delta: number) => {
    const d = new Date(cursor);
    if (view === 'month') d.setMonth(d.getMonth() + delta);
    else d.setDate(d.getDate() + delta * (view === 'week' ? 7 : 1));
    setCursor(d);
  };

  const weekDays = useMemo(() => {
    const start = new Date(cursor);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  return (
    <Paper elevation={1} className={cx('overflow-hidden', className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--mui-divider)] px-3 py-2">
        <Chip label="Scheduler Premium" color="warning" size="small" />
        <Typography variant="subtitle1" className="!mr-auto">
          {cursor.toLocaleString(undefined, {
            month: 'long',
            year: 'numeric',
            ...(view !== 'month' ? { day: 'numeric' } : {}),
          })}
        </Typography>
        <Stack direction="row" spacing={1}>
          {(['month', 'week', 'day'] as const).map((v) => (
            <Button
              key={v}
              size="small"
              variant={view === v ? 'contained' : 'outlined'}
              onClick={() => setView(v)}
            >
              {v}
            </Button>
          ))}
        </Stack>
        <IconButton size="small" onClick={() => shift(-1)}>
          ‹
        </IconButton>
        <Button size="small" variant="text" onClick={() => setCursor(new Date())}>
          Today
        </Button>
        <IconButton size="small" onClick={() => shift(1)}>
          ›
        </IconButton>
      </div>

      {view === 'month' && (
        <div className="grid grid-cols-7">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="border-b border-[var(--mui-divider)] px-2 py-1 text-[0.65rem] font-bold uppercase text-[var(--mui-text-secondary)]"
            >
              {d}
            </div>
          ))}
          {monthCells.map(({ date, inMonth }) => {
            const key = dayKey(date);
            const dayEvents = eventsByDay.get(key) ?? [];
            return (
              <div
                key={key + String(inMonth)}
                className={cx(
                  'min-h-24 border-b border-r border-[var(--mui-divider)] p-1',
                  !inMonth && 'bg-[color-mix(in_srgb,var(--mui-text)_4%,transparent)] opacity-60'
                )}
              >
                <div className="mb-1 text-xs font-semibold">{date.getDate()}</div>
                <div className="flex flex-col gap-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      className="truncate rounded px-1 py-0.5 text-left text-[0.65rem] font-medium text-white"
                      style={{ background: ev.color ?? 'var(--mui-primary)' }}
                      onClick={() => onEventClick?.(ev)}
                    >
                      {ev.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[0.65rem] text-[var(--mui-text-secondary)]">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'week' && (
        <div className="grid grid-cols-7 divide-x divide-[var(--mui-divider)]">
          {weekDays.map((d) => {
            const key = dayKey(d);
            const dayEvents = eventsByDay.get(key) ?? [];
            return (
              <div key={key} className="min-h-64 p-2">
                <Typography variant="caption" className="!font-bold">
                  {d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                </Typography>
                <div className="mt-2 flex flex-col gap-1">
                  {dayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      className="rounded-lg px-2 py-1 text-left text-xs text-white"
                      style={{ background: ev.color ?? 'var(--mui-primary)' }}
                      onClick={() => onEventClick?.(ev)}
                    >
                      {ev.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'day' && (
        <div className="p-4">
          <Typography variant="h6" gutterBottom>
            {cursor.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Typography>
          <Stack spacing={2}>
            {(eventsByDay.get(dayKey(cursor)) ?? []).map((ev) => (
              <Paper
                key={ev.id}
                elevation={0}
                className="cursor-pointer border-l-4 p-3"
                style={{ borderLeftColor: ev.color ?? 'var(--mui-primary)' }}
                onClick={() => onEventClick?.(ev)}
              >
                <Typography variant="subtitle2">{ev.title}</Typography>
                <Typography variant="caption" color="secondary">
                  {ev.start}
                  {ev.end ? ` → ${ev.end}` : ''}
                </Typography>
              </Paper>
            ))}
            {(eventsByDay.get(dayKey(cursor)) ?? []).length === 0 && (
              <Typography variant="body2" color="secondary">
                No events
              </Typography>
            )}
          </Stack>
        </div>
      )}
    </Paper>
  );
}
