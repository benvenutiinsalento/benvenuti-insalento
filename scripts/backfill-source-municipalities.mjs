// Collega le fonti "orfane" al proprio Comune (municipality_id) + registra la
// fonte di riferimento comunale (municipal_discovery) per tutti i 96 Comuni,
// come previsto dal mandato. Idempotente.
// Uso: SUPABASE_DB_URL=... node scripts/backfill-source-municipalities.mjs
import { query, one, getDb } from '../netlify/functions/_shared/db.mjs';
import { MUNICIPALITIES } from '../netlify/functions/_shared/registry.mjs';

const norm = (v = '') => String(v).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slugOf = (site = '') => { try { return new URL(site).hostname; } catch { return ''; } };

let updated = 0, skipped = 0;
const sources = await query(`SELECT id, source_key, entity_name, url, base_url FROM sources WHERE municipality_id IS NULL`);
for (const source of sources) {
  const host = slugOf(source.url);
  const hostNoWww = host.replace(/^www\./, '');
  const tokens = norm(`${source.entity_name} ${source.source_key.replace(/-/g, ' ')} ${hostNoWww}`);
  // 1) dominio comunale
  let hit = MUNICIPALITIES.find((m) => slugOf(m.websiteCandidate).replace(/^www\./, '') === hostNoWww);
  // 2) nome comune come parola intera nel testo (es. "Pro Loco Gallipoli")
  if (!hit) {
    const words = new Set(tokens.split(/[^a-zà-ÿ0-9]+/).filter(Boolean));
    hit = MUNICIPALITIES
      .filter((m) => {
        const parts = norm(m.name).split(/[^a-zà-ÿ0-9]+/).filter(Boolean);
        return parts.every((part) => words.has(part));
      })
      .sort((a, b) => b.name.length - a.name.length)[0] || null;
  }
  if (!hit) { skipped += 1; continue; }
  await query('UPDATE sources SET municipality_id=$2 WHERE id=$1 AND municipality_id IS NULL',
    [source.id, (await one('SELECT id FROM municipalities WHERE name=$1', [hit.name])).id]);
  updated += 1;
}
console.log(`Backfill: ${updated} fonti collegate al Comune, ${skipped} senza corrispondenza.`);

// Fonte comunale di base per i 96 Comuni (discovery controllata del sito istituzionale)
const before = (await one(`SELECT COUNT(*)::int AS n FROM sources WHERE parser_type='municipal_discovery'`)).n;
for (const m of MUNICIPALITIES) {
  if (!m.websiteCandidate) continue;
  const muni = await one('SELECT id FROM municipalities WHERE name=$1', [m.name]);
  if (!muni) continue;
  const host = slugOf(m.websiteCandidate);
  await query(`INSERT INTO sources (source_key,entity_name,municipality_id,source_type,url,base_url,
      format,priority,authority_level,parser_type,status,approved,auto_publish,active,discovery_only,crawl_policy,reliability_score)
    VALUES ($1,$2,$3,'municipality',$4,$5,'html',2,'institutional','municipal_discovery','approved',TRUE,FALSE,TRUE,TRUE,'public_page',85)
    ON CONFLICT (url) DO UPDATE SET municipality_id=COALESCE(sources.municipality_id,EXCLUDED.municipality_id),
      parser_type=CASE WHEN sources.parser_type IN ('municipal_discovery','generic_html') THEN sources.parser_type ELSE 'municipal_discovery' END,
      discovery_only=sources.discovery_only, updated_at=NOW()`,
    [`comune-${m.slug}-sito`, `Comune di ${m.name} — sito istituzionale`, muni.id, m.websiteCandidate, `https://${host}`]);
}
const after = (await one(`SELECT COUNT(*)::int AS n FROM sources WHERE parser_type='municipal_discovery'`)).n;
console.log(`Fonti comunali municipal_discovery: ${before} → ${after} (Comuni totali: ${MUNICIPALITIES.length}).`);

const { pool } = await getDb();
await pool.end();
