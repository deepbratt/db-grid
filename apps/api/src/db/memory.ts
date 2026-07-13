/** In-memory fallback when PostgreSQL is unavailable */

export type MemInstrument = {
  id: number;
  ticker: string;
  name: string;
  instrument: string;
  region: string;
  currency: string;
  pnl: number;
  totalValue: number;
  quantity: number;
  price: number;
  changePct: number;
  sparkline: number[];
};

const BASE: Array<[string, string, string, string]> = [
  ['AAPL', 'Apple Inc.', 'Stock', 'US'],
  ['MSFT', 'Microsoft', 'Stock', 'US'],
  ['GOOGL', 'Alphabet', 'Stock', 'US'],
  ['AMZN', 'Amazon', 'Stock', 'US'],
  ['TSLA', 'Tesla', 'Stock', 'US'],
  ['NVDA', 'NVIDIA', 'Stock', 'US'],
  ['BTC-USD', 'Bitcoin', 'Crypto', 'Global'],
  ['US10Y', 'US Treasury 10Y', 'Bond', 'US'],
  ['MUB', 'Muni ETF', 'ETF', 'US'],
  ['BP', 'BP plc', 'Stock', 'UK'],
  ['SAP', 'SAP SE', 'Stock', 'EU'],
  ['TSM', 'TSMC', 'Stock', 'APAC'],
];

function spark(): number[] {
  let v = 40 + Math.random() * 40;
  return Array.from({ length: 20 }, () => {
    v += (Math.random() - 0.48) * 3;
    return Math.round(v * 100) / 100;
  });
}

export const mem = {
  orgId: '00000000-0000-4000-8000-000000000001',
  userId: '00000000-0000-4000-8000-000000000002',
  instruments: [] as MemInstrument[],
  licenses: [] as any[],
  plans: [
    {
      id: 'community',
      name: 'Community',
      tier: 'community',
      price_per_seat_usd: 0,
      features: [],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tier: 'enterprise',
      price_per_seat_usd: 999,
      features: [],
    },
    {
      id: 'enterprise-bundle',
      name: 'Enterprise Bundle',
      tier: 'enterprise-bundle',
      price_per_seat_usd: 1499,
      features: [],
    },
  ],
  events: [] as any[],
  activations: [] as any[],
};

export function ensureMemSeed() {
  if (mem.instruments.length) return;
  mem.instruments = Array.from({ length: 500 }, (_, i) => {
    const b = BASE[i % BASE.length];
    const price = +(20 + Math.random() * 800).toFixed(2);
    const quantity = Math.floor(Math.random() * 4000) + 10;
    return {
      id: i + 1,
      ticker: i < BASE.length ? b[0] : `${b[0]}-${i}`,
      name: i < BASE.length ? b[1] : `${b[1]} #${i}`,
      instrument: b[2],
      region: b[3],
      currency: 'USD',
      pnl: +((Math.random() - 0.42) * 8000).toFixed(2),
      totalValue: +(price * quantity).toFixed(2),
      quantity,
      price,
      changePct: +((Math.random() - 0.5) * 6).toFixed(2),
      sparkline: spark(),
    };
  });
}

export let dbAvailable = false;

export function setDbAvailable(v: boolean) {
  dbAvailable = v;
}
