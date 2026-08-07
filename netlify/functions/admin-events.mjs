import { requireRole } from './_shared/auth.mjs';
import { query } from './_shared/db.mjs';
import { adminUpdateEvent } from './_shared/event-repository.mjs';
import { json, error } from './_shared/http.mjs';

export default async (req) => {
  try {
    if (req.method === 'GET') {
      const a = await requireRole(req, 'viewer');
      if (!a.ok) return error(a.message, a.status, 'UNAUTHORIZED');
      const u = new URL(req.url);
      const status = u.searchParams.get('status') || '';
      const rows = await query(`SELECT e.id,e.slug,e.title,e.town,
        (SELECT MIN(o.occurrence_date) FROM event_occurrences o WHERE o.event_id=e.id) AS start_date,
        (SELECT MAX(o.occurrence_date) FROM event_occurrences o WHERE o.event_id=e.id) AS end_date,
        e.status,e.verification_level::text AS verification_level,e.confidence_score,
        e.source_name,e.source_url,e.primary_source_id,e.last_seen_run_id AS ingestion_run_id,
        e.first_discovered_at,e.last_checked_at,e.updated_at
        FROM events e WHERE ($1='' OR e.status=$1::event_status) ORDER BY start_date DESC NULLS LAST LIMIT 1000`, [status]);
      return json({ ok: true, events: rows });
    }
    if (req.method === 'PATCH') {
      const a = await requireRole(req, 'editor');
      if (!a.ok) return error(a.message, a.status, 'UNAUTHORIZED');
      const b = await req.json();
      if (!b.id) return error('ID mancante', 422, 'VALIDATION_ERROR');
      const row = await adminUpdateEvent(b.id, b.patch || {}, a.actor);
      return row ? json({ ok: true, event: row }) : error('Evento non trovato', 404, 'NOT_FOUND');
    }
    return error('Metodo non consentito', 405, 'METHOD_NOT_ALLOWED');
  } catch (e) {
    return error('Operazione eventi fallita', 500, 'EVENT_ADMIN_FAILED', String(e.message || e));
  }
};
export const config = { path: '/api/admin/events' };
