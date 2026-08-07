// DISCOVERY SUPPLEMENTARE del 2026-08-07 (BLOCCO DI VERIFICA punti 4 e 6).
// Registra le fonti ORIGINALI individuate con ricerca web assistita
// (Comune / portali civici / DMO / aggregatori provinciali). IMPORTANTE: qui si
// registrano SOLO fonti — gli eventi entreranno ESCLUSIVAMENTE tramite la
// pipeline (crawler → parser → normalizzazione → dedup → verifica → database).
// Ogni registrazione è tracciata anche in source_discoveries.
// Uso: SUPABASE_DB_URL=... node scripts/register-discovery-sweep-2026-08-07.mjs
import { query, one, getDb } from '../netlify/functions/_shared/db.mjs';
import { stableHash } from '../netlify/functions/_shared/events-core.mjs';

const SWEEP = 'assisted-web-sweep-2026-08-07';
const SOURCES = [
  // --- Fonti istituzionali / ufficiali per-Comune (risalita alla fonte originale) ---
  { name: 'Comune di Lecce — Rassegna estiva nelle marine 2026', municipality: 'Lecce',
    url: 'https://www.comune.lecce.it/news/dettaglio/2026/06/23/rassegna-estiva-nelle-marine',
    type: 'municipality', parser: 'generic_html', priority: 2, autoPublish: true, reliability: 95,
    note: 'Cartellone ufficiale con date: Spiaggiabella, San Cataldo, Torre Chianca, Torre Rinalda' },
  { name: 'Comune di Otranto — Calendario eventi primavera-estate 2026', municipality: 'Otranto',
    url: 'https://comune.otranto.le.it/novita/calendario-eventi-primavera-estate-2026/',
    type: 'municipality', parser: 'generic_html', priority: 2, autoPublish: true, reliability: 95,
    note: 'Programma ufficiale: Santi Martiri 13-15/8, Notte dei Bambini, Otranto Jazz…' },
  { name: 'Comune di Nardò — Nardò Estate 2026', municipality: 'Nardò',
    url: 'https://www.comune.nardo.le.it/notizia/la-citta-si-fa-palcoscenico-ecco-nardo-estate-2026/',
    type: 'municipality', parser: 'generic_html', priority: 2, autoPublish: true, reliability: 95,
    note: 'Cartellone ufficiale: Circonauta, Salento Ridens, Premio Città di Nardò' },
  { name: 'Comune di Porto Cesareo — Notizie', municipality: 'Porto Cesareo',
    url: 'https://www.comune.portocesareo.le.it/Novita/Notizie',
    type: 'municipality', parser: 'generic_html', priority: 2, autoPublish: true, reliability: 85,
    note: 'Albo notizie istituzionale (annunci eventi/rinvii)' },
  { name: 'Parrocchia SS. Cesarea — Programma Porto Cesareo Estate 2026', municipality: 'Porto Cesareo',
    url: 'https://www.ecclesiacesarina.com/2026/07/30/porto-cesareo-estate-eventi-2026-il-programma-comprende-anche-torre-lapillo/',
    type: 'association', parser: 'generic_html', priority: 4, autoPublish: false, reliability: 75,
    note: 'Programma dettagliato ufficiale locale con orari (Sagra del Pesce XLVII, Vista Festival, Ferragosto)' },
  { name: 'Città di Galatina — Eventi (portale civico)', municipality: 'Galatina',
    url: 'https://www.galatina.it/eventi', type: 'municipality', parser: 'generic_html',
    priority: 3, autoPublish: true, reliability: 80, note: 'Portale civico cittadino (Estate della Civetta 2026)' },
  { name: 'Galatina.info — Eventi a Galatina', municipality: 'Galatina',
    url: 'https://www.galatina.info/eventi-galatina/', type: 'association', parser: 'generic_html',
    priority: 4, autoPublish: false, reliability: 70, note: 'Calendario eventi cittadino (The Events Calendar, dati strutturati)' },
  { name: 'Visit Gallipoli — Eventi (DMO cittadina)', municipality: 'Gallipoli',
    url: 'https://www.visit-gallipoli.com/eventi/', type: 'municipality', parser: 'generic_html',
    priority: 3, autoPublish: true, reliability: 80, note: 'Destination management cittadina con calendario verificato e dati strutturati (Parco Gondar…)' },
  { name: 'Tricase — Festa di San Vito (OpenCities, canale civico)', municipality: 'Tricase',
    url: 'https://www.opencitiesonline.com/it/eventi-mobile-it/festa-patronale/festa-di-san-vito',
    type: 'municipality', parser: 'generic_html', priority: 4, autoPublish: false, reliability: 70,
    note: 'Scheda ufficiale festa patronale 9-11 agosto' },

  // --- Aggregatori provinciali e stagionali (mandato: mai auto-pubblicanti,
  //     utili per scoperta e risalita alla fonte; i candidati vanno in revisione) ---
  { name: 'Torrevado.info — Sagre ed eventi Salento 2026', municipality: null,
    url: 'https://www.torrevado.info/eventi-sagre/', type: 'aggregator', parser: 'torrevado_calendar',
    priority: 5, autoPublish: false, reliability: 65, note: 'Calendario sagre/pro loco provinciale aggiornato (Ugento, Tricase, Andrano, Melendugno…)' },
  { name: 'PuntaProsciutto — Eventi Salento Estate 2026', municipality: null,
    url: 'https://www.puntaprosciutto.com/blog/eventi-salento-estate-2026', type: 'aggregator',
    parser: 'generic_html', priority: 6, autoPublish: false, reliability: 60, note: 'Guida stagionale con tabelle per Comune' },
  { name: 'ilGallo — Estate Salentina 2026 settimana per settimana', municipality: null,
    url: 'https://www.ilgallo.it/appuntamenti/estate-salentina-2026-tutti-gli-eventi-settimana-dopo-settimana/',
    type: 'aggregator', parser: 'generic_html', priority: 6, autoPublish: false, reliability: 60,
    note: 'Testata locale: appuntamenti datati (Galatina Birra & Sound, Ugento Festival Armonia…)' },
  { name: 'LaTerraDiPuglia — Eventi Salento agosto 2026', municipality: null,
    url: 'https://www.laterradipuglia.it/2026/eventi-salento-agosto.htm', type: 'aggregator',
    parser: 'generic_html', priority: 6, autoPublish: false, reliability: 60,
    note: 'Guida giorno per giorno (Cibus Uxenti, Sagra Ciceri e Tria…)' },
  { name: 'SalentoRents — Calendario sagre e feste Salento', municipality: null,
    url: 'https://salentorents.com/magazine/sagre-e-feste-nel-salento-calendario-completo-date-da-verificare-ogni-anno/',
    type: 'aggregator', parser: 'generic_html', priority: 6, autoPublish: false, reliability: 55,
    note: 'Calendario annuale sagre con date 2026' },
];

