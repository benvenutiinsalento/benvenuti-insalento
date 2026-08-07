// Repository eventi — layer dati Supabase (v13).
// Modello: events + event_occurrences (mai comprimere date discontinue),
// event_sources/categories/tags/audiences, versioni, storico stati, audit.
// Contratti di output pubblici invariati rispetto alla v12 (camelCase), così
// frontend e pagine SEO continuano a funzionare senza modifiche immediate.
import { query, one, transaction } from './db.mjs';
import {
  buildOccurrences, canAutoPublish, canonicalEventKey, categorySlug, deriveConfidence,
  eventSearchText, mergeEvents, mergeSameSourceUpdate, normalizeSearchText,
  romeIsoDate, sameEvent, stableHash, validateEvent, verificationLevelForPriority,
} from './events-core.mjs';
import { uniqueEventSlug } from './slug.mjs';

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  try { return JSON.parse(value); } catch { return []; }
}

function mapRow(row) {
  if (!row) return null;
  const occurrences = asArray(row.occurrences);
  const dates = occurrences.map((o) => String(o.date).slice(0, 10)).sort();
  const first = occurrences[0] || null;
  const categories = asArray(row.categories);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description,
    shortDescription: row.short_description || '',
    primaryCategory: categories[0] || 'Altro',
    secondaryCategories: categories.slice(1),
    categories,
    tags: asArray(row.tags),
    audiences: asArray(row.audiences),
    startDate: dates[0] || '',
    endDate: dates.at(-1) || dates[0] || '',
    startTime: first?.startAt ? new Date(first.startAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' }) : '',
    endTime: '',
    occurrenceDates: dates,
    occurrences,
    originalTimeText: row.original_time_text || '',
    town: row.town,
    locality: row.locality || '',
    localityType: row.locality_type || '',
    venue: row.venue || '',
    address: row.address || '',
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    distanceKm: row.distance_km == null ? null : Number(row.distance_km),
    locationAccuracy: row.location_accuracy || 'unknown',
    priceText: row.price_text || '',
    priceType: row.is_free ? 'free' : (row.price_text ? 'paid' : 'unknown'),
    isFree: Boolean(row.is_free),
    bookingRequired: Boolean(row.booking_required),
    bookingUrl: row.booking_url || '',
    organizer: row.organizer || '',
    organizerUrl: row.organizer_url || '',
    contactEmail: row.contact_email || '',
    contactPhone: row.contact_phone || '',
    imageUrl: row.image_url || '',
    accessibilityText: row.accessibility_text || '',
    parkingText: row.parking_text || '',
    status: row.status,
    verificationLevel: row.verification_level,
    confidenceScore: row.confidence_score == null ? 0 : Number(row.confidence_score),
    sourceUrl: row.source_url,
    sourceName: row.source_name,
    firstDiscoveredAt: row.first_discovered_at,
    lastCheckedAt: row.last_checked_at,
    lastVerifiedAt: row.last_verified_at,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    municipalitySlug: row.municipality_slug || '',
  };
}

const OCCURRENCES_SUBSELECT = `COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'id', o.id,
      'startAt', o.start_at,
      'endAt', o.end_at,
      'allDay', o.all_day,
      'timezone', o.timezone,
      'doorsOpenAt', o.doors_open_at,
      'scheduleText', o.schedule_text,
      'status', o.status,
      'date', o.occurrence_date) ORDER BY o.start_at)
    FROM event_occurrences o WHERE o.event_id = e.id), '[]'::jsonb)`;

const BASE_COLS = `
  SELECT e.*, m.slug AS municipality_slug, l.name AS locality_name, l.locality_type::text AS locality_type,
    ${OCCURRENCES_SUBSELECT} AS occurrences,
    COALESCE((SELECT array_agg(c.name ORDER BY ec.is_primary DESC, c.sort_order)
              FROM event_categories ec JOIN categories c ON c.id = ec.category_id
              WHERE ec.event_id = e.id), '{}'::text[]) AS categories,
    COALESCE((SELECT array_agg(t.tag) FROM event_tags t WHERE t.event_id = e.id), '{}'::text[]) AS tags,
    COALESCE((SELECT array_agg(a.audience) FROM event_audiences a WHERE a.event_id = e.id), '{}'::text[]) AS audiences`;

const SOURCES_COL = `,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('name', s.entity_name, 'url', es.source_event_url,
            'priority', s.priority, 'isPrimary', es.is_primary) ORDER BY s.priority)
      FROM event_sources es JOIN sources s ON s.id = es.source_id WHERE es.event_id = e.id), '[]'::jsonb) AS sources`;

