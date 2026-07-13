import crypto from 'node:crypto';
import { query } from './pool.js';

const TICKERS = [
  ['AAPL', 'Apple Inc.', 'Stock', 'US'],
  ['MSFT', 'Microsoft', 'Stock', 'US'],
  ['GOOGL', 'Alphabet', 'Stock', 'US'],
  ['AMZN', 'Amazon', 'Stock', 'US'],
  ['TSLA', 'Tesla', 'Stock', 'US'],
  ['NVDA', 'NVIDIA', 'Stock', 'US'],
  ['META', 'Meta Platforms', 'Stock', 'US'],
  ['JPM', 'JPMorgan Chase', 'Stock', 'US'],
  ['V', 'Visa Inc', 'Stock', 'US'],
  ['MA', 'Mastercard', 'Stock', 'US'],
  ['BTC-USD', 'Bitcoin', 'Crypto', 'Global'],
  ['ETH-USD', 'Ethereum', 'Crypto', 'Global'],
  ['US10Y', 'U.S. Treasury 10Y', 'Bond', 'US'],
  ['EUBOND', 'Eurozone 20Y Gov Bond', 'Bond', 'EU'],
  ['CAD30Y', 'Canada 30Y Bond', 'Bond', 'CA'],
  ['MUB', 'iShares National Muni ETF', 'ETF', 'US'],
  ['VGT', 'Vanguard Info Tech ETF', 'ETF', 'US'],
  ['QQQ', 'Invesco QQQ', 'ETF', 'US'],
  ['BP', 'BP plc', 'Stock', 'UK'],
  ['SHEL', 'Shell plc', 'Stock', 'UK'],
  ['SAP', 'SAP SE', 'Stock', 'EU'],
  ['SIE', 'Siemens AG', 'Stock', 'EU'],
  ['TSM', 'Taiwan Semiconductor', 'Stock', 'APAC'],
  ['BABA', 'Alibaba', 'Stock', 'APAC'],
  ['SONY', 'Sony Group', 'Stock', 'APAC'],
];

function spark(): number[] {
  let v = 50 + Math.random() * 50;
  return Array.from({ length: 24 }, () => {
    v += (Math.random() - 0.48) * 4;
    return Math.round(v * 100) / 100;
  });
}

function encodeLicensePayload(payload: object): string {
  const json = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.LICENSE_SIGNING_SECRET ?? 'db-grid-license-hmac-secret';
  const sig = crypto.createHmac('sha256', secret).update(json).digest('base64url');
  return `DBG.${json}.${sig}`;
}

export async function seed() {
  const org = await query<{ id: string }>(
    `INSERT INTO organizations (name, domain)
     VALUES ('db-grid Demo Corp', 'dbgrid.dev')
     ON CONFLICT DO NOTHING
     RETURNING id`
  );

  let orgId = org.rows[0]?.id;
  if (!orgId) {
    const existing = await query<{ id: string }>(
      `SELECT id FROM organizations WHERE domain = 'dbgrid.dev' LIMIT 1`
    );
    orgId = existing.rows[0]?.id;
  }

  if (!orgId) throw new Error('Failed to create org');

  const passwordHash = crypto.createHash('sha256').update('admin123').digest('hex');
  await query(
    `INSERT INTO users (org_id, email, name, role, password_hash)
     VALUES ($1, 'admin@dbgrid.dev', 'db-grid Admin', 'admin', $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [orgId, passwordHash]
  );

  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  const payload = {
    company: 'db-grid Demo Corp',
    tier: 'enterprise-bundle',
    seats: 25,
    expiresAt: expires.toISOString(),
    orgId,
  };
  const licenseKey = encodeLicensePayload(payload);

  await query(
    `INSERT INTO licenses (org_id, plan_id, license_key, seats, seats_used, status, expires_at, metadata)
     VALUES ($1, 'enterprise-bundle', $2, 25, 3, 'active', $3, $4::jsonb)
     ON CONFLICT (license_key) DO NOTHING`,
    [orgId, licenseKey, expires.toISOString(), JSON.stringify({ demo: true })]
  );

  // Also ensure a trial key exists
  const trialExp = new Date();
  trialExp.setDate(trialExp.getDate() + 30);
  const trialPayload = {
    company: 'db-grid Demo Corp',
    tier: 'enterprise',
    seats: 5,
    expiresAt: trialExp.toISOString(),
    orgId,
    trial: true,
  };
  const trialKey = encodeLicensePayload(trialPayload);
  await query(
    `INSERT INTO licenses (org_id, plan_id, license_key, seats, seats_used, status, expires_at)
     VALUES ($1, 'enterprise', $2, 5, 1, 'trial', $3)
     ON CONFLICT (license_key) DO NOTHING`,
    [orgId, trialKey, trialExp.toISOString()]
  );

  const count = await query<{ c: string }>('SELECT COUNT(*)::text AS c FROM instruments');
  if (Number(count.rows[0].c) < 100) {
    await query('DELETE FROM instruments');
    // Generate ~500 rows for SSRM demos
    const rows: unknown[][] = [];
    for (let i = 0; i < 500; i++) {
      const base = TICKERS[i % TICKERS.length];
      const ticker = i < TICKERS.length ? base[0] : `${base[0]}-${i}`;
      const price = +(10 + Math.random() * 900).toFixed(4);
      const qty = Math.floor(Math.random() * 5000) + 10;
      const pnl = +((Math.random() - 0.45) * 5000).toFixed(2);
      rows.push([
        ticker,
        i < TICKERS.length ? base[1] : `${base[1]} #${i}`,
        base[2],
        base[3],
        'USD',
        pnl,
        +(price * qty).toFixed(2),
        qty,
        price,
        +((Math.random() - 0.5) * 8).toFixed(4),
        JSON.stringify(spark()),
      ]);
    }

    for (const r of rows) {
      await query(
        `INSERT INTO instruments
         (ticker, name, instrument, region, currency, pnl, total_value, quantity, price, change_pct, sparkline)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)`,
        r
      );
    }
  }

  console.log('Seed complete.');
  console.log('Login: admin@dbgrid.dev / admin123');
  console.log('Enterprise license key:', licenseKey);
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
