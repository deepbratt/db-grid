import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { issueLicense, signLicensePayload, verifyLicenseKey } from '../services/licenseService.js';
import { dbAvailable, mem } from '../db/memory.js';

export const licenseRouter = Router();

licenseRouter.get('/plans', async (_req, res) => {
  if (!dbAvailable) {
    res.json(mem.plans);
    return;
  }
  const result = await query('SELECT * FROM license_plans ORDER BY price_per_seat_usd');
  res.json(result.rows);
});

licenseRouter.get('/', async (_req, res) => {
  if (!dbAvailable) {
    res.json(mem.licenses);
    return;
  }
  const result = await query(
    `SELECT l.*, o.name AS org_name, p.name AS plan_name, p.tier
     FROM licenses l
     JOIN organizations o ON o.id = l.org_id
     JOIN license_plans p ON p.id = l.plan_id
     ORDER BY l.issued_at DESC`
  );
  res.json(result.rows);
});

licenseRouter.get('/stats', async (_req, res) => {
  if (!dbAvailable) {
    const seats = mem.licenses.reduce((s, l) => s + Number(l.seats || 0), 0);
    const used = mem.licenses.reduce((s, l) => s + Number(l.seats_used || 0), 0);
    res.json({
      activeLicenses: mem.licenses.filter((l) => l.status === 'active' || l.status === 'trial')
        .length,
      seatsPurchased: seats,
      seatsUsed: used,
      organizations: 1,
      events: mem.events.reduce((acc: any[], ev) => {
        const existing = acc.find((a) => a.event_type === ev.event_type);
        if (existing) existing.count += 1;
        else acc.push({ event_type: ev.event_type, count: 1 });
        return acc;
      }, []),
    });
    return;
  }
  const [licenses, seats, events, orgs] = await Promise.all([
    query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM licenses WHERE status IN ('active','trial')`),
    query<{ seats: string; used: string }>(
      `SELECT COALESCE(SUM(seats),0)::text AS seats, COALESCE(SUM(seats_used),0)::text AS used FROM licenses WHERE status IN ('active','trial')`
    ),
    query(`SELECT event_type, COUNT(*)::int AS count FROM license_events GROUP BY event_type`),
    query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM organizations`),
  ]);
  res.json({
    activeLicenses: Number(licenses.rows[0].c),
    seatsPurchased: Number(seats.rows[0].seats),
    seatsUsed: Number(seats.rows[0].used),
    organizations: Number(orgs.rows[0].c),
    events: events.rows,
  });
});

licenseRouter.post('/issue', async (req, res) => {
  const schema = z.object({
    orgId: z.string(),
    planId: z.string(),
    seats: z.number().int().min(1).max(10000),
    company: z.string().min(1),
    daysValid: z.number().int().optional(),
    trial: z.boolean().optional(),
  });
  const body = schema.parse(req.body);

  if (!dbAvailable) {
    const plan = mem.plans.find((p) => p.id === body.planId);
    if (!plan) {
      res.status(400).json({ error: 'Unknown plan' });
      return;
    }
    const expires = new Date();
    expires.setDate(expires.getDate() + (body.daysValid ?? 365));
    const license_key = signLicensePayload({
      company: body.company,
      tier: plan.tier,
      seats: body.seats,
      expiresAt: expires.toISOString(),
      orgId: body.orgId,
      trial: !!body.trial,
    });
    const row = {
      id: `mem-lic-${Date.now()}`,
      org_id: body.orgId,
      org_name: body.company,
      plan_id: plan.id,
      plan_name: plan.name,
      tier: plan.tier,
      license_key,
      seats: body.seats,
      seats_used: 0,
      status: body.trial ? 'trial' : 'active',
      issued_at: new Date().toISOString(),
      expires_at: expires.toISOString(),
    };
    mem.licenses.unshift(row);
    mem.events.push({
      license_id: row.id,
      event_type: 'issued',
      created_at: row.issued_at,
      payload: {},
    });
    res.status(201).json(row);
    return;
  }

  const license = await issueLicense({
    ...body,
    orgId: body.orgId,
  });
  res.status(201).json(license);
});

licenseRouter.post('/validate', async (req, res) => {
  const key = String(req.body.licenseKey ?? '');
  const machineId = String(req.body.machineId ?? 'unknown');
  const verified = verifyLicenseKey(key);
  if (!verified.valid) {
    res.status(400).json({ valid: false, reason: verified.reason });
    return;
  }

  if (!dbAvailable) {
    const lic = mem.licenses.find((l) => l.license_key === key);
    mem.activations.push({
      license_id: lic?.id,
      machine_id: machineId,
      app_name: req.body.appName ?? 'db-grid',
      last_seen_at: new Date().toISOString(),
    });
    res.json({ valid: true, license: lic ?? null, payload: verified.payload, mode: 'memory' });
    return;
  }

  const row = await query(`SELECT * FROM licenses WHERE license_key = $1`, [key]);
  if (!row.rows[0]) {
    res.json({ valid: true, offline: true, payload: verified.payload });
    return;
  }
  const lic = row.rows[0];
  if (lic.status === 'revoked' || lic.status === 'expired') {
    res.status(403).json({ valid: false, reason: lic.status });
    return;
  }

  await query(
    `INSERT INTO license_activations (license_id, machine_id, app_name, last_seen_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (license_id, machine_id)
     DO UPDATE SET last_seen_at = now()`,
    [lic.id, machineId, req.body.appName ?? 'db-grid']
  );

  await query(
    `INSERT INTO license_events (license_id, event_type, payload)
     VALUES ($1, 'validate', $2::jsonb)`,
    [lic.id, JSON.stringify({ machineId })]
  );

  res.json({ valid: true, license: lic, payload: verified.payload });
});

licenseRouter.post('/:id/revoke', async (req, res) => {
  if (!dbAvailable) {
    const lic = mem.licenses.find((l) => l.id === req.params.id);
    if (!lic) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    lic.status = 'revoked';
    res.json(lic);
    return;
  }
  const result = await query(
    `UPDATE licenses SET status = 'revoked' WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (!result.rows[0]) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  await query(
    `INSERT INTO license_events (license_id, event_type, payload) VALUES ($1, 'revoked', '{}')`,
    [req.params.id]
  );
  res.json(result.rows[0]);
});

licenseRouter.get('/:id/activations', async (req, res) => {
  if (!dbAvailable) {
    res.json(mem.activations.filter((a) => a.license_id === req.params.id));
    return;
  }
  const result = await query(
    `SELECT * FROM license_activations WHERE license_id = $1 ORDER BY last_seen_at DESC`,
    [req.params.id]
  );
  res.json(result.rows);
});

licenseRouter.get('/:id/events', async (req, res) => {
  if (!dbAvailable) {
    res.json(mem.events.filter((e) => e.license_id === req.params.id));
    return;
  }
  const result = await query(
    `SELECT * FROM license_events WHERE license_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [req.params.id]
  );
  res.json(result.rows);
});
