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

### Addendum 3 — collegamento GitHub finito sul sito Netlify di prova

```text
PROBLEMA TROVATO: il deploy funzionava ma sul sito NETLIFY DI PROVA
  (benvenutiinsalento.netlify.app), non su quello col dominio reale.
  L'utente ha confermato: il sito di prova era un vecchio esperimento,
  ora disattivato da lui.
  - Evidenza: /eventi → 200 su netlify.app (con fix ENOENT incluso dopo il push),
    mentre benvenutiinsalento.it/eventi → 404 (vecchio sito manuale).
  - Bug laterale trovato e corretto da me: fs.readFileSync dei JSON dati non
    funziona in Lambda → sostituito con import JSON statici (bundled da esbuild).
    Verificato live: dopo il push il sito di prova serviva il nuovo codice.
CORREZIONE APPLICATA (utente, guidata): ripetere link GitHub + variabili
  ambiente sul sito che possiede il dominio benvenutiinsalento.it.
NESSUNO SPRECO: il lavoro fatto sul sito di prova ha permesso di scoprire e
  correggere il bug deploy prima del go-live sul dominio reale.
```

---

## 2026-08-07 — Go-live /eventi + Fase 6 GitHub Actions + primi eventi reali

```text
FASE: 5-6 — go-live, crawling automatico, primi eventi reali pubblicati
ATTIVITÀ COMPLETATE (eseguite, con verifica su sistemi live):
  - Sito reale online: risolto il linking Netlify (era collegato a un VECCHIO
    repo di un altro account; guida utente per ricollegare benvenuti-insalento).
  - GO-LIVE confermato: benvenutiinsalento.it/eventi risponde.
  - GitHub Actions (mandato, scheduler SOLO li'): ingest-frequent ogni 6h,
    recheck-imminent ogni 2h, daily-maintenance (archivio + copertura +
    RIGENERAZIONE GIORNALIERA fallback da Supabase, commit automatico),
    weekly-discovery (iPA + nuove fonti), tests CI (verde al primo push).
    Rimossi TUTTI i cron Netlify (test dedicato ne verifica l'assenza).
  - Primo crawling reale: 64 fetch, timeout open-data Regione risolto
    (dump 28MB gzip, timeout dedicato 10 min), parser puglia_json allineato ai
    campi reali (nm_evento_it, dsc_evento_it, ...), 7044 candidati, filtro
    provincia Lecce + territorio + regole mandato → 4 eventi PUBBLICATI
    (SIFF Tricase, JEANSMUSIC, Fulminacci, From Italy With Love) con fonte,
    ultimo controllo e livello 'institutional'.
  - Fix qualita' pipeline: colonna id ambigua (s.id), filtro anti-rumore coda
    (candidati senza titolo/data scartati, non piu' 121 righe di rumore),
    import JSON bundled per Lambda (ENOENT /var/data).
  - FIX CRITICO API /api/events: Number(null)===0 attivava il ramo geo e
    rompeva la SQL ("missing FROM-clause entry e") → il sito viveva in
    fallback mascherato. Riprodotta, corretta (guardie null + espressione
    distanza in due varianti CTE/esterna), verificata: fallback=false live.
PROBLEMI TROVATI: tutti risolti sopra. Logo + 3 immagini mancanti nel repo
  (mai pervenute nei pacchetti): in attesa file originali dall'utente o
  autorizzazione a placeholder temporanei.
CORREZIONI APPLICATE: vedi sopra; push su main (auto-deploy Netlify attivo).
PROSSIMO PASSO: logo; osservare i run schedulati; fase 7 (backoffice
  Supabase Auth + ruoli); collaudo allargato fonti Comuni (discovery iPA).
```

### Addendum 2026-08-07 — Portale live verificato, immagini provvisorie, demo discovery

