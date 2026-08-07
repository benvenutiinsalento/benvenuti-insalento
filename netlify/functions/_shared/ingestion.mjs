import crypto from 'node:crypto';
import { query, one } from './db.mjs';
import { robotsAllows } from './robots.mjs';
import { stableHash, sanitizeText } from './events-core.mjs';
import {
  parseHtmlEvents, parseDatedTownCalendar, parseTorrevadoCalendar, parseIcs,
  parsePugliaJson, extractPdfText, extractOcrText, parsePosterText,
} from './source-parsers.mjs';
import { extractCandidateLinks, extractSitemapLinks, parserForUrl, discoveredSourceKey } from './discovery.mjs';
import { upsertEvent, queueReview } from './event-repository.mjs';
import { municipalityByName, municipalityFromText, PRO_LOCO_REGISTRY, normalize } from './registry.mjs';

const USER_AGENT = 'BenvenutiInSalentoEventBot';
const DEFAULT_MAX_BYTES = 12 * 1024 * 1024;
const OPEN_DATA_MAX_BYTES = 40 * 1024 * 1024;

function sourceForParser(source) {
  return {
    ...source,
    entityName: source.entity_name,
    municipality: source.municipality_name || '',
    locality: source.locality || '',
    year: null,
  };
}

function parserName(source, contentType = '') {
  if (source.parser_type && !['municipal_discovery','religious_discovery','organization_discovery','sitemap_discovery'].includes(source.parser_type)) return source.parser_type;
  if (/text\/calendar|application\/ics/i.test(contentType)) return 'ics';
  if (/application\/pdf/i.test(contentType)) return 'pdf';
  if (/image\//i.test(contentType)) return 'poster';
  return source.discovery_only ? 'discovery' : 'generic_html';
}

async function fetchLimited(url, options = {}, maxBytes = DEFAULT_MAX_BYTES, timeoutMs = 25000) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs), redirect: 'follow' });
  const length = Number(response.headers.get('content-length') || 0);
  if (length > maxBytes) throw new Error('CONTENT_TOO_LARGE');
  if (response.status === 304) return { response, bytes: new Uint8Array(), notModified: true };
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > maxBytes) throw new Error('CONTENT_TOO_LARGE');
  return { response, bytes, notModified: false };
}

export async function fetchSource(source) {
  if (!source.active) return { skipped: true, reason: 'SOURCE_INACTIVE' };
  if (['disallowed','manual_only'].includes(source.crawl_policy)) return { skipped: true, reason: `CRAWL_${source.crawl_policy.toUpperCase()}` };

  let robotsAllowed = true;
  if (source.crawl_policy !== 'open_data') {
    robotsAllowed = await robotsAllows(source.url, USER_AGENT);
    await query('UPDATE sources SET robots_allowed=$2,robots_checked_at=NOW() WHERE id=$1', [source.id, robotsAllowed]);
    if (!robotsAllowed) return { skipped: true, reason: 'ROBOTS_DISALLOWED' };
  }

  const headers = {
    accept: 'text/html,application/json,application/ld+json,text/calendar,application/pdf,image/*;q=0.8,*/*;q=0.5',
    'user-agent': `${USER_AGENT}/1.0 (+https://benvenutiinsalento.it/contatti)`,
  };
  if (!Number(source.ingestion_cursor || 0)) {
    if (source.etag) headers['if-none-match'] = source.etag;
    if (source.last_modified_header) headers['if-modified-since'] = source.last_modified_header;
  }

  const maxBytes = source.crawl_policy === 'open_data' ? OPEN_DATA_MAX_BYTES : DEFAULT_MAX_BYTES;
  // Open data regionali: dump grandi e server lenti → timeout dedicato 10 minuti
  // (girano solo su GitHub Actions, mai nelle Netlify Functions leggere).
  const timeoutMs = source.crawl_policy === 'open_data' ? 600000 : 25000;
  const { response, bytes, notModified } = await fetchLimited(source.url, { headers }, maxBytes, timeoutMs);
  if (!response.ok && response.status !== 304) throw new Error(`HTTP_${response.status}`);
  return {
    skipped: false,
    notModified,
    bytes,
    status: response.status,
    finalUrl: response.url || source.url,
    contentType: response.headers.get('content-type') || '',
    etag: response.headers.get('etag') || null,
    lastModified: response.headers.get('last-modified') || null,
  };
}

