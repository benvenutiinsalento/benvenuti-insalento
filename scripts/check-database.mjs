import { query } from '../netlify/functions/_shared/db.mjs';
const rows = await query(`SELECT current_database() AS database, NOW() AS checked_at,
  (SELECT COUNT(*)::int FROM information_schema.tables WHERE table_schema='public') AS public_tables`);
console.log(rows[0]);
