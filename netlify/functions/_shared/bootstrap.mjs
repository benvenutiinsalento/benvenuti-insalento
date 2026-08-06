import { transaction, query } from './db.mjs';
import { MUNICIPALITIES, PRO_LOCO_REGISTRY, SOURCE_REGISTRY, normalize, municipalityByName } from './registry.mjs';
import { slugify } from './slug.mjs';
import { loadVerifiedPrograms } from './verified-programs.mjs';
import { upsertEvent } from './event-repository.mjs';

function baseUrl(url) {
  try { return new URL(url).origin; } catch { return ''; }
}

export async function bootstrapSystem() {
  const verifiedPrograms = loadVerifiedPrograms();
  await transaction(async (client) => {
    for (const municipality of MUNICIPALITIES) {
      const result = await client.query(`
        INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (name) DO UPDATE SET
          slug = EXCLUDED.slug,
          istat_code = EXCLUDED.istat_code,
          website_candidate = EXCLUDED.website_candidate,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          updated_at = NOW()
        RETURNING id
      `, [municipality.name, municipality.slug, municipality.province, municipality.region,
          municipality.istat || null, municipality.websiteCandidate,
          municipality.latitude ?? null, municipality.longitude ?? null]);
      const municipalityId = result.rows[0].id;
      for (const alias of municipality.aliases || []) {
        await client.query(`
          INSERT INTO territorial_aliases (alias, normalized_alias, municipality_id)
          VALUES ($1,$2,$3)
          ON CONFLICT (normalized_alias) DO UPDATE SET municipality_id = EXCLUDED.municipality_id, alias = EXCLUDED.alias
        `, [alias, normalize(alias), municipalityId]);
      }
      await client.query(`
        INSERT INTO sources (source_key, entity_name, municipality_id, source_type, url, base_url, priority, parser_type, active, discovery_only, crawl_policy)
        VALUES ($1,$2,$3,'municipality_candidate',$4,$5,2,'municipal_discovery',FALSE,TRUE,'unknown')
        ON CONFLICT (source_key) DO UPDATE SET entity_name=EXCLUDED.entity_name, municipality_id=EXCLUDED.municipality_id,
          url=EXCLUDED.url, base_url=EXCLUDED.base_url, updated_at=NOW()
      `, [`comune-${municipality.slug}`, `Comune di ${municipality.name}`, municipalityId, municipality.websiteCandidate, baseUrl(municipality.websiteCandidate)]);
    }

    for (const item of SOURCE_REGISTRY.coreSources) {
      await client.query(`
        INSERT INTO sources (source_key, entity_name, source_type, url, base_url, priority, parser_type, active, discovery_only, crawl_policy)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (source_key) DO UPDATE SET entity_name=EXCLUDED.entity_name, source_type=EXCLUDED.source_type,
          url=EXCLUDED.url, base_url=EXCLUDED.base_url, priority=EXCLUDED.priority, parser_type=EXCLUDED.parser_type,
          active=EXCLUDED.active, discovery_only=EXCLUDED.discovery_only, crawl_policy=EXCLUDED.crawl_policy, updated_at=NOW()
      `, [item.key, item.entityName, item.sourceType, item.url, baseUrl(item.url), item.priority, item.parserType,
        item.active !== false, Boolean(item.discoveryOnly), item.crawlPolicy || 'unknown']);
    }

    for (const program of verifiedPrograms.programs) {
      const municipality = await client.query('SELECT id FROM municipalities WHERE name=$1 LIMIT 1', [program.municipality]);
      await client.query(`
        INSERT INTO sources (source_key,entity_name,municipality_id,source_type,url,base_url,priority,parser_type,active,discovery_only,crawl_policy,last_checked_at,last_success_at,extracted_events_count)
        VALUES ($1,$2,$3,$4,$5,$6,$7,'verified_program_snapshot',TRUE,FALSE,'manual_only',$8,$8,$9)
        ON CONFLICT (source_key) DO UPDATE SET entity_name=EXCLUDED.entity_name,municipality_id=EXCLUDED.municipality_id,
          source_type=EXCLUDED.source_type,url=EXCLUDED.url,base_url=EXCLUDED.base_url,priority=EXCLUDED.priority,
          last_checked_at=EXCLUDED.last_checked_at,last_success_at=EXCLUDED.last_success_at,
          extracted_events_count=EXCLUDED.extracted_events_count,updated_at=NOW()
      `, [program.key, program.entityName, municipality.rows[0]?.id || null, program.sourceType, program.url,
        baseUrl(program.url), program.priority, verifiedPrograms.capturedAt, program.events.length]);
    }

    for (const organization of PRO_LOCO_REGISTRY) {
      const municipality = await client.query('SELECT id FROM municipalities WHERE name=$1', [organization.municipality]);
      if (!municipality.rows[0]) continue;
      await client.query(`
        INSERT INTO organizations (name, normalized_name, organization_type, municipality_id, locality, registry_source_url, verification_status)
        VALUES ($1,$2,'pro_loco',$3,$4,$5,'candidate')
        ON CONFLICT (normalized_name, municipality_id) DO UPDATE SET locality=EXCLUDED.locality,
          registry_source_url=EXCLUDED.registry_source_url, updated_at=NOW()
      `, [organization.name, normalize(organization.name), municipality.rows[0].id, organization.locality || null, organization.registryUrl]);
    }

    await client.query(`
      INSERT INTO system_state (key, value) VALUES ('bootstrap', $1::jsonb)
      ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()
    `, [JSON.stringify({ completedAt: new Date().toISOString(), municipalities: MUNICIPALITIES.length, proLocoCandidates: PRO_LOCO_REGISTRY.length })]);
  });

  let verifiedEventsImported = 0;
  for (const program of verifiedPrograms.programs) {
    const source = await query('SELECT * FROM sources WHERE source_key=$1 LIMIT 1', [program.key]);
    if (!source[0]) continue;
    for (const event of program.events) {
      const result = await upsertEvent({
        description: '', secondaryCategories: [], tags: [], occurrenceDates: [event.startDate], locality: '',
        venue: program.municipality, address: '', latitude: program.latitude ?? null, longitude: program.longitude ?? null,
        priceText: 'Da verificare', priceType: 'unknown', audiences: [], organizer: program.entityName, artists: [],
        imageUrl: '', bookingUrl: '', status: 'published', sourceUrl: program.documentUrl || program.url,
        sourceName: program.entityName, ...event, town: program.municipality,
      }, source[0], null);
      if (result.created || result.updated || result.duplicateMerged) verifiedEventsImported += 1;
    }
  }

  return { municipalities: MUNICIPALITIES.length, proLocoCandidates: PRO_LOCO_REGISTRY.length,
    coreSources: SOURCE_REGISTRY.coreSources.length, verifiedPrograms: verifiedPrograms.programs.length, verifiedEventsImported };
}

