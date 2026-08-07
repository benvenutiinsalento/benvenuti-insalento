import { requireRole } from './_shared/auth.mjs';
import { query, one } from './_shared/db.mjs';
import { json, error } from './_shared/http.mjs';

export default async (req) => {
  const a = await requireRole(req, 'viewer');
  if (!a.ok) return error(a.message, a.status, 'UNAUTHORIZED');
  try {
    const counts = await one(`SELECT
      (SELECT COUNT(*)::int FROM events) events,
      (SELECT COUNT(DISTINCT e.id) FROM events e JOIN event_occurrences o ON o.event_id=e.id
        WHERE e.status IN ('published','postponed') AND o.occurrence_date>=CURRENT_DATE) future_events,
      (SELECT COUNT(*)::int FROM sources WHERE active) active_sources,
      (SELECT COUNT(*)::int FROM review_queue WHERE status='pending') pending_reviews,
      (SELECT COUNT(*)::int FROM event_submissions WHERE status='pending') pending_submissions,
      (SELECT COUNT(*)::int FROM coverage_warnings WHERE status='open') open_coverage_warnings`);
    const runs = await query(`SELECT id,run_type,status,actor,started_at,completed_at,sources_checked,sources_succeeded,sources_failed,
      events_discovered,events_created,events_updated,events_discarded,duplicates_merged,notes
      FROM source_runs ORDER BY started_at DESC LIMIT 20`);
    return json({ ok: true, counts, runs });
  } catch (e) {
    return error('Stato non disponibile', 500, 'STATUS_FAILED', String(e.message || e));
  }
};
export const config = { path: '/api/admin/status' };
