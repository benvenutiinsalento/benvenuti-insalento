// Adapter database — Supabase Postgres (unico provider ammesso dal mandato).
// Richiede SUPABASE_DB_URL (service o read-only secondo il contesto di esecuzione).
let cachedPromise;

async function createPool() {
  const url = String(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '').trim();
  if (!url) throw new Error('SUPABASE_DB_URL non configurata: il portale usa Supabase Postgres.');
  if (!process.env.SUPABASE_DB_URL) {
    console.warn('[db] DATABASE_URL deprecata: configura SUPABASE_DB_URL (transizione v13).');
  }
  const { Pool } = await import('pg');
  const sslDisabled = String(process.env.DATABASE_SSL || '').toLowerCase() === 'false';
  const pool = new Pool({
    connectionString: url,
    ssl: sslDisabled ? false : { rejectUnauthorized: false },
    max: Math.min(10, Math.max(1, Number(process.env.DATABASE_POOL_MAX) || 5)),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return { pool, provider: 'supabase' };
}

export function getDb() {
  if (!cachedPromise) cachedPromise = createPool();
  return cachedPromise;
}

export async function query(text, params = []) {
  const db = await getDb();
  const result = await db.pool.query(text, params);
  return result.rows;
}

export async function one(text, params = []) {
  const rows = await query(text, params);
  return rows[0] || null;
}

export async function transaction(callback) {
  const db = await getDb();
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
