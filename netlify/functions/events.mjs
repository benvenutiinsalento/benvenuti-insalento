import { listEvents } from './_shared/event-repository.mjs';
import { listVerifiedEvents, loadVerifiedPrograms } from './_shared/verified-programs.mjs';
import { resolvePreset } from './_shared/events-core.mjs';
import { json, error, corsResponse, isoDateOrEmpty, parsePositiveInt } from './_shared/http.mjs';

// Parametri completi del mandato: q, municipality/town, locality, categories,
// audiences, free, from/to oppure preset (oggi|stasera|domani|weekend|7giorni),
// lat/lng/radius (5-50km), sort, page/pageSize (limit).
function readFilters(u) {
  const preset = resolvePreset(u.searchParams.get('preset') || '') || null;
  const from = isoDateOrEmpty(u.searchParams.get('from') || u.searchParams.get('date')) || preset?.from || '';
  const to = isoDateOrEmpty(u.searchParams.get('to')) || preset?.to || (from && !preset ? from : '') || '';
  const categories = String(u.searchParams.get('categories') || '')
    .split(',').map((item) => item.trim()).filter(Boolean);
  return {
    from, to,
    weekend: u.searchParams.get('weekend') === '1' || Boolean(preset?.weekend),
    evening: u.searchParams.get('evening') === '1' || Boolean(preset?.evening),
    town: u.searchParams.get('town') || u.searchParams.get('municipality') || '',
    locality: u.searchParams.get('locality') || '',
    category: u.searchParams.get('category') || '',
    categories,
    audience: u.searchParams.get('audience') || '',
    family: u.searchParams.get('family') === '1' || u.searchParams.get('famiglie') === '1',
    priceType: u.searchParams.get('priceType') || (u.searchParams.get('free') === '1' ? 'free' : ''),
    q: (u.searchParams.get('q') || '').slice(0, 120),
    lat: u.searchParams.get('lat'), lng: u.searchParams.get('lng'), radius: u.searchParams.get('radius'),
    sort: u.searchParams.get('sort') || 'date',
    page: parsePositiveInt(u.searchParams.get('page'), 1, 10000),
    pageSize: parsePositiveInt(u.searchParams.get('limit'), 0, 100)
      || parsePositiveInt(u.searchParams.get('pageSize'), 30, 100),
  };
}

export default async (req) => {
  const cors = corsResponse(req);
  if (cors) return cors;
  if (req.method !== 'GET') return error('Metodo non consentito', 405, 'METHOD_NOT_ALLOWED');
  const u = new URL(req.url);
  const filters = readFilters(u);
  try {
    const data = await listEvents(filters);
    return json({ ok: true, ...data }, 200, {
      'cache-control': 'public, max-age=60, stale-while-revalidate=300',
      'x-backend-status': 'supabase',
    });
  } catch (e) {
    // Errore registrato nei log Netlify; lo stato è ispezionabile su /api/health
    // e nel backoffice. Il fallback è sempre contrassegnato come tale.
    console.error('EVENTS_DATABASE_FALLBACK', e);
    const data = listVerifiedEvents(filters);
    let meta = null;
    try { meta = loadVerifiedPrograms(); } catch { meta = null; }
    return json({
      ok: true, ...data, verifiedFallback: true,
      backendStatus: 'ko',
      fallbackNotice: 'Elenco servito da archivio di riserva rigenerato quotidianamente: il database principale non risponde. Verificare sempre fonte e ultimo controllo su ogni scheda.',
      fallbackGeneratedAt: meta?.generatedAt || meta?.capturedAt || null,
      fallbackExpiresAt: meta?.expiresAt || null,
    }, 200, {
      'cache-control': 'public, max-age=60, stale-while-revalidate=300',
      'x-backend-status': 'fallback',
    });
  }
};
export const config = { path: '/api/events', rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