async function parsePayload(source, fetched) {
  const parser = parserName(source, fetched.contentType);
  const parserSource = { ...sourceForParser(source), url: fetched.finalUrl || source.url };
  const text = new TextDecoder('utf-8', { fatal: false }).decode(fetched.bytes);

  if (parser === 'puglia_json') return parsePugliaJson(JSON.parse(text), parserSource);
  if (parser === 'ics') return parseIcs(text, parserSource);
  if (parser === 'dated_town_calendar') return parseDatedTownCalendar(text, parserSource);
  if (parser === 'torrevado_calendar') return parseTorrevadoCalendar(text, parserSource);
  if (parser === 'pdf') {
    let extracted = extractPdfText(fetched.bytes);
    if (extracted.replace(/\s/g, '').length < 80 && process.env.OCR_API_ENDPOINT && process.env.OCR_API_KEY) {
      extracted = await extractOcrText(fetched.bytes, { endpoint: process.env.OCR_API_ENDPOINT, apiKey: process.env.OCR_API_KEY });
    }
    if (extracted.replace(/\s/g, '').length < 40) throw new Error('PDF_TEXT_NOT_EXTRACTABLE');
    return parsePosterText(extracted, parserSource);
  }
  if (parser === 'poster') {
    const extracted = await extractOcrText(fetched.bytes, { endpoint: process.env.OCR_API_ENDPOINT, apiKey: process.env.OCR_API_KEY });
    return parsePosterText(extracted, parserSource);
  }
  if (parser === 'discovery' || parser === 'sitemap_discovery') return [];
  if (parser === 'ipa_entities' || parser === 'pro_loco_registry') return [];
  return parseHtmlEvents(text, parserSource);
}

function provinceMunicipality(value) {
  const raw = String(value || '').replace(/\((?:LE|Lecce)\)/gi, ' ').replace(/\bprovincia di lecce\b/gi, ' ').trim();
  const direct = municipalityByName(raw);
  if (direct) return direct;
  const key = normalize(raw);
  const organizationMatch = PRO_LOCO_REGISTRY
    .map((item) => ({ item, key: normalize(item.name) }))
    .filter(({ key: organizationKey }) => organizationKey && (` ${key} `).includes(` ${organizationKey} `))
    .sort((left, right) => right.key.length - left.key.length)[0]?.item;
  if (organizationMatch) return municipalityByName(organizationMatch.municipality);
  return municipalityFromText(raw);
}

function keepProvinceEvents(candidates) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return candidates.map((candidate) => {
    const municipality = provinceMunicipality(candidate.town);
    return municipality ? { ...candidate, town: municipality.name } : null;
  }).filter(Boolean).filter((candidate) => !candidate.endDate || candidate.endDate >= today).sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
}

function allLinks(html, baseUrl) {
  const found = [];
  for (const match of String(html).matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(match[1].replace(/&amp;/g, '&'), baseUrl);
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      const label = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      found.push({ url: url.href, label });
    } catch {}
  }
  return found;
}

