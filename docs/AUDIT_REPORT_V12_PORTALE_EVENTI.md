# AUDIT REPORT — Portale Eventi Salento (pacchetto v12)

Data: 2026-08-06 · Eseguito secondo PROMPT MASTER — PORTALE EVENTI SALENTO, fase 1 (Audit) e fase 2 (Scelta base).
Audit svolto sul codice reale estratto da `BENVENUTI-IN-SALENTO-NETLIFY-v14-PRONTO.txt` (ZIP rinominato, 6,8 MB), non su ipotesi.

---

## 1. Verdetto sintetico

**Il pacchetto v12 è una base valida e viene SCELTO come base di lavoro.** Non si ricrea nulla da zero: si conserva ciò che funziona (stack, parser, ingestion, deduplica, discovery, copertura, sito editoriale, documentazione) e si corregge ciò che non rispetta il mandato (database, scheduler, backoffice, schema dati, API, frontend pubblico, fallback, test).

Verifiche eseguite davvero in questa sessione:

| Verifica | Esito |
|---|---|
| Estrazione e lettura integrale di tutti i file (codice, dati, documenti) | ✅ |
| Esecuzione reale della suite `node --test tests/*.test.mjs` | ✅ **31/31 superati** |
| Moduli Netlify dichiarati: 32 | ✅ 32 file `.mjs` presenti |
| 96 Comuni nel registro | ✅ 96 elementi in `data/municipalities.json` |
| Esempi obbligatori di alias del mandato (13) | ⚠️ 12/13 presenti; **manca Santa Maria di Leuca → Castrignano del Capo** |
| Coordinate dei Comuni (per distanza "centro Comune") | ❌ **0/96 coordinate** |
| Nessuna chiave privata committata | ✅ nessun `.env`, nessun segreto trovato (grep su js/mjs/json/toml) |
| Eventi hardcoded nel codice | ✅ nessuno nel codice applicativo; l'archivio verificato è un file dati separato (`data/verified-programs-2026.json`) |

---

## 2. Cosa contiene il pacchetto

- **Sito editoriale Netlify statico** (HTML/CSS/JS vanilla, nessun framework): `index.html`, guide, privacy, pagine `success-*`, Netlify Forms.
- **Portale eventi pubblico**: `eventi.html` + `styles/events.css` + `scripts/events.js`; rewrite `/eventi → /eventi.html` in `netlify.toml`.
- **Motore backend** in Netlify Functions moderne (`export default`, `config.path`):
  - API pubbliche: `/api/events`, `/api/municipalities`, `/api/coverage`, `/api/event-submissions`;
  - SEO: `/eventi/:slug` (pagina dettaglio dinamica con JSON-LD `schema.org/Event`), `/api/event-sitemap`;
  - backoffice: `/api/admin/*` con singolo `ADMIN_TOKEN` Bearer;
  - programmate Netlify: `ingest-scheduled` (ogni ora), `discovery-scheduled` (ogni 6h), `coverage-scheduled` (giornaliera); background: `ingest-batch-background`.
- **Moduli condivisi seri e riutilizzabili**: `db.mjs` (adapter), `event-repository.mjs` (upsert, merge, dedup, review), `events-core.mjs` (normalizzazione, similarità, validazione), `ingestion.mjs` (fetch con robots/ETag/Last-Modified/limiti byte, cursore riprendibile), `source-parsers.mjs` (HTML, JSON-LD, ICS, JSON Regione Puglia, PDF testuale, hook OCR), `discovery.mjs`, `coverage.mjs`, `bootstrap.mjs`, `registry.mjs`, `verified-programs.mjs`, `auth.mjs`, `http.mjs`, `geo.mjs` (Haversine), `slug.mjs`.
- **Dati territoriali**: 96 Comuni con 85 alias piatti; 102 Pro Loco candidate (da registro UNPLI); 20 fonti core (registro JSON + CSV); archivio verificato 2026 con 5 programmi ufficiali.
- **Documentazione già presente**: deploy passo-passo, architettura, fonti/copertura, operatività editoriale, licenze, rapporto qualità, changelog, manifest, CSV copertura.
- **Test**: 8 file, 31 controlli verdi (date/preset, filtri, distanza senza consenso, parser, registry, discovery, finestre ingestione, schedule, interfaccia pubblica, programmi verificati).

