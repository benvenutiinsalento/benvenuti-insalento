import { query, one } from './_shared/db.mjs';
import { json, error, corsResponse } from './_shared/http.mjs';

// /api/coverage-summary — copertura per Comune (monitoraggio, NON certifica
// il totale eventi) + avvisi di copertura aperti. Pubblico e trasparente.
export default async (req) => {
  const cors = corsResponse(req);
  if (cors) return cors;
  if (req.method !== 'GET') return error('Metodo non consentito', 405, 'METHOD_NOT_ALLOWED');
  try {
    const totals = await one(`SELECT
      (SELECT COUNT(*)::int FROM municipalities) AS municipalities,
      (SELECT snapshot_at FROM coverage_snapshots ORDER BY snapshot_at DESC LIMIT 1) AS last_snapshot`);
    const latest = totals.last_snapshot;
    const perStatus = latest
      ? await query(`SELECT coverage_status::text AS status, COUNT(*)::int AS count
          FROM coverage_snapshots WHERE snapshot_at = $1 GROUP BY coverage_status ORDER BY status`, [latest])
      : [];
    const warnings = await query(`SELECT w.id, m.name AS municipality, w.window_from, w.window_to,
      w.events_found, w.threshold, w.reason, w.status, w.created_at
      FROM coverage_warnings w JOIN municipalities m ON m.id = w.municipality_id
      WHERE w.status IN ('open','investigating') ORDER BY w.created_at DESC LIMIT 100`);
    return json({
      ok: true,
      disclaimer: 'La copertura misura il monitoraggio delle fonti, non certifica il totale degli eventi sul territorio.',
      municipalities: totals.municipalities,
      lastSnapshotAt: latest,
      byStatus: perStatus,
      openWarnings: warnings,
      generatedAt: new Date().toISOString(),
    }, 200, { 'cache-control': 'public, max-age=300' });
  } catch (e) {
    return error('Copertura non disponibile', 503, 'COVERAGE_FAILED', String(e.message || e));
  }
};
export const config = { path: '/api/coverage-summary', rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