const BASE_FROM = `
  FROM events e
  LEFT JOIN municipalities m ON m.id = e.municipality_id
  LEFT JOIN localities l ON l.id = e.locality_id`;

const BASE_SELECT = BASE_COLS + BASE_FROM;

export async function listEvents(filters = {}) {
  const conditions = ["e.status IN ('published','postponed','cancelled')"];
  const params = [];
  const add = (value) => { params.push(value); return `$${params.length}`; };
  const today = filters.today || romeIsoDate();

  if (filters.from) {
    const to = filters.to || filters.from;
    conditions.push(`EXISTS (SELECT 1 FROM event_occurrences o WHERE o.event_id = e.id
      AND o.occurrence_date BETWEEN ${add(filters.from)}::date AND ${add(to)}::date)`);
    if (filters.weekend) {
      // Regola weekend (documentata in UI): venerdì solo dalle 18:00, sabato e domenica interi.
      conditions.push(`EXISTS (SELECT 1 FROM event_occurrences o WHERE o.event_id = e.id
        AND o.occurrence_date BETWEEN ${add(filters.from)}::date AND ${add(to)}::date
        AND EXTRACT(ISODOW FROM o.occurrence_date) IN (5,6,7)
        AND (EXTRACT(ISODOW FROM o.occurrence_date) <> 5
             OR o.all_day
             OR (o.start_at AT TIME ZONE o.timezone)::time >= TIME '18:00'))`);
    }
    if (filters.evening) {
      conditions.push(`(EXISTS (SELECT 1 FROM event_occurrences o WHERE o.event_id = e.id
          AND o.occurrence_date BETWEEN ${add(filters.from)}::date AND ${add(to)}::date
          AND (o.start_at AT TIME ZONE o.timezone)::time >= TIME '18:00')
        OR e.original_time_text ~* 'sera|serata|notturn|a cena|mezzanotte|cena spettacolo')`);
    }
  } else {
    // Ricerche normali: nessun evento completamente passato.
    conditions.push(`EXISTS (SELECT 1 FROM event_occurrences o WHERE o.event_id = e.id
      AND o.occurrence_date >= ${add(today)}::date)`);
  }

  if (filters.town) {
    conditions.push(`(e.town = ${add(filters.town)}
      OR e.municipality_id = (SELECT id FROM municipalities WHERE slug = ${add(filters.town)} LIMIT 1)
      OR e.municipality_id = (SELECT municipality_id FROM territorial_aliases WHERE normalized_alias = ${add(normalizeSearchText(filters.town))} LIMIT 1)
      OR e.town = (SELECT m.name FROM municipalities m WHERE m.slug = ${add(filters.town)} LIMIT 1))`);
  }
  if (filters.locality) {
    conditions.push(`(e.locality ILIKE ${add(filters.locality)}
      OR e.locality_id IN (SELECT id FROM localities WHERE normalized_name = ${add(normalizeSearchText(filters.locality))}))`);
  }
  const categoriesFilter = Array.isArray(filters.categories) && filters.categories.length
    ? filters.categories
    : (filters.category ? [filters.category] : []);
  if (categoriesFilter.length) {
    conditions.push(`EXISTS (SELECT 1 FROM event_categories ec JOIN categories c ON c.id = ec.category_id
      WHERE ec.event_id = e.id AND (c.slug = ANY(${add(categoriesFilter.map((c2) => categorySlug(c2)))}::text[]) OR c.name = ANY(${add(categoriesFilter)}::text[])))`);
  }
  if (filters.audience) {
    conditions.push(`EXISTS (SELECT 1 FROM event_audiences ea WHERE ea.event_id = e.id AND ea.audience = ${add(filters.audience)})`);
  }
  if (filters.priceType === 'free' || filters.free === true) conditions.push('e.is_free = TRUE');
  else if (filters.priceType === 'paid') conditions.push('e.is_free = FALSE AND e.price_text IS NOT NULL');
  if (filters.family) {
    conditions.push(`(EXISTS (SELECT 1 FROM event_audiences ea WHERE ea.event_id = e.id AND ea.audience IN ('famiglie','bambini'))
      OR e.search_text ~* 'bambin|famigli|laborator|giochi|animazione|burattin')`);
  }
  if (filters.q) {
    // FTS italiana + trigrammi + sinonimi (funzione search_events, migration 0001)
    conditions.push(`e.id IN (SELECT event_id FROM search_events(${add(String(filters.q).slice(0, 200))}))`);
  }

  let distanceExpression = 'NULL::double precision';
  // Geolocalizzazione solo se le coordinate arrivano davvero: Number(null) === 0
  // (finito!) attiverebbe il ramo distanza anche senza parametri nella query.
  const lat = (filters.lat === undefined || filters.lat === null || filters.lat === '') ? NaN : Number(filters.lat);
  const lng = (filters.lng === undefined || filters.lng === null || filters.lng === '') ? NaN : Number(filters.lng);
  const radius = (filters.radius === undefined || filters.radius === null || filters.radius === '') ? NaN : Number(filters.radius);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const pLat = add(lat);
    const pLng = add(lng);
    // Due varianti: WHERE nella CTE (tabella e + join municipalities, serve alias)
    // e SELECT esterna su filtered (senza alias; li' 'latitude' non e' ambiguo).
    const exprCte = `(6371 * acos(LEAST(1, GREATEST(-1,
      cos(radians(${pLat})) * cos(radians(e.latitude)) * cos(radians(e.longitude) - radians(${pLng})) +
      sin(radians(${pLat})) * sin(radians(e.latitude))
    ))))`;
    distanceExpression = `(6371 * acos(LEAST(1, GREATEST(-1,
      cos(radians(${pLat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${pLng})) +
      sin(radians(${pLat})) * sin(radians(latitude))
    ))))`;
    conditions.push('e.latitude IS NOT NULL AND e.longitude IS NOT NULL');
    if (Number.isFinite(radius) && radius > 0 && radius <= 200) conditions.push(`${exprCte} <= ${add(radius)}`);
  }

  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize || filters.limit) || 30));
  const offset = (page - 1) * pageSize;
  const orderBy = filters.sort === 'distance' && Number.isFinite(lat) && Number.isFinite(lng)
    ? 'distance_km ASC NULLS LAST, next_start_at NULLS LAST'
    : filters.sort === 'updated'
      ? 'e.updated_at DESC'
      : 'next_start_at NULLS LAST, title';

  const rows = await query(
    `WITH filtered AS (${BASE_SELECT} WHERE ${conditions.join(' AND ')})
     SELECT *, ${distanceExpression} AS distance_km,
       (SELECT MIN(o.start_at) FROM events ev JOIN event_occurrences o ON o.event_id = ev.id WHERE ev.id = filtered.id) AS next_start_at,
       COUNT(*) OVER()::int AS total_count
     FROM filtered
     ORDER BY ${orderBy}
     LIMIT ${add(pageSize)} OFFSET ${add(offset)}`,
    params,
  );
  return {
    events: rows.map(mapRow),
    total: rows[0]?.total_count || 0,
    page,
    pageSize,
  };
}

