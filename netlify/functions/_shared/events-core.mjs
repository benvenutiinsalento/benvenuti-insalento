const ROMAN = new Map([
  ["i", "1"], ["ii", "2"], ["iii", "3"], ["iv", "4"], ["v", "5"], ["vi", "6"], ["vii", "7"], ["viii", "8"],
  ["ix", "9"], ["x", "10"], ["xi", "11"], ["xii", "12"], ["xiii", "13"], ["xiv", "14"], ["xv", "15"],
  ["xvi", "16"], ["xvii", "17"], ["xviii", "18"], ["xix", "19"], ["xx", "20"], ["xxi", "21"],
  ["xxii", "22"], ["xxiii", "23"], ["xxiv", "24"], ["xxv", "25"], ["xxvi", "26"], ["xxvii", "27"],
  ["xxviii", "28"], ["xxix", "29"], ["xxx", "30"], ["xxxi", "31"], ["xxxii", "32"], ["xxxiii", "33"],
  ["xxxiv", "34"], ["xxxv", "35"], ["xxxvi", "36"], ["xxxvii", "37"], ["xxxviii", "38"], ["xxxix", "39"],
  ["xl", "40"], ["xli", "41"], ["xlii", "42"], ["xliii", "43"], ["xliv", "44"], ["xlv", "45"],
]);

const TITLE_NOISE = new Set(["sagra", "festa", "festival", "manifestazione", "evento", "patronale", "patronali", "edizione", "della", "delle", "degli", "del", "di", "la", "le", "il", "lo", "un", "una"]);

