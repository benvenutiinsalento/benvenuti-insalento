// ============================================================================
// GHA — Crawling frequente fonti (ogni 6h). Esegue batch finche' ci sono fonti
// dovute (next_check_at <= NOW). Mandato: scheduler SOLO su GitHub Actions.
// Richiede SUPABASE_DB_URL nell'ambiente (secret GitHub).
// ============================================================================
import { bootstrapStatus, bootstrapSystem } from '../netlify/functions/_shared/bootstrap.mjs';
import { runIngestionBatch } from '../netlify/functions/_shared/ingestion.mjs';
import { getDb } from '../netlify/functions/_shared/db.mjs';

const MAX_BATCHES = Number(process.env.INGEST_MAX_BATCHES || 8);
const BATCH_LIMIT = Number(process.env.INGEST_BATCH_LIMIT || 8);

try {
  const status = await bootstrapStatus();
  if (Number(status.total || 0) < 96) {
    console.log('Territorio incompleto: eseguo bootstrap iniziale...');
    console.log(JSON.stringify(await bootstrapSystem()));
  }
  const summary = [];
  for (let i = 0; i < MAX_BATCHES; i += 1) {
    const result = await runIngestionBatch({ limit: BATCH_LIMIT, runType: 'ingestion' });
    console.log(`batch ${i + 1} →`, JSON.stringify(result));
    summary.push(result);
    if (!result.checked) { console.log('Nessuna altra fonte dovuta: stop.'); break; }
  }
  const tot = summary.reduce((a, r) => ({
    checked: a.checked + r.checked, created: a.created + r.created,
    updated: a.updated + r.updated, failed: a.failed + r.failed,
  }), { checked: 0, created: 0, updated: 0, failed: 0 });
  console.log('RIEPILOGO INGEST →', JSON.stringify(tot));
} finally {
  await getDb().end();
}