export async function syncIpaOfficialWebsites() {
  const source = SOURCE_REGISTRY.coreSources.find((item) => item.parserType === 'ipa_entities');
  if (!source) throw new Error('IPA_SOURCE_MISSING');
  const response = await fetch(source.url, { headers: { accept: 'application/json', 'user-agent': 'BenvenutiInSalentoEventBot/1.0' }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`IPA_HTTP_${response.status}`);
  const payload = await response.json();
  const records = payload?.result?.records || [];
  let updated = 0;
  let socialSources = 0;

  await transaction(async (client) => {
    for (const record of records) {
      const name = String(record.Denominazione_ente || '').replace(/^Comune di\s+/i, '').trim();
      const istat = String(record.Codice_ISTAT || record.Codice_comune_ISTAT || '').replace(/\D/g, '');
      if (istat && !istat.startsWith('075')) continue;
      const municipality = municipalityByName(name);
      const official = String(record.Sito_istituzionale || '').trim();
      if (!municipality || !/^https?:\/\//i.test(official)) continue;
      const normalizedUrl = official.replace(/^http:/i, 'https:').replace(/\/$/, '') + '/';
      const row = await client.query(`UPDATE municipalities SET official_website=$1, official_website_verified=TRUE,
        istat_code=COALESCE(NULLIF($2,''), istat_code), updated_at=NOW() WHERE name=$3 RETURNING id`,
        [normalizedUrl, istat, municipality.name]);
      if (!row.rows[0]) continue;
      const municipalityId = row.rows[0].id;
      await client.query(`
        INSERT INTO sources (source_key, entity_name, municipality_id, source_type, url, base_url, priority, parser_type, active, discovery_only, crawl_policy)
        VALUES ($1,$2,$3,'municipality',$4,$5,2,'municipal_discovery',TRUE,TRUE,'public_page')
        ON CONFLICT (source_key) DO UPDATE SET url=EXCLUDED.url, base_url=EXCLUDED.base_url, active=TRUE,
          source_type='municipality', crawl_policy='public_page', municipality_id=EXCLUDED.municipality_id, updated_at=NOW()
      `, [`comune-${municipality.slug}`, `Comune di ${municipality.name}`, municipalityId, normalizedUrl, baseUrl(normalizedUrl)]);
      updated += 1;

      const social = [record.Url_facebook, record.Url_youtube, record.Url_twitter].filter((url) => /^https?:\/\//i.test(String(url || '')));
      for (const url of social) {
        const key = `social-comune-${municipality.slug}-${slugify(new URL(url).hostname)}`;
        await client.query(`
          INSERT INTO sources (source_key, entity_name, municipality_id, source_type, url, base_url, priority, parser_type, active, discovery_only, crawl_policy)
          VALUES ($1,$2,$3,'official_social',$4,$5,4,'social_metadata',TRUE,FALSE,'public_page')
          ON CONFLICT (source_key) DO UPDATE SET url=EXCLUDED.url, base_url=EXCLUDED.base_url, active=TRUE, updated_at=NOW()
        `, [key, `${municipality.name} — canale social istituzionale`, municipalityId, url, baseUrl(url)]);
        socialSources += 1;
      }
    }
  });
  return { records: records.length, municipalitiesUpdated: updated, socialSources };
}

export async function bootstrapStatus() {
  const [municipalities] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE official_website_verified)::int AS verified_websites
      FROM municipalities`),
  ]);
  return municipalities[0] || { total: 0, verified_websites: 0 };
}
