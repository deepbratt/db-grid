import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgresql://dbgrid:dbgrid_secret@localhost:5433/db_grid',
});

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: unknown[]
) {
  return pool.query<T>(text, params);
}