export async function getEventBySlug(slug) {
  const row = await one(`${BASE_COLS} ${SOURCES_COL} ${BASE_FROM}
    WHERE e.slug = $1 AND e.status IN ('published','postponed','cancelled','verified')`, [slug]);
  const event = mapRow(row);
  if (!event) return null;
  event.sources = asArray(row.sources);
  return event;
}

async function aliasesMap(client) {
  const rows = await client.query(`SELECT ta.normalized_alias, ta.locality_id, m.name FROM territorial_aliases ta JOIN municipalities m ON m.id = ta.municipality_id`);
  return new Map(rows.rows.map((row) => [row.normalized_alias, row.name]));
}

async function resolveMunicipality(client, town) {
  const direct = await client.query('SELECT id, name FROM municipalities WHERE lower(name) = lower($1) LIMIT 1', [town]);
  if (direct.rows[0]) return direct.rows[0];
  const viaAlias = await client.query(
    `SELECT m.id, m.name FROM territorial_aliases ta JOIN municipalities m ON m.id = ta.municipality_id
     WHERE ta.normalized_alias = $1 LIMIT 1`, [normalizeSearchText(town)]);
  return viaAlias.rows[0] || null;
}

async function resolveLocality(client, municipalityId, value) {
  if (!value) return null;
  const normalized = normalizeSearchText(value);
  if (!normalized) return null;
  const own = await client.query(
    `SELECT id, name, locality_type::text AS locality_type FROM localities
     WHERE municipality_id = $1 AND normalized_name = $2 LIMIT 1`, [municipalityId, normalized]);
  if (own.rows[0]) return own.rows[0];
  const viaAlias = await client.query(
    `SELECT l.id, l.name, l.locality_type::text AS locality_type FROM territorial_aliases ta
     JOIN localities l ON l.id = ta.locality_id
     WHERE ta.municipality_id = $1 AND ta.normalized_alias = $2 AND ta.locality_id IS NOT NULL LIMIT 1`,
    [municipalityId, normalized]);
  return viaAlias.rows[0] || null;
}

async function categoryIdMap(client) {
  const rows = await client.query('SELECT id, slug FROM categories');
  return new Map(rows.rows.map((row) => [row.slug, row.id]));
}

