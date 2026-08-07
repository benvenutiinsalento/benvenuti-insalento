// COLLAUDO REALE agosto 2026 (BLOCCO DI VERIFICA punti 3, 6, 7, 12).
// Esegue la pipeline vera (crawler → parser → normalizzazione → dedup →
// verifica → database) sulle fonti registrate dei 15 Comuni richiesti e
// produce il report per-Comune. Nessun evento viene inserito a mano: entra
// solo attraverso processSource/upsertEvent.
//
// Uso: SUPABASE_DB_URL=... node scripts/collaudo-agosto.mjs
import fs from 'node:fs';
import { getDb, query, one } from '../netlify/functions/_shared/db.mjs';
import { processSource } from '../netlify/functions/_shared/ingestion.mjs';
import { evaluateCoverageWarnings } from '../netlify/functions/_shared/coverage-warnings.mjs';
import { computeMetrics } from '../netlify/functions/admin-metrics.mjs';

const MUNICIPI = ['Lecce', 'Gallipoli', 'Otranto', 'Nardò', 'Porto Cesareo', 'Galatina',
  'Leverano', 'Ugento', 'Tricase', 'Andrano', 'Botrugno', 'Bagnolo del Salento',
  'Maglie', 'Melendugno', 'Casarano'];
const FROM = '2026-08-07';
const TO = '2026-08-16';
const MAX_SOURCES_PER_COMUNE = 25;
const CONCURRENCY = 4;
const MAX_OPEN_DATA_ROUNDS = 5;

// Piccolo pool di concorrenza: le fonti sono indipendenti (transazioni atomiche
// per evento), quindi possiamo interrogarne più d'una alla volta.
async function mapPool(items, size, worker) {
  const results = new Array(items.length);
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (index < items.length) {
      const current = index; index += 1;
      results[current] = await worker(items[current], current);
    }
  }));
  return results;
}

const knownChecks = [
  ['MEDinFEST', `(title ILIKE '%medinfest%' OR title ILIKE '%med in fest%')`],
  ['Festa patronale Andrano', `(town='Andrano' AND (title ILIKE '%patronale%' OR title ILIKE '%madonna%' OR title ILIKE '%santi%' OR title ILIKE '%festa%'))`],
  ["Sant'Oronzo Lecce", `(town='Lecce' AND (title ILIKE '%oronzo%' OR title ILIKE '%giusto%' OR title ILIKE '%fortunato%'))`],
  ['Eventi Leverano', `(town='Leverano')`],
  ['Eventi Galatina', `(town='Galatina')`],
  ['Eventi Ugento', `(town='Ugento')`],
];

function line(msg = '') { console.log(msg); }

