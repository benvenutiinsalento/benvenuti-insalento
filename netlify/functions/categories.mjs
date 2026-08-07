import { query } from './_shared/db.mjs';
import { json, error, corsResponse } from './_shared/http.mjs';

// /api/categories — tassonomia ufficiale con conteggio eventi futuri.
export default async (req) => {
  const cors = corsResponse(req);
  if (cors) return cors;
  if (req.method !== 'GET') return error('Metodo non consentito', 405, 'METHOD_NOT_ALLOWED');
  try {
    const rows = await query(`SELECT c.name, c.slug, c.sort_order,
      (SELECT COUNT(DISTINCT e.id)::int FROM events e
        JOIN event_categories ec ON ec.event_id = e.id AND ec.category_id = c.id
        JOIN event_occurrences o ON o.event_id = e.id
        WHERE e.status IN ('published','postponed') AND o.occurrence_date >= CURRENT_DATE) AS future_events
      FROM categories c ORDER BY c.sort_order, c.name`);
    return json({ ok: true, categories: rows }, 200, { 'cache-control': 'public, max-age=300' });
  } catch (e) {
    return error('Categorie non disponibili', 503, 'CATEGORIES_FAILED', String(e.message || e));
  }
};
export const config = { path: '/api/categories', rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
