# Benvenuti in Salento — Portale Eventi (Netlify + Supabase + GitHub Actions)

Versione unificata del sito Netlify e del motore provinciale per eventi, sagre e feste patronali.

> **Mappa completa del progetto sorgente** (frontend, backend, crawler, parser,
> discovery, migrazioni, workflow, test): vedi **[docs/STRUTTURA_PROGETTO.md](docs/STRUTTURA_PROGETTO.md)**.
> Ricostruzione da zero: `npm ci && npm test && npm run build`.
>
> Architettura vincolata dal mandato: **Netlify** = frontend/API leggere,
> **Supabase Postgres** = unico database, **GitHub Actions** = unico schedulatore.
> Backoffice con **Supabase Auth** e ruoli (admin/editor/reviewer/viewer).

## Principio del progetto
Il sistema non è costruito intorno a MEDinFEST, Andrano o altri esempi. Quei casi non sono seed e non ricevono trattamenti speciali. Un evento entra nel portale soltanto tramite una fonte registrata o una segnalazione verificata.

L’obiettivo è censire sistematicamente la provincia di Lecce attraverso fonti istituzionali, Comuni, Regione, Provincia, Pro Loco, UNPLI, diocesi, organizzatori e documenti ufficiali. Le informazioni tecniche sul monitoraggio restano nel backoffice e non compaiono nella pagina pubblica.

## Cosa contiene
- sito originale preservato;
- pagina `/eventi.html`;
- dettaglio SEO `/eventi/:slug`;
- ricerca per data, Comune, categoria, testo, prezzo, famiglie e posizione (5/10/20/30/50 km);
- database **solo Supabase Postgres** (migrazioni in `supabase/migrations/`);
- 96 Comuni della provincia di Lecce;
- 102 candidature Pro Loco da verificare;
- registro di fonti regionali, provinciali, comunali, UNPLI e diocesane;
- acquisizione controllata con `robots.txt`, limiti, ETag e Last-Modified;
- parser JSON, HTML/JSON-LD, ICS, PDF testuale e OCR opzionale;
- elaborazione a lotti riprendibile, senza perdere record oltre il limite della singola esecuzione;
- discovery di sitemap, pagine comunali, profili Pro Loco e pagine parrocchiali;
- deduplicazione, priorità delle fonti e cronologia delle modifiche;
- coda di revisione;
- backoffice tecnico `/admin-eventi.html`;
- segnalazioni documentate con consenso privacy e protezione anti-spam;
- report di copertura territoriale riservato al backoffice;
- sitemap dinamica degli eventi.

## Pubblicazione rapida
1. Estrarre lo ZIP.
2. Da autenticati su Netlify, trascinare la cartella completa nell'area di pubblicazione oppure collegarla a un repository Git.
3. Attendere il completamento del deploy e aprire `/eventi`.

Netlify rileva le dipendenze, crea il database, applica la migrazione e registra le funzioni programmate. L'archivio ufficiale iniziale resta consultabile anche durante il primo avvio del database. Il bootstrap dei 96 Comuni e l'acquisizione partono automaticamente; non è richiesto `INGESTION_SECRET`.

`ADMIN_TOKEN` è facoltativo e serve soltanto per accedere al backoffice tecnico. Per sicurezza non viene inserito nel pacchetto: chi desidera usare `/admin-eventi.html` deve impostarlo nelle variabili d'ambiente Netlify, senza modificare alcun file.

La procedura completa è in `docs/DEPLOY_NETLIFY_PASSO_PASSO.md`.

## Comandi

```bash
npm run check
npm test
npm run dev
```

Per PostgreSQL esterno:

```bash
npm run db:apply:external
npm run db:check
```

## Sicurezza
Non inserire token nel codice. Il backoffice usa inizialmente un Bearer token conservato nella sessione del browser. Per una redazione con più utenti deve essere sostituito da autenticazione individuale e ruoli.

## Vincolo importante
Il pacchetto contiene un archivio iniziale di eventi verificati con fonte specifica; gli altri record vengono acquisiti soltanto da fonti registrate. La dicitura di copertura misura la qualità del monitoraggio, non garantisce l’esistenza online di ogni evento organizzato sul territorio.