```text
- VERIFICA LIVE: /api/events → fallback=false, 5 eventi reali pubblicati
  (fonte Regione Puglia open data, livello institutional, date reali);
  /eventi 200; logo/hero/favicon 200 (PROVISORI, generati dal team: gli
  originali non esistono in NESSUN pacchetto/deploy allegato, nemmeno nel
  deploy Netlify 6a75a865 — verificato. Sostituibili in qualsiasi momento).
- BUG API risolto definitivamente: Number(null)===0 → ramo geo attivo senza
  parametri → SQL rotta → fallback mascherato. Diagnosi live (campo DIAG2,
  sanitizzato, da rimuovere al prossimo giro), fix + test.
- Documenti utente acquisiti: "PROMPT OPERATIVO completamento definitivo"
  (riferimento esteso) e "DISCOVERY WEB E SCRAPING CONTROLLATO" (flusso
  ricerca web → fonte originale → verifica → crawling; mai da aggregatori).
- DEMO DISCOVERY realizzata su Leverano: ricerca web (aggregatori) → fonte
  istituzionale originale (comune.leverano.le.it/manifestazioni-ed-eventi) →
  verifica pagina → registrazione fonte (istituzionale, p2, auto_publish) →
  crawl reale: 7 eventi estratti e catalogati (storici → completed).
- STATO DB: 18 eventi (4 pubblicati futuri), 316 fonti attive registrate;
  scheduler GitHub Actions ingest 6h/riscadenze 2h/manutenzione giornaliera/
  discovery settimanale attivi; CI test 62/62 verde.
PROSSIMI PASSI: pulizia campo DIAG2; fase 7 backoffice (auth+ruoli); UI
  alignment al reference design; eventuale chiave gratuita Google
  Programmable Search (0 €, 100 query/giorno) per discovery web su tutti i
  96 Comuni + frazioni/marine (da fare con l'utente).
```

### Addendum 2026-08-07bis — Logo originale, archivio curato nel DB, 9 eventi live

```text
- LOGO ORIGINALE ripristinato (file fornito dall'utente via chat, convertito
  JPEG→PNG 512px); favicon allineata al logo su tutte le pagine statiche.
  Fonte delle immagini precedenti: provvisorie AI, archiviate come fallback.
- ARCHIVIO CURATO NEL DB: script scripts/import-verified-programs.mjs
  (percorso identico al crawling: validazione+territorio+dedup+regole) →
  5 programmi ufficiali registrati come FONTI crawlabili (Comuni/Pro Loco),
  23 eventi futuri importati (11 passati saltati per regola).
- Promozione redazionale tracciata (event_status_history, attore 'editorial'):
  gli eventi dell'archivio curato con fonte ufficiale+documento pubblico
  fermi a conf=0.80 (soglia auto 0.90) sono stati pubblicati come decisione
  REDAZIONALE registrata — non come abbassamento della soglia automatica.
- RISULTATO LIVE VERIFICATO: /api/events total=9 fallback=false
  (JEANSMUSIC, MEDinFEST, Fulminacci, Booksellers, SIFF Tricase, Santi
  Oronzo Lecce, Cabaret Botrugno, Alex Britti, From Italy With Love).
  Nessun evento in coda pending_review.
NOTA PER L'UTENTE: il deploy 6a75a865 = main@b48d06b mostrava "piu' eventi"
  perche' era la modalita' riserva da archivio: ora quelli stessi eventi sono
  nel database vero, con fonte e tracciatura mandato.
```

---
DATA: 07/08/2026 (seconda voce — BLOCCO DI VERIFICA completato)

FASE:
Blocco di verifica "NON AGGIUNGERE EVENTI MANUALMENTE" — dimostrazione end-to-end
che il sistema SCOPRE -> INDICIZZA -> VERIFICA -> AGGIORNA da solo.

ATTIVITA' COMPLETATE:
- Autenticazione backoffice migrata a Supabase Auth con ruoli admin/editor/reviewer/viewer;
  eliminato completamente ADMIN_TOKEN da backend e frontend.