async function registerOrganizationLinks(source, fetched) {
  const html = new TextDecoder('utf-8', { fatal: false }).decode(fetched.bytes);
  let linked = 0;
  const parentOrigin = new URL(source.url).origin;
  const sourceIsOrganization = Boolean(source.organization_id) || source.source_type === 'pro_loco';
  for (const link of allLinks(html, fetched.finalUrl || source.url)) {
    const target = new URL(link.url);
    const external = target.origin !== parentOrigin;
    const social = /(?:instagram\.com|facebook\.com|youtube\.com|youtu\.be|x\.com|twitter\.com|tiktok\.com)$/i.test(target.hostname.replace(/^www\./, ''));
    const combined = `${source.entity_name || ''} ${link.label} ${link.url}`;
    const looksLikeDirectoryEntry = /pro[ -]?loco/i.test(`${link.label} ${link.url}`);
    const looksLikeOfficialChannel = sourceIsOrganization && external && (social || /sito|website|pagina|facebook|instagram|social|ufficial/i.test(combined));
    if (!looksLikeDirectoryEntry && !looksLikeOfficialChannel) continue;

    const municipality = source.municipality_name
      ? provinceMunicipality(source.municipality_name)
      : provinceMunicipality(combined);
    if (!municipality) continue;
    const org = source.organization_id
      ? { id: source.organization_id }
      : await one(`SELECT o.id FROM organizations o JOIN municipalities m ON m.id=o.municipality_id WHERE m.name=$1 AND o.organization_type='pro_loco' ORDER BY o.id LIMIT 1`, [municipality.name]);
    if (!org) continue;

    if (!external) {
      await query(`INSERT INTO sources(source_key,entity_name,municipality_id,organization_id,source_type,url,base_url,priority,parser_type,active,discovery_only,crawl_policy)
        VALUES($1,$2,(SELECT id FROM municipalities WHERE name=$3),$4,'pro_loco_directory_profile',$5,$6,3,'organization_discovery',TRUE,TRUE,'public_page')
        ON CONFLICT(url) DO UPDATE SET organization_id=EXCLUDED.organization_id,municipality_id=EXCLUDED.municipality_id,active=TRUE,updated_at=NOW()`,
        [`pro-loco-profile-${municipality.slug}-${stableHash(link.url)}`, `Profilo registro Pro Loco ${municipality.name}`, municipality.name, org.id, link.url, target.origin]);
      linked += 1;
      continue;
    }

    if (social) {
      await query(`UPDATE organizations SET social_url=$2,verification_status='verified',last_verified_at=NOW(),updated_at=NOW() WHERE id=$1`, [org.id, link.url]);
      await query(`INSERT INTO sources(source_key,entity_name,municipality_id,organization_id,source_type,url,base_url,priority,parser_type,active,discovery_only,crawl_policy)
        VALUES($1,$2,(SELECT id FROM municipalities WHERE name=$3),$4,'official_social',$5,$6,4,'social_metadata',TRUE,FALSE,'public_page')
        ON CONFLICT(url) DO UPDATE SET organization_id=EXCLUDED.organization_id,municipality_id=EXCLUDED.municipality_id,active=TRUE,priority=4,updated_at=NOW()`,
        [`pro-loco-social-${municipality.slug}-${stableHash(link.url)}`, `Canale sociale Pro Loco ${municipality.name}`, municipality.name, org.id, link.url, target.origin]);
    } else {
      await query(`UPDATE organizations SET official_url=$2,verification_status='verified',last_verified_at=NOW(),updated_at=NOW() WHERE id=$1`, [org.id, link.url]);
      await query(`INSERT INTO sources(source_key,entity_name,municipality_id,organization_id,source_type,url,base_url,priority,parser_type,active,discovery_only,crawl_policy)
        VALUES($1,$2,(SELECT id FROM municipalities WHERE name=$3),$4,'pro_loco',$5,$6,3,'organization_discovery',TRUE,TRUE,'public_page')
        ON CONFLICT(url) DO UPDATE SET organization_id=EXCLUDED.organization_id,municipality_id=EXCLUDED.municipality_id,active=TRUE,priority=3,updated_at=NOW()`,
        [`pro-loco-${municipality.slug}-${stableHash(link.url)}`, `Pro Loco ${municipality.name}`, municipality.name, org.id, link.url, target.origin]);
    }
    linked += 1;
  }
  return linked;
}

