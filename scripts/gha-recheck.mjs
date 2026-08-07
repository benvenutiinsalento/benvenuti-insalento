// ============================================================================
// GHA — Ricontrollo eventi imminenti (ogni 2h): riesamina SOLO le fonti che
// hanno eventi pubblicati nelle prossime 72 ore (mandato: recheck-imminent).
// ============================================================================
import { query, getDb } from '../netlify/functions/_shared/db.mjs';
import { runIngestionBatch } from '../netlify/functions/_shared/ingestion.mjs';

try {
  const rows = await query(`
    SELECT DISTINCT es.source_id AS id
    FROM event_sources es
    JOIN events e ON e.id = es.event_id
    JOIN event_occurrences o ON o.event_id = e.id
    WHERE e.status IN ('published','verified','postponed')
      AND o.status = 'scheduled'
      AND o.start_at <= NOW() + INTERVAL '72 hours'
      AND COALESCE(o.end_at, o.start_at) >= NOW()`);
  const ids = rows.map((r) => r.id);
  console.log(`Fonti con eventi nelle prossime 72h: ${ids.length}`);
  if (ids.length) {
    const result = await runIngestionBatch({ sourceIds: ids, limit: Math.min(40, ids.length), runType: 'recheck-imminent' });
    console.log('RICONTROLLO →', JSON.stringify(result));
  } else {
    console.log('Nessuna fonte da ricontrollare: skip.');
  }
} finally {
  const { pool } = await getDb(); await pool.end();
}
