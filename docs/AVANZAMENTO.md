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