async function saveRaw(source, runId, fetched) {
  const hash = crypto.createHash('sha256').update(fetched.bytes).digest('hex');
  const contentType = fetched.contentType || '';
  const textual = /json|html|xml|text|calendar/i.test(contentType)
    ? sanitizeText(new TextDecoder('utf-8', { fatal: false }).decode(fetched.bytes).slice(0, 1_500_000))
    : null;
  const row = await one(`
    INSERT INTO raw_ingestion_records (source_id,run_id,source_url,content_type,content_hash,raw_text,processing_status)
    VALUES ($1,$2,$3,$4,$5,$6,'new')
    ON CONFLICT (source_id,content_hash) DO UPDATE SET acquired_at=NOW(),run_id=EXCLUDED.run_id
    RETURNING id
  `, [source.id, runId, fetched.finalUrl || source.url, contentType, hash, textual]);
  return { id: row?.id, hash };
}

async function registerDiscoveredLinks(source, fetched) {
  const text = new TextDecoder('utf-8', { fatal: false }).decode(fetched.bytes);
  const links = /xml|sitemap/i.test(fetched.contentType || '') || /sitemap/i.test(source.parser_type || '')
    ? extractSitemapLinks(text).map((url) => ({ url, label: '' }))
    : extractCandidateLinks(text, fetched.finalUrl || source.url);
  let inserted = 0;
  const parentOrigin = new URL(source.url).origin;
  for (const link of links) {
    const parser = parserForUrl(link.url);
    const target = new URL(link.url);
    const sameOrigin = target.origin === parentOrigin;
    const social = /(?:instagram\.com|facebook\.com|youtube\.com|youtu\.be|x\.com|twitter\.com|tiktok\.com)$/i.test(target.hostname.replace(/^www\./, ''));
    const priority = sameOrigin ? Number(source.priority) : Math.max(5, Number(source.priority));
    const sourceType = parser === 'pdf' ? 'official_document'
      : parser === 'poster' ? 'official_poster'
        : parser === 'sitemap_discovery' ? 'sitemap'
          : social ? 'official_social' : 'event_page';
    const parserType = social ? 'social_metadata' : parser;
    const discoveryOnly = parser === 'sitemap_discovery';
    const result = await query(`
      INSERT INTO sources (source_key,entity_name,municipality_id,organization_id,locality,source_type,url,base_url,priority,parser_type,active,discovery_only,crawl_policy)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE,$11,'public_page')
      ON CONFLICT (url) DO UPDATE SET updated_at=NOW(),municipality_id=COALESCE(sources.municipality_id,EXCLUDED.municipality_id),
        organization_id=COALESCE(sources.organization_id,EXCLUDED.organization_id)
      RETURNING id
    `, [discoveredSourceKey(link.url), `${source.entity_name}${link.label ? ` — ${link.label.slice(0,100)}` : ''}`,
      source.municipality_id || null, source.organization_id || null, source.locality || null, sourceType, link.url,
      target.origin, priority, parserType, discoveryOnly]);
    if (result.length) inserted += 1;
  }
  return inserted;
}

async function registerSitemapIfAvailable(source) {
  if (!['municipal_discovery','religious_discovery','organization_discovery'].includes(source.parser_type)) return 0;
  const origin = new URL(source.url).origin;
  const sitemapUrl = `${origin}/sitemap.xml`;
  if (sitemapUrl === source.url) return 0;
  const existing = await one('SELECT id,active FROM sources WHERE url=$1', [sitemapUrl]);
  if (existing) return 0;
  try {
    if (!await robotsAllows(sitemapUrl, USER_AGENT)) return 0;
    const { response, bytes } = await fetchLimited(sitemapUrl, {
      headers: { accept: 'application/xml,text/xml,text/plain;q=0.8', 'user-agent': `${USER_AGENT}/1.0 (+https://benvenutiinsalento.it/contatti)` },
    }, 2 * 1024 * 1024);
    if (!response.ok) return 0;
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 5000));
    if (!/<(?:urlset|sitemapindex)\b/i.test(text)) return 0;
    await query(`INSERT INTO sources(source_key,entity_name,municipality_id,organization_id,locality,source_type,url,base_url,priority,parser_type,active,discovery_only,crawl_policy)
      VALUES($1,$2,$3,$4,$5,'sitemap',$6,$7,$8,'sitemap_discovery',TRUE,TRUE,'public_page')
      ON CONFLICT(url) DO NOTHING`,
      [discoveredSourceKey(sitemapUrl), `${source.entity_name} — sitemap`, source.municipality_id || null, source.organization_id || null,
        source.locality || null, sitemapUrl, origin, Number(source.priority)]);
    return 1;
  } catch {
    return 0;
  }
}