---

## 3. Gap rispetto al mandato (analisi per area)

### 3.1 Architettura — INADEMPIMENTI PRINCIPALI
| Mandato | Stato attuale | Azione |
|---|---|---|
| **Supabase** come database principale | Netlify Database di default; PostgreSQL esterno solo opzionale (`DATABASE_URL`) | Rendere Supabase l'unico provider; eliminare `@netlify/database` e il fallback |
| **GitHub Actions** per crawling/discovery/dedup/report | Tutto su funzioni programmate Netlify | Spostare la pipeline su 7 workflow GA (con timeout, retry, concorrenza, report); Netlify resta solo per frontend e API leggere |
| Auth amministratori **Supabase Auth + RLS + ruoli** (admin/editor/reviewer/viewer) | Singolo `ADMIN_TOKEN` condiviso | Sostituire con Supabase Auth, RLS, audit |
| Frequenze: 6h fonti approvate, 2h imminenti, giornaliera manutenzione, settimanale discovery | Ogni ora (1 sola fonte per ciclo!), ogni 6h discovery, giornaliera copertura | Reallineare frequenze; limit 1 rende il ciclo troppo lento |

### 3.2 Database / modello dati
| Mandato | Stato attuale | Azione |
|---|---|---|
| Stati evento `draft, pending_review, verified, published, postponed, cancelled, completed, archived, rejected` | `draft, verified, published, postponed, cancelled, concluded, rejected` | Aggiungere `pending_review`, `archived`; rinominare `concluded → completed` |
| Livelli verifica `official, institutional, confirmed, secondary, unverified, conflicting` | `primary, institutional, official_social, secondary, unverified` | Rinominare `primary→official`, `official_social→confirmed`; aggiungere `conflicting` |
| `localities` come tabella prima classe (frazioni/marine/borghi) + `territorial_aliases` | Solo `territory_aliases` piatta (85 alias, nessun tipo, nessuna coordinata) | Nuovo seed territoriale completo + tipizzato + 12 alias mandanti (aggiungere Santa Maria di Leuca) |
| `event_occurrences` con `start_at, end_at, all_day, timezone, doors_open_at, schedule_text, status` | Occorrenze con `occurrence_date, start_time, end_time, program_text`; evento con `start_date/end_date` continui | Ristrutturare su occorrenze-first `Europe/Rome`; non trasformare date discontinue |
| Tabelle mancanti: `event_categories`, `event_media`, `event_versions`, `event_status_history`, `source_errors`, `source_snapshots`, `source_discoveries`, `duplicate_candidates`, `editor_notes`, `audit_log`, `profiles/roles/user_roles`, `submission_media`, `submission_status_history` | Assenti; presenti solo `event_changes`, `review_queue`, `coverage_snapshots`, `system_state` | Estendere lo schema (migrazione dedicata) |
| Ricerca PG: `unaccent`, `pg_trgm`, FTS italiano, **sinonimi** (`purpu=polpo`, `pizzica=taranta`…) | `search_text` normalizzata lato JS + `GIN to_tsvector('simple')`; ILIKE per token | Abilitare estensioni, indice FTS italiano, trigrammi, tabella sinonimi |
| Indicizzatori campo: `confidence_score`, `location_accuracy`, `short description`, `organizer_url`, contatti | Assenti | Aggiungere |
| Duplicazione schema: SQL **duplicato** in `schema.mjs` e `migration.sql` | Due fonti di verità | Unificare in migrazioni Supabase versionate |

