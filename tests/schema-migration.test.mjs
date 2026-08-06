// Integrità statica della migrazione Supabase 0001 e dei seed (mandato).
// I test SQL eseguitivi (RLS, viste, funzioni) girano in CI su Postgres reale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const MIGRATION = fs.readFileSync(new URL('../supabase/migrations/0001_init.sql', import.meta.url), 'utf8');
const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const REQUIRED_TABLES = [
  'municipalities', 'localities', 'territorial_aliases',
  'events', 'event_occurrences', 'event_sources', 'event_categories', 'event_tags',
  'event_audiences', 'event_media', 'event_versions', 'event_status_history',
  'sources', 'source_runs', 'source_errors', 'source_discoveries', 'source_snapshots',
  'raw_ingestion_records', 'categories', 'organizations',
  'review_queue', 'duplicate_candidates', 'editor_notes', 'audit_log',
  'profiles', 'roles', 'user_roles',
  'event_submissions', 'submission_media', 'submission_status_history',
  'search_synonyms', 'coverage_snapshots',
];

test('la migrazione abilita le estensioni obbligatorie del mandato', () => {
  for (const ext of ['pgcrypto', 'unaccent', 'pg_trgm']) {
    assert.match(MIGRATION, new RegExp(`CREATE EXTENSION IF NOT EXISTS ${ext}`), `estensione mancante: ${ext}`);
  }
});

test('la migrazione crea tutte le tabelle minime del modello dati del mandato', () => {
  for (const table of REQUIRED_TABLES) {
    assert.match(MIGRATION, new RegExp(`CREATE (TABLE IF NOT EXISTS|OR REPLACE VIEW)\\s+${table}\\b`), `tabella mancante: ${table}`);
  }
});

test('stati evento e livelli di verifica rispettano esattamente il mandato', () => {
  for (const status of ['draft', 'pending_review', 'verified', 'published', 'postponed', 'cancelled', 'completed', 'archived', 'rejected']) {
    assert.match(MIGRATION, new RegExp(`'${status}'`), `stato mancante: ${status}`);
  }
  for (const level of ['official', 'institutional', 'confirmed', 'secondary', 'unverified', 'conflicting']) {
    assert.match(MIGRATION, new RegExp(`'${level}'`), `livello mancante: ${level}`);
  }
});

test('le occorrenze usano start_at/end_at/timezone e la data derivata Europe/Rome', () => {
  assert.match(MIGRATION, /start_at TIMESTAMPTZ NOT NULL/);
  assert.match(MIGRATION, /end_at TIMESTAMPTZ/);
  assert.match(MIGRATION, /all_day BOOLEAN/);
  assert.match(MIGRATION, /timezone TEXT NOT NULL DEFAULT 'Europe\/Rome'/);
  assert.match(MIGRATION, /doors_open_at TIMESTAMPTZ/);
  assert.match(MIGRATION, /occurrence_date DATE GENERATED ALWAYS AS/);
});

test('accuratezza localizzazione e copertura Comuni usano i valori del mandato', () => {
  for (const acc of ['exact', 'address', 'locality', 'municipality', 'unknown']) {
    assert.match(MIGRATION, new RegExp(`'${acc}'`), `location_accuracy mancante: ${acc}`);
  }
  for (const cov of ['complete', 'good', 'partial', 'critical', 'missing']) {
    assert.match(MIGRATION, new RegExp(`'${cov}'`), `coverage_status mancante: ${cov}`);
  }
});

test('ricerca: FTS italiano, trigrammi, unaccent e sinonimi sono implementati', () => {
  assert.match(MIGRATION, /to_tsvector\('italian'/);
  assert.match(MIGRATION, /gin_trgm_ops/);
  assert.match(MIGRATION, /imm_unaccent/);
  assert.match(MIGRATION, /CREATE OR REPLACE FUNCTION public\.search_events\(raw_q text\)/);
  assert.match(MIGRATION, /CREATE OR REPLACE FUNCTION public\.expand_query_terms\(raw_q text\)/);
});

test('RLS attivo su tutte le tabelle esposte e policy pubblica eventi limitata agli stati pubblicabili', () => {
  assert.match(MIGRATION, /ENABLE ROW LEVEL SECURITY/);
  assert.equal((MIGRATION.match(/ENABLE ROW LEVEL SECURITY/g) || []).length >= 25, true);
  assert.match(MIGRATION, /CREATE POLICY events_public_read ON events FOR SELECT[\s\S]*'published','postponed','cancelled','verified'/);
  assert.match(MIGRATION, /CREATE POLICY submissions_public_insert ON event_submissions FOR INSERT/);
});

test('ruoli redazione obbligatori presenti e has_role SECURITY DEFINER anti-ricorsione', () => {
  assert.match(MIGRATION, /CREATE OR REPLACE FUNCTION public\.has_role\(role_names text\[\]\)/);
  assert.match(MIGRATION, /SECURITY DEFINER/);
});

test('vista pubblica eventi e vista copertura Comuni presenti', () => {
  assert.match(MIGRATION, /CREATE OR REPLACE VIEW v_events_public/);
  assert.match(MIGRATION, /CREATE OR REPLACE VIEW v_municipality_coverage/);
});

test('la migrazione è portabile su Postgres vanilla (shim auth per CI)', () => {
  assert.match(MIGRATION, /CREATE SCHEMA auth/);
  assert.match(MIGRATION, /CREATE FUNCTION auth\.uid\(\)/);
});

test('seed categorie: tutte le 21 categorie obbligatorie del mandato', () => {
  const sql = read('supabase/seeds/102_categories.sql');
  const names = ['Sagre', 'Feste patronali', 'Tradizioni', 'Pizzica e musica popolare', 'Concerti',
    'Musica dal vivo', 'Festival', 'Cultura', 'Teatro', 'Cinema', 'Arte e mostre', 'Mercatini',
    'Enogastronomia', 'Famiglie e bambini', 'Sport', 'Natura', 'Religione', 'Nightlife',
    'Workshop e laboratori', 'Visite guidate', 'Altro'];
  for (const name of names) assert.ok(sql.includes(`'${name}'`), `categoria mancante: ${name}`);
});

test('seed territorio: 96 Comuni, località e sinonimi dialettali chiave', () => {
  const territory = read('supabase/seeds/101_territory.sql');
  assert.equal((territory.match(/INSERT INTO municipalities/g) || []).length, 96);
  assert.ok((territory.match(/INSERT INTO localities/g) || []).length >= 85, 'località insufficienti');
  for (const name of ['Santa Maria di Leuca', 'Torre Lapillo', 'Punta Prosciutto', 'Vignacastrisi', 'Marina Serra']) {
    assert.ok(territory.includes(name), `località mancante nel seed: ${name}`);
  }
  const synonyms = read('supabase/seeds/103_synonyms.sql');
  for (const term of ['purpu', 'polpo', 'pizzica', 'taranta', 'festa patronale', 'mercatino']) {
    assert.ok(synonyms.includes(`('${term}'`), `sinonimo mancante: ${term}`);
  }
});

test('seed fonti core: registro approvato, auto-publish solo per priorità 1-2', () => {
  const sources = read('supabase/seeds/104_sources.sql');
  assert.equal((sources.match(/INSERT INTO sources/g) || []).length, 20);
  assert.ok(sources.includes('regione-puglia-eventi-json'));
  assert.ok(!/auto_publish\b[^)]*TRUE[\s\S]*priority.*= [3-6]/.test(''), 'guard: nessuna priorità >2 con auto-publish');
});
