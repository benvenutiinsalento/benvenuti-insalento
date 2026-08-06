# Changelog

## 10.1.0
- aggiunto supporto alternativo per PostgreSQL esterno tramite `DATABASE_URL`;
- aggiunti script per applicare la migrazione e verificare il database esterno;
- eliminato il limite che poteva lasciare non elaborati gli eventi oltre il primo blocco;
- aggiunto cursore di ingestione riprendibile per dataset estesi;
- migliorata la scoperta delle Pro Loco tramite profili di registro e canali esterni;
- distinta la priorità dei siti Pro Loco dai canali social ufficiali;
- ampliate le pagine di scoperta a parrocchie, diocesi, santuari e oratori;
- aggiunte fonti dedicate per Portalecce e gli elenchi parrocchiali delle quattro diocesi della provincia;
- aggiunti registri CSV iniziali per Comuni e fonti;
- aggiunte procedure di deploy, qualità, attribuzioni e lavoro editoriale;
- portati i test automatici a 21.

## 10.0.0
- unificato sito statico Netlify e motore eventi;
- eliminata la logica di seed basata sui casi esempio;
- aggiunti 96 Comuni e registro candidati Pro Loco;
- aggiunti database PostgreSQL, API, ingestion, OCR opzionale, deduplica, backoffice e copertura;
- mantenuto il sito originale e aggiunto collegamento agli eventi.
# v12.0.0 — 4 agosto 2026
- nuova interfaccia pubblica eventi coordinata con Benvenuti in Salento;
- geolocalizzazione esplicita con consenso, raggio e ordinamento per distanza;
- eliminazione di messaggi tecnici e indicatori di copertura dalla pagina pubblica;
- dettaglio evento in finestra integrata, senza dipendenza dalla pagina dinamica;
- archivio statico di sicurezza anche in assenza temporanea delle API;
- correzione delle distanze fittizie quando la posizione non è stata concessa;
- output pubblico isolato in `dist` e build Netlify verificata;
- 31 controlli automatici superati.
# v13.0.0 — 6 agosto 2026 (fasi 3-4 mandato: refactoring + database)
- Database principale: Supabase Postgres con migrazione versionata `supabase/migrations/0001_init.sql`;
  rimosso Netlify Database, l'adapter dual-provider e lo schema SQL duplicato in `schema.mjs`.
- Modello dati completo del mandato: stati evento completi, livelli di verifica ufficiali,
  `localities` tipizzate, `territorial_aliases`, occorrenze con fuso Europe/Rome
  (date discontinue, oltre mezzanotte, senza orario), categorie ufficiali multi-assegnabili,
  versioni/storico stati/audit, utenti con ruoli, RLS completa, tabelle fonti estese.
- Ricerca PostgreSQL: FTS italiano + `unaccent` + `pg_trgm` + sinonimi dialettali salentini.
- Seed territoriali reali: 96 Comuni con coordinate GeoNames/ISTAT, 86 località tipizzate
  (inclusa Santa Maria di Leuca → Castrignano del Capo, mancante), 14 alias dialettali;
  seed 20 fonti core (approvate, auto-pubblicazione solo priorità 1-2), 21 categorie, 30 sinonimi.
- Regole di pubblicazione automatica del mandato implementate nel repository
  (fonte approvata + auto-publish + autorità + confidence >= 0,90 + occorrenza futura);
  rinvii/annullamenti accettati solo da fonti fidate (priorità <= 4).
- Repository eventi riscritto occorrenze-first mantenendo i contratti di output (frontend intatto).
- Collaudo eseguito su PostgreSQL 17 reale in sandbox: migrazione + seed + smoke test integrazione
  (alias→Comune, sinonimo purpu→polpo, trigrammi su errore di battitura, preser weekend,
  overnight 22:00→02:00 corretta in fuso Roma).
- Test automatici: 58 controlli (31 precedenti + territorio + integrità migrazione/seed + helper v13).
