// ============================================================================
// GHA — Manutenzione giornaliera (mandato):
//   1. archivia eventi conclusi da oltre 180 giorni
//   2. ricalcola la copertura territoriale (snapshot)
//   3. RIGENERA l'archivio di riserva (fallback) da Supabase: solo eventi
//      pubblicati e futuri, OCCORRENZA PER OCCORRENZA (date discontinue non
//      fuse mai), con metadati generatedAt/expiresAt visibili. Il file viene
//      poi committato dal workflow → Netlify ripubblica il sito.
//   4. scrive data/coverage-report.json (riepilogo pubblico copertura)
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { query, getDb } from '../netlify/functions/_shared/db.mjs';
import { calculateCoverage } from '../netlify/functions/_shared/coverage.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const FALLBACK_FILE = path.join(ROOT, 'data', 'verified-programs-2026.json');
const REPORT_FILE = path.join(ROOT, 'data', 'coverage-report.json');

const toDate = (v) => (v ? new Date(v).toISOString().slice(0, 10) : null);
const toTime = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Rome' });
};

try {
  // 1. Archivio storico: eventi chiusi da piu' di 180 giorni → archived
  const archived = await query(`
    WITH sel AS (
      UPDATE events SET status='archived', updated_at=NOW()
      WHERE status='completed' AND updated_at < NOW() - INTERVAL '180 days'
      RETURNING id)
    SELECT COUNT(*)::int AS n FROM sel`);
  console.log(`Archiviati: ${archived[0].n}`);

  // 2. Copertura (snapshot + stati per comune, secondo matrice mandato)
  const coverage = await calculateCoverage();
  console.log('Coverage →', JSON.stringify(coverage).slice(0, 400));

  // 3. Rigenerazione fallback da Supabase (occurrence-first)
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 26 * 3600 * 1000);
  const rows = await query(`
    SELECT v.slug, v.title, v.short_description, v.description, v.town, v.locality,
           v.municipality_name, v.locality_name, v.venue, v.address,
           v.latitude, v.longitude, v.price_text, v.is_free, v.booking_url, v.image_url,
           v.organizer, v.source_url, v.source_name, v.status, v.verification_level,
           v.categories, v.occurrences,
           m2.latitude AS municipality_latitude, m2.longitude AS municipality_longitude
    FROM v_events_public v
    LEFT JOIN municipalities m2 ON m2.name = v.municipality_name
    WHERE v.status IN ('published','verified','postponed')
    ORDER BY v.municipality_name NULLS LAST, v.source_name NULLS LAST, v.first_start_at NULLS LAST
    LIMIT 6000`);

  const programsByKey = new Map();
  let emitted = 0;
  for (const row of rows) {
    const future = (row.occurrences || [])
      .filter((o) => o.date && String(o.date) >= toDate(now.toISOString()) && o.status === 'scheduled')
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    if (!future.length) continue;
    const entity = row.source_name || row.organizer || 'Fonte istituzionale';
    const key = `db-${String(row.municipality_name || row.town || 'salento').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}-${String(entity).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}`.slice(0, 90);
    if (!programsByKey.has(key)) {
      programsByKey.set(key, {
        key,
        municipality: row.municipality_name || row.town || 'Salento',
        entityName: entity,
        priority: row.verification_level === 'official' ? 1 : row.verification_level === 'institutional' ? 2 : 4,
        url: row.source_url || '',
        documentUrl: '',
        latitude: row.latitude ?? row.municipality_latitude ?? null,
        longitude: row.longitude ?? row.municipality_longitude ?? null,
        events: [],
      });
    }
    const program = programsByKey.get(key);
    // una voce per OGNI occorrenza futura: date discontinue mai fuse (mandato)
    for (const occ of future) {
      if (program.events.length >= 60) break;
      program.events.push({
        title: row.title,
        startDate: toDate(occ.startAt) || occ.date,
        startTime: occ.allDay ? null : toTime(occ.startAt),
        endDate: toDate(occ.endAt) || null,
        endTime: occ.endAt && !occ.allDay ? toTime(occ.endAt) : null,
        description: row.short_description || (row.description || '').slice(0, 400),
        category: Array.isArray(row.categories) ? row.categories[0] || '' : '',
        town: row.municipality_name || row.town || '',
        locality: row.locality_name || row.locality || '',
        venue: row.venue || '',
        address: row.address || '',
        priceText: row.price_text || (row.is_free ? 'Gratuito' : 'Da verificare'),
        imageUrl: row.image_url || '',
        bookingUrl: row.booking_url || '',
        sourceUrl: row.source_url || '',
        sourceName: row.source_name || '',
        verificationLevel: row.verification_level || 'secondary',
        status: row.status === 'postponed' ? 'postponed' : 'published',
      });
      emitted += 1;
    }
  }

  const payload = {
    generatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    capturedAt: now.toISOString(), // compatibilita' loader storico
    generatedBy: 'github-actions/daily-maintenance',
    note: 'Archivio di riserva rigenerato quotidianamente dal database Supabase. In caso di indisponibilita del live, mostrare sempre scadenza e provenienza.',
    programs: [...programsByKey.values()].filter((p) => p.events.length > 0),
  };
  fs.writeFileSync(FALLBACK_FILE, JSON.stringify(payload, null, 2));
  console.log(`Fallback rigenerato: ${payload.programs.length} programmi, ${emitted} voci-evento.`);

  // 4. Report copertura pubblico (JSON committato dal workflow)
  const covRows = await query(`
    SELECT name, slug, coverage_status, coverage_score, sources_registered,
           sources_active, sources_working, future_events, last_source_success
    FROM v_municipality_coverage ORDER BY name`);
  const byStatus = covRows.reduce((acc, r) => { acc[r.coverage_status] = (acc[r.coverage_status] || 0) + 1; return acc; }, {});
  const report = {
    generatedAt: now.toISOString(),
    mandate: 'La copertura misura il monitoraggio delle fonti, non certifica la totalita degli eventi organizzati.',
    totals: {
      municipalities: covRows.length,
      byStatus,
      sources_active: covRows.reduce((a, r) => a + Number(r.sources_active || 0), 0),
      sources_working_72h: covRows.reduce((a, r) => a + Number(r.sources_working || 0), 0),
      future_events: covRows.reduce((a, r) => a + Number(r.future_events || 0), 0),
    },
    municipalities: covRows,
  };
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log('Coverage report →', JSON.stringify(report.totals));
} finally {
  await getDb().end();
}