export async function queueReview({ sourceId, reason, severity = 'medium', payload, eventId = null, itemType = 'event' }, clientOverride) {
  const run = async (client) => client.query(
    `INSERT INTO review_queue (item_type, event_id, source_id, reason, severity, payload) VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
    [itemType, eventId, sourceId || null, reason, severity, JSON.stringify(payload || {})]);
  if (clientOverride) return run(clientOverride);
  return transaction(run);
}

function confidenceCap(level) {
  // Mandato OCR/critici: livelli non ufficiali non possono superare la soglia auto-publish
  return level === 'secondary' || level === 'unverified' ? 0.79 : 1;
}

export async function upsertEvent(candidate, source, runId) {
  return transaction(async (client) => {
    const aliases = await aliasesMap(client);
    const canonicalTown = aliases.get(normalizeSearchText(candidate.town)) || candidate.town;
    const municipality = await resolveMunicipality(client, canonicalTown);
    const effectivePriority = source?.priority ?? 9;
    const verificationLevel = verificationLevelForPriority(effectivePriority);
    const normalizedCandidate = {
      ...candidate,
      town: municipality?.name || canonicalTown,
      sourceUrl: candidate.sourceUrl || source.url,
      sourceName: candidate.sourceName || source.entity_name,
      sourcePriority: Number(effectivePriority),
      verificationLevel,
    };
    const validation = validateEvent(normalizedCandidate, new Date().getFullYear());
    if (!validation.valid || !municipality) {
      // Filtro anti-rumore (mandato: la coda serve a revisionare EVENTI, non link):
      // candidati senza titolo o senza alcuna data/ora non sono eventi plausibili
      // (tipico delle pagine-registro): scartati silenziosamente nel run, mai in coda.
      const hasAnyDate = (normalizedCandidate.occurrences || []).some((o) => o?.startAt || o?.date)
        || Boolean(normalizedCandidate.startDate) || Boolean(normalizedCandidate.occurrenceDates?.length);
      const hasTitle = Boolean(String(normalizedCandidate.title || '').trim());
      if (validation.errors.includes('title_missing') || !hasTitle || !hasAnyDate) {
        return { created: false, updated: false, review: false, discarded: 1 };
      }
      await queueReview({
        sourceId: source.id,
        reason: `Dati non pubblicabili: ${[...validation.errors, ...(!municipality ? ['territory_unknown'] : [])].join(', ')}`,
        severity: 'high',
        payload: normalizedCandidate,
      }, client);
      return { created: false, updated: false, review: true };
    }
    const locality = await resolveLocality(client, municipality.id, normalizedCandidate.locality || '')
      || await resolveLocality(client, municipality.id, normalizedCandidate.venue || '');
    const occurrences = buildOccurrences(normalizedCandidate);
    const today = romeIsoDate();
    const allPast = occurrences.length > 0 && occurrences.every((o) => o.date < today);

    // --- Matching (chiave canonica -> stesso url sorgente -> fuzzy) ---
    const key = canonicalEventKey(normalizedCandidate, aliases);
    const selectExisting = `SELECT e.*, COALESCE(s.priority, 9) AS source_priority,
      COALESCE((SELECT jsonb_agg(o.occurrence_date ORDER BY o.occurrence_date) FROM event_occurrences o WHERE o.event_id = e.id), '[]'::jsonb) AS occurrence_dates
      FROM events e LEFT JOIN sources s ON s.id = e.primary_source_id`;
    let matchType = 'canonical';
    let existingRow = (await client.query(`${selectExisting} WHERE e.canonical_key = $1`, [key])).rows[0];
    const distinctEventUrl = normalizedCandidate.sourceUrl && normalizedCandidate.sourceUrl !== source.url;
    if (!existingRow && distinctEventUrl) {
      existingRow = (await client.query(`${selectExisting} JOIN event_sources es ON es.event_id = e.id
        WHERE es.source_id = $1 AND es.source_event_url = $2 ORDER BY es.last_seen_at DESC LIMIT 1`,
        [source.id, normalizedCandidate.sourceUrl])).rows[0];
      if (existingRow) matchType = 'same_source_url';
    }
    if (!existingRow) {
      const window = await client.query(`${selectExisting} WHERE e.municipality_id = $1
        AND EXISTS (SELECT 1 FROM event_occurrences o WHERE o.event_id = e.id
          AND o.occurrence_date BETWEEN $2::date - INTERVAL '1 day' AND $3::date + INTERVAL '1 day')
        ORDER BY e.title LIMIT 100`,
        [municipality.id, normalizedCandidate.startDate, normalizedCandidate.endDate || normalizedCandidate.startDate]);
      existingRow = window.rows.find((row) => sameEvent(serializeExisting(row), normalizedCandidate, aliases));
      if (existingRow) matchType = 'fuzzy';
    }
    const existing = serializeExisting(existingRow);
    const samePrimarySourceUpdate = Boolean(existingRow && Number(existingRow.primary_source_id) === Number(source.id));
    const merged = existing
      ? (samePrimarySourceUpdate || matchType === 'same_source_url'
          ? mergeSameSourceUpdate(existing, normalizedCandidate)
          : mergeEvents(existing, normalizedCandidate))
      : normalizedCandidate;
    const mergedOccurrences = buildOccurrences(merged);
    const duplicateMerged = Boolean(existingRow && matchType !== 'same_source_url' && !samePrimarySourceUpdate && matchType !== 'canonical');

    // --- Regole di stato (rinvii/annullamenti solo se comunicati da fonte fidata) ---
    const incomingPriority = Number(effectivePriority);
    const existingPriority = Number(existingRow?.source_priority || 9);
    const incomingIsPrimary = !existingRow || samePrimarySourceUpdate || incomingPriority < existingPriority;
    const bestPriority = incomingIsPrimary ? incomingPriority : existingPriority;
    const bestLevel = verificationLevelForPriority(bestPriority);
    const untrustedStateChange = ['cancelled', 'postponed'].includes(candidate.status) && incomingPriority > 4;
    const confidence = Math.min(deriveConfidence(normalizedCandidate, source), confidenceCap(bestLevel));
    const hasCriticalConflict = untrustedStateChange;
    let status;
    if (untrustedStateChange) {
      status = existingRow?.status || 'pending_review';
    } else if (['cancelled', 'postponed'].includes(candidate.status)) {
      status = candidate.status;
    } else if (existingRow?.status === 'cancelled' && !incomingIsPrimary) {
      status = 'cancelled';
    } else if (existingRow?.status === 'postponed' && !incomingIsPrimary) {
      status = 'postponed';
    } else if (allPast) {
      status = 'completed';
    } else if (canAutoPublish({
      source, verificationLevel: bestLevel, confidence,
      municipality, occurrences: mergedOccurrences, hasCriticalConflict,
    })) {
      status = 'published';
    } else if (existingRow?.status === 'published') {
      status = 'published';
    } else {
      status = 'pending_review';
    }
    if (mergedOccurrences.every((o) => o.date < today) && mergedOccurrences.length) status = 'completed';

    if (status === 'pending_review') {
      await queueReview({
        sourceId: source.id,
        reason: 'Pubblicazione automatica non consentita dalle regole (fonte, confidence o dati mancanti)',
        severity: hasCriticalConflict ? 'high' : 'medium',
        payload: {
          title: merged.title, town: merged.town, dates: merged.occurrenceDates,
          confidence, verificationLevel: bestLevel,
          sourceApproved: Boolean(source.approved), sourceAutoPublish: Boolean(source.auto_publish),
        },
      }, client);
    }
    if (untrustedStateChange && existingRow) {
      await queueReview({
        sourceId: source.id, eventId: existingRow.id,
        reason: `Fonte a bassa priorità dichiara "${candidate.status}" — richiesta verifica su fonte primaria`,
        severity: 'high',
        payload: { title: merged.title, town: merged.town },
      }, client);
    }

    const slugOut = existingRow?.slug || uniqueEventSlug(merged);
    const dataHash = stableHash(merged);
    const searchText = eventSearchText(merged);
    const isFree = merged.priceType === 'free' || /gratis|gratuit|ingresso libero|entrata libera/i.test(String(merged.priceText || ''));
    const normalizedTitle = normalizeSearchText(merged.title);
    const locationAccuracy = merged.latitude != null && merged.longitude != null ? 'exact'
      : merged.address ? 'address' : locality ? 'locality' : 'municipality';
    const effectiveLat = merged.latitude ?? (locationAccuracy === 'municipality' ? null : null);
    const effectiveLng = merged.longitude ?? (locationAccuracy === 'municipality' ? null : null);

    const fieldParams = [
      key, slugOut, merged.title, normalizedTitle, merged.subtitle || null,
      merged.description || '', merged.shortDescription || null, status, bestLevel, confidence,
      municipality.id, locality?.id || null, merged.town, locality?.name || merged.locality || null,
      merged.venue || null, merged.address || null, effectiveLat, effectiveLng, locationAccuracy,
      merged.organizer || null, merged.organizerUrl || null, merged.priceText || null, isFree,
      Boolean(merged.bookingRequired || merged.bookingUrl), merged.bookingUrl || null,
      merged.contactEmail || null, merged.contactPhone || null,
      merged.accessibilityText || null, merged.parkingText || null, merged.originalTimeText || null,
      merged.imageUrl || null, dataHash,
      incomingIsPrimary ? source.id : existingRow?.primary_source_id,
      incomingIsPrimary ? normalizedCandidate.sourceUrl : existingRow.source_url,
      incomingIsPrimary ? normalizedCandidate.sourceName : existingRow.source_name,
      searchText, runId || null,
    ];

    let eventId;
    let previousStatus = existingRow?.status || null;
    if (!existingRow) {
      const inserted = await client.query(
        `INSERT INTO events (canonical_key, slug, title, normalized_title, subtitle, description, short_description,
           status, verification_level, confidence_score, municipality_id, locality_id, town, locality, venue, address,
           latitude, longitude, location_accuracy, organizer, organizer_url, price_text, is_free, booking_required,
           booking_url, contact_email, contact_phone, accessibility_text, parking_text, original_time_text, image_url,
           data_hash, primary_source_id, source_url, source_name, search_text, last_seen_run_id, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::event_status,$9::verification_level,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::location_accuracy,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,
                 CASE WHEN $8::event_status = 'published' THEN NOW() ELSE NULL END)
         RETURNING id`, fieldParams);
      eventId = inserted.rows[0].id;
    } else {
      eventId = existingRow.id;
      // Tutti i placeholder devono comparire nel testo (altrimenti Postgres
      // non deduce i tipi): rinumero da $1 su fieldParams.slice(2), id = $36.
      await client.query(
        `UPDATE events SET title = $1, normalized_title = $2, subtitle = $3, description = $4, short_description = $5,
           status = $6::event_status, verification_level = $7::verification_level, confidence_score = GREATEST(confidence_score, $8),
           municipality_id = $9, locality_id = $10, town = $11, locality = $12, venue = $13, address = $14,
           latitude = COALESCE($15, latitude), longitude = COALESCE($16, longitude), location_accuracy = $17::location_accuracy,
           organizer = $18, organizer_url = $19, price_text = $20, is_free = $21, booking_required = $22,
           booking_url = $23, contact_email = $24, contact_phone = $25, accessibility_text = $26, parking_text = $27,
           original_time_text = $28, image_url = $29, data_hash = $30, primary_source_id = $31, source_url = $32,
           source_name = $33, search_text = $34, last_seen_run_id = $35, last_checked_at = NOW(),
           published_at = CASE WHEN $6::event_status = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END
         WHERE id = $36`, [...fieldParams.slice(2), eventId]);
    }

    // Occorrenze: sostituzione atomica del set (dentro la transazione)
    await client.query('DELETE FROM event_occurrences WHERE event_id = $1', [eventId]);
    for (const occ of mergedOccurrences) {
      await client.query(
        `INSERT INTO event_occurrences (event_id, start_at, end_at, all_day, timezone, schedule_text, status)
         VALUES ($1,
           (($2::date + COALESCE($3::time, '00:00'::time)) AT TIME ZONE 'Europe/Rome'),
           CASE WHEN $4::time IS NULL THEN NULL
                ELSE (($2::date + (CASE WHEN $6 THEN INTERVAL '1 day' ELSE INTERVAL '0 day' END) + $4::time) AT TIME ZONE 'Europe/Rome')
           END,
           $5, 'Europe/Rome', $7, $8::occurrence_status)`,
        [eventId, occ.date, occ.startTime, occ.endTime, !occ.startTime, occ.overnight || false,
         occ.scheduleText || null, occ.status || 'scheduled']);
    }

    // Categorie: primaria + secondarie via slug mandate
    const catMap = await categoryIdMap(client);
    const primarySlug = categorySlug(merged.primaryCategory || merged.categories?.[0] || 'Altro');
    const secondarySlugs = [...new Set([...(merged.secondaryCategories || []), ...(merged.categories || []).slice(1)]
      .map((c) => categorySlug(c)).filter((s) => s !== primarySlug))];
    await client.query('DELETE FROM event_categories WHERE event_id = $1', [eventId]);
    for (const [slugC, isPrimary] of [[primarySlug, true], ...secondarySlugs.map((s) => [s, false])]) {
      const categoryId = catMap.get(slugC) || catMap.get('altro');
      if (categoryId) {
        await client.query('INSERT INTO event_categories (event_id, category_id, is_primary) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
          [eventId, categoryId, isPrimary]);
      }
    }
    await client.query('DELETE FROM event_tags WHERE event_id = $1', [eventId]);
    for (const tag of [...new Set((merged.tags || []).map((t) => normalizeSearchText(t)).filter(Boolean))].slice(0, 20)) {
      await client.query('INSERT INTO event_tags (event_id, tag) VALUES ($1,$2) ON CONFLICT DO NOTHING', [eventId, tag]);
    }
    await client.query('DELETE FROM event_audiences WHERE event_id = $1', [eventId]);
    for (const audience of [...new Set((merged.audiences || []).map((a) => normalizeSearchText(a)).filter(Boolean))].slice(0, 10)) {
      await client.query('INSERT INTO event_audiences (event_id, audience) VALUES ($1,$2) ON CONFLICT DO NOTHING', [eventId, audience]);
    }

    // Fonti: conserva tutte, designa la primaria (mandato dedup)
    await client.query(
      `INSERT INTO event_sources (event_id, source_id, source_event_url, is_primary)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (event_id, source_id, source_event_url)
       DO UPDATE SET last_seen_at = NOW(), is_primary = EXCLUDED.is_primary`,
      [eventId, source.id, normalizedCandidate.sourceUrl, incomingIsPrimary]);
    if (incomingIsPrimary) {
      await client.query(
        'UPDATE event_sources SET is_primary = FALSE WHERE event_id = $1 AND NOT (source_id = $2 AND source_event_url = $3)',
        [eventId, source.id, normalizedCandidate.sourceUrl]);
    }

    // Storico versioni / stati / audit
    if (previousStatus !== status) {
      await client.query(
        `INSERT INTO event_status_history (event_id, from_status, to_status, reason, actor, source_id, source_run_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [eventId, previousStatus, status,
         previousStatus ? 'Aggiornamento da ingestione' : 'Prima importazione',
         'system', source.id, runId || null]);
    }
    await client.query(
      `INSERT INTO event_versions (event_id, version, snapshot, changed_by, change_reason)
       VALUES ($1, COALESCE((SELECT MAX(version) + 1 FROM event_versions WHERE event_id = $1), 1), $2::jsonb, $3, $4)`,
      [eventId, JSON.stringify({ merged, occurrences: mergedOccurrences, matchType }), 'ingestion',
       existingRow ? `update:${matchType}` : 'create']);
    await client.query(
      `INSERT INTO audit_log (actor_label, source, action, entity_type, entity_id, before_data, after_data)
       VALUES ($1,'gha',$2,'event',$3,$4::jsonb,$5::jsonb)`,
      [source.entity_name || 'ingestion', existingRow ? 'event_updated' : 'event_created', eventId,
       JSON.stringify(existing ? { title: existing.title, status: existing.status } : null),
       JSON.stringify({ title: merged.title, status, matchType })]);

    return { created: !existingRow, updated: Boolean(existingRow), review: status === 'pending_review', duplicateMerged };
  });
}

