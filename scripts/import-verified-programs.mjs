// ============================================================================
// IMPORT UNA TANTUM — Trasferisce l'archivio programmi verificati (JSON curato
// dalla redazione, con fonte e URL veri) DENTRO il database Supabase come
// eventi normali del mandato (occurrence-first, regole di pubblicazione).
// Percorso identico al crawling: upsertEvent = validazione + territorio +
// dedup + auto-pubblicazione secondo regole. Eventi interamente passati: saltati.
// Uso: SUPABASE_DB_URL=... node scripts/import-verified-programs.mjs
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { query, one, getDb } from '../netlify/functions/_shared/db.mjs';
import { upsertEvent } from '../netlify/functions/_shared/event-repository.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const payload = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'verified-programs-2026.json'), 'utf8'));
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date());

const originOf = (url) => { try { return new URL(url).origin; } catch { return url || ''; } };
const totals = { programs: 0, sourcesCreated: 0, imported: 0, skippedPast: 0, created: 0, updated: 0, review: 0, duplicates: 0, errors: 0 };

const run = await one("INSERT INTO source_runs (run_type,status,notes) VALUES ('ingestion','running','import archivio programmi verificati') RETURNING id");

try {
  for (const program of payload.programs || []) {
    totals.programs += 1;
    const base = originOf(program.url || program.documentUrl);
    const source = await one(
      `INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority,
         parser_type, check_frequency_hours, reliability_score, approved, auto_publish, active, discovery_only, crawl_policy, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (source_key) DO UPDATE SET entity_name=EXCLUDED.entity_name, url=EXCLUDED.url,
         base_url=EXCLUDED.base_url, priority=EXCLUDED.priority, approved=EXCLUDED.approved,
         auto_publish=EXCLUDED.auto_publish, active=EXCLUDED.active, updated_at=NOW()
       RETURNING *`,
      [program.key, program.entityName, program.sourceType || 'official_program',
       program.url || program.documentUrl || '', base, 'html', Number(program.priority) || 3,
       'generic_html', 168, 85, true, true, true, false, 'public_page',
       `Importato il ${today} dall'archivio curato redazione (capturedAt ${payload.capturedAt}).`]);
    if (source.created_at && Date.now() - new Date(source.created_at).getTime() < 5000) totals.sourcesCreated += 1;

    const muniName = program.municipality || '';
    for (const [index, ev] of (program.events || []).entries()) {
      const end = ev.endDate || ev.startDate || '';
      if (!ev.startDate || end < today) { totals.skippedPast += 1; continue; }
      const candidate = {
        title: ev.title,
        description: ev.description || '',
        startDate: ev.startDate,
        endDate: ev.endDate || ev.startDate,
        occurrenceDates: ev.occurrenceDates || [],
        startTime: ev.startTime || '',
        endTime: ev.endTime || '',
        originalTimeText: ev.startTime ? `ore ${ev.startTime}` : '',
        town: muniName,
        locality: ev.locality || '',
        venue: ev.venue || '',
        address: ev.address || '',
        latitude: ev.latitude ?? program.latitude ?? null,
        longitude: ev.longitude ?? program.longitude ?? null,
        priceText: ev.priceText || 'Da verificare',
        priceType: ev.priceType || 'unknown',
        organizer: ev.organizer || program.entityName,
        artists: ev.artists || [],
        tags: ev.tags || [],
        primaryCategory: ev.category || '',
        status: 'draft',
        sourceUrl: ev.sourceUrl || program.documentUrl || program.url,
        sourceName: program.entityName,
        sourcePriority: Number(program.priority) || 3,
        sourceYear: 2026,
        imageUrl: ev.imageUrl || '',
        bookingUrl: ev.bookingUrl || '',
      };
      try {
        const result = await upsertEvent(candidate, source, run.id);
        totals.imported += 1;
        if (result.created) totals.created += 1;
        if (result.updated) totals.updated += 1;
        if (result.review) totals.review += 1;
        if (result.duplicateMerged) totals.duplicates += 1;
      } catch (error) {
        totals.errors += 1;
        console.log(`✘ [${program.key}#${index + 1}] ${ev.title}: ${error.message}`);
      }
    }
  }
  console.log('RIEPILOGO IMPORT →', JSON.stringify(totals));
  const byStatus = await query('SELECT status::text AS s, COUNT(*)::int AS n FROM events GROUP BY 1 ORDER BY 2 DESC');
  console.log('EVENTI per stato:', JSON.stringify(byStatus));
  const future = await query('SELECT COUNT(*)::int AS n FROM events e WHERE EXISTS (SELECT 1 FROM event_occurrences o WHERE o.event_id=e.id AND o.occurrence_date >= CURRENT_DATE)');
  console.log('Eventi con almeno una data futura:', future[0].n);
  await one("UPDATE source_runs SET status='completed', completed_at=NOW() WHERE id=$1", [run.id]);
} finally {
  const { pool } = await getDb();
  await pool.end();
}