let created = 0, updated = 0;
for (const item of SOURCES) {
  const muni = item.municipality ? await one('SELECT id FROM municipalities WHERE name=$1', [item.municipality]) : null;
  const existing = await one('SELECT id, priority, auto_publish FROM sources WHERE url=$1', [item.url]);
  const key = `web-sweep-2026-08-${stableHash(item.url).slice(0, 12)}`;
  const rows = await query(`INSERT INTO sources (source_key,entity_name,municipality_id,source_type,url,base_url,
      format,priority,authority_level,parser_type,status,approved,auto_publish,active,discovery_only,crawl_policy,reliability_score,notes,next_check_at)
    VALUES ($1,$2,$3,$4,$5,$6,'html',$7,$8,$9,'approved',TRUE,$10,TRUE,FALSE,'public_page',$11,$12,NOW())
    ON CONFLICT (url) DO UPDATE SET
      municipality_id=COALESCE(sources.municipality_id,EXCLUDED.municipality_id),
      status='approved', approved=TRUE, active=TRUE,
      auto_publish=(sources.auto_publish OR EXCLUDED.auto_publish),
      priority=LEAST(sources.priority, EXCLUDED.priority),
      parser_type=CASE WHEN sources.parser_type LIKE '%discovery' THEN EXCLUDED.parser_type ELSE sources.parser_type END,
      discovery_only=FALSE, notes=COALESCE(sources.notes,'')||' | '||EXCLUDED.notes, updated_at=NOW()
    RETURNING id, (xmax = 0) AS inserted`,
    [key, item.name, muni?.id || null, item.type, item.url, new URL(item.url).origin,
     item.priority, item.priority <= 3 ? 'institutional' : item.priority === 4 ? 'confirmed' : 'secondary',
     item.parser, item.autoPublish, item.reliability, `${SWEEP}: ${item.note}`]);
  rows[0]?.inserted ? created++ : updated++;
  await query(`INSERT INTO source_discoveries (url,label,municipality_id,parser_hint,status,resolved_by,resolved_at)
    VALUES ($1,$2,$3,$4,'approved',$5,NOW())
    ON CONFLICT (url) DO UPDATE SET status='approved', resolved_by=$5, resolved_at=NOW(),
      municipality_id=COALESCE(source_discoveries.municipality_id,EXCLUDED.municipality_id)`,
    [item.url, item.name, muni?.id || null, item.parser, SWEEP]);
  console.log(`${rows[0]?.inserted ? '+NUOVA' : '=agg.'}  ${item.name}`);
}
console.log(`\nSweep completato: ${created} fonti nuove registrate, ${updated} aggiornate. Ora gli eventi entreranno solo via pipeline.`);
const { pool } = await getDb();
await pool.end();
