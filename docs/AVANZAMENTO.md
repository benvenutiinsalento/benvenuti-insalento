# Avanzamento lavori — Portale Eventi Salento

File di log richiesto dal PROMPT MASTER. Formato obbligatorio per ogni aggiornamento.
Ogni voce descrive solo lavori realmente eseguiti.

---

## 2026-08-06 — Fase 1 (Audit) + Fase 2 (Scelta base)

```text
FASE: 1-2 — Audit completo e scelta base
ATTIVITÀ COMPLETATE:
  - Estrazione e analisi integrale del pacchetto v12 (codice, dati, documenti, test).
  - Esecuzione reale dei test: 31/31 superati.
  - Verifica mandato: 96 Comuni OK; 12/13 alias obbligatori presenti
    (manca Santa Maria di Leuca -> Castrignano del Capo); 0 coordinate Comuni.
  - Verifica sicurezza: nessun segreto committato, nessun evento hardcoded nel codice.
  - Scelta base: pacchetto v12, con piano di correzione verso Supabase + GitHub Actions.
  - Report completo: docs/AUDIT_REPORT_V12_PORTALE_EVENTI.md
  - Creato .env.example conforme al mandato.
PROBLEMI TROVATI:
  - Database attuale: Netlify Database di default (mandato: Supabase unico).
  - Scheduler su Netlify invece che su GitHub Actions; ingest 1 fonte/ciclo (troppo lento).
  - Modello dati incompleto (stati, livelli verifica, localities, occorrenze, RLS, audit).
  - API e frontend senza fonte/ultimo controllo/verifica pubblici sulle schede.
  - Fallback statico non rigenerato giornalmente.
CORREZIONI APPLICATE:
  - Nessuna modifica al codice in questa fase (audit); documentato tutto nel report.
AUTORIZZAZIONE NECESSARIA:
  - Nessuna ora. In futuro: creazione progetto Supabase, collegamento GitHub repo,
    deploy Netlify (richiederanno le tue credenziali, spiegate prima una a una).
PROSSIMO PASSO:
  - Fase 3-4: refactoring db adapter Supabase-only + migrazioni schema completo
    (stati, verifica, localities tipizzate, occorrenze, estensioni PG, sinonimi)
    + seed territorio esteso e categorie.
```

---

## 2026-08-06 — Fasi 3-4 (Refactoring + Database Supabase)

```text
FASE: 3-4 — Refactoring e database
ATTIVITÀ COMPLETATE:
  - Rimosso Netlify Database: adapter Supabase-only, dipendenza @netlify/database eliminata,
    netlify/database/ e schema.mjs duplicato cancellati, check automatici aggiornati.
  - Migrazione `supabase/migrations/0001_init.sql` completa e PORTABILE (shim auth per CI):
    30+ tabelle, enum mandato, occorrenze Europe/Rome, RLS su tutte le tabelle, funzioni di
    ricerca (FTS ita + trigrammi + sinonimi), viste pubbliche e copertura.
  - Seed reali da data/: 96 Comuni con coordinate GeoNames + ISTAT, 86 località tipizzate,
    96 alias territoriali (inclusa Santa Maria di Leuca, ora presente), 21 categorie,
    30 sinonimi dialettali, 20 fonti core approvate.
  - Repository eventi riscritto occorrenze-first con regole di auto-pubblicazione del mandato;
    output pubblico invariato; alias Torre Lapillo -> Porto Cesareo verificato in esecuzione.
  - Update coerenti: bootstrap, ingestion (chiusura a `completed`), coverage (stati mandato),
    submit-event/admin (event_submissions), sitemap, admin-events/status.
  - ESECUZIONE REALE: PostgreSQL 17 in sandbox; migrazione + seed applicati senza errori;
    smoke test integrazione superato (auto-publish, sinonimi, trigrammi, weekend, overnight).
  - Test: 58/58 superati (31 preesistenti + 27 nuovi).
PROBLEMI TROVATI E RISOLTI:
  - Errore sintassi SQL (dollar-quoting annidato nello shim auth.uid) -> corretto tag $fn$.
  - Inline unaccent negli indici falliva -> funzione schema-qualificata public.unaccent.
  - Typo parametri $8 enum inferito in due contesti -> cast espliciti.
  - Placeholder non usati nella UPDATE eventi -> rinumerazione parametri.
  - Subselect fonti finita per errore nella FROM clause (comma) -> spostata nella select list.
  - 3 Comuni con apostrofi tipografici senza codice ISTAT -> matching normalizzato.
PROBLEMI NOTI (prossimi passi):
  - Scheduler di crawling ancora su Netlify: va spostato su GitHub Actions (fase 6).
  - API mancanti: /api/events/:slug, /api/localities, /api/categories, /api/search/suggestions,
    /api/health, /api/coverage-summary (fase 5).
  - Backoffice con ADMIN_TOKEN singolo (Supabase Auth in fase 7).
  - Fallback archivio: da rigenerare giornalmente (fase 6).
CORREZIONI APPLICATE: tutte elencate sopra, con evidenza di esecuzione reale.
AUTORIZZAZIONE NECESSARIA: nessuna; lavoro locale e reversibile.
PROSSIMO PASSO: fase 5 — API del mandato completate; fase 6 — workflow GitHub Actions
  (ingest-frequent 6h, recheck-imminent 2h, daily-maintenance, weekly-discovery,
  coverage-report, tests, deploy-preview) e spostamento crawling da Netlify.
```