export function normalizeSearchText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`´]/g, "'")
    .toLocaleLowerCase("it")
    .replace(/\b([ivxlcdm]{1,8})\b/gi, (match) => ROMAN.get(match.toLowerCase()) || match)
    .replace(/[^a-z0-9'\s-]/g, " ")
    .replace(/['-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeTitle(value = "") {
  return normalizeSearchText(value)
    .split(" ")
    .filter((token) => token && !TITLE_NOISE.has(token))
    .join(" ");
}

export function normalizeTown(value = "", aliases = new Map()) {
  const key = normalizeSearchText(value);
  return aliases.get(key) || String(value).trim();
}

export function canonicalEventKey(event, aliases = new Map()) {
  const town = normalizeSearchText(normalizeTown(event.town || event.municipality || "", aliases));
  const title = normalizeTitle(event.title);
  const dates = [...new Set(event.occurrenceDates?.length ? event.occurrenceDates : [event.startDate])].sort().join(",");
  return `${town}|${title}|${dates}`;
}

export function eventSearchText(event) {
  return normalizeSearchText([
    event.title,
    event.description,
    event.town,
    event.locality,
    event.venue,
    event.organizer,
    ...(event.tags || []),
    ...(event.artists || []),
  ].filter(Boolean).join(" "));
}

function tokenSet(value) {
  return new Set(normalizeTitle(value).split(" ").filter(Boolean));
}

export function titleSimilarity(left, right) {
  const a = tokenSet(left);
  const b = tokenSet(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

export function sameEvent(left, right, aliases = new Map()) {
  const leftTown = normalizeSearchText(normalizeTown(left.town || "", aliases));
  const rightTown = normalizeSearchText(normalizeTown(right.town || "", aliases));
  if (!leftTown || leftTown !== rightTown) return false;
  const leftDates = new Set(left.occurrenceDates?.length ? left.occurrenceDates : [left.startDate]);
  const rightDates = new Set(right.occurrenceDates?.length ? right.occurrenceDates : [right.startDate]);
  if (![...leftDates].some((date) => rightDates.has(date))) return false;
  return titleSimilarity(left.title, right.title) >= 0.45;
}

export function sourceAuthority(priority = 9) {
  return Math.max(0, 10 - Number(priority || 9));
}

export function mergeEvents(existing, incoming) {
  const incomingWins = sourceAuthority(incoming.sourcePriority) > sourceAuthority(existing.sourcePriority);
  const primary = incomingWins ? incoming : existing;
  const secondary = incomingWins ? existing : incoming;
  const occurrenceDates = [...new Set([
    ...(primary.occurrenceDates || []),
    ...(secondary.occurrenceDates || []),
    primary.startDate,
    secondary.startDate,
  ].filter(Boolean))].sort();
  return {
    ...secondary,
    ...primary,
    description: primary.description?.length >= (secondary.description?.length || 0) ? primary.description : secondary.description,
    tags: [...new Set([...(primary.tags || []), ...(secondary.tags || [])])],
    secondaryCategories: [...new Set([...(primary.secondaryCategories || []), ...(secondary.secondaryCategories || [])])],
    audiences: [...new Set([...(primary.audiences || []), ...(secondary.audiences || [])])],
    artists: [...new Set([...(primary.artists || []), ...(secondary.artists || [])])],
    occurrenceDates,
    startDate: occurrenceDates[0] || primary.startDate,
    endDate: occurrenceDates.at(-1) || primary.endDate,
    sourceUrls: [...new Set([...(existing.sourceUrls || [existing.sourceUrl]), ...(incoming.sourceUrls || [incoming.sourceUrl])].filter(Boolean))],
    discrepancies: [...new Set([...(existing.discrepancies || []), ...(incoming.discrepancies || [])])],
  };
}


export function mergeSameSourceUpdate(existing, incoming) {
  const pick = (fresh, previous) => {
    if (fresh == null) return previous;
    if (typeof fresh === "string" && !fresh.trim()) return previous;
    return fresh;
  };
  const pickArray = (fresh, previous) => Array.isArray(fresh) && fresh.length ? fresh : (previous || []);
  return {
    ...existing,
    ...incoming,
    title: pick(incoming.title, existing.title),
    description: pick(incoming.description, existing.description),
    primaryCategory: pick(incoming.primaryCategory, existing.primaryCategory),
    secondaryCategories: pickArray(incoming.secondaryCategories, existing.secondaryCategories),
    tags: [...new Set([...(existing.tags || []), ...(incoming.tags || [])])],
    audiences: [...new Set([...(existing.audiences || []), ...(incoming.audiences || [])])],
    artists: pickArray(incoming.artists, existing.artists),
    startDate: pick(incoming.startDate, existing.startDate),
    endDate: pick(incoming.endDate, incoming.startDate || existing.endDate),
    occurrenceDates: Array.isArray(incoming.occurrenceDates) && incoming.occurrenceDates.length
      ? [...new Set(incoming.occurrenceDates)].sort()
      : (existing.occurrenceDates || []),
    originalTimeText: pick(incoming.originalTimeText, existing.originalTimeText),
    venue: pick(incoming.venue, existing.venue),
    address: pick(incoming.address, existing.address),
    locality: pick(incoming.locality, existing.locality),
    organizer: pick(incoming.organizer, existing.organizer),
    imageUrl: pick(incoming.imageUrl, existing.imageUrl),
    bookingUrl: pick(incoming.bookingUrl, existing.bookingUrl),
    sourceUrls: [...new Set([...(existing.sourceUrls || [existing.sourceUrl]), incoming.sourceUrl].filter(Boolean))],
  };
}

export function deduplicateEvents(events, aliases = new Map()) {
  const merged = [];
  let duplicates = 0;
  for (const event of events) {
    const index = merged.findIndex((candidate) => sameEvent(candidate, event, aliases));
    if (index < 0) merged.push(event);
    else {
      merged[index] = mergeEvents(merged[index], event);
      duplicates += 1;
    }
  }
  return { events: merged, duplicates };
}

export function isFamilyFriendly(event) {
  if ((event.audiences || []).map(normalizeSearchText).includes("famiglie")) return true;
  if ((event.tags || []).map(normalizeSearchText).some((tag) => ["famiglie", "bambini", "family"].includes(tag))) return true;
  return /bambin|famigli|ragazz|laboratori?|giochi|animazione|burattin|fiab|mago|circo|aquilon|melevisione/i.test(
    `${event.title || ""} ${event.description || ""} ${event.programText || ""}`,
  );
}

export function classifyEvent(text = "") {
  const value = normalizeSearchText(text);
  if (/patronal|madonna|sant |san |santa |procession|parrocchi/.test(value)) return "Feste patronali";
  if (/sagra|food|gusto|gastronomi|birra|vino|pitta|frisa|pasticciott|street food|degustaz/.test(value)) return "Sagre";
  if (/sport|torneo|gara|podistic|cicl|calcio|basket|pallavolo|regata/.test(value)) return "Sport";
  if (/bambin|famigli|laborator|giochi|burattin|circo/.test(value)) return "Per famiglie";
  if (/mercatin|artigian/.test(value)) return "Mercatini";
  if (/concerto|musica|pizzica|dj set|band|orchestra/.test(value)) return "Musica e pizzica";
  if (/teatro|mostra|libro|cinema|cultura|museo|visita/.test(value)) return "Cultura";
  return "Altro";
}

export function eventOccursOn(event, day) {
  if (event.occurrenceDates?.length) return event.occurrenceDates.includes(day);
  return event.startDate <= day && event.endDate >= day;
}

export function eventOccursInRange(event, from, to) {
  if (event.occurrenceDates?.length) return event.occurrenceDates.some((day) => day >= from && day <= to);
  return event.startDate <= to && event.endDate >= from;
}

export function matchesEventFilters(event, filters = {}) {
  const from = filters.from || filters.date;
  const to = filters.to || from;
  if (from && to && !eventOccursInRange(event, from, to)) return false;
  if (filters.town && event.town !== filters.town) return false;
  if (filters.category) {
    const categoryMatch = filters.category === "Per famiglie"
      ? isFamilyFriendly(event)
      : event.primaryCategory === filters.category || event.category === filters.category || (event.secondaryCategories || []).includes(filters.category);
    if (!categoryMatch) return false;
  }
  if (filters.q) {
    const searchable = eventSearchText(event);
    const queryTokens = normalizeSearchText(filters.q).split(/\s+/).filter(Boolean);
    if (!queryTokens.every((token) => searchable.includes(token))) return false;
  }
  return true;
}

export function selectFreshOrLastValid(fresh, lastValid) {
  return fresh?.valid && Array.isArray(fresh.events) ? fresh : lastValid;
}

export function territoryCoverageStatus(successfulSources, publishedEvents = 0) {
  if (successfulSources >= 2) return "complete";
  if (successfulSources >= 1 || publishedEvents > 0) return "partial";
  return "none";
}

export function detectEventStatus(text = "") {
  const value = normalizeSearchText(text);
  if (/annullat|cancellat|non si terra|non avra luogo/.test(value)) return "cancelled";
  if (/rinviat|posticipat|nuova data/.test(value)) return "postponed";
  return null;
}

export function validateEvent(event, nowYear = new Date().getUTCFullYear()) {
  const errors = [];
  if (!event.title || normalizeTitle(event.title).length < 2) errors.push("title_missing");
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(event.startDate || "")) errors.push("date_missing");
  else if (Number.isNaN(new Date(`${event.startDate}T12:00:00Z`).getTime())) errors.push("date_invalid");
  if (event.endDate && event.endDate < event.startDate) errors.push("date_range_invalid");
  if (!event.town) errors.push("town_missing");
  if (!event.sourceUrl || !/^https:\/\//.test(event.sourceUrl)) errors.push("source_missing");
  const eventYear = Number(String(event.startDate || "").slice(0, 4));
  if (event.inferredYear && eventYear === nowYear && event.sourceYear && Number(event.sourceYear) !== nowYear) errors.push("year_inferred_from_old_source");
  return { valid: errors.length === 0, errors };
}

export function stableHash(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value, Object.keys(value || {}).sort());
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function romeIsoDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

// ---------------------------------------------------------------------------
// Layer Supabase (v13): mapping mandate-aligned. Pure helpers, unit-testabili.
// ---------------------------------------------------------------------------

// Alias nomi categoria prodotti dai parser legacy -> slug mandate.
export const CATEGORY_SLUG_BY_NAME = {
  'sagre': 'sagre',
  'feste patronali': 'feste-patronali',
  'tradizioni': 'tradizioni',
  'pizzica e musica popolare': 'pizzica-e-musica-popolare',
  'musica e pizzica': 'pizzica-e-musica-popolare',
  'concerti': 'concerti',
  'musica dal vivo': 'musica-dal-vivo',
  'festival': 'festival',
  'cultura': 'cultura',
  'teatro': 'teatro',
  'cinema': 'cinema',
  'arte e mostre': 'arte-e-mostre',
  'mercatini': 'mercatini',
  'enogastronomia': 'enogastronomia',
  'famiglie e bambini': 'famiglie-e-bambini',
  'per famiglie': 'famiglie-e-bambini',
  'sport': 'sport',
  'natura': 'natura',
  'religione': 'religione',
  'nightlife': 'nightlife',
  'workshop e laboratori': 'workshop-e-laboratori',
  'visite guidate': 'visite-guidate',
  'altro': 'altro',
};

export function categorySlug(name = '') {
  const key = normalizeSearchText(name);
  return CATEGORY_SLUG_BY_NAME[key] || 'altro';
}

// Fonte prioritaria -> livello di verifica del mandato.
export function verificationLevelForPriority(priority = 9) {
  const p = Number(priority) || 9;
  if (p <= 1) return 'official';
  if (p <= 3) return 'institutional';
  if (p === 4) return 'confirmed';
  if (p <= 6) return 'secondary';
  return 'unverified';
}

// Confidence cosentina: parser strutturati deterministici = alta; HTML generico
// = medio-alta; OCR = passata dal parser, altrimenti bassa (mandato: soglie 0.90/0.80).
export function deriveConfidence(candidate = {}, source = {}) {
  if (Number.isFinite(Number(candidate.confidence))) return Math.max(0, Math.min(1, Number(candidate.confidence)));
  const structured = ['puglia_json', 'ics', 'json_ld', 'ipa_entities', 'rss', 'atom'];
  if (structured.includes(source.parser_type)) return 0.95;
  if (['poster', 'pdf', 'pdf_scan'].includes(source.parser_type)) return 0.6;
  return 0.8;
}

// Date + orari -> occorrenze. Mai comprimere date discontinue in un intervallo.
// output: [{date, startTime, endTime, allDay, overnight, scheduleText, status}]
export function buildOccurrences(event = {}) {
  const dates = [...new Set((event.occurrenceDates || []).filter(Boolean))].sort();
  const startTime = event.startTime || '';
  const endTime = event.endTime || '';
  const overnight = Boolean(startTime && endTime && endTime <= startTime);
  const status = event.status === 'cancelled' ? 'cancelled' : event.status === 'postponed' ? 'postponed' : 'scheduled';
  if (dates.length) {
    return dates.slice(0, 90).map((date) => ({
      date, startTime: startTime || null, endTime: endTime || null,
      allDay: !startTime, overnight, scheduleText: event.originalTimeText || null, status,
    }));
  }
  if (!event.startDate) return [];
  if (event.endDate && event.endDate > event.startDate) {
    // Evento continuo multi-giorno: esplicitiamo le giornate (max 60)
    const out = [];
    const cursor = new Date(`${event.startDate}T12:00:00Z`);
    const end = new Date(`${event.endDate}T12:00:00Z`);
    let guard = 0;
    while (cursor <= end && guard < 60) {
      out.push({
        date: cursor.toISOString().slice(0, 10),
        startTime: startTime || null, endTime: endTime || null,
        allDay: !startTime, overnight, scheduleText: event.originalTimeText || null, status,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      guard += 1;
    }
    return out;
  }
  return [{
    date: event.startDate, startTime: startTime || null, endTime: endTime || null,
    allDay: !startTime, overnight, scheduleText: event.originalTimeText || null, status,
  }];
}

// Regola pubblicazione automatica del mandato.
export function canAutoPublish({ source, verificationLevel, confidence, municipality, occurrences, hasCriticalConflict }) {
  const future = (occurrences || []).some((o) => o.date >= romeIsoDate());
  return Boolean(
    source?.approved && source?.auto_publish
    && ['official', 'institutional', 'confirmed'].includes(verificationLevel)
    && confidence >= 0.9
    && municipality
    && future
    && !hasCriticalConflict,
  );
}

// Preset temporali in Europe/Rome (mandato): today|evening|tomorrow|weekend|seven
export function resolvePreset(preset = '', now = new Date()) {
  const key = normalizeSearchText(preset);
  const day = romeIsoDate(now);
  const shift = (iso, days) => {
    const d = new Date(`${iso}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  if (['oggi', 'today'].includes(key)) return { from: day, to: day };
  if (['stasera', 'evening', 'tonight'].includes(key)) return { from: day, to: day, evening: true };
  if (['domani', 'tomorrow'].includes(key)) return { from: shift(day, 1), to: shift(day, 1) };
  if (['weekend', 'week end'].includes(key)) {
    // venerdì dalle 18:00, sabato e domenica (regola documentata in UI).
    // Se siamo già nel weekend: sabato -> oggi+domani; domenica -> solo oggi.
    const dow = new Date(`${day}T12:00:00Z`).getUTCDay(); // 0=dom .. 6=sab
    if (dow === 6) return { from: day, to: shift(day, 1), weekend: true };
    if (dow === 0) return { from: day, to: day, weekend: true };
    const toFri = (5 - dow + 7) % 7;
    return { from: shift(day, toFri), to: shift(day, toFri + 2), weekend: true };
  }
  if (['7 giorni', 'sette giorni', 'seven', 'prossimi 7 giorni', 'next7', 'settimana'].includes(key)) {
    return { from: day, to: shift(day, 6) };
  }
  return null;
}