function serializeExisting(row) {
  if (!row) return null;
  const occurrenceDates = asArray(row.occurrence_dates).map((d) => String(d).slice(0, 10)).sort();
  return {
    id: row.id, title: row.title, description: row.description, primaryCategory: null,
    secondaryCategories: [], tags: [], startDate: occurrenceDates[0] || '',
    endDate: occurrenceDates.at(-1) || occurrenceDates[0] || '', originalTimeText: row.original_time_text || '', town: row.town,
    locality: row.locality || '', venue: row.venue || '', address: row.address || '', latitude: row.latitude,
    longitude: row.longitude, priceText: row.price_text || '', priceType: row.is_free ? 'free' : (row.price_text ? 'paid' : 'unknown'),
    audiences: asArray(row.audiences), organizer: row.organizer || '', imageUrl: row.image_url || '',
    bookingUrl: row.booking_url || '', status: row.status, verificationLevel: row.verification_level,
    sourceUrl: row.source_url, sourceName: row.source_name,
    sourcePriority: row.source_priority || 9, occurrenceDates: asArray(row.occurrence_dates),
    primarySourceId: row.primary_source_id || null, existingStatus: row.status,
  };
}

const ADMIN_PATCHABLE = new Map([
  ['title', 'title'], ['subtitle', 'subtitle'], ['description', 'description'],
  ['shortDescription', 'short_description'], ['venue', 'venue'], ['address', 'address'],
  ['priceText', 'price_text'], ['isFree', 'is_free'], ['bookingUrl', 'booking_url'],
  ['bookingRequired', 'booking_required'], ['organizer', 'organizer'], ['organizerUrl', 'organizer_url'],
  ['contactEmail', 'contact_email'], ['contactPhone', 'contact_phone'],
  ['accessibilityText', 'accessibility_text'], ['parkingText', 'parking_text'],
  ['originalTimeText', 'original_time_text'], ['imageUrl', 'image_url'],
  ['status', 'status'],
]);
const ALLOWED_STATUSES = ['draft', 'pending_review', 'verified', 'published', 'postponed', 'cancelled', 'completed', 'archived', 'rejected'];