export function candidateWindow(candidates, cursor = 0, size = 800) {
  const safeCursor = Math.max(0, Number(cursor) || 0);
  const safeSize = Math.min(2000, Math.max(1, Number(size) || 800));
  const items = candidates.slice(safeCursor, safeCursor + safeSize);
  const nextCursor = safeCursor + items.length;
  return {
    items,
    cursor: safeCursor,
    nextCursor: nextCursor < candidates.length ? nextCursor : 0,
    remaining: Math.max(0, candidates.length - nextCursor),
    hasMore: nextCursor < candidates.length,
    total: candidates.length,
  };
}

export async function processSource(source, runId) {
  const started = Date.now();
  try {
    const fetched = await fetchSource(source);
    if (fetched.skipped) {
      await query(`UPDATE sources SET last_checked_at=NOW(),last_error=$2,next_check_at=NOW()+INTERVAL '24 hours' WHERE id=$1`, [source.id, fetched.reason]);
      return { ok: true, skipped: true, reason: fetched.reason, discovered: 0, created: 0, updated: 0, review: 0 };
    }
    if (fetched.notModified) {
      await query(`UPDATE sources SET last_checked_at=NOW(),last_success_at=NOW(),last_http_status=304,last_error=NULL,consecutive_failures=0,
        last_created_count=0,last_updated_count=0,last_review_count=0,last_run_id=$2,last_duration_ms=$3,
        next_check_at=NOW()+INTERVAL '12 hours' WHERE id=$1`, [source.id, runId, Date.now() - started]);
      return { ok: true, notModified: true, discovered: 0, created: 0, updated: 0, review: 0 };
    }

    const raw = await saveRaw(source, runId, fetched);
    let discoveredLinks = 0;
    if (source.discovery_only || ['municipal_discovery','religious_discovery','organization_discovery','sitemap_discovery'].includes(source.parser_type)) {
      discoveredLinks = await registerDiscoveredLinks(source, fetched);
      discoveredLinks += await registerSitemapIfAvailable(source);
      if (['organization_discovery','pro_loco_registry'].includes(source.parser_type)) discoveredLinks += await registerOrganizationLinks(source, fetched);
    }

    let candidates = await parsePayload(source, fetched);
    if (source.parser_type === 'puglia_json') candidates = keepProvinceEvents(candidates);
    const storedCursor = source.content_hash && source.content_hash !== raw.hash ? 0 : Number(source.ingestion_cursor || 0);
    const window = candidateWindow(candidates, storedCursor, source.parser_type === 'puglia_json' ? 800 : 1200);
    let created = 0, updated = 0, review = 0, duplicateMerged = 0;
    for (const candidate of window.items) {
      const result = await upsertEvent(candidate, source, runId);
      if (result.created) created += 1;
      if (result.updated) updated += 1;
      if (result.review) review += 1;
      if (result.duplicateMerged) duplicateMerged += 1;
    }
    await query(`UPDATE raw_ingestion_records SET processing_status=$2,processed_at=NOW() WHERE id=$1`, [raw.id, window.hasMore ? 'new' : 'processed']);
    await query(`UPDATE sources SET last_checked_at=NOW(),last_success_at=NOW(),last_http_status=$2,etag=$3,last_modified_header=$4,
      content_hash=$5,last_error=NULL,consecutive_failures=0,extracted_events_count=$6,ingestion_cursor=$7,
      last_created_count=$9,last_updated_count=$10,last_review_count=$11,last_run_id=$12,last_duration_ms=$13,
      next_check_at=NOW()+CASE WHEN $8 THEN INTERVAL '2 minutes' ELSE INTERVAL '8 hours' END,updated_at=NOW() WHERE id=$1`,
      [source.id, fetched.status, fetched.etag, fetched.lastModified, raw.hash, candidates.length, window.nextCursor, window.hasMore,
       created, updated, review, runId, Date.now() - started]);
    return { ok: true, discovered: window.items.length, sourceCandidates: candidates.length, remaining: window.remaining, discoveredLinks, created, updated, review, duplicateMerged, durationMs: Date.now()-started };
  } catch (error) {
    const message = String(error?.message || error).slice(0, 500);
    await query(`UPDATE sources SET last_checked_at=NOW(),last_failure_at=NOW(),last_error=$2,consecutive_failures=consecutive_failures+1,
      last_run_id=$3,last_duration_ms=$4,
      next_check_at=NOW() + (LEAST(consecutive_failures+1,7) * INTERVAL '12 hours'),updated_at=NOW() WHERE id=$1`,
      [source.id, message, runId, Date.now() - started]);
    await queueReview({ sourceId: source.id, reason: `Errore acquisizione: ${message}`, severity: source.priority <= 3 ? 'high' : 'medium', payload: { url: source.url } });
    return { ok: false, error: message, discovered: 0, created: 0, updated: 0, review: 1, durationMs: Date.now()-started };
  }
}

