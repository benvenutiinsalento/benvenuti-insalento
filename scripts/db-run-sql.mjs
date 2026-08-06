// Applica in ordine gli .sql di una directory (migrazioni o seed) su Supabase Postgres.
// Uso:
//   node scripts/db-run-sql.mjs supabase/migrations   -> migrazioni
//   node scripts/db-run-sql.mjs supabase/seeds        -> seed
// Richiede SUPABASE_DB_URL (o DATABASE_URL in transizione) nell'ambiente.
import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';

const dir = process.argv[2] || 'supabase/migrations';
const url = String(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '').trim();
if (!url) throw new Error('SUPABASE_DB_URL non configurata.');
const ssl = String(process.env.DATABASE_SSL || '').toLowerCase() === 'false' ? false : { rejectUnauthorized: false };
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
if (!files.length) throw new Error(`Nessun file .sql in ${dir}`);
const pool = new Pool({ connectionString: url, ssl, max: 1 });
console.log(`Applicazione di ${files.length} file da ${dir}...`);
try {
  for (const file of files) {
    const sqlText = fs.readFileSync(path.join(dir, file), 'utf8');
    await pool.query(sqlText);
    console.log(`  ✓ ${file}`);
  }
  console.log('Completato senza errori.');
} finally {
  await pool.end();
}