export async function adminUpdateEvent(id, patch = {}, actor = 'admin') {
  return transaction(async (client) => {
    const current = await client.query(
      `SELECT e.id, e.status, e.slug, e.title,
              (SELECT jsonb_agg(jsonb_build_object('startAt', o.start_at, 'endAt', o.end_at, 'allDay', o.all_day,
                'timezone', o.timezone, 'scheduleText', o.schedule_text, 'status', o.status, 'date', o.occurrence_date)
                ORDER BY o.start_at) FROM event_occurrences o WHERE o.event_id = e.id) AS occurrences,
              COALESCE((SELECT array_agg(c.name ORDER BY ec.is_primary DESC, c.sort_order)
                FROM event_categories ec JOIN categories c ON c.id = ec.category_id WHERE ec.event_id = e.id), '{}'::text[]) AS categories
       FROM events e WHERE e.id = $1`, [id]);
    if (!current.rows[0]) return null;
    const before = current.rows[0];

    const assignments = [];
    const params = [];
    const add = (value) => { params.push(value); return `$${params.length}`; };
    for (const [key, column] of ADMIN_PATCHABLE) {
      if (patch[key] === undefined) continue;
      if (key === 'status' && !ALLOWED_STATUSES.includes(patch[key])) continue;
      assignments.push(`${column} = ${add(patch[key])}`);
    }
    const nextStatus = patch.status && ALLOWED_STATUSES.includes(patch.status) ? patch.status : null;
    if (nextStatus && nextStatus !== before.status) {
      assignments.push(`last_verified_at = CASE WHEN ${add(nextStatus)} IN ('verified','published') THEN NOW() ELSE last_verified_at END`);
      assignments.push(`published_at = CASE WHEN ${add(nextStatus)} = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END`);
    }
    if (assignments.length) {
      params.push(id);
      await client.query(`UPDATE events SET ${assignments.join(', ')} WHERE id = $${params.length}`, params);
    }
    if (nextStatus && nextStatus !== before.status) {
      await client.query(
        `INSERT INTO event_status_history (event_id, from_status, to_status, reason, actor) VALUES ($1,$2,$3,$4,$5)`,
        [id, before.status, nextStatus, String(patch.reason || 'intervento redazionale').slice(0, 500), actor]);
    }
    // Editoria occorrenze (sostituzione completa solo se fornite e valide)
    if (Array.isArray(patch.occurrences) && patch.occurrences.length) {
      const provided = patch.occurrences.filter((o) => /^\d{4}-\d{2}-\d{2}$/.test(String(o.date || '')));
      const effective = provided.length
        ? provided.map((o) => ({
            date: String(o.date).slice(0, 10), startTime: o.startTime || null, endTime: o.endTime || null,
            allDay: !o.startTime, overnight: Boolean(o.startTime && o.endTime && o.endTime <= o.startTime),
            scheduleText: o.scheduleText || null, status: ['scheduled', 'postponed', 'cancelled'].includes(o.status) ? o.status : 'scheduled',
          }))
        : [];
      if (!effective.length) {
        // patch.occurrences presente ma nessuna data valida: nessuna modifica alle occorrenze
      } else {
      await client.query('DELETE FROM event_occurrences WHERE event_id = $1', [id]);
      for (const occ of effective) {
        await client.query(
          `INSERT INTO event_occurrences (event_id, start_at, end_at, all_day, timezone, schedule_text, status)
           VALUES ($1,
             (($2::date + COALESCE($3::time, '00:00'::time)) AT TIME ZONE 'Europe/Rome'),
             CASE WHEN $4::time IS NULL THEN NULL
                  ELSE (($2::date + (CASE WHEN $6 THEN INTERVAL '1 day' ELSE INTERVAL '0 day' END) + $4::time) AT TIME ZONE 'Europe/Rome')
             END, $5, 'Europe/Rome', $7, $8::occurrence_status)`,
          [id, occ.date, occ.startTime, occ.endTime, !occ.startTime, occ.overnight || false,
           occ.scheduleText || null, occ.status || 'scheduled']);
      }
      }
    }
    await client.query(
      `INSERT INTO event_versions (event_id, version, snapshot, changed_by, change_reason)
       VALUES ($1, COALESCE((SELECT MAX(version) + 1 FROM event_versions WHERE event_id = $1), 1), $2::jsonb, $3, $4)`,
      [id, JSON.stringify({ patch }), actor, 'admin_patch']);
    await client.query(
      `INSERT INTO audit_log (actor_label, source, action, entity_type, entity_id, before_data, after_data)
       VALUES ($1,'api','admin_update','event',$2,$3::jsonb,$4::jsonb)`,
      [actor, id, JSON.stringify({ title: before.title, status: before.status }), JSON.stringify({ patch })]);
    return { id, patched: true };
  });
}
