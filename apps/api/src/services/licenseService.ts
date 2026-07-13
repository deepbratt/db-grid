import crypto from 'node:crypto';
import { query } from '../db/pool.js';

export function signLicensePayload(payload: Record<string, unknown>): string {
  const json = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.LICENSE_SIGNING_SECRET ?? 'db-grid-license-hmac-secret';
  const sig = crypto.createHmac('sha256', secret).update(json).digest('base64url');
  return `DBG.${json}.${sig}`;
}

export function verifyLicenseKey(key: string): {
  valid: boolean;
  payload?: Record<string, unknown>;
  reason?: string;
} {
  try {
    const parts = key.split('.');
    if (parts.length !== 3 || parts[0] !== 'DBG') {
      return { valid: false, reason: 'format' };
    }
    const secret = process.env.LICENSE_SIGNING_SECRET ?? 'db-grid-license-hmac-secret';
    const expected = crypto.createHmac('sha256', secret).update(parts[1]).digest('base64url');
    if (expected !== parts[2]) return { valid: false, reason: 'signature' };
    const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
      'utf8'
    );
    const payload = JSON.parse(json) as Record<string, unknown>;
    if (payload.expiresAt && new Date(String(payload.expiresAt)).getTime() < Date.now()) {
      return { valid: false, payload, reason: 'expired' };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'parse' };
  }
}

export async function issueLicense(input: {
  orgId: string;
  planId: string;
  seats: number;
  company: string;
  daysValid?: number;
  trial?: boolean;
}) {
  const plan = await query<{ tier: string }>(`SELECT tier FROM license_plans WHERE id = $1`, [
    input.planId,
  ]);
  if (!plan.rows[0]) throw new Error('Unknown plan');

  const expires = new Date();
  expires.setDate(expires.getDate() + (input.daysValid ?? 365));

  const payload = {
    company: input.company,
    tier: plan.rows[0].tier,
    seats: input.seats,
    expiresAt: expires.toISOString(),
    orgId: input.orgId,
    trial: !!input.trial,
  };
  const licenseKey = signLicensePayload(payload);

  const result = await query(
    `INSERT INTO licenses (org_id, plan_id, license_key, seats, status, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.orgId,
      input.planId,
      licenseKey,
      input.seats,
      input.trial ? 'trial' : 'active',
      expires.toISOString(),
    ]
  );

  await query(
    `INSERT INTO license_events (license_id, event_type, payload)
     VALUES ($1, 'issued', $2::jsonb)`,
    [result.rows[0].id, JSON.stringify(payload)]
  );

  return result.rows[0];
}

export async function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
