import { query } from './_shared/db.mjs';

function escapeXml(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export default async (req) => {
  const origin = new URL(req.url).origin;
  let rows = [];
  try {
    rows = await query(`SELECT e.slug,e.updated_at FROM events e
      WHERE e.status IN ('published','postponed','cancelled')
        AND EXISTS (SELECT 1 FROM event_occurrences o WHERE o.event_id=e.id AND o.occurrence_date>=CURRENT_DATE-INTERVAL '30 days')
      ORDER BY e.updated_at DESC LIMIT 10000`);
  } catch {}
  const urls = [
    { loc: `${origin}/eventi.html`, lastmod: new Date().toISOString() },
    ...rows.map((row) => ({ loc: `${origin}/eventi/${encodeURIComponent(row.slug)}`, lastmod: new Date(row.updated_at).toISOString() })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${escapeXml(url.loc)}</loc><lastmod>${escapeXml(url.lastmod)}</lastmod></url>`).join('')}</urlset>`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public,max-age=3600' } });
};
export const config = { path: '/sitemap-eventi.xml' };
