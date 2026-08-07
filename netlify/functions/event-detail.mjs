import { getEventBySlug } from './_shared/event-repository.mjs';
import { json, error, corsResponse } from './_shared/http.mjs';

// /api/events/:slug — scheda evento completa con tracciabilità pipeline
// (source_id, run di acquisizione, primo rilevamento, ultimo controllo).
export default async (req) => {
  const cors = corsResponse(req);
  if (cors) return cors;
  if (req.method !== 'GET') return error('Metodo non consentito', 405, 'METHOD_NOT_ALLOWED');
  const slug = req.url.split('/').filter(Boolean).pop() || '';
  if (!slug || slug === 'events') return error('Slug mancante', 422, 'VALIDATION_ERROR');
  try {
    const event = await getEventBySlug(slug);
    if (!event) return error('Evento non trovato', 404, 'NOT_FOUND');
    return json({ ok: true, event }, 200, { 'cache-control': 'public, max-age=120, stale-while-revalidate=600' });
  } catch (e) {
    console.error('EVENT_DETAIL_FAILED', e);
    return error('Dettaglio non disponibile', 503, 'EVENT_DETAIL_FAILED');
  }
};
export const config = { path: '/api/events/:slug', rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
