import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { hashPassword } from '../services/licenseService.js';
import { dbAvailable, mem } from '../db/memory.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const body = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .parse(req.body);

  if (!dbAvailable) {
    if (body.email === 'admin@dbgrid.dev' && body.password === 'admin123') {
      const token = jwt.sign(
        { sub: mem.userId, orgId: mem.orgId, role: 'admin', email: body.email },
        process.env.JWT_SECRET ?? 'db-grid-dev-secret-change-me',
        { expiresIn: '7d' }
      );
      res.json({
        token,
        user: {
          id: mem.userId,
          email: body.email,
          name: 'db-grid Admin',
          role: 'admin',
          orgId: mem.orgId,
          orgName: 'db-grid Demo Corp',
        },
      });
      return;
    }
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const hash = await hashPassword(body.password);
  const result = await query(
    `SELECT u.*, o.name AS org_name FROM users u
     JOIN organizations o ON o.id = u.org_id
     WHERE u.email = $1 AND u.password_hash = $2`,
    [body.email, hash]
  );
  if (!result.rows[0]) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const user = result.rows[0];
  const token = jwt.sign(
    { sub: user.id, orgId: user.org_id, role: user.role, email: user.email },
    process.env.JWT_SECRET ?? 'db-grid-dev-secret-change-me',
    { expiresIn: '7d' }
  );
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.org_id,
      orgName: user.org_name,
    },
  });
});

authRouter.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const payload = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET ?? 'db-grid-dev-secret-change-me'
    ) as { sub: string; orgId?: string; email?: string };
    if (!dbAvailable) {
      res.json({
        id: mem.userId,
        email: payload.email ?? 'admin@dbgrid.dev',
        name: 'db-grid Admin',
        role: 'admin',
        orgId: mem.orgId,
        orgName: 'db-grid Demo Corp',
      });
      return;
    }
    const result = await query(
      `SELECT u.id, u.email, u.name, u.role, u.org_id AS "orgId", o.name AS "orgName"
       FROM users u JOIN organizations o ON o.id = u.org_id WHERE u.id = $1`,
      [payload.sub]
    );
    res.json(result.rows[0] ?? null);
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
});
