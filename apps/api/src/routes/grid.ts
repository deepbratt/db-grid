import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { dbAvailable, ensureMemSeed, mem } from '../db/memory.js';

export const gridRouter = Router();

const ssrmSchema = z.object({
  startRow: z.number().int().min(0),
  endRow: z.number().int().min(0),
  sortModel: z
    .array(z.object({ colId: z.string(), sort: z.enum(['asc', 'desc']) }))
    .optional()
    .default([]),
  filterModel: z
    .array(
      z
        .object({
          colId: z.string(),
          type: z.string().optional(),
          operator: z.string().optional(),
          filter: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
          filterTo: z.union([z.string(), z.number(), z.null()]).optional(),
          values: z.array(z.union([z.string(), z.number(), z.boolean()])).optional(),
        })
        .passthrough()
    )
    .optional()
    .default([]),
  groupKeys: z.array(z.union([z.string(), z.number()])).optional().default([]),
  rowGroupCols: z
    .array(z.object({ id: z.string(), field: z.string().optional() }).passthrough())
    .optional()
    .default([]),
  valueCols: z.array(z.any()).optional().default([]),
  pivotCols: z.array(z.any()).optional().default([]),
  pivotMode: z.boolean().optional(),
});

const SORTABLE: Record<string, string> = {
  ticker: 'ticker',
  name: 'name',
  instrument: 'instrument',
  region: 'region',
  pnl: 'pnl',
  total_value: 'total_value',
  totalValue: 'total_value',
  quantity: 'quantity',
  price: 'price',
  change_pct: 'change_pct',
  changePct: 'change_pct',
};

function memField(colId: string): string {
  if (colId === 'total_value') return 'totalValue';
  if (colId === 'change_pct') return 'changePct';
  return SORTABLE[colId] === 'total_value'
    ? 'totalValue'
    : SORTABLE[colId] === 'change_pct'
      ? 'changePct'
      : colId;
}

