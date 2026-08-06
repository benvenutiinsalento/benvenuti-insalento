import { requireAdmin } from './_shared/auth.mjs';
import { query } from './_shared/db.mjs';
import { json, error } from './_shared/http.mjs';

export default async (req) => {
  const auth = requireAdmin(req);
  if (!auth.ok) return error(auth.message, auth.status, 'UNAUTHORIZED');
  try {
    if (req.method === 'GET') {
      const rows = await query(`SELECT s.id,s.source_key,s.entity_name,m.name municipality,s.source_type,s.url,s.priority,s.parser_type,s.active,s.discovery_only,s.crawl_policy,s.robots_allowed,s.last_success_at,s.last_error,s.consecutive_failures,s.extracted_events_count,s.ingestion_cursor
        FROM sources s LEFT JOIN municipalities m ON m.id=s.municipality_id
        ORDER BY s.active DESC,s.priority,s.entity_name LIMIT 2000`);
      return json({ ok: true, sources: rows });
    }
    if (req.method === 'POST') {
      const body = await req.json();
      const url = String(body.url || '');
      if (!/^https:\/\//i.test(url) || !body.entityName) return error('URL e nome fonte obbligatori', 422, 'VALIDATION_ERROR');
      let municipalityId = null;
      if (body.municipalitySlug) {
        const municipality = (await query('SELECT id FROM municipalities WHERE slug=$1', [body.municipalitySlug]))[0];
        municipalityId = municipality?.id || null;
      }
      const priority = Math.min(6, Math.max(1, Number(body.priority) || 5));
      const parser = String(body.parserType || 'generic_html');
      const sourceType = String(body.sourceType || 'association');
      const key = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const rows = await query(`INSERT INTO sources(source_key,entity_name,municipality_id,source_type,url,base_url,priority,parser_type,active,discovery_only,crawl_policy)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,TRUE,FALSE,'public_page') RETURNING *`,
      [key, String(body.entityName).slice(0, 180), municipalityId, sourceType, url, new URL(url).origin, priority, parser]);
      return json({ ok: true, source: rows[0] }, 201);
    }
    if (req.method === 'PATCH') {
      const body = await req.json();
      const id = Number(body.id);
      if (!id) return error('ID non valido', 422, 'VALIDATION_ERROR');
      const rows = await query(`UPDATE sources SET active=COALESCE($2,active),crawl_policy=COALESCE($3,crawl_policy),priority=COALESCE($4,priority),updated_at=NOW() WHERE id=$1 RETURNING *`,
        [id, typeof body.active === 'boolean' ? body.active : null, body.crawlPolicy || null, Number.isInteger(body.priority) ? body.priority : null]);
      return json({ ok: true, source: rows[0] || null });
    }
    return error('Metodo non consentito', 405, 'METHOD_NOT_ALLOWED');
  } catch (e) {
    return error('Operazione fonti fallita', 500, 'SOURCES_FAILED', String(e.message || e));
  }
};
export const config = { path: '/api/admin/sources' };