### 3.3 API
| Mandato | Stato attuale |
|---|---|
| `GET /api/events` | ✅ esiste, ma parametri diversi (`town/category/priceType/family/evening`) |
| Parametri `q, municipality, locality, date, from, to, preset, categories, audiences, free, lat, lng, radius, page, limit, sort` | ⚠️ parziali: manca `preset` lato server, `locality`, `categories/audiences` multipli, `free` |
| `GET /api/events/:slug` | ❌ esiste solo la pagina HTML `/eventi/:slug`; manca il JSON |
| `GET /api/localities`, `/api/categories`, `/api/search/suggestions`, `/api/health`, `/api/coverage-summary` | ❌ assenti (`/api/coverage` copre parzialmente l'ultimo) |
| Validazione Zod o equivalente, errori strutturati | ⚠️ errori strutturati presenti; validazione manuale |
| Rate limit | ⚠️ solo su `/api/events` e `/api/event-submissions` |

### 3.4 Frontend pubblico
- ✅ Struttura moderna, responsive, accessibile di base (skip-link, aria-live, dialog nativo), preset Oggi/Stasera/Domani/Weekend/7 giorni, geolocalizzazione con consenso esplicito, nessuna distanza fittizia.
- ❌ La scheda evento **non mostra fonte, ultimo controllo, livello di verifica, stato** — il mandato li richiede sempre (il riferimento li mostra); le azioni **Indicazioni / Calendario / Condividi / Salva / Segnala errore** mancano (c'è solo "Scopri di più" + link fonte nel dialog).
- ❌ Struttura pagina diversa dal riferimento (hero "Che facciamo stasera?", chip categorie, "salvati").
- ❌ Pagine Comune/categoria/data assenti (SEO).
- ✅ Di buono: nessun messaggio tecnico, nessun caricamento infinito.

### 3.5 Fonti e ingestione
- ✅ Robots, ETag/Last-Modified, limiti byte, timeout 25s, cursore riprendibile, finestre (800/1200) per dataset grandi, retry con backoff (fino a 7×12h), code review a priorità 5–6, blocco pubblicazione anni vecchi.
- ⚠️ OCR: hook presente (`OCR_API_ENDPOINT/OCR_API_KEY`) ma **senza confidenza per campo** (mandato: soglie 0,90/0,80 e review automatica).
- ⚠️ Rinvii/annullamenti: gestiti via `detectEventStatus`, ma manca la regola "1° fallimento = nessuna modifica, 2° = da verificare, 3° = review" per pagine sorgente temporaneamente giù (attuale: review a ogni errore — troppo rumorosa) e lo storico status.
- ❌ `source_errors`, `source_snapshots`, log scoperte strutturati.

### 3.6 Fallback
- ⚠️ L'archivio `verified-programs-2026.json` (catturato 2026-08-01) è un file dati legittimo, ma il mandato lo vuole **rigenerato automaticamente ogni giorno**, con data di generazione e scadenza visibili, senza mascherare errori API. Ora è statico e funge anche da sostituto silenzioso in caso di errore DB (`verifiedFallback: true`).

### 3.7 SEO / Accessibilità
- ✅ Dettaglio dinamico con `schema.org/Event`, canonical, descrizione; sitemap eventi; robots.txt.
- ❌ Open Graph/Twitter Card, breadcrumb, pagine SEO per Comune/categoria/data, sitemap completa di quelle pagine.

### 3.8 Sicurezza
- ✅ Headers base (nosniff, referrer, frame, permissions-policy), nessun segreto nel repo, honeypot+rate limit sulle segnalazioni, timingSafeEqual su admin.
- ❌ CSP assente, RLS assente (non c'è Supabase), controllo MIME upload (asserzione: allegati segnalazioni non implementati — `attachment_url` sempre NULL), CSRF non applicabile a Bearer ma da decifrare con Auth, audit log non completo.

### 3.9 Test
- ✅ 31/31 verdi eseguiti davvero, inclusi casi reali (Sant'Oronzo 5 giorni non consecutivi, Sagra dell'Anguria 1 sola data, senza consenso nessuna distanza).
- ❌ Mancano vs mandato: test SQL (migrazioni/RLS/viste), ora legale (DST), eventi oltre mezzanotte, sinonimi/varianti dialettali, errore ortografico/trigrammi, `locality/frazione/marina`, preset "stasera" con testo serale, fallimenti fonte (timeout/404/429/redirect), OCR confidence, merge duplicati multi-fonte end-to-end, sicurezza (chiavi nel frontend), accessibilità browser.

### 3.10 Territorio
- ✅ 96 Comuni completi e corretti; 12/13 esempi obbligatori mappati bene.
- ❌ Manca Santa Maria di Leuca → Castrignano del Capo; alias non tipizzati (frazione/marina/località/borgo), niente `localities`, **0 coordinate Comune** (impedisce distanza con fallback "centro centro Comune" e raggi).

---

## 4. Scelta base (fase 2) — DECISIONE

**Base scelta: pacchetto v12 (quello fornito).** Motivazioni:

1. Stack identico all'architettura obbligatoria lato Netlify (static + functions leggere) e compatibile con Supabase/GA.
2. Documentazione del progetto precedente (`AUDIT_DUE_PROGETTI.md`) dimostra che l'alternativa (React/Cloudflare D1) è già stata scartata per incompatibilità — conferma la direzione.
3. Motore di ingestion/dedup/coverage concreto, testato (31/31), senza eventi hardcoded: costruirlo ex novo sarebbe un rischio inutile.
4. Il sito editoriale resta intatto e il portale si integra nello stesso repo, come deciso con l'utente.

### Si conserva
Sito editoriale, `eventi.html` (evolverà), moduli `_shared/*` (parser, ingestion, repository, coverage, discovery, geo, http), dati registry (estesi), test esistenti (estesi), documentazione (aggiornata).

### Si elimina / sostituisce
- Dipendenza `@netlify/database` e adapter dual-provider → **solo Supabase Postgres** (`SUPABASE_DB_URL` server-side; chiavi `ANON/SERVICE_ROLE` secondo mandato; niente service role nel frontend).
- Funzioni Netlify programmate per crawling → **GitHub Actions**; restano API leggere di lettura.
- Backoffice `ADMIN_TOKEN` → **Supabase Auth + ruoli + RLS + audit_log**.
- Fallback statico → **fallback giornaliero** rigenerato da GA con data/scadenza.
- Schema SQL duplicato → migrazioni versionate in `supabase/migrations/`.

---

## 5. Piano di lavoro (fasi 3–10)

1. **Refactoring**: rimozione Netlify DB, fix alias Leuca, db adapter Supabase-only, unificazione schema.
2. **Database**: migrazioni complete (tabelle mancanti, occorrenze-first, estensioni `unaccent/pg_trgm`, FTS ita, indici), viste pubbliche, RLS, seed territorio (geocoding centri Comune + località tipizzate), seed categorie (20 ufficiali), tabella sinonimi, test SQL.
3. **Frontend**: allineamento al riferimento — schede con fonte/ultimo controllo/verifica/stato, azioni (indicazioni, calendario ICS, condividi, salva, segnala errore), chip categorie, pagina dettaglio con OG/Twitter/breadcrumb, pagine Comune/categoria/data, salvati locali.
4. **API**: endpoint mancanti e parametri mandato; validazione (zod), rate limit coerente, `/api/health`, `/api/coverage-summary` pubblico limitato.
5. **Ingestione**: regola fallimenti 1/2/3, confidence OCR, storico status, snapshot/errori/discoperte strutturati, rigenerazione fallback giornaliera.
6. **GitHub Actions**: `ingest-frequent` (6h), `recheck-imminent` (2h), `daily-maintenance`, `weekly-discovery`, `coverage-report`, `tests`, `deploy-preview` — con timeout/retry/concorrenza/report.
7. **Backoffice**: Supabase Auth, ruoli, coda review con azioni rapide, merge, fonti fallite, Comuni scoperti, segnalazioni, report copertura 96 Comuni.
8. **Test estesi** secondo la matrice del mandato + collaudo reale 10 Comuni / 30–50 fonti.
9. **Staging** (deploy preview + Supabase staging popolato) → **Produzione** solo dopo criteri di accettazione.

---

## 6. Rischi noti

- **Supabase Free** (500 MB Postgres, limiti edge/egress): il volume di snapshot/raw va contenuto (retention e pulizia in `daily-maintenance`).
- **GitHub Actions** su repo privato ha minuti limitati (2.000/mese free): schedulazioni 2h/6h compatibili se i run restano brevi (batch).
- Alcune fonti social ufficiali (Instagram/FB) non sono leggibili server-side senza login: restano "segnalazione" o metadati, mai pubblicazione automatica.
- Robots/condizioni d'uso: rispettati già ora; i parser a pagina statica possono rompersi al cambio layout dei siti comunali (mitigato da recensioni e errori consecutivi).

_Report generato dall'audit reale del codice — nessuna voce è basata su supposizioni._
