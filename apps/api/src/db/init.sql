-- ApexGrid schema: demo trading data + custom licensing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'billing', 'viewer')),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS license_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('community', 'enterprise', 'enterprise-bundle')),
  price_per_seat_usd INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES license_plans(id),
  license_key TEXT NOT NULL UNIQUE,
  seats INTEGER NOT NULL DEFAULT 1,
  seats_used INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'expired', 'revoked')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS license_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  machine_id TEXT NOT NULL,
  app_name TEXT,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (license_id, machine_id)
);

CREATE TABLE IF NOT EXISTS license_events (
  id BIGSERIAL PRIMARY KEY,
  license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS instruments (
  id BIGSERIAL PRIMARY KEY,
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  instrument TEXT NOT NULL,
  region TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  pnl NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_value NUMERIC(16, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(14, 4) NOT NULL DEFAULT 0,
  change_pct NUMERIC(8, 4) NOT NULL DEFAULT 0,
  sparkline JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instruments_ticker ON instruments(ticker);
CREATE INDEX IF NOT EXISTS idx_instruments_instrument ON instruments(instrument);
CREATE INDEX IF NOT EXISTS idx_instruments_region ON instruments(region);
CREATE INDEX IF NOT EXISTS idx_licenses_org ON licenses(org_id);
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);

INSERT INTO license_plans (id, name, tier, price_per_seat_usd, features) VALUES
  ('community', 'Community', 'community', 0, '["sorting","filtering","pagination","csvExport","virtualization"]'),
  ('enterprise', 'Enterprise', 'enterprise', 999, '["rowGrouping","pivoting","excelExport","serverSideRowModel","masterDetail","formulas","sparklines"]'),
  ('enterprise-bundle', 'Enterprise Bundle', 'enterprise-bundle', 1499, '["rowGrouping","pivoting","excelExport","serverSideRowModel","masterDetail","formulas","sparklines","aiFilter","postgresAdapter","realtimeCollab"]')
ON CONFLICT (id) DO NOTHING;
