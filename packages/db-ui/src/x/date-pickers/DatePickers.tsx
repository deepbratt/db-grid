import { useMemo, useState, type ReactNode } from 'react';
import { TextField } from '../../TextField';
import { Paper } from '../../Paper';
import { Button } from '../../Button';
import { IconButton } from '../../IconButton';
import { Stack } from '../../Stack';
import { Typography } from '../../Typography';
import { cx } from '../../utils/cx';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function CalendarGrid({
  month,
  selected,
  rangeStart,
  rangeEnd,
  onSelect,
  onMonthChange,
}: {
  month: Date;
  selected?: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  onSelect: (d: Date) => void;
  onMonthChange: (d: Date) => void;
}) {
  const year = month.getFullYear();
  const mo = month.getMonth();
  const first = new Date(year, mo, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, mo, i + 1)),
  ];

  const inRange = (d: Date) => {
    if (!rangeStart || !rangeEnd) return false;
    const t = new Date(d).setHours(0, 0, 0, 0);
    const a = new Date(rangeStart).setHours(0, 0, 0, 0);
    const b = new Date(rangeEnd).setHours(0, 0, 0, 0);
    return t >= a && t <= b;
  };

  return (
    <div className="w-[280px] p-3">
      <Stack direction="row" alignItems="center" justifyContent="between" className="mb-2">
        <IconButton size="small" onClick={() => onMonthChange(new Date(year, mo - 1, 1))}>
          ‹
        </IconButton>
        <Typography variant="subtitle2">
          {month.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </Typography>
        <IconButton size="small" onClick={() => onMonthChange(new Date(year, mo + 1, 1))}>
          ›
        </IconButton>
      </Stack>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[0.65rem] font-bold text-[var(--mui-text-secondary)]">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`e-${i}`} />;
          const isSel = selected && toDateStr(d) === toDateStr(selected);
          const isStart = rangeStart && toDateStr(d) === toDateStr(rangeStart);
          const isEnd = rangeEnd && toDateStr(d) === toDateStr(rangeEnd);
          const ranged = rangeStart && rangeEnd && inRange(new Date(d));
          return (
            <button
              key={toDateStr(d)}
              type="button"
              className={cx(
                'h-8 rounded-lg text-xs font-medium transition',
                (isSel || isStart || isEnd) &&
                  'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)]',
                ranged && !isStart && !isEnd && 'bg-[color-mix(in_srgb,var(--mui-primary)_16%,transparent)]',
                !isSel && !isStart && !isEnd && 'hover:bg-[color-mix(in_srgb,var(--mui-text)_8%,transparent)]'
              )}
              onClick={() => onSelect(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type DatePickerProps = {
  label?: ReactNode;
  value?: string | null;
  onChange?: (value: string | null) => void;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
};

/** MUI X–style DatePicker (Community+) */
export function DatePicker({ label, value, onChange, fullWidth, disabled, className }: DatePickerProps) {
  const selected = parseDate(value);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => selected ?? new Date());

  return (
    <div className={cx('relative', fullWidth && 'w-full', className)}>
      <TextField
        label={label}
        fullWidth={fullWidth}
        disabled={disabled}
        value={value ?? ''}
        placeholder="YYYY-MM-DD"
        onChange={(e) => onChange?.(e.target.value || null)}
        onFocus={() => setOpen(true)}
      />
      {open && !disabled && (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close" onClick={() => setOpen(false)} />
          <Paper elevation={8} className="absolute z-50 mt-1">
            <CalendarGrid
              month={month}
              selected={selected}
              onMonthChange={setMonth}
              onSelect={(d) => {
                onChange?.(toDateStr(d));
                setOpen(false);
              }}
            />
            <div className="flex justify-end gap-2 border-t border-[var(--mui-divider)] px-3 py-2">
              <Button size="small" variant="text" onClick={() => onChange?.(null)}>
                Clear
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  onChange?.(toDateStr(new Date()));
                  setOpen(false);
                }}
              >
                Today
              </Button>
            </div>
          </Paper>
        </>
      )}
    </div>
  );
}

export type TimePickerProps = {
  label?: ReactNode;
  value?: string | null;
  onChange?: (value: string | null) => void;
  fullWidth?: boolean;
  ampm?: boolean;
  className?: string;
};

/** MUI X–style TimePicker */
export function TimePicker({ label, value, onChange, fullWidth, className }: TimePickerProps) {
  const [h, m] = (value ?? '12:00').split(':').map((x) => Number(x) || 0);
  return (
    <div className={cx(fullWidth && 'w-full', className)}>
      <TextField label={label} fullWidth={fullWidth} type="time" value={value ?? ''} onChange={(e) => onChange?.(e.target.value || null)} />
      <Stack direction="row" spacing={2} className="mt-2" alignItems="center">
        <select
          className="h-9 rounded-lg border border-[var(--mui-divider)] bg-[var(--mui-paper)] px-2 text-sm"
          value={h}
          onChange={(e) => onChange?.(`${pad(Number(e.target.value))}:${pad(m)}`)}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {pad(i)}h
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-lg border border-[var(--mui-divider)] bg-[var(--mui-paper)] px-2 text-sm"
          value={m}
          onChange={(e) => onChange?.(`${pad(h)}:${pad(Number(e.target.value))}`)}
        >
          {[0, 15, 30, 45].map((i) => (
            <option key={i} value={i}>
              {pad(i)}m
            </option>
          ))}
        </select>
      </Stack>
    </div>
  );
}

export type DateTimePickerProps = {
  label?: ReactNode;
  value?: string | null;
  onChange?: (value: string | null) => void;
  fullWidth?: boolean;
  className?: string;
};

/** MUI X–style DateTimePicker */
export function DateTimePicker({ label, value, onChange, fullWidth, className }: DateTimePickerProps) {
  const datePart = value?.slice(0, 10) ?? '';
  const timePart = value?.slice(11, 16) ?? '09:00';
  return (
    <Stack spacing={2} className={cx(fullWidth && 'w-full', className)}>
      <DatePicker
        label={label ?? 'Date'}
        fullWidth={fullWidth}
        value={datePart || null}
        onChange={(d) => onChange?.(d ? `${d}T${timePart}` : null)}
      />
      <TimePicker
        label="Time"
        fullWidth={fullWidth}
        value={timePart}
        onChange={(t) => onChange?.(datePart ? `${datePart}T${t ?? '00:00'}` : null)}
      />
    </Stack>
  );
}

export type DateRange = { start: string | null; end: string | null };

export type DateRangePickerProps = {
  label?: ReactNode;
  value?: DateRange;
  onChange?: (value: DateRange) => void;
  fullWidth?: boolean;
  className?: string;
};

/** MUI X Pro — Date Range Picker */
export function DateRangePicker({
  label = 'Date range',
  value = { start: null, end: null },
  onChange,
  fullWidth,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());
  const start = parseDate(value.start);
  const end = parseDate(value.end);
  const display = useMemo(() => {
    if (value.start && value.end) return `${value.start} → ${value.end}`;
    if (value.start) return `${value.start} → …`;
    return '';
  }, [value]);

  return (
    <div className={cx('relative', fullWidth && 'w-full', className)}>
      <TextField
        label={label}
        fullWidth={fullWidth}
        value={display}
        placeholder="Start → End"
        onFocus={() => setOpen(true)}
        readOnly
      />
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close" onClick={() => setOpen(false)} />
          <Paper elevation={8} className="absolute z-50 mt-1">
            <CalendarGrid
              month={month}
              rangeStart={start}
              rangeEnd={end}
              onMonthChange={setMonth}
              onSelect={(d) => {
                const s = toDateStr(d);
                if (!value.start || (value.start && value.end)) {
                  onChange?.({ start: s, end: null });
                } else if (value.start && s < value.start) {
                  onChange?.({ start: s, end: value.start });
                } else {
                  onChange?.({ start: value.start, end: s });
                  setOpen(false);
                }
              }}
            />
            <Typography variant="caption" color="secondary" className="block px-3 pb-3">
              Pro feature · pick start then end
            </Typography>
          </Paper>
        </>
      )}
    </div>
  );
}

export type TimeRange = { start: string | null; end: string | null };

/** MUI X Pro — Time Range Picker */
export function TimeRangePicker({
  label = 'Time range',
  value = { start: '09:00', end: '17:00' },
  onChange,
  fullWidth,
  className,
}: {
  label?: ReactNode;
  value?: TimeRange;
  onChange?: (v: TimeRange) => void;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <Stack spacing={2} className={cx(fullWidth && 'w-full', className)}>
      <Typography variant="caption" color="secondary">
        {label} · Pro
      </Typography>
      <Stack direction="row" spacing={2}>
        <TimePicker
          label="Start"
          fullWidth
          value={value.start}
          onChange={(start) => onChange?.({ ...value, start })}
        />
        <TimePicker
          label="End"
          fullWidth
          value={value.end}
          onChange={(end) => onChange?.({ ...value, end })}
        />
      </Stack>
    </Stack>
  );
}