export async function runIngestionBatch({ limit = 10, sourceIds = [], runType = 'ingestion', discoveryOnly = false } = {}) {
  const run = await one(`INSERT INTO source_runs (run_type,status,notes) VALUES ($1,'running',$2) RETURNING id,started_at`, [runType, `batch limit ${limit}`]);
  const params = [];
  let where = `active=TRUE AND crawl_policy NOT IN ('disallowed','manual_only') AND (next_check_at IS NULL OR next_check_at<=NOW())`;
  if (sourceIds.length) {
    params.push(sourceIds);
    where += ` AND s.id=ANY($1::bigint[])`;
  }
  if (discoveryOnly) where += ` AND (discovery_only=TRUE OR parser_type IN ('municipal_discovery','religious_discovery','organization_discovery','sitemap_discovery'))`;
  params.push(Math.min(40, Math.max(1, Number(limit) || 10)));
  const sources = await query(`SELECT s.*,m.name AS municipality_name FROM sources s LEFT JOIN municipalities m ON m.id=s.municipality_id WHERE ${where} ORDER BY priority,last_checked_at NULLS FIRST LIMIT $${params.length}`, params);
  const totals = { checked: 0, succeeded: 0, failed: 0, discovered: 0, created: 0, updated: 0, review: 0, duplicates: 0, links: 0 };
  for (const source of sources) {
    totals.checked += 1;
    const result = await processSource(source, run.id);
    result.ok ? totals.succeeded++ : totals.failed++;
    totals.discovered += result.discovered || 0;
    totals.created += result.created || 0;
    totals.updated += result.updated || 0;
    totals.review += result.review || 0;
    totals.duplicates += result.duplicateMerged || 0;
    totals.links += result.discoveredLinks || 0;
  }
  const status = totals.failed === 0 ? 'completed' : totals.succeeded ? 'partial' : 'failed';
  await query(`UPDATE source_runs SET status=$2,completed_at=NOW(),duration_ms=EXTRACT(EPOCH FROM (NOW()-started_at))*1000,
    sources_checked=$3,sources_succeeded=$4,sources_failed=$5,events_discovered=$6,events_created=$7,events_updated=$8,events_discarded=$9,duplicates_merged=$10,notes=$11 WHERE id=$1`,
    [run.id,status,totals.checked,totals.succeeded,totals.failed,totals.discovered,totals.created,totals.updated,totals.review,totals.duplicates,`link scoperti: ${totals.links}`]);
  await query(`WITH closing AS (
      UPDATE events SET status='completed'
      WHERE status IN ('published','postponed')
        AND NOT EXISTS (SELECT 1 FROM event_occurrences o WHERE o.event_id=events.id AND COALESCE(o.end_at,o.start_at) >= NOW())
      RETURNING id)
    INSERT INTO event_status_history (event_id, from_status, to_status, reason, actor)
      SELECT id, 'published', 'completed', 'Finestra occorrenze conclusa', 'system' FROM closing`);
  return { runId: run.id, status, ...totals };
}
