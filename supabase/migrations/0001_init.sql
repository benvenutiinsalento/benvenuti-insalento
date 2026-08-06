-- ============================================================================
-- PORTALE EVENTI SALENTO — Migrazione 0001: schema completo (Supabase)
-- Conforme al PROMPT MASTER: territorio, eventi/occorrenze, fonti/ingestione,
-- revisione, utenti/ruoli, segnalazioni, ricerca PG (unaccent+pg_trgm+FTS ita).
-- Portabile su Postgres vanilla (CI GitHub Actions): vedi sezione "shim auth".
-- Idempotente: tutti gli oggetti usano IF NOT EXISTS / CREATE OR REPLACE.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Estensioni
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- unaccent() non è dichiarata IMMUTABLE dal catalogo: wrapper immutabile
-- (assert documentata: la sostituzione accenti è deterministica) per poterla
-- usare negli indici di espressione. Schema-qualificata per l'inline negli
-- indici (search_path ridotto a pg_catalog durante la valutazione).
CREATE OR REPLACE FUNCTION public.imm_unaccent(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
AS $$ SELECT public.unaccent($1) $$;

-- ---------------------------------------------------------------------------
-- 1. Shim Auth (solo fuori Supabase / CI vanilla)
-- Su Supabase lo schema auth esiste già: i DO block non toccano nulla.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                 WHERE n.nspname = 'auth' AND c.relname = 'users') THEN
    CREATE TABLE auth.users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
                 WHERE n.nspname = 'auth' AND p.proname = 'uid') THEN
    CREATE FUNCTION auth.uid() RETURNS uuid
      LANGUAGE sql STABLE AS $fn$ SELECT NULL::uuid $fn$;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Tipi enumerati (stati obbligatori del mandato)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE event_status AS ENUM
    ('draft','pending_review','verified','published','postponed','cancelled','completed','archived','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_level AS ENUM
    ('official','institutional','confirmed','secondary','unverified','conflicting');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE location_accuracy AS ENUM ('exact','address','locality','municipality','unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE occurrence_status AS ENUM ('scheduled','postponed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE locality_type AS ENUM ('frazione','marina','borgo','localita','alias');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- 3. Territorio: 96 Comuni + località tipizzate + alias/varianti
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS municipalities (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  province TEXT NOT NULL DEFAULT 'Lecce',
  region TEXT NOT NULL DEFAULT 'Puglia',
  istat_code TEXT,
  official_website TEXT,
  website_candidate TEXT,
  official_website_verified BOOLEAN NOT NULL DEFAULT FALSE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  coverage_status TEXT NOT NULL DEFAULT 'missing'
    CHECK (coverage_status IN ('complete','good','partial','critical','missing')),
  coverage_score INTEGER NOT NULL DEFAULT 0 CHECK (coverage_score BETWEEN 0 AND 100),
  last_coverage_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS localities (
  id BIGSERIAL PRIMARY KEY,
  municipality_id BIGINT NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  locality_type locality_type NOT NULL DEFAULT 'localita',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (municipality_id, normalized_name)
);
CREATE INDEX IF NOT EXISTS localities_municipality_idx ON localities(municipality_id);
CREATE INDEX IF NOT EXISTS localities_type_idx ON localities(locality_type);

-- Alias/varianti territoriali (dialetto, forme abbreviate). locality_id NULL = alias di Comune.
CREATE TABLE IF NOT EXISTS territorial_aliases (
  id BIGSERIAL PRIMARY KEY,
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL UNIQUE,
  municipality_id BIGINT NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
  locality_id BIGINT REFERENCES localities(id) ON DELETE CASCADE,
  locality_type locality_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS territorial_aliases_municipality_idx ON territorial_aliases(municipality_id);

-- Compatibilità lettura codice precedente (v12 usava territory_aliases):
-- la vista espone la nuova tabella col vecchio nome logico.
CREATE OR REPLACE VIEW territory_aliases AS
  SELECT id, alias, normalized_alias, municipality_id,
         COALESCE(locality_type::text, 'locality') AS locality_type
  FROM territorial_aliases;

-- ---------------------------------------------------------------------------
-- 4. Organizzazioni (Pro Loco, comitati festa, parrocchie, enti)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  municipality_id BIGINT REFERENCES municipalities(id),
  locality TEXT,
  registry_source_url TEXT NOT NULL,
  official_url TEXT,
  social_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (verification_status IN ('candidate','verified','inactive','rejected')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (normalized_name, municipality_id)
);

-- ---------------------------------------------------------------------------
-- 5. Categorie evento (20 obbligatorie) + tag + pubblici
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 6. Fonti e tracciamento ingestione
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sources (
  id BIGSERIAL PRIMARY KEY,
  source_key TEXT NOT NULL UNIQUE,
  entity_name TEXT NOT NULL,
  municipality_id BIGINT REFERENCES municipalities(id),
  organization_id BIGINT REFERENCES organizations(id),
  locality TEXT,
  source_type TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  -- Mandato: formato, parser, frequenza, stato, approvazione, auto-pubblicazione,
  -- priorità, affidabilità, controlli, ETag/Last-Modified, policy robots, note.
  format TEXT NOT NULL DEFAULT 'html', -- html|json|jsonld|rss|atom|ics|xml|sitemap|pdf|pdf_scan|image
  priority INTEGER NOT NULL DEFAULT 6 CHECK (priority BETWEEN 1 AND 6),
  authority_level TEXT NOT NULL DEFAULT 'secondary'
    CHECK (authority_level IN ('official','institutional','confirmed','secondary','aggregator')),
  parser_type TEXT NOT NULL,
  check_frequency_hours INTEGER NOT NULL DEFAULT 6,
  reliability_score INTEGER NOT NULL DEFAULT 50 CHECK (reliability_score BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate','approved','active','failing','paused','disabled','rejected')),
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  auto_publish BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  discovery_only BOOLEAN NOT NULL DEFAULT FALSE,
  crawl_policy TEXT NOT NULL DEFAULT 'unknown'
    CHECK (crawl_policy IN ('unknown','open_data','public_page','allowed','disallowed','manual_only')),
  robots_allowed BOOLEAN,
  robots_checked_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_http_status INTEGER,
  etag TEXT,
  last_modified_header TEXT,
  content_hash TEXT,
  last_error TEXT,
  extracted_events_count INTEGER NOT NULL DEFAULT 0,
  ingestion_cursor INTEGER NOT NULL DEFAULT 0,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  next_check_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sources_municipality_idx ON sources(municipality_id);
CREATE INDEX IF NOT EXISTS sources_active_priority_idx ON sources(active, priority, next_check_at);
CREATE INDEX IF NOT EXISTS sources_failures_idx ON sources(consecutive_failures DESC, last_checked_at);
CREATE INDEX IF NOT EXISTS sources_status_idx ON sources(status, approved);

CREATE TABLE IF NOT EXISTS source_runs (
  id BIGSERIAL PRIMARY KEY,
  run_type TEXT NOT NULL
    CHECK (run_type IN ('bootstrap','ingestion','recheck','discovery','manual','coverage','maintenance')),
  status TEXT NOT NULL CHECK (status IN ('running','completed','partial','failed')),
  actor TEXT NOT NULL DEFAULT 'gha', -- gha-ingest-frequent | netlify | console | ...
  batch_number INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  sources_checked INTEGER NOT NULL DEFAULT 0,
  sources_succeeded INTEGER NOT NULL DEFAULT 0,
  sources_failed INTEGER NOT NULL DEFAULT 0,
  events_discovered INTEGER NOT NULL DEFAULT 0,
  events_created INTEGER NOT NULL DEFAULT 0,
  events_updated INTEGER NOT NULL DEFAULT 0,
  events_discarded INTEGER NOT NULL DEFAULT 0,
  duplicates_merged INTEGER NOT NULL DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS source_errors (
  id BIGSERIAL PRIMARY KEY,
  source_id BIGINT REFERENCES sources(id) ON DELETE CASCADE,
  run_id BIGINT REFERENCES source_runs(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL, -- http_404|http_429|timeout|parse|robots|too_large|...
  message TEXT NOT NULL,
  http_status INTEGER,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS source_errors_source_idx ON source_errors(source_id, occurred_at DESC);

-- Snapshot del contenuto acquisito (storage Supabase facoltativo via storage_path)
CREATE TABLE IF NOT EXISTS source_snapshots (
  id BIGSERIAL PRIMARY KEY,
  source_id BIGINT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  run_id BIGINT REFERENCES source_runs(id) ON DELETE SET NULL,
  content_hash TEXT NOT NULL,
  byte_size INTEGER,
  storage_path TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS source_snapshots_source_idx ON source_snapshots(source_id, captured_at DESC);

-- Nuove fonti scoperte automaticamente: richiedono approvazione editoriale.
CREATE TABLE IF NOT EXISTS source_discoveries (
  id BIGSERIAL PRIMARY KEY,
  discovered_from_source_id BIGINT REFERENCES sources(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  label TEXT,
  municipality_id BIGINT REFERENCES municipalities(id),
  parser_hint TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','approved','rejected','duplicate')),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  UNIQUE (url)
);

CREATE TABLE IF NOT EXISTS raw_ingestion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id BIGINT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  run_id BIGINT REFERENCES source_runs(id) ON DELETE SET NULL,
  external_id TEXT,
  source_url TEXT NOT NULL,
  content_type TEXT,
  content_hash TEXT NOT NULL,
  raw_payload JSONB,
  raw_text TEXT,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processing_status TEXT NOT NULL DEFAULT 'new'
    CHECK (processing_status IN ('new','processed','review','discarded','failed')),
  processing_error TEXT,
  UNIQUE(source_id, content_hash)
);

-- ---------------------------------------------------------------------------
-- 7. Eventi (modello del mandato) + occorrenze + relazioni
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_key TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT,
  status event_status NOT NULL DEFAULT 'draft',
  verification_level verification_level NOT NULL DEFAULT 'unverified',
  confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 1),
  municipality_id BIGINT REFERENCES municipalities(id),
  locality_id BIGINT REFERENCES localities(id),
  town TEXT NOT NULL,                    -- denormalizzato per prestazioni (contiene frazioni in ricerca)
  locality TEXT,
  venue TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_accuracy location_accuracy NOT NULL DEFAULT 'unknown',
  organizer TEXT,
  organizer_url TEXT,
  price_text TEXT,
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  booking_required BOOLEAN NOT NULL DEFAULT FALSE,
  booking_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  accessibility_text TEXT,
  parking_text TEXT,
  original_time_text TEXT,
  image_url TEXT,
  first_discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  data_hash TEXT NOT NULL,
  primary_source_id BIGINT REFERENCES sources(id),
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  search_text TEXT NOT NULL DEFAULT '',
  last_seen_run_id BIGINT REFERENCES source_runs(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS events_status_idx ON events(status);
CREATE INDEX IF NOT EXISTS events_town_idx ON events(town);
CREATE INDEX IF NOT EXISTS events_municipality_idx ON events(municipality_id);
CREATE INDEX IF NOT EXISTS events_locality_idx ON events(locality_id);
CREATE INDEX IF NOT EXISTS events_geo_idx ON events(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
-- FTS italiano accent-insensitive + trigrammi per errori di battitura
CREATE INDEX IF NOT EXISTS events_search_tsv_idx ON events
  USING GIN (to_tsvector('italian', public.imm_unaccent(search_text)));
CREATE INDEX IF NOT EXISTS events_title_trgm_idx ON events
  USING GIN (normalized_title gin_trgm_ops);

-- Occorrenze: mai trasformare date discontinue in un intervallo continuo.
CREATE TABLE IF NOT EXISTS event_occurrences (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  all_day BOOLEAN NOT NULL DEFAULT FALSE,
  timezone TEXT NOT NULL DEFAULT 'Europe/Rome',
  doors_open_at TIMESTAMPTZ,
  schedule_text TEXT,
  status occurrence_status NOT NULL DEFAULT 'scheduled',
  occurrence_date DATE GENERATED ALWAYS AS ((start_at AT TIME ZONE COALESCE(timezone,'Europe/Rome'))::date) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, start_at)
);
CREATE INDEX IF NOT EXISTS event_occurrences_date_idx ON event_occurrences(occurrence_date);
CREATE INDEX IF NOT EXISTS event_occurrences_start_idx ON event_occurrences(start_at);
CREATE INDEX IF NOT EXISTS event_occurrences_event_idx ON event_occurrences(event_id);

CREATE TABLE IF NOT EXISTS event_sources (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  source_id BIGINT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  source_event_url TEXT NOT NULL,
  source_payload_hash TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, source_id, source_event_url)
);

CREATE TABLE IF NOT EXISTS event_categories (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (event_id, category_id)
);

CREATE TABLE IF NOT EXISTS event_tags (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (event_id, tag)
);

CREATE TABLE IF NOT EXISTS event_audiences (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  audience TEXT NOT NULL, -- famiglie|bambini|adulti|tutti|...
  PRIMARY KEY (event_id, audience)
);

CREATE TABLE IF NOT EXISTS event_media (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','poster','pdf','video')),
  source_url TEXT,
  ocr_confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_versions (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  changed_by TEXT NOT NULL DEFAULT 'system',
  change_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, version)
);

CREATE TABLE IF NOT EXISTS event_status_history (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT,
  actor TEXT NOT NULL DEFAULT 'system',
  source_id BIGINT REFERENCES sources(id) ON DELETE SET NULL,
  source_run_id BIGINT REFERENCES source_runs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS event_status_history_event_idx ON event_status_history(event_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 8. Revisione e qualità
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS review_queue (
  id BIGSERIAL PRIMARY KEY,
  item_type TEXT NOT NULL DEFAULT 'event'
    CHECK (item_type IN ('event','source','duplicate','submission')),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  source_id BIGINT REFERENCES sources(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','merged','ignored','resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_note TEXT
);
CREATE INDEX IF NOT EXISTS review_queue_status_idx ON review_queue(status, severity, created_at);

CREATE TABLE IF NOT EXISTS duplicate_candidates (
  id BIGSERIAL PRIMARY KEY,
  primary_event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  duplicate_event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  similarity NUMERIC(4,3) NOT NULL DEFAULT 0,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','merged','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  UNIQUE (primary_event_id, duplicate_event_id)
);

CREATE TABLE IF NOT EXISTS editor_notes (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  author_id UUID,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID,
  actor_label TEXT NOT NULL DEFAULT 'system',
  source TEXT NOT NULL DEFAULT 'api' CHECK (source IN ('api','gha','console')),
  action TEXT NOT NULL, -- approve|merge|postpone|cancel|source_disable|...
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON audit_log(entity_type, entity_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 9. Autenticazione e ruoli redazione (admin|editor|reviewer|viewer)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Funzione SECURITY DEFINER per evitare ricorsione RLS su user_roles
CREATE OR REPLACE FUNCTION public.has_role(role_names text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.name = ANY(role_names)
  );
$$;

-- ---------------------------------------------------------------------------
-- 10. Segnalazioni utenti
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  town TEXT NOT NULL,
  municipality_id BIGINT REFERENCES municipalities(id),
  start_date DATE,
  end_date DATE,
  source_url TEXT,
  organizer_name TEXT,
  contact_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','duplicate')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

CREATE TABLE IF NOT EXISTS submission_media (
  id BIGSERIAL PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES event_submissions(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  media_type TEXT,
  byte_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_status_history (
  id BIGSERIAL PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES event_submissions(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  actor TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 11. Sinonimi di ricerca (varianti dialettali e lessicali)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS search_synonyms (
  term TEXT PRIMARY KEY,          -- normalizzato, minuscole, senza accenti
  synonyms TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Espansione query: token + sinonimi (singole parole e frasi)
CREATE OR REPLACE FUNCTION public.expand_query_terms(raw_q text)
RETURNS text[]
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  q text := lower(public.imm_unaccent(btrim(coalesce(raw_q, ''))));
  tokens text[];
  terms text[] := '{}';
BEGIN
  IF q IS NULL OR q = '' THEN RETURN '{}'; END IF;
  tokens := regexp_split_to_array(q, '\s+');
  terms := tokens;
  -- forma canonica dei sinonimi quando compaiono le varianti (o frasi note)
  SELECT array_cat(terms, array_agg(DISTINCT s.term))
    INTO terms
    FROM search_synonyms s
   WHERE s.synonyms && tokens
      OR position(s.term in q) > 0;
  -- varianti dialettali/lessicali quando la query contiene la forma canonica
  SELECT array_cat(terms, array_agg(DISTINCT syn))
    INTO terms
    FROM search_synonyms s, unnest(s.synonyms) AS syn
   WHERE s.term = ANY(tokens)
      OR position(s.term in q) > 0;
  SELECT array_agg(DISTINCT u) INTO terms FROM unnest(terms) AS u;
  RETURN terms;
END;
$$;

-- Ricerca obbligatoria: FTS italiano (unaccent) + trigrammi + sinonimi.
-- Ritorna gli id evento ordinati per pertinenza.
CREATE OR REPLACE FUNCTION public.search_events(raw_q text)
RETURNS TABLE (event_id uuid, rank real)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  q text := nullif(btrim(public.imm_unaccent(lower(coalesce(raw_q,'')))), '');
  terms text[];
BEGIN
  IF q IS NULL THEN
    RETURN;
  END IF;
  terms := public.expand_query_terms(raw_q);
  RETURN QUERY
  WITH scored AS (
    SELECT e.id,
      GREATEST(
        ts_rank_cd(to_tsvector('italian', public.imm_unaccent(e.search_text)),
                   websearch_to_tsquery('italian', public.imm_unaccent(raw_q))),
        similarity(e.normalized_title, q) * 0.8,
        CASE WHEN EXISTS (
          SELECT 1 FROM unnest(terms) t
          WHERE public.imm_unaccent(lower(e.search_text)) ILIKE '%' || t || '%'
        ) THEN 0.15 ELSE 0 END
      )::real AS score
    FROM events e
    WHERE to_tsvector('italian', public.imm_unaccent(e.search_text))
            @@ websearch_to_tsquery('italian', public.imm_unaccent(raw_q))
       OR e.normalized_title % q
       OR EXISTS (
            SELECT 1 FROM unnest(terms) t
            WHERE public.imm_unaccent(lower(e.search_text)) ILIKE '%' || t || '%'
          )
  )
  SELECT scored.id, scored.score FROM scored WHERE scored.score > 0
  ORDER BY scored.score DESC, scored.id
  LIMIT 400;
END;
$$;

-- ---------------------------------------------------------------------------
-- 12. Viste pubbliche e reportistica
-- ---------------------------------------------------------------------------
-- Eventi visibili al pubblico: stati pubblicabili, occorrenze aggregate,
-- nessun evento completamente passato nelle ricerche normali (iltrov filtra).
CREATE OR REPLACE VIEW v_events_public AS
SELECT
  e.id, e.slug, e.title, e.subtitle, e.description, e.short_description,
  e.status::text AS status, e.verification_level::text AS verification_level,
  e.confidence_score, e.town, e.locality, e.venue, e.address,
  e.latitude, e.longitude, e.location_accuracy::text AS location_accuracy,
  e.organizer, e.organizer_url, e.price_text, e.is_free,
  e.booking_required, e.booking_url, e.contact_email, e.contact_phone,
  e.accessibility_text, e.parking_text, e.original_time_text, e.image_url,
  e.source_url, e.source_name,
  e.first_discovered_at, e.last_checked_at, e.last_verified_at, e.published_at,
  m.name AS municipality_name, m.slug AS municipality_slug,
  l.name AS locality_name, l.locality_type::text AS locality_type,
  COALESCE((SELECT jsonb_agg(jsonb_build_object(
              'id', o.id,
              'startAt', o.start_at,
              'endAt', o.end_at,
              'allDay', o.all_day,
              'timezone', o.timezone,
              'doorsOpenAt', o.doors_open_at,
              'scheduleText', o.schedule_text,
              'status', o.status,
              'date', o.occurrence_date) ORDER BY o.start_at)
    FROM event_occurrences o WHERE o.event_id = e.id), '[]'::jsonb) AS occurrences,
  COALESCE((SELECT array_agg(c.name ORDER BY ec.is_primary DESC, c.sort_order)
    FROM event_categories ec JOIN categories c ON c.id = ec.category_id
    WHERE ec.event_id = e.id), '{}'::text[]) AS categories,
  COALESCE((SELECT array_agg(t.tag) FROM event_tags t WHERE t.event_id = e.id), '{}'::text[]) AS tags,
  COALESCE((SELECT array_agg(a.audience) FROM event_audiences a WHERE a.event_id = e.id), '{}'::text[]) AS audiences,
  (SELECT MIN(o.start_at) FROM event_occurrences o WHERE o.event_id = e.id) AS first_start_at,
  (SELECT MAX(o.end_at) FROM event_occurrences o WHERE o.event_id = e.id) AS last_end_at
FROM events e
LEFT JOIN municipalities m ON m.id = e.municipality_id
LEFT JOIN localities l ON l.id = e.locality_id
WHERE e.status IN ('published','postponed','cancelled','verified');

-- Report copertura per Comune (96): il "complete" misura il monitoraggio,
-- non certifica la totalità degli eventi organizzati sul territorio.
CREATE OR REPLACE VIEW v_municipality_coverage AS
SELECT
  m.id, m.name, m.slug, m.coverage_status, m.coverage_score, m.last_coverage_check,
  (SELECT COUNT(*) FROM sources s WHERE s.municipality_id = m.id) AS sources_registered,
  (SELECT COUNT(*) FROM sources s WHERE s.municipality_id = m.id AND s.active) AS sources_active,
  (SELECT COUNT(*) FROM sources s WHERE s.municipality_id = m.id AND s.active
      AND s.last_success_at >= NOW() - INTERVAL '72 hours') AS sources_working,
  (SELECT MAX(s.last_success_at) FROM sources s WHERE s.municipality_id = m.id) AS last_source_success,
  (SELECT COUNT(DISTINCT e.id) FROM events e
      JOIN event_occurrences o ON o.event_id = e.id
      WHERE e.municipality_id = m.id AND e.status IN ('published','postponed')
        AND o.occurrence_date >= CURRENT_DATE) AS future_events,
  (SELECT COUNT(DISTINCT e.id) FROM events e
      JOIN event_occurrences o ON o.event_id = e.id
      WHERE e.municipality_id = m.id
        AND o.occurrence_date BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE) AS events_last_30d,
  (SELECT COUNT(*) FROM source_errors se JOIN sources s ON s.id = se.source_id
      WHERE s.municipality_id = m.id AND se.occurred_at >= NOW() - INTERVAL '7 days') AS recent_errors
FROM municipalities m;

-- Storico punteggi copertura (trend nel tempo, compilato da coverage-report)
CREATE TABLE IF NOT EXISTS coverage_snapshots (
  id BIGSERIAL PRIMARY KEY,
  municipality_id BIGINT NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  status TEXT NOT NULL CHECK (status IN ('complete','good','partial','critical','missing')),
  sources_registered INTEGER NOT NULL DEFAULT 0,
  sources_active INTEGER NOT NULL DEFAULT 0,
  sources_working INTEGER NOT NULL DEFAULT 0,
  future_events INTEGER NOT NULL DEFAULT 0,
  events_last_30d INTEGER NOT NULL DEFAULT 0,
  recent_errors INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  UNIQUE (municipality_id, snapshot_date)
);
ALTER TABLE coverage_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_read_coverage_snapshots ON coverage_snapshots;
CREATE POLICY staff_read_coverage_snapshots ON coverage_snapshots FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));

-- ---------------------------------------------------------------------------
-- 13. Trigger updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['municipalities','localities','organizations','sources','events','profiles']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS touch_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER touch_updated_at BEFORE UPDATE ON %I
                    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 14. Row Level Security
--   - Lettura pubblica: territorio, categorie, sinonimi, eventi pubblicabili.
--   - Nessuna scrittura pubblica tranne inserimento segnalazioni (validato
--     comunque dall'API con honeypot, consenso privacy e rate limit).
--   - Fonti/code/audit: solo staff (ruoli) o service_role (bypassa RLS).
-- ---------------------------------------------------------------------------
ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE territorial_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_synonyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_ingestion_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_status_history ENABLE ROW LEVEL SECURITY;

-- Lettura pubblica dati territoriali/categorie/sinonimi
DROP POLICY IF EXISTS territory_public_read ON municipalities;
CREATE POLICY territory_public_read ON municipalities FOR SELECT USING (true);
DROP POLICY IF EXISTS localities_public_read ON localities;
CREATE POLICY localities_public_read ON localities FOR SELECT USING (true);
DROP POLICY IF EXISTS aliases_public_read ON territorial_aliases;
CREATE POLICY aliases_public_read ON territorial_aliases FOR SELECT USING (true);
DROP POLICY IF EXISTS categories_public_read ON categories;
CREATE POLICY categories_public_read ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS synonyms_public_read ON search_synonyms;
CREATE POLICY synonyms_public_read ON search_synonyms FOR SELECT USING (true);

-- Eventi: pubblico legge solo stati esponibili; staff legge tutto.
DROP POLICY IF EXISTS events_public_read ON events;
CREATE POLICY events_public_read ON events FOR SELECT
  USING (status IN ('published','postponed','cancelled','verified')
         OR public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS occurrences_public_read ON event_occurrences;
CREATE POLICY occurrences_public_read ON event_occurrences FOR SELECT
  USING (EXISTS (SELECT 1 FROM events e WHERE e.id = event_occurrences.event_id
          AND (e.status IN ('published','postponed','cancelled','verified')
               OR public.has_role(ARRAY['admin','editor','reviewer','viewer']))));
DROP POLICY IF EXISTS event_sources_public_read ON event_sources;
CREATE POLICY event_sources_public_read ON event_sources FOR SELECT USING (true);
DROP POLICY IF EXISTS event_categories_public_read ON event_categories;
CREATE POLICY event_categories_public_read ON event_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS event_tags_public_read ON event_tags;
CREATE POLICY event_tags_public_read ON event_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS event_audiences_public_read ON event_audiences;
CREATE POLICY event_audiences_public_read ON event_audiences FOR SELECT USING (true);
DROP POLICY IF EXISTS event_media_public_read ON event_media;
CREATE POLICY event_media_public_read ON event_media FOR SELECT USING (true);

-- Backoffice: solo ruoli redazione (lettura scrivania tecnica).
DROP POLICY IF EXISTS staff_read_sources ON sources;
CREATE POLICY staff_read_sources ON sources FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS staff_read_runs ON source_runs;
CREATE POLICY staff_read_runs ON source_runs FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS staff_read_errors ON source_errors;
CREATE POLICY staff_read_errors ON source_errors FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS staff_read_snapshots ON source_snapshots;
CREATE POLICY staff_read_snapshots ON source_snapshots FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS staff_read_discoveries ON source_discoveries;
CREATE POLICY staff_read_discoveries ON source_discoveries FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS staff_read_raw ON raw_ingestion_records;
CREATE POLICY staff_read_raw ON raw_ingestion_records FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS staff_read_review ON review_queue;
CREATE POLICY staff_read_review ON review_queue FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS staff_review_write ON review_queue;
CREATE POLICY staff_review_write ON review_queue FOR UPDATE
  USING (public.has_role(ARRAY['admin','editor','reviewer']));
DROP POLICY IF EXISTS staff_read_duplicates ON duplicate_candidates;
CREATE POLICY staff_read_duplicates ON duplicate_candidates FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS staff_read_notes ON editor_notes;
CREATE POLICY staff_read_notes ON editor_notes FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS staff_write_notes ON editor_notes;
CREATE POLICY staff_write_notes ON editor_notes FOR INSERT
  WITH CHECK (public.has_role(ARRAY['admin','editor','reviewer']));
DROP POLICY IF EXISTS admin_read_audit ON audit_log;
CREATE POLICY admin_read_audit ON audit_log FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer']));
DROP POLICY IF EXISTS staff_read_versions ON event_versions;
CREATE POLICY staff_read_versions ON event_versions FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS staff_read_status_history ON event_status_history;
CREATE POLICY staff_read_status_history ON event_status_history FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS staff_read_organizations ON organizations;
CREATE POLICY staff_read_organizations ON organizations FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));

-- Profili e ruoli: l'utente legge il proprio profilo; staff legge tutto.
DROP POLICY IF EXISTS profiles_self_read ON profiles;
CREATE POLICY profiles_self_read ON profiles FOR SELECT
  USING (id = auth.uid() OR public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS user_roles_self_read ON user_roles;
CREATE POLICY user_roles_self_read ON user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(ARRAY['admin']));
DROP POLICY IF EXISTS roles_read ON roles;
CREATE POLICY roles_read ON roles FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']) OR auth.uid() IS NOT NULL);

-- Scritture redazionali (API backoffice usa service role; queste policy
-- coprono accessi diretti dalla dashboard Supabase con utenti autenticati).
DROP POLICY IF EXISTS editor_write_events ON events;
CREATE POLICY editor_write_events ON events FOR UPDATE
  USING (public.has_role(ARRAY['admin','editor','reviewer']));
DROP POLICY IF EXISTS admin_write_sources ON sources;
CREATE POLICY admin_write_sources ON sources FOR UPDATE
  USING (public.has_role(ARRAY['admin','editor']));

-- Segnalazioni: chiunque inserisce; solo staff legge/aggiorna.
DROP POLICY IF EXISTS submissions_public_insert ON event_submissions;
CREATE POLICY submissions_public_insert ON event_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS submissions_staff_read ON event_submissions;
CREATE POLICY submissions_staff_read ON event_submissions FOR SELECT
  USING (public.has_role(ARRAY['admin','editor','reviewer','viewer']));
DROP POLICY IF EXISTS submissions_staff_update ON event_submissions;
CREATE POLICY submissions_staff_update ON event_submissions FOR UPDATE
  USING (public.has_role(ARRAY['admin','editor','reviewer']));
DROP POLICY IF EXISTS submissions_media_staff ON submission_media;
CREATE POLICY submissions_media_staff ON submission_media FOR ALL
  USING (public.has_role(ARRAY['admin','editor','reviewer']));
DROP POLICY IF EXISTS submissions_history_staff ON submission_status_history;
CREATE POLICY submissions_history_staff ON submission_status_history FOR ALL
  USING (public.has_role(ARRAY['admin','editor','reviewer']));

-- ---------------------------------------------------------------------------
-- 15. Grant (solo se i ruoli Supabase esistono; su CI vanilla non esistono)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA public TO anon, authenticated';
    EXECUTE 'GRANT SELECT ON municipalities, localities, territorial_aliases, categories,
             search_synonyms TO anon, authenticated';
    EXECUTE 'GRANT SELECT ON events, event_occurrences, event_sources, event_categories,
             event_tags, event_audiences, event_media TO anon, authenticated';
    EXECUTE 'GRANT INSERT ON event_submissions TO anon, authenticated';
    EXECUTE 'GRANT SELECT ON v_events_public, v_municipality_coverage TO anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.search_events(text),
             public.expand_query_terms(text), public.has_role(text[]) TO anon, authenticated';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Fine migrazione 0001
-- ---------------------------------------------------------------------------
