export type Instrument = {
  id?: number;
  ticker: string;
  name: string;
  instrument: string;
  region: string;
  currency?: string;
  pnl: number;
  totalValue: number;
  quantity: number;
  price: number;
  changePct: number;
  sparkline: number[];
  orders?: Array<{ id: string; side: string; qty: number; price: number }>;
};

function spark(): number[] {
  let v = 40 + Math.random() * 40;
  return Array.from({ length: 20 }, () => {
    v += (Math.random() - 0.48) * 3;
    return Math.round(v * 100) / 100;
  });
}

const BASE: Array<[string, string, string, string]> = [
  ['AAPL', 'Apple Inc.', 'Stock', 'US'],
  ['MSFT', 'Microsoft', 'Stock', 'US'],
  ['GOOGL', 'Alphabet', 'Stock', 'US'],
  ['AMZN', 'Amazon', 'Stock', 'US'],
  ['TSLA', 'Tesla', 'Stock', 'US'],
  ['NVDA', 'NVIDIA', 'Stock', 'US'],
  ['META', 'Meta', 'Stock', 'US'],
  ['JPM', 'JPMorgan', 'Stock', 'US'],
  ['V', 'Visa', 'Stock', 'US'],
  ['BTC-USD', 'Bitcoin', 'Crypto', 'Global'],
  ['ETH-USD', 'Ethereum', 'Crypto', 'Global'],
  ['US10Y', 'US Treasury 10Y', 'Bond', 'US'],
  ['EUBOND', 'EU 20Y Bond', 'Bond', 'EU'],
  ['MUB', 'Muni Bond ETF', 'ETF', 'US'],
  ['VGT', 'Info Tech ETF', 'ETF', 'US'],
  ['BP', 'BP plc', 'Stock', 'UK'],
  ['SAP', 'SAP SE', 'Stock', 'EU'],
  ['TSM', 'TSMC', 'Stock', 'APAC'],
  ['BABA', 'Alibaba', 'Stock', 'APAC'],
  ['SIE', 'Siemens', 'Stock', 'EU'],
];

export function generateInstruments(count = 120): Instrument[] {
  return Array.from({ length: count }, (_, i) => {
    const [ticker, name, instrument, region] = BASE[i % BASE.length];
    const price = +(20 + Math.random() * 800).toFixed(2);
    const quantity = Math.floor(Math.random() * 4000) + 10;
    const pnl = +((Math.random() - 0.42) * 8000).toFixed(2);
    return {
      id: i + 1,
      ticker: i < BASE.length ? ticker : `${ticker}-${i}`,
      name: i < BASE.length ? name : `${name} #${i}`,
      instrument,
      region,
      currency: 'USD',
      pnl,
      totalValue: +(price * quantity).toFixed(2),
      quantity,
      price,
      changePct: +((Math.random() - 0.5) * 6).toFixed(2),
      sparkline: spark(),
      orders: [
        { id: `O-${i}-1`, side: 'BUY', qty: Math.floor(quantity * 0.2), price },
        { id: `O-${i}-2`, side: 'SELL', qty: Math.floor(quantity * 0.1), price: +(price * 1.01).toFixed(2) },
      ],
    };
  });
}

/** Demo enterprise-bundle license (client-side payload; API signs production keys) */
export const DEMO_LICENSE_KEY = (() => {
  const payload = {
    company: 'db-grid Demo Corp',
    tier: 'enterprise-bundle',
    seats: 25,
    expiresAt: new Date(Date.now() + 365 * 864e5).toISOString(),
  };
  const json = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `DBG.${json}.demo`;
})();