async function main() {
  const pool = (await getDb()).pool;
  const run = await one(`INSERT INTO source_runs (run_type, status, actor, notes)
    VALUES ('manual','running','collaudo-agosto-2026','Ciclo reale di collaudo BLOCCO DI VERIFICA: 15 Comuni, finestra ${FROM}→${TO}')
    RETURNING id`);
  line(`\n=== COLLAUDO AGOSTO 2026 · run #${run.id} · finestra ${FROM} → ${TO} ===\n`);

  const perComune = [];
  for (const nome of MUNICIPI) {
    const sources = await query(`SELECT s.*, m.name AS municipality_name
      FROM sources s JOIN municipalities m ON m.id = s.municipality_id
      WHERE m.name = $1 AND s.active = TRUE
      ORDER BY s.priority, s.id LIMIT $2`, [nome, MAX_SOURCES_PER_COMUNE]);
    let riuscite = 0, fallite = 0, trovati = 0, nuovi = 0, aggiornati = 0, revisione = 0, duplicati = 0;
    const errori = [];
    let done = 0;
    await mapPool(sources, CONCURRENCY, async (source) => {
      const result = await processSource(source, run.id);
      done += 1;
      if (result.ok) riuscite += 1;
      else { fallite += 1; errori.push(`${source.entity_name}: ${result.error}`); }
      trovati += result.discovered || 0;
      nuovi += result.created || 0;
      aggiornati += result.updated || 0;
      revisione += result.review || 0;
      duplicati += result.duplicateMerged || 0;
      line(`    [${String(done).padStart(2)}/${sources.length}] ${result.ok ? 'OK ' : 'KO  '} ${source.entity_name.slice(0, 70)}${result.ok ? ` (+${result.created || 0} nuovi, ${result.updated || 0} agg.)` : ` (${result.error})`}`);
    });
    const counts = await one(`SELECT
      (SELECT COUNT(DISTINCT e.id)::int FROM events e JOIN event_occurrences o ON o.event_id=e.id
        WHERE e.municipality_id=(SELECT id FROM municipalities WHERE name=$1)
          AND e.status IN ('published','postponed')
          AND o.occurrence_date BETWEEN $2::date AND $3::date) AS pubblicati_finestra,
      (SELECT COUNT(DISTINCT e.id)::int FROM events e JOIN event_occurrences o ON o.event_id=e.id
        WHERE e.municipality_id=(SELECT id FROM municipalities WHERE name=$1)
          AND e.status='pending_review'
          AND o.occurrence_date BETWEEN $2::date AND $3::date) AS in_revisione_finestra,
      (SELECT COUNT(DISTINCT e.id)::int FROM events e JOIN event_occurrences o ON o.event_id=e.id
        WHERE e.municipality_id=(SELECT id FROM municipalities WHERE name=$1)
          AND e.status IN ('published','postponed') AND o.occurrence_date >= CURRENT_DATE) AS pubblicati_futuri_totali`, [nome, FROM, TO]);
    perComune.push({
      comune: nome, fontiInterrogate: sources.length, fontiRiuscite: riuscite, fontiFallite: fallite,
      eventiTrovati: trovati, eventiNuoviPipeline: nuovi, eventiAggiornatiPipeline: aggiornati,
      duplicatiUniti: duplicati, ...counts, errori: errori.slice(0, 4),
    });
    line(`• ${nome.padEnd(20)} fonti ${riuscite}/${sources.length} OK · pubblicati in finestra: ${counts.pubblicati_finestra} · futuri totali: ${counts.pubblicati_futuri_totali}`);
  }

  // Fonti sovracomunali (open data Regione Puglia): consumo completo del cursore
  line('\n--- Fonti sovracomunali (open data) ---');
  const openData = await query(`SELECT s.*, NULL AS municipality_name FROM sources s
    WHERE s.municipality_id IS NULL AND s.active = TRUE AND s.parser_type IN ('puglia_json','ics','json_ld')`);
  for (const source of openData) {
    let rounds = 0;
    while (rounds < MAX_OPEN_DATA_ROUNDS) {
      const result = await processSource(source, run.id);
      rounds += 1;
      line(`  ${source.entity_name}: giro ${rounds} → ${result.ok ? 'OK' : result.error} (nuovi ${result.created || 0}, aggiornati ${result.updated || 0}, restanti ${result.remaining || 0})`);
      if (!result.ok || !result.remaining) break;
    }
  }

  // Punto 6 — test di completezza + COVERAGE_WARNING (e auto-risoluzione)
  line('\n--- Test di completezza (COVERAGE_WARNING) ---');
  const coverage = await evaluateCoverageWarnings({ windowDays: 10, runId: run.id, onlyMunicipalities: MUNICIPI });
  for (const w of coverage.warnings) line(`  ⚠️  ${w.name}: ${w.events_found}/${w.threshold} eventi → COVERAGE_WARNING aperto`);

  // Punto 7 — verifica eventi noti (devono emergere dalla pipeline, mai inseriti a mano)
  line('\n--- Eventi noti attesi (punto 7) ---');
  const known = [];
  for (const [label, where] of knownChecks) {
    const rows = await query(`SELECT title, town, status::text AS status, source_name, last_seen_run_id AS run
      FROM events WHERE ${where} AND status IN ('published','postponed','pending_review','completed')
      ORDER BY status LIMIT 6`);
    known.push({ label, trovati: rows.length, esempi: rows.slice(0, 3) });
    line(`  ${label}: ${rows.length ? `${rows.length} evento/i (es. "${rows[0].title}" — fonte ${rows[0].source_name}, run #${rows[0].run ?? '—'})` : 'NESSUNO'}`);
  }

  // Punto 12 — metriche A–J finali
  const { metrics } = await computeMetrics();

  const totals = perComune.reduce((acc, row) => ({
    interrogate: acc.interrogate + row.fontiInterrogate,
    riuscite: acc.riuscite + row.fontiRiuscite,
    fallite: acc.fallite + row.fontiFallite,
    nuovi: acc.nuovi + row.eventiNuoviPipeline,
    aggiornati: acc.aggiornati + row.eventiAggiornatiPipeline,
    duplicati: acc.duplicati + row.duplicatiUniti,
  }), { interrogate: 0, riuscite: 0, fallite: 0, nuovi: 0, aggiornati: 0, duplicati: 0 });

  await query(`UPDATE source_runs SET status=$2, completed_at=NOW(), sources_checked=$3, sources_succeeded=$4,
    sources_failed=$5, events_created=$6, events_updated=$7, duplicates_merged=$8 WHERE id=$1`,
    [run.id, totals.fallite ? 'partial' : 'completed', totals.interrogate, totals.riuscite, totals.fallite,
     totals.nuovi, totals.aggiornati, totals.duplicati]);

  // Report Markdown
  const md = [];
  md.push(`# COLLAUDO REALE — ciclo di verifica ${FROM} → ${TO}`, '');
  md.push(`Run di acquisizione: **#${run.id}** (pipeline reale: crawler → parser → normalizzazione → deduplicazione → verifica → database).`);
  md.push(`Eseguito il ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}. Nessun evento inserito manualmente.`, '');
  md.push('| Comune | Fonti interrogate | Riuscite | Fallite | Eventi trovati | Pubblicati (finestra) | In revisione | Duplicati |', '|---|---|---|---|---|---|---|---|');
  for (const row of perComune) {
    md.push(`| ${row.comune} | ${row.fontiInterrogate} | ${row.fontiRiuscite} | ${row.fontiFallite} | ${row.eventiTrovati} | ${row.pubblicati_finestra} | ${row.in_revisione_finestra} | ${row.duplicatiUniti} |`);
  }
  md.push('', '## Errori fonti (estratto)');
  for (const row of perComune.filter((r) => r.errori.length)) md.push(`- **${row.comune}**: ${row.errori.join(' · ')}`);
  md.push('', '## Coverage warning (punto 6)');
  md.push(coverage.warnings.length
    ? coverage.warnings.map((w) => `- ⚠️ **${w.name}**: ${w.events_found}/${w.threshold} eventi nei prossimi 10 giorni → avviso aperto`).join('\n')
    : 'Nessun Comune sotto soglia.');
  md.push('', '## Eventi noti verificati (punto 7)');
  for (const k of known) md.push(`- **${k.label}**: ${k.trovati ? `${k.trovati} eventi. Esempio: “${k.esempi[0].title}” (${k.esempi[0].town}, ${k.esempi[0].status}, fonte: ${k.esempi[0].source_name}, run #${k.esempi[0].run ?? '—'})` : '**NESSUNO — anomalia**'}`);
  md.push('', '## Metriche finali A–J (punto 12)', '');
  const L = [['A', 'Fonti registrate', metrics.a_fonti_registrate], ['B', 'Fonti realmente funzionanti', metrics.b_fonti_funzionanti], ['C', 'Fonti fallite', metrics.c_fonti_fallite], ['D', 'Eventi futuri totali', metrics.d_eventi_futuri], ['E', 'Eventi prossimi 7 giorni', metrics.e_eventi_prossimi_7_giorni], ['F', 'Comuni con almeno un evento', metrics.f_comuni_con_eventi], ['G', 'Comuni senza copertura', metrics.g_comuni_senza_copertura], ['H', 'Eventi acquisiti automaticamente', metrics.h_eventi_automatici], ['I', 'Eventi inseriti manualmente', metrics.i_eventi_manuali], ['J', 'Eventi in revisione', metrics.j_eventi_in_review]];
  for (const [k, label, v] of L) md.push(`- **${k}.** ${label}: **${v}**`);
  fs.writeFileSync('docs/COLLAUDO_AGOSTO_2026.md', `${md.join('\n')}\n`);
  line('\nReport scritto in docs/COLLAUDO_AGOSTO_2026.md');
  line(`Metriche — A:${metrics.a_fonti_registrate} B:${metrics.b_fonti_funzionanti} C:${metrics.c_fonti_fallite} D:${metrics.d_eventi_futuri} E:${metrics.e_eventi_prossimi_7_giorni} F:${metrics.f_comuni_con_eventi} G:${metrics.g_comuni_senza_copertura} H:${metrics.h_eventi_automatici} I:${metrics.i_eventi_manuali} J:${metrics.j_eventi_in_review}`);
  await pool.end();
}

main().catch((error) => { console.error('COLLAUDO FALLITO:', error); process.exit(1); });
