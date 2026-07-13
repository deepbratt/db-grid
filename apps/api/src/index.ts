import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { authRouter } from './routes/auth.js';
import { gridRouter } from './routes/grid.js';
import { licenseRouter } from './routes/licenses.js';
import { pool } from './db/pool.js';
import { dbAvailable, ensureMemSeed, mem, setDbAvailable } from './db/memory.js';
import { signLicensePayload } from './services/licenseService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

async function boot() {
  ensureMemSeed();
  try {
    await pool.query('SELECT 1');
    setDbAvailable(true);
    console.log('PostgreSQL connected');
  } catch {
    setDbAvailable(false);
    console.warn('PostgreSQL unavailable — using in-memory store');
    const expires = new Date(Date.now() + 365 * 864e5).toISOString();
    const key = signLicensePayload({
      company: 'db-grid Demo Corp',
      tier: 'enterprise-bundle',
      seats: 25,
      expiresAt: expires,
      orgId: mem.orgId,
    });
    mem.licenses = [
      {
        id: 'mem-lic-1',
        org_id: mem.orgId,
        org_name: 'db-grid Demo Corp',
        plan_id: 'enterprise-bundle',
        plan_name: 'Enterprise Bundle',
        tier: 'enterprise-bundle',
        license_key: key,
        seats: 25,
        seats_used: 3,
        status: 'active',
        issued_at: new Date().toISOString(),
        expires_at: expires,
      },
    ];
  }

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', async (_req, res) => {
    res.json({
      ok: true,
      db: dbAvailable,
      mode: dbAvailable ? 'postgres' : 'memory',
      product: 'db-grid API',
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/grid', gridRouter);
  app.use('/api/licenses', licenseRouter);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    if (err?.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: err?.message ?? 'Server error' });
  });

  const port = Number(process.env.API_PORT ?? 4000);
  const server = http.createServer(app);

  const wss = new WebSocketServer({ server, path: '/ws' });
  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'hello', message: 'db-grid realtime channel' }));
    const timer = setInterval(() => {
      const sample = mem.instruments.sort(() => Math.random() - 0.5).slice(0, 5);
      const updates = sample.map((r) => ({
        id: r.id,
        ticker: r.ticker,
        pnl: +(r.pnl + (Math.random() - 0.5) * 20).toFixed(2),
        price: +(r.price * (1 + (Math.random() - 0.5) * 0.01)).toFixed(4),
        changePct: r.changePct,
      }));
      socket.send(JSON.stringify({ type: 'ticks', updates }));
    }, 2000);
    socket.on('close', () => clearInterval(timer));
  });

  server.listen(port, () => {
    console.log(`db-grid API listening on http://localhost:${port}`);
  });
}

void boot();