gridRouter.post('/ssrm', async (req, res) => {
  try {
    const parsed = ssrmSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }
    const body = parsed.data;

    const serveMemory = () => {
      ensureMemSeed();
      let rows = [...mem.instruments];
      for (const f of body.filterModel) {
        const field = memField(f.colId);
        const op = f.operator ?? 'contains';
        rows = rows.filter((r) => {
          const v = (r as any)[field];
          if (op === 'contains') return String(v).toLowerCase().includes(String(f.filter ?? '').toLowerCase());
          if (op === 'equals') return String(v) === String(f.filter);
          if (op === 'greaterThan') return Number(v) > Number(f.filter);
          if (op === 'lessThan') return Number(v) < Number(f.filter);
          return true;
        });
      }
      for (const s of [...body.sortModel].reverse()) {
        const field = memField(s.colId);
        rows.sort((a, b) => {
          const av = (a as any)[field];
          const bv = (b as any)[field];
          const cmp = av < bv ? -1 : av > bv ? 1 : 0;
          return s.sort === 'asc' ? cmp : -cmp;
        });
      }
      const slice = rows.slice(body.startRow, body.endRow);
      res.json({ rowData: slice, rowCount: rows.length });
    };

    if (!dbAvailable) {
      serveMemory();
      return;
    }

    try {
      const where: string[] = [];
      const params: unknown[] = [];
      const FILTERABLE = SORTABLE;

      for (const f of body.filterModel) {
        const col = FILTERABLE[f.colId];
        if (!col) continue;
        const op = f.operator ?? 'contains';
        if (op === 'contains' && f.filter != null) {
          params.push(`%${f.filter}%`);
          where.push(`${col}::text ILIKE $${params.length}`);
        } else if (op === 'equals' && f.filter != null) {
          params.push(f.filter);
          where.push(`${col} = $${params.length}`);
        } else if (op === 'greaterThan' && f.filter != null) {
          params.push(f.filter);
          where.push(`${col} > $${params.length}`);
        } else if (op === 'lessThan' && f.filter != null) {
          params.push(f.filter);
          where.push(`${col} < $${params.length}`);
        }
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const order =
        body.sortModel
          .map((s) => {
            const col = SORTABLE[s.colId];
            return col ? `${col} ${s.sort.toUpperCase()}` : null;
          })
          .filter(Boolean)
          .join(', ') || 'id ASC';

      const limit = Math.max(0, body.endRow - body.startRow);
      params.push(limit, body.startRow);

      const data = await query(
        `SELECT id, ticker, name, instrument, region, currency, pnl::float8 AS pnl,
            total_value::float8 AS "totalValue", quantity, price::float8 AS price,
            change_pct::float8 AS "changePct", sparkline, updated_at AS "updatedAt"
     FROM instruments
     ${whereSql}
     ORDER BY ${order}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      );

      const countParams = params.slice(0, -2);
      const count = await query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM instruments ${whereSql}`,
        countParams
      );

      res.json({
        rowData: data.rows.map((r) => ({
          ...r,
          sparkline: typeof r.sparkline === 'string' ? JSON.parse(r.sparkline) : r.sparkline,
        })),
        rowCount: Number(count.rows[0].c),
      });
    } catch (dbErr) {
      console.warn('SSRM postgres failed — falling back to memory', dbErr);
      serveMemory();
    }
  } catch (err) {
    console.error('SSRM error', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' });
  }
});

gridRouter.get('/instruments', async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 200), 1000);
  if (!dbAvailable) {
    ensureMemSeed();
    res.json(mem.instruments.slice(0, limit));
    return;
  }
  const result = await query(
    `SELECT id, ticker, name, instrument, region, currency, pnl::float8 AS pnl,
            total_value::float8 AS "totalValue", quantity, price::float8 AS price,
            change_pct::float8 AS "changePct", sparkline
     FROM instruments ORDER BY id LIMIT $1`,
    [limit]
  );
  res.json(
    result.rows.map((r) => ({
      ...r,
      sparkline: typeof r.sparkline === 'string' ? JSON.parse(r.sparkline) : r.sparkline,
    }))
  );
});

gridRouter.post('/ai-filter', async (req, res) => {
  const text = String(req.body.query ?? '').toLowerCase();
  const filterModel: Array<Record<string, unknown>> = [];

  if (text.includes('stock')) {
    filterModel.push({ colId: 'instrument', operator: 'equals', filter: 'Stock', type: 'text' });
  }
  if (text.includes('bond')) {
    filterModel.push({ colId: 'instrument', operator: 'equals', filter: 'Bond', type: 'text' });
  }
  if (text.includes('crypto')) {
    filterModel.push({ colId: 'instrument', operator: 'equals', filter: 'Crypto', type: 'text' });
  }
  if (text.includes('etf')) {
    filterModel.push({ colId: 'instrument', operator: 'equals', filter: 'ETF', type: 'text' });
  }
  if (text.includes('us') || text.includes('united states')) {
    filterModel.push({ colId: 'region', operator: 'equals', filter: 'US', type: 'text' });
  }
  const gt = text.match(/pnl\s*>\s*(-?\d+)/);
  if (gt) {
    filterModel.push({
      colId: 'pnl',
      operator: 'greaterThan',
      filter: Number(gt[1]),
      type: 'number',
    });
  }
  const lt = text.match(/pnl\s*<\s*(-?\d+)/);
  if (lt) {
    filterModel.push({
      colId: 'pnl',
      operator: 'lessThan',
      filter: Number(lt[1]),
      type: 'number',
    });
  }

  res.json({
    query: req.body.query,
    filterModel,
    explanation:
      filterModel.length > 0
        ? `Mapped natural language to ${filterModel.length} filter(s)`
        : 'No filters inferred — try “stocks in US with pnl > 100”',
  });
});
