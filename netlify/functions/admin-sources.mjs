import { requireRole } from './_shared/auth.mjs';
import { query } from './_shared/db.mjs';
import { json, error } from './_shared/http.mjs';

// Report completo fonti (BLOCCO DI VERIFICA punto 2): distingue
// "fonte registrata" da "fonte realmente funzionante".
const REPORT_SELECT = `SELECT s.id, s.source_key, s.entity_name, m.name AS municipality,
  s.source_type, s.status, s.approved, s.auto_publish, s.url, s.priority,
  s.parser_type, s.format, s.crawl_policy, s.discovery_only, s.active,
  s.last_checked_at AS last_scan_at, s.last_success_at, s.last_failure_at,
  s.last_http_status, s.last_error, s.consecutive_failures,
  s.extracted_events_count AS events_found,
  s.last_created_count AS events_created_last_scan,
  s.last_updated_count AS events_updated_last_scan,
  s.last_review_count AS events_review_last_scan,
  s.last_run_id AS ingestion_run_id,
  (SELECT COUNT(*)::int FROM event_sources es WHERE es.source_id = s.id) AS linked_events,
  (SELECT COUNT(*)::int FROM events e WHERE e.primary_source_id = s.id AND e.status = 'published') AS published_events,
  CASE
    WHEN s.active IS NOT TRUE THEN 'disattivata'
    WHEN s.last_checked_at IS NULL THEN 'mai_controllata'
    WHEN s.last_success_at IS NOT NULL AND (s.last_failure_at IS NULL OR s.last_success_at >= COALESCE(s.last_failure_at, '-infinity'::timestamptz)) THEN 'funzionante'
    ELSE 'in_errore'
  END AS working_state
  FROM sources s LEFT JOIN municipalities m ON m.id = s.municipality_id`;

export default async (req) => {
  try {
    if (req.method === 'GET') {
      const auth = await requireRole(req, 'viewer');
      if (!auth.ok) return error(auth.message, auth.status, 'UNAUTHORIZED');
      const u = new URL(req.url);
      const state = u.searchParams.get('state') || '';
      const townSlug = u.searchParams.get('municipality') || '';
      const conditions = [];
      const params = [];
      if (state) { params.push(state); conditions.push(`1=1`); }
      let sql = REPORT_SELECT;
      if (townSlug) { params.push(townSlug); conditions.push(`m.slug = $${params.length}`); }
      if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
      sql += ' ORDER BY s.active DESC, s.priority, s.entity_name LIMIT 3000';
      let rows = await query(sql, params);
      if (state) rows = rows.filter((row) => row.working_state === state);
      const summary = {
        registered: rows.length,
        working: rows.filter((row) => row.working_state === 'funzionante').length,
        failing: rows.filter((row) => row.working_state === 'in_errore').length,
        neverChecked: rows.filter((row) => row.working_state === 'mai_controllata').length,
        inactive: rows.filter((row) => row.working_state === 'disattivata').length,
      };
      return json({ ok: true, summary, sources: rows });
    }
    if (req.method === 'POST') {
      const auth = await requireRole(req, 'editor');
      if (!auth.ok) return error(auth.message, auth.status, 'UNAUTHORIZED');
      const body = await req.json();
      const url = String(body.url || '');
      if (!/^https:\/\//i.test(url) || !body.entityName) return error('URL https e nome fonte obbligatori', 422, 'VALIDATION_ERROR');
      let municipalityId = null;
      if (body.municipalitySlug) {
        const municipality = (await query('SELECT id FROM municipalities WHERE slug=$1', [body.municipalitySlug]))[0];
        municipalityId = municipality?.id || null;
      }
      const priority = Math.min(6, Math.max(1, Number(body.priority) || 5));
      const parser = String(body.parserType || 'generic_html');
      const sourceType = String(body.sourceType || 'association');
      const key = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const rows = await query(`INSERT INTO sources(source_key,entity_name,municipality_id,source_type,url,base_url,priority,parser_type,status,approved,auto_publish,active,discovery_only,crawl_policy)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,'approved',FALSE,FALSE,TRUE,FALSE,'public_page') RETURNING *`,
        [key, String(body.entityName).slice(0, 180), municipalityId, sourceType, url, new URL(url).origin, priority, parser]);
      return json({ ok: true, source: rows[0] }, 201);
    }
    if (req.method === 'PATCH') {
      const auth = await requireRole(req, 'editor');
      if (!auth.ok) return error(auth.message, auth.status, 'UNAUTHORIZED');
      const body = await req.json();
      const id = Number(body.id);
      if (!id) return error('ID non valido', 422, 'VALIDATION_ERROR');
      const rows = await query(`UPDATE sources SET active=COALESCE($2,active),approved=COALESCE($3,approved),
        auto_publish=COALESCE($4,auto_publish),crawl_policy=COALESCE($5,crawl_policy),priority=COALESCE($6,priority),updated_at=NOW()
        WHERE id=$1 RETURNING *`,
        [id, typeof body.active === 'boolean' ? body.active : null,
         typeof body.approved === 'boolean' ? body.approved : null,
         typeof body.autoPublish === 'boolean' ? body.autoPublish : null,
         body.crawlPolicy || null, Number.isInteger(body.priority) ? body.priority : null]);
      return json({ ok: true, source: rows[0] || null });
    }
    return error('Metodo non consentito', 405, 'METHOD_NOT_ALLOWED');
  } catch (e) {
    return error('Operazione fonti fallita', 500, 'SOURCES_FAILED', String(e.message || e));
  }
};
export const config = { path: '/api/admin/sources' };
