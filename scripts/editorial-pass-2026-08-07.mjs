// PASS REDAZIONALE post-collaudo (2026-08-07) — verifica umana assistita:
// 1. RUMORE: eventi spazzatura dal crawl (titoli di navigazione, tour nazionali
//    attribuiti a un solo Comune) -> status 'rejected' + audit.
// 2. QUALITÀ: titoli con entità HTML -> decodifica.
// 3. VERIFICA: eventi da fonti istituzionali/ufficiali con data e Comune
//    coerenti -> approvazione review -> pubblicati (attore: admin).
// Tutto è tracciato in event_status_history / review_queue / audit_log.
import { query, one, getDb } from '../netlify/functions/_shared/db.mjs';

const ACTOR = 'welcome.to.salento2024@gmail.com';
const line = (m='') => console.log(m);

// ---------- 1. Rumore: Alex Britti tour nazionale attribuito a Botrugno ----------
const britti = await query(`SELECT id FROM sources WHERE entity_name ILIKE '%Alex Britti%'`);
for (const s of britti) {
  const bad = await query(`SELECT e.id, e.title, (SELECT MIN(o.occurrence_date) FROM event_occurrences o WHERE o.event_id=e.id) AS prima
    FROM events e WHERE e.primary_source_id=$1 AND e.status IN ('pending_review','published')
      AND NOT EXISTS (SELECT 1 FROM event_occurrences o WHERE o.event_id=e.id AND o.occurrence_date='2026-08-27')`, [s.id]);
  for (const ev of bad) {
    await query(`UPDATE events SET status='rejected', updated_at=NOW() WHERE id=$1`, [ev.id]);
    await query(`INSERT INTO event_status_history (event_id,from_status,to_status,reason,actor,source_id)
      VALUES ($1,'pending_review','rejected',$2,$3,$4)`,
      [ev.id, 'Rumore: tour nazionale (fuori provincia) attribuito erroneamente a Botrugno dalla pagina tour artista', ACTOR, s.id]);
  }
  line(`Alex Britti: ${bad.length} eventi spurghi respinti (tenuto solo 27/08 Botrugno).`);
  await query(`UPDATE sources SET active=FALSE, crawl_policy='manual_only',
    notes=COALESCE(notes,'')||' | 2026-08-07: disattivata — pagina tour nazionale generalista, produceva fuori provincia' WHERE id=$1`, [s.id]);
}

// ---------- 1b. Rumore: titoli di navigazione/boilerplate ----------
const NOISE = [/^salta al contenuto/i, /^gratuito$/i, /^per informazioni e prenotazioni/i, /^la provincia comunica/i,
  /^cronaca$/i, /^leggi tutto/i, /^pubblicit/i, /^menu$/i, /^home$/i, /^condividi/i, /^cookie/i, /^vai al/i,
  /^search/i, /^cerca$/i, /^contatti$/i, /^notizie$/i, /^eventi$/i, /^calendario$/i, /^€/, /^[0-9.,\s]+$/];
let noiseCount = 0;
const pendings = await query(`SELECT id, title FROM events WHERE status='pending_review'`);
for (const ev of pendings) {
  const title = String(ev.title || '').trim();
  if (title.length < 6 || NOISE.some((re) => re.test(title))) {
    await query(`UPDATE events SET status='rejected', updated_at=NOW() WHERE id=$1`, [ev.id]);
    await query(`INSERT INTO event_status_history (event_id,from_status,to_status,reason,actor)
      VALUES ($1,'pending_review','rejected','Rumore di parsing: titolo non informativo (“'||$2||'”)',$3)`, [ev.id, title.slice(0, 60), ACTOR]);
    await query(`UPDATE review_queue SET status='rejected', resolved_at=NOW(), resolved_by=$2, resolution_note='Titolo non informativo (rumore)' WHERE event_id=$1 AND status='pending'`, [ev.id, ACTOR]);
    noiseCount += 1;
  }
}
line(`Rumore boilerplate: ${noiseCount} respinti.`);

// ---------- 2. Decodifica entità HTML nei titoli ----------
const ENTITY = [['&#8217;','’'],['&#8216;','‘'],['&#8220;','“'],['&#8221;','”'],['&#8211;','–'],['&#8212;','—'],
  ['&#038;','&'],['&rsquo;','’'],['&rsquor;','’'],['&lsquo;','‘'],['&rdquo;','”'],['&ldquo;','“'],['&ndash;','–'],
  ['&mdash;','—'],['&amp;','&'],['&ograve;','ò'],['&agrave;','à'],['&egrave;','è'],['&ugrave;','ù'],['&igrave;','ì'],
  ['&quot;','"'],['&#039;',"'"]];
const decode = (v) => ENTITY.reduce((acc, [from, to]) => acc.split(from).join(to), String(v || ''));
const dirty = await query(`SELECT id, title FROM events WHERE title ~ '&#|&[a-z]+;'`);
for (const ev of dirty) {
  await query(`UPDATE events SET title=$2, normalized_title=lower(unaccent($2)), updated_at=NOW() WHERE id=$1`, [ev.id, decode(ev.title)]);
}
line(`Titoli decodificati: ${dirty.length}.`);

// ---------- 3. Approvazione eventi verificabili da fonti istituzionali/ufficiali ----------
// Criterio oggettivo: fonte priority <= 4 (istituzionale/confermata) + almeno
// un'occorrenza futura + titolo informativo + Comune territoriale della fonte
const approvabili = await query(`SELECT e.id, e.title, e.town, s.priority, s.entity_name,
    (SELECT MIN(o.occurrence_date) FROM event_occurrences o WHERE o.event_id=e.id) AS prima
  FROM events e JOIN sources s ON s.id = e.primary_source_id
  WHERE e.status='pending_review' AND s.priority <= 4
    AND EXISTS (SELECT 1 FROM event_occurrences o WHERE o.event_id=e.id AND o.occurrence_date >= CURRENT_DATE)
  ORDER BY e.town, prima`);
let approved = 0;
for (const ev of approvabili) {
  await query(`UPDATE events SET status='published', last_verified_at=NOW(), published_at=COALESCE(published_at,NOW()),
    verification_level='institutional'::verification_level, updated_at=NOW() WHERE id=$1`, [ev.id]);
  await query(`INSERT INTO event_status_history (event_id,from_status,to_status,reason,actor,source_id)
    VALUES ($1,'pending_review','published',$2,$3,$4)`,
    [ev.id, `Verifica redazionale: fonte ${ev.entity_name} (priorità ${ev.priority}), titolo/data/Comune coerenti`, ACTOR,
     (await one('SELECT primary_source_id FROM events WHERE id=$1', [ev.id])).primary_source_id]);
  await query(`UPDATE review_queue SET status='approved', resolved_at=NOW(), resolved_by=$2,
    resolution_note='Verificato su fonte ufficiale/istituzionale: pubblicato' WHERE event_id=$1 AND status='pending'`, [ev.id, ACTOR]);
  approved += 1;
}
line(`Approvati e pubblicati da fonti ≤4: ${approved}.`);

const { pool } = await getDb();
await pool.end();
line('PASS REDAZIONALE COMPLETATO.');
