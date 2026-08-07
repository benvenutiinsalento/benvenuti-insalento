import { one, query } from './_shared/db.mjs';
import { json, corsResponse } from './_shared/http.mjs';

// /api/health — stato REALE del backend (BLOCCO DI VERIFICA punto 10:
// il fallback non deve mai mascherare un backend rotto).
export default async (req) => {
  const cors = corsResponse(req);
  if (cors) return cors;
  const started = Date.now();
  const checkedAt = new Date().toISOString();
  try {
    const ping = await one('SELECT 1 AS ok');
    const stats = await one(`SELECT
      (SELECT COUNT(DISTINCT e.id)::int FROM events e JOIN event_occurrences o ON o.event_id=e.id
        WHERE e.status IN ('published','postponed') AND o.occurrence_date >= CURRENT_DATE) AS future_events,
      (SELECT COUNT(*)::int FROM sources WHERE active) AS active_sources`);
    const lastRun = (await query(`SELECT id, run_type, status, actor, started_at, completed_at,
      events_created, events_updated FROM source_runs ORDER BY started_at DESC LIMIT 1`))[0] || null;
    return json({
      status: 'ok',
      checkedAt,
      latencyMs: Date.now() - started,
      db: { ok: Boolean(ping?.ok), provider: 'supabase-postgres' },
      events: { futurePublished: stats.future_events },
      sources: { active: stats.active_sources },
      lastIngestionRun: lastRun,
      scheduler: { provider: 'github-actions', netlifyCron: false },
      fallback: { active: false },
    }, 200, { 'cache-control': 'no-store' });
  } catch (e) {
    console.error('HEALTH_CHECK_KO', e);
    return json({
      status: 'ko',
      checkedAt,
      latencyMs: Date.now() - started,
      db: { ok: false, provider: 'supabase-postgres', error: 'connessione fallita' },
      fallback: { active: true, note: '/api/events sta servendo l’archivio di riserva verificato' },
    }, 503, { 'cache-control': 'no-store' });
  }
};
export const config = { path: '/api/health', rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
