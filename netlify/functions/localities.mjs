import { query } from './_shared/db.mjs';
import { json, error, corsResponse } from './_shared/http.mjs';
import { LOCALITIES, MUNICIPALITIES } from './_shared/registry.mjs';

// /api/localities?municipality=<slug> — frazioni e marine (fallback su registro statico).
export default async (req) => {
  const cors = corsResponse(req);
  if (cors) return cors;
  if (req.method !== 'GET') return error('Metodo non consentito', 405, 'METHOD_NOT_ALLOWED');
  const municipality = new URL(req.url).searchParams.get('municipality') || '';
  try {
    const rows = await query(`SELECT l.name, l.locality_type::text AS type, m.slug AS municipality
      FROM localities l JOIN municipalities m ON m.id = l.municipality_id
      WHERE ($1 = '' OR m.slug = $1) ORDER BY m.name, l.name LIMIT 1000`, [municipality]);
    return json({ ok: true, localities: rows }, 200, { 'cache-control': 'public, max-age=3600' });
  } catch {
    const muni = MUNICIPALITIES.find((item) => item.slug === municipality);
    const rows = LOCALITIES
      .filter((entry) => !municipality || entry.municipality === muni?.name)
      .flatMap((entry) => entry.localities.map((loc) => ({ name: loc.name, type: loc.type, municipality: entry.municipality })));
    return json({ ok: true, localities: rows, staticFallback: true }, 200, { 'cache-control': 'public, max-age=3600' });
  }
};
export const config = { path: '/api/localities', rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
