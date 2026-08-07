import { query } from './_shared/db.mjs';
import { json, error, corsResponse } from './_shared/http.mjs';
import { normalizeSearchText } from './_shared/events-core.mjs';

// /api/search/suggestions?q=... — suggerimenti da titoli eventi futuri, Comuni, categorie.
export default async (req) => {
  const cors = corsResponse(req);
  if (cors) return cors;
  if (req.method !== 'GET') return error('Metodo non consentito', 405, 'METHOD_NOT_ALLOWED');
  const q = String(new URL(req.url).searchParams.get('q') || '').trim().slice(0, 60);
  if (q.length < 2) return json({ ok: true, suggestions: [] }, 200, { 'cache-control': 'no-store' });
  const needle = normalizeSearchText(q);
  try {
    const events = await query(`SELECT DISTINCT e.title AS label, 'evento' AS kind, e.slug
      FROM events e JOIN event_occurrences o ON o.event_id = e.id
      WHERE e.status IN ('published','postponed') AND o.occurrence_date >= CURRENT_DATE
        AND e.normalized_title ILIKE '%' || $1 || '%'
      ORDER BY label LIMIT 6`, [needle]);
    const towns = await query(`SELECT name AS label, 'comune' AS kind, slug FROM municipalities
      WHERE unaccent(lower(name)) ILIKE '%' || $1 || '%' ORDER BY name LIMIT 4`, [needle]);
    const categories = await query(`SELECT name AS label, 'categoria' AS kind, slug FROM categories
      WHERE unaccent(lower(name)) ILIKE '%' || $1 || '%' ORDER BY sort_order LIMIT 3`, [needle]);
    return json({ ok: true, suggestions: [...towns, ...events, ...categories].slice(0, 10) }, 200, { 'cache-control': 'no-store' });
  } catch (e) {
    return error('Suggerimenti non disponibili', 503, 'SUGGESTIONS_FAILED', String(e.message || e));
  }
};
export const config = { path: '/api/search/suggestions', rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
