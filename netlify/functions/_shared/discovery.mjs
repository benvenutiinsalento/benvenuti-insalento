import { stableHash } from './events-core.mjs';

const KEYWORDS = /(event|evento|eventi|manifestaz|estate|natale|turismo|vivere|cultur|sagra|festa|patronal|calendar|programma|spettacol|concerto|mercatin|tradizion|parrocch|dioces|santuar|oratori|\.pdf(?:$|\?))/i;
const SITEMAP_KEYWORDS = /(event|manifestaz|turismo|cultur|sagra|festa|calendar|spettacol|concerto|mercatin|parrocch|dioces|santuar|post-sitemap|page-sitemap)/i;

function decode(value = '') {
  return String(value).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

export function extractCandidateLinks(html, baseUrl, limit = 80) {
  const links = new Map();
  const text = String(html);
  for (const match of text.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(decode(match[1]), baseUrl);
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      url.hash = '';
      const label = decode(match[2].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
      if (!KEYWORDS.test(`${url.pathname} ${url.search} ${label}`)) continue;
      links.set(url.href, label);
    } catch { /* malformed external link */ }
  }
  return [...links.entries()].slice(0, limit).map(([url, label]) => ({ url, label }));
}

export function extractSitemapLinks(xml, limit = 300) {
  return [...String(xml).matchAll(/<loc>([^<]+)<\/loc>/gi)]
    .map((match) => match[1].trim())
    .filter((url) => KEYWORDS.test(url) || SITEMAP_KEYWORDS.test(url))
    .slice(0, limit);
}

export function parserForUrl(url) {
  const lower = String(url).toLowerCase();
  if (/sitemap|\.xml(?:$|\?)/.test(lower)) return 'sitemap_discovery';
  if (/\.ics(?:$|\?)/.test(lower)) return 'ics';
  if (/\.pdf(?:$|\?)/.test(lower)) return 'pdf';
  if (/\.(?:jpg|jpeg|png|webp)(?:$|\?)/.test(lower)) return 'poster';
  return 'generic_html';
}

export function discoveredSourceKey(url) {
  return `discovered-${stableHash(url)}`;
}
