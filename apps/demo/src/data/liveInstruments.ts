import { useCallback, useEffect, useRef, useState } from 'react';
import { generateInstruments, type Instrument } from './instruments';

/** One market tick for a single instrument row. */
export function tickInstrument(row: Instrument): Instrument {
  const move = (Math.random() - 0.48) * row.price * 0.006;
  const price = Math.max(0.01, +(row.price + move).toFixed(2));
  const changePct = +(((price - row.price) / row.price) * 100).toFixed(2);
  const sparkline = [...row.sparkline.slice(1), +(price / 10).toFixed(2)];
  const pnlDelta = move * row.quantity * 0.15;
  const pnl = +(row.pnl + pnlDelta).toFixed(2);
  return {
    ...row,
    price,
    changePct,
    sparkline,
    pnl,
    totalValue: +(price * row.quantity).toFixed(2),
  };
}

export type LiveInstrumentsOptions = {
  count?: number;
  intervalMs?: number;
  /** How many rows to update per tick */
  batchSize?: number;
  autoStart?: boolean;
};

export function useLiveInstruments(options: LiveInstrumentsOptions = {}) {
  const count = options.count ?? 80;
  const intervalMs = options.intervalMs ?? 600;
  const batchSize = options.batchSize ?? 8;
  const autoStart = options.autoStart ?? true;

  const [rowData, setRowData] = useState(() => generateInstruments(count));
  const [live, setLive] = useState(autoStart);
  const [speedMs, setSpeedMs] = useState(intervalMs);
  const [tickCount, setTickCount] = useState(0);
  const dataRef = useRef(rowData);
  dataRef.current = rowData;
  const batchSizeRef = useRef(batchSize);
  batchSizeRef.current = batchSize;

  useEffect(() => {
    setSpeedMs(intervalMs);
  }, [intervalMs]);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      const prev = dataRef.current;
      const next = prev.slice();
      const n = Math.min(batchSizeRef.current, next.length);
      for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * next.length);
        next[idx] = tickInstrument(next[idx]);
      }
      dataRef.current = next;
      setRowData(next);
      setTickCount((c) => c + 1);
    }, speedMs);
    return () => window.clearInterval(id);
  }, [live, speedMs]);

  const reset = useCallback(() => {
    const next = generateInstruments(count);
    dataRef.current = next;
    setRowData(next);
    setTickCount(0);
  }, [count]);

  const bumpSpeed = useCallback((dir: 'faster' | 'slower') => {
    setSpeedMs((ms) => {
      if (dir === 'faster') return Math.max(120, Math.round(ms * 0.7));
      return Math.min(2000, Math.round(ms * 1.35));
    });
  }, []);

  return {
    rowData,
    setRowData,
    live,
    setLive,
    speedMs,
    tickCount,
    reset,
    bumpSpeed,
  };
}