- Nuovi endpoint: /api/health (200 ok / 503 ko), /api/admin/metrics (A-J + warning),
  /api/admin/me, /api/events/:slug, /api/localities, /api/categories,
  /api/search-suggestions, /api/coverage-summary; report fonti completo in /api/admin/sources.
- Backoffice admin-eventi.html riscritto: login email+password (Supabase Auth),
  badge ruolo, tab Panoramica/Fonti/Revisioni/Eventi/Segnalazioni, banner KO se il
  backend cade (il fallback non maschera piu' il problema).
- Filtri corretti: Weekend = venerdi' >=18:00 + sabato + domenica; Stasera = serale /
  giornaliero in corso / pomeridiano che entra in serata / piu' occorrenze;
  Famiglie = audience reali; Distanza 5/10/20/30/50 km; Date da event_occurrences.
- Migrazione 0003 applicata (contatori ultima scansione per fonte, coverage_warnings,
  indici). Scritture per-fonte a ogni controllo.
- Discovery assistita reale: 14 nuove fonti registrate e tracciate (Comuni, Pro Loco,
  parrocchie, aggregatori) incluse fonti per Otranto, Nardo', Galatina, Tricase,
  Porto Cesareo, Leverano.
- Backfill municipality_id per 272 fonti + fonte municipal_discovery per i 96 Comuni.
- Collaudo eseguito con run multipli (16, 24, 26, 27 + passate editoriali mirate),
  tutto registrato in source_runs/raw_ingestion_records/review_queue.
- Parser potenziato: date senza anno e liste di date ("13, 14 e 15 agosto",
  "dal 19 giugno al 12 luglio") diventano occorrenze distinte.
- Test: 74/74 verdi (12 nuovi test del blocco). npm ci && npm test && npm run build riproducibili.
- Metriche finali reali: A=655 B=157 C=14 D=113 E=42 F=46 G=50 H=415 I=0 J=3.
  Live: /api/events total=114, fallback=false, x-backend-status: supabase.

PROBLEMI TROVATI:
- Errore "invalid input syntax for type json" su caratteri Unicode social (surrogati isolati).
- 320 fonti senza municipality_id (la copertura "316 fonti" era di facciata).
- Weekend/Stasera mai applicati (frontend non passava i flag al backend).
- Parser perdeva date senza anno -> fonti Otranto/Nardo' davano quasi zero eventi.
- Eventi di oggi chiusi a mezzanotte dal close-out.
- Fonte tour nazionale attribuiva 22 date fasulle a Botrugno.
- Duplicati diocesi Lecce/Melendugno (scorciatoie senza data ereditavano data errata).

CORREZIONI APPLICATE:
- Sanitizzazione Unicode dei payload JSONB + test di regressione.
- Backfill municipality + fonti comunali automatiche per 96/96 Comuni.
- Flag weekend/evening/family cablati frontend<->backend; regole SQL verificate con test.
- Parser: defaultYear + dateListFromLine; Otranto passata da 2 a 14 candidati.
- Close-out su CURRENT_DATE (giorno intero); riaperti 2 eventi di oggi.
- Fonte tour disattivata, 6 eventi spurii rifiutati con storico; conservato il 27/8 reale.
- Fix ereditarieta' data nelle scorciatoie diocesi; 2 duplicati rifiutati e non ricreati.
- Rimossi 5 titoli boilerplate; decodificate entita' HTML in 42 titoli.

AUTORIZZAZIONE NECESSARIA:
- Nessuna spesa (sempre 0 euro). Da fare dall'utente quando comodo: cambiare la password
  temporanea dell'account admin dal backoffice Supabase; a fine progetto ruotare
  service_role key e revocare il PAT GitHub (mai inseriti nel codice).

PROSSIMO PASSO:
- Osservare le prime esecuzioni schedulate delle GitHub Actions (ingest ogni 6h,
  maintenance quotidiana con ricalcolo COVERAGE_WARNING).
- Nuova passata di discovery assistita per Leverano, Andrano, Casarano (fonti deboli).
- Test login backoffice da browser (utente non tecnico, guida click-per-click).
