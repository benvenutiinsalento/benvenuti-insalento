import { query, one } from './db.mjs';

// COVERAGE_WARNING (BLOCCO DI VERIFICA punto 6): "0 eventi" NON significa
// "non ci sono eventi". Sotto la soglia plausibile per il periodo si apre un
// avviso esplicito, visibile in backoffice e nel report di copertura.
// Soglie stagionali: giugno–settembre i Comuni turistici devono avere segnali.
export const TOURIST_MUNICIPALITIES = new Set([
  'Lecce', 'Gallipoli', 'Otranto', 'Nardò', 'Porto Cesareo', 'Galatina', 'Ugento',
  'Tricase', 'Andrano', 'Maglie', 'Melendugno', 'Casarano', 'Leverano', 'Copertino',
  'Galatone', 'Galatina', 'Neviano', 'Tuglie', 'Parabita', 'Matino', 'Taviano',
  'Racale', 'Alliste', 'Melissano', 'Alessano', 'Specchia', 'Miggiano', 'Montesano Salentino',
  'Castro', 'Diso', 'Marittima', 'Andrano', 'Spongano', 'Corsano', 'Tiggiano', 'Gagliano del Capo',
  'Castrignano del Capo', 'Salve', 'Morciano di Leuca', 'Patù', 'Presicce-Acquarica',
  'Santa Cesarea Terme', 'Minervino di Lecce', 'Giurdignano', 'Ortelle', 'Poggiardo',
  'San Cassiano', 'Corigliano d’Otranto', 'Martano', 'Soleto', 'Sternatia', 'Zollino',
  'Vernole', 'Carpignano Salentino', 'Cannole', 'Bagnolo del Salento', 'Palmariggi',
  'Giuggianello', 'Muro Leccese', 'Sanarica', 'Scorrano', 'Supersano', 'Ruffano',
  'Collepasso', 'Sannicola', 'Alezio', 'Veglie', 'Campi Salentina', 'Salice Salentino',
  'Guagnano', 'San Donaci', 'San Pancrazio Salentino', 'Torchiarolo', 'San Pietro Vernotico',
  'Cellino San Marco', 'Squinzano', 'Trepuzzi', 'Surbo', 'Monteroni di Lecce',
  'Carmiano', 'Novoli', 'Arnesano', 'Cavallino', 'Lizzanello', 'San Cesario di Lecce',
  'Lequile', 'San Pietro in Lama', 'Castrì di Lecce', 'Caprarica di Lecce', 'Calimera',
  'Martignano', 'Castri di Lecce', 'Botrugno', 'Nociglia', 'Mela', 'Cutrofiano', 'Aradeo',
])

// Alias robusti: alcuni nomi canonici usano l’apostrofo tipografico
export function isTouristMunicipality(name = '') {
  const plain = String(name).replace(/[\u2019']/g, "'").trim().toLowerCase();
  if (TOURIST_MUNICIPALITIES.has(name)) return true;
  for (const item of TOURIST_MUNICIPALITIES) {
    if (item.replace(/[\u2019']/g, "'").toLowerCase() === plain) return true;
  }
  return false;
}

// Valuta i Comuni e apre/risolve gli avvisi. Ritorna il riepilogo.
export async function evaluateCoverageWarnings({ windowDays = 10, runId = null, onlyMunicipalities = null } = {}) {
  const month = Number(new Intl.DateTimeFormat('en', { timeZone: 'Europe/Rome', month: 'numeric' }).format(new Date()));
  const highSeason = month >= 6 && month <= 9;
  const rows = await query(`SELECT m.id, m.name,
      (SELECT COUNT(DISTINCT e.id)::int FROM events e JOIN event_occurrences o ON o.event_id = e.id
        WHERE e.municipality_id = m.id AND e.status IN ('published','postponed')
          AND o.occurrence_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ($1::int - 1) * INTERVAL '1 day') AS events_found
    FROM municipalities m ${onlyMunicipalities?.length ? 'WHERE m.name = ANY($2::text[])' : ''}
    ORDER BY m.name`,
    onlyMunicipalities?.length ? [windowDays, onlyMunicipalities] : [windowDays]);
  const results = [];
  for (const row of rows) {
    const tourist = isTouristMunicipality(row.name);
    const threshold = highSeason ? (tourist ? 2 : 1) : (tourist ? 1 : 0);
    if (threshold === 0) { results.push({ ...row, threshold, warning: false }); continue; }
    if (row.events_found < threshold) {
      await query(`INSERT INTO coverage_warnings (municipality_id, window_from, window_to, events_found, threshold, reason, status, run_id)
        VALUES ($1, CURRENT_DATE, CURRENT_DATE + ($4::int - 1) * INTERVAL '1 day', $2, $3,
          'Sotto soglia plausibile per un Comune turistico in alta stagione: 0-1 eventi trovati NON significa che non ci siano eventi',
          'open', $5)
        ON CONFLICT (municipality_id, window_from, window_to)
        DO UPDATE SET events_found = EXCLUDED.events_found, status = 'open', run_id = EXCLUDED.run_id, resolved_at = NULL`,
        [row.id, row.events_found, threshold, windowDays, runId]);
      results.push({ ...row, threshold, warning: true });
    } else {
      await query(`UPDATE coverage_warnings SET status='resolved', resolved_at=NOW(), resolution_note='Soglia raggiunta: ' || $2 || ' eventi su ' || $3
        WHERE municipality_id=$1 AND status IN ('open','investigating') AND window_from >= CURRENT_DATE - INTERVAL '30 days'`,
        [row.id, row.events_found, threshold]);
      results.push({ ...row, threshold, warning: false });
    }
  }
  return {
    evaluated: rows.length,
    warnings: results.filter((r) => r.warning),
    highSeason,
    windowDays,
  };
}
