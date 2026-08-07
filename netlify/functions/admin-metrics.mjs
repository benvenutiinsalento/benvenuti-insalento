import { requireRole } from './_shared/auth.mjs';
import { query, one } from './_shared/db.mjs';
import { json, error } from './_shared/http.mjs';

// Metriche A–J del BLOCCO DI VERIFICA (punto 12), calcolate dal database reale.
export async function computeMetrics() {
  const m = await one(`SELECT
    (SELECT COUNT(*)::int FROM sources) AS a_fonti_registrate,
    (SELECT COUNT(*)::int FROM sources WHERE active AND last_success_at IS NOT NULL
      AND (last_failure_at IS NULL OR last_success_at >= last_failure_at)) AS b_fonti_funzionanti,
    (SELECT COUNT(*)::int FROM sources WHERE active AND last_checked_at IS NOT NULL
      AND (last_success_at IS NULL OR last_success_at < COALESCE(last_failure_at, '-infinity'::timestamptz))) AS c_fonti_fallite,
    (SELECT COUNT(DISTINCT e.id)::int FROM events e JOIN event_occurrences o ON o.event_id=e.id
      WHERE e.status IN ('published','postponed') AND o.occurrence_date >= CURRENT_DATE) AS d_eventi_futuri,
    (SELECT COUNT(DISTINCT e.id)::int FROM events e JOIN event_occurrences o ON o.event_id=e.id
      WHERE e.status IN ('published','postponed')
        AND o.occurrence_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '6 days') AS e_eventi_prossimi_7_giorni,
    (SELECT COUNT(DISTINCT e.municipality_id)::int FROM events e JOIN event_occurrences o ON o.event_id=e.id
      WHERE e.status IN ('published','postponed') AND o.occurrence_date >= CURRENT_DATE) AS f_comuni_con_eventi,
    (SELECT COUNT(*)::int FROM municipalities) - (SELECT COUNT(DISTINCT e.municipality_id)::int FROM events e
      JOIN event_occurrences o ON o.event_id=e.id WHERE e.status IN ('published','postponed')
      AND o.occurrence_date >= CURRENT_DATE) AS g_comuni_senza_copertura,
    (SELECT COUNT(*)::int FROM events e WHERE EXISTS
      (SELECT 1 FROM event_versions v WHERE v.event_id=e.id AND v.version=1 AND v.changed_by='ingestion')) AS h_eventi_automatici,
    (SELECT COUNT(*)::int FROM events e WHERE NOT EXISTS
      (SELECT 1 FROM event_versions v WHERE v.event_id=e.id AND v.version=1 AND v.changed_by='ingestion')) AS i_eventi_manuali,
    (SELECT COUNT(*)::int FROM events WHERE status='pending_review')
      + (SELECT COUNT(*)::int FROM review_queue WHERE status='pending') AS j_eventi_in_review`);
  const warnings = await query(`SELECT w.id, m.name AS municipality, w.window_from, w.window_to,
    w.events_found, w.threshold, w.reason, w.status, w.created_at
    FROM coverage_warnings w JOIN municipalities m ON m.id = w.municipality_id
    WHERE w.status IN ('open','investigating') ORDER BY w.created_at DESC LIMIT 100`);
  return { metrics: m, coverageWarnings: warnings };
}

export default async (req) => {
  const a = await requireRole(req, 'viewer');
  if (!a.ok) return error(a.message, a.status, 'UNAUTHORIZED');
  try {
    const data = await computeMetrics();
    return json({ ok: true, ...data, generatedAt: new Date().toISOString() });
  } catch (e) {
    return error('Metriche non disponibili', 500, 'METRICS_FAILED', String(e.message || e));
  }
};
export const config = { path: '/api/admin/metrics' };