---

## 2026-08-06 — Push iniziale su GitHub (step utente 1-2 completati)

```text
FASE: setup esterno + avvio cloud
ATTIVITÀ COMPLETATE:
  - Utente ha creato: account GitHub (benvenutiinsalento), repo pubblico
    benvenutiinsalento/benvenuti-insalento, progetto Supabase eu-west-2 (Londra).
  - Verifica token: validissimo, scope admin/push su quel solo repo. OK.
  - PUSH INIZIALE COMPLETATO: 104 file su GitHub (codice, migrazione, seed, test, docs).
  - Verifica progetto Supabase: REST service_role 200 OK; anon key incollata -> 401
    (probabilmente copiata con un carattere perso; richiesta ricopia in dashboard).
IN ATTESA DALL'UTENTE:
  1. Estendere il token con permesso "Secrets: Read and write" (per scrivere i secrets Actions).
  2. Password del database (per SUPABASE_DB_URL e migrazioni reali).
  3. Ricopia esatta della anon public key da Settings -> API keys.
  4. Email admin redazione (creo io l'utente con password temporanea).
PROSSIMO PASSO: con 1+2 eseguo migrazioni+seed sul Supabase reale e scrivo i secrets;
  intanto proseguo fasi 5-6 (API complete + workflow GitHub Actions).
```

---

## 2026-08-06 — Database reale attivo, admin creato, secrets GitHub impostati

```text
FASE: provisioning Supabase reale + autenticazione + secrets CI
ATTIVITÀ COMPLETATE (eseguite davvero, con verifica):
  - Connessione al DB Supabase (pooler eu-west-2, PostgreSQL 17.6): OK.
  - Estensioni unaccent + pg_trgm installate nello schema public (fissato a mano:
    pgcrypto era preinstallata nello schema extensions, serviva coerenza per gli
    indici FTS/trigram della migrazione).
  - MIGRAZIONE 0001 applicata sul database reale: 35 tabelle, 32 con RLS attiva,
    funzioni search_events / expand_query_terms / has_role, viste v_events_public
    e v_municipality_coverage. Nessun errore.
  - SEED applicati sul database reale: 96 comuni (96/96 con coordinate + ISTAT),
    86 localita' tipizzate, 96 alias territoriali, 21 categorie, 30 sinonimi,
    20 fonti (4 con auto_publish), 4 ruoli (nuovo seed 105_roles.sql aggiunto).
  - UTENTE ADMIN CREATO su Supabase Auth: welcome.to.salento2024@gmail.com
    (email confermata, password temporanea comunicata in chat, da cambiare).
    Profilo + ruolo admin collegati e verificati con query.
  - GITHUB SECRETS scritti via API (token ora con permesso Secrets):
    SUPABASE_URL, SUPABASE_DB_URL, SUPABASE_SERVICE_ROLE_KEY.
PROBLEMI TROVATI:
  - La anon key incollata resta 401 anche al secondo tentativo: struttura JWT
    corretta ma firma non valida. Provato recupero automatico (tutte le 2709
    varianti a 1 carattere): nessuna valida -> la chiave va ricopiata integrale
    dalla dashboard (Settings -> API -> anon public, pulsante copia).
CORREZIONI APPLICATE: tutte elencate sopra su sistemi reali (Supabase + GitHub).
AUTORIZZAZIONE NECESSARIA: nessuna ulteriore.
PROSSIMO PASSO:
  - Utente: (a) ricopiare la anon key e comunicarla; (b) collegare il repo a
    Netlify (guida passo-passo in docs/ISTRUZIONI_DEPLOY_UTENTE.md, step 4).
  - Io: fase 5 (API complete del mandato) e fase 6 (GitHub Actions: crawler,
    riscadenze, manutenzione giornaliera, discovery settimanale, report copertura).
```

### Addendum (stessa giornata) — fix permessi REST

```text
PROBLEMA TROVATO: le API REST di Supabase rispondevano 403 anche con service_role:
  la migrazione 0001 dava i grant solo ad anon/authenticated; gli oggetti creati
  via SQL non ereditano i permessi automatici della dashboard.
CORREZIONE APPLICATA: nuova migrazione 0002_grants.sql (grant completi a
  service_role su tabelle/sequence/funzioni + default privileges per gli oggetti
  futuri). Applicata sul reale. Verifica REST: municipalities 200, vista pubblica
  200 (vuota: nessun evento ancora, il mandato vieta eventi inventati), RPC
  search_events 200.
```

### Addendum 2 — anon key VALIDATA (rettifica diagnosi precedente)

```text
RETTIFICA: in precedenza avevo dichiarato la anon key "non valida" perche'
  il test rispondeva' 401. Errore mio di diagnosi: il test era stato fatto
  sull'endpoint radice /rest/v1/ quando il database non aveva ancora
  migrazioni/grant. Oggi, dopo migrazioni 0001+0002, la STESSA chiave incollata
  dall'utente risponde 200 su: municipalities, v_events_public, categories,
  rpc search_events, auth settings. La chiave e' quindi valida e definitiva.
CONSEGUENZA: nessuna ricopia necessaria; la chiave va solo impostata su Netlify.
```
