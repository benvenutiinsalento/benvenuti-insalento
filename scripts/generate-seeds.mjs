// Genera i seed SQL deterministici da data/*.json:
//   supabase/seeds/101_territory.sql  (Comuni + località + alias)
//   supabase/seeds/104_sources.sql    (fonti core del registro)
// Eseguire: node scripts/generate-seeds.mjs
import fs from 'node:fs';
import { slugify } from '../netlify/functions/_shared/slug.mjs';

const read = (name) => JSON.parse(fs.readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'));
const MUNICIPALITIES = read('municipalities.json');
const LOCALITIES = read('localities.json').entries;
const SOURCES = read('source-registry.json');

const sql = (v) => (v == null || v === '' ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const num = (v) => (v == null || v === '' ? 'NULL' : Number(v));

function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`´]/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function authorityLevel(item) {
  if (['official_registry', 'regional_open_data'].includes(item.sourceType)) return 'institutional';
  if (item.priority <= 2) return 'institutional';
  if (item.priority >= 5) return 'aggregator';
  return 'secondary';
}

function formatFor(item) {
  const p = item.parserType;
  if (p === 'puglia_json') return 'json';
  if (p === 'ics') return 'ics';
  if (p === 'pdf') return 'pdf';
  if (p === 'poster') return 'image';
  if (p === 'sitemap_discovery') return 'sitemap';
  if (p === 'rss') return 'rss';
  return 'html';
}

const t = [];
t.push('-- SEED TERRITORIO — generato da scripts/generate-seeds.mjs. NON MODIFICARE A MANO.');
t.push('-- Dati: data/municipalities.json (96 Comuni, coordinate GeoNames) + data/localities.json.');
t.push('');
for (const m of MUNICIPALITIES) {
  t.push(`INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES (${sql(m.name)}, ${sql(m.slug)}, ${sql(m.province)}, ${sql(m.region)}, ${sql(m.istat)}, ${sql(m.websiteCandidate)}, ${num(m.latitude)}, ${num(m.longitude)})
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;`);
}
t.push('');
for (const entry of LOCALITIES) {
  for (const loc of entry.localities) {
    const nName = normalize(loc.name);
    // il nome stesso della località è un alias verso il Comune (ricerca/filtro)
    t.push(`INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = ${sql(entry.municipality)}),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = ${sql(entry.municipality)}) AND normalized_name = ${sql(nName)}),
        ${sql(loc.name)}, ${sql(nName)}, ${sql(loc.type)})
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;`);
    t.push(`INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = ${sql(entry.municipality)}), ${sql(loc.name)}, ${sql(slugify(loc.name))}, ${sql(nName)}, ${sql(loc.type)})
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;`);
    for (const alias of loc.aliases || []) {
      t.push(`INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = ${sql(entry.municipality)}),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = ${sql(entry.municipality)}) AND normalized_name = ${sql(nName)}),
        ${sql(alias)}, ${sql(normalize(alias))}, ${sql(loc.type)})
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;`);
    }
  }
}
t.push('');
fs.writeFileSync(new URL('../supabase/seeds/101_territory.sql', import.meta.url), t.join('\n') + '\n');

const s = [];
s.push('-- SEED FONTI CORE — generato da scripts/generate-seeds.mjs da data/source-registry.json.');
s.push('-- Registro curato: approved=TRUE perché fonti verificate editorialmente; auto_publish');
s.push('-- abilitato solo per priorità 1-2 (mandato: pubblicazione automatica condizionata).');
s.push('');
for (const item of SOURCES.coreSources) {
  const priority = Number(item.priority);
  s.push(`INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES (${sql(item.key)}, ${sql(item.entityName)}, ${sql(item.sourceType)}, ${sql(item.url)}, ${sql(new URL(item.url).origin)},
  ${sql(formatFor(item))}, ${priority}, ${sql(authorityLevel(item))}, ${sql(item.parserType)},
  ${priority <= 2 ? 6 : 12}, ${priority <= 2 ? 80 : 60}, 'approved', TRUE, ${priority <= 2 ? 'TRUE' : 'FALSE'},
  ${item.active !== false ? 'TRUE' : 'FALSE'}, ${item.discoveryOnly ? 'TRUE' : 'FALSE'}, ${sql(item.crawlPolicy || 'unknown')})
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;`);
}
fs.writeFileSync(new URL('../supabase/seeds/104_sources.sql', import.meta.url), s.join('\n') + '\n');

console.log(`101_territory.sql: ${MUNICIPALITIES.length} comuni, ${LOCALITIES.reduce((a, e) => a + e.localities.length, 0)} località`);
console.log(`104_sources.sql: ${SOURCES.coreSources.length} fonti core`);
