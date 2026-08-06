# Pubblicazione su Netlify — procedura operativa

## Obiettivo
Pubblicare prima una versione di staging separata dal sito principale. Non sostituire il sito pubblico finché database, fonti, coda di revisione e copertura non sono stati controllati.

## 1. Pubblicazione senza modificare i file
1. Conservare una copia ZIP del sito attualmente online.
2. Estrarre lo ZIP v12.
3. Accedere a Netlify e trascinare la cartella completa nell'area di pubblicazione del progetto oppure collegarla a un repository Git.
4. Attendere il deploy: pubblicazione `.` e Functions `netlify/functions` sono già configurate.
5. Aprire `/eventi` e verificare la ricerca iniziale.

## 2. Scegliere il database

### Opzione A — Netlify Database
È la modalità più integrata. Non compilare `DATABASE_URL`. Installare le dipendenze e pubblicare il progetto: Netlify rileva `@netlify/database` e le migrazioni in `netlify/database/migrations`.

### Opzione B — PostgreSQL esterno
Può essere un database PostgreSQL gestito esternamente. Impostare:

```text
DATABASE_URL=postgresql://...
DATABASE_SSL=true
DATABASE_POOL_MAX=5
```

Applicare una sola volta la migrazione:

```bash
npm run db:apply:external
```

La stessa applicazione userà automaticamente il database esterno quando `DATABASE_URL` è presente.

## 3. Backoffice facoltativo
La pagina pubblica e gli aggiornamenti automatici non richiedono segreti configurati manualmente. Per usare il pannello amministrativo creare un valore lungo e casuale:

```text
ADMIN_TOKEN=...
```

Non inserirli in HTML, JavaScript pubblico, repository o screenshot.

Le variabili OCR sono facoltative:

```text
OCR_API_ENDPOINT=
OCR_API_KEY=
```

Senza OCR esterno, il sistema continua a elaborare HTML, JSON, ICS e PDF con testo incorporato. Immagini e PDF scansionati verranno segnalati come non estraibili o inviati a revisione.

## 4. Primo avvio
1. Aprire `/eventi`: l'archivio verificato di sicurezza è disponibile anche prima dell'inizializzazione completa.
2. Il controllo delle fonti parte automaticamente ogni ora.
3. La ricerca di nuove fonti e calendari parte automaticamente ogni 6 ore.
4. Il rapporto di copertura viene ricalcolato ogni giorno.
5. Se è stato configurato `ADMIN_TOKEN`, aprire `/admin-eventi.html` per consultare fonti, errori e coda di revisione.

## 5. Controlli prima della pubblicazione
- nessun evento inventato o senza fonte;
- date e anno correnti;
- Comune e luogo corretti;
- duplicati unificati;
- eventi annullati o rinviati confermati da fonte autorevole;
- collegamento al programma disponibile nelle schede;
- nessuna chiave nei file pubblici;
- pagina mobile verificata;
- API e sitemap funzionanti;
- almeno un ciclo completo di controllo delle fonti territoriali;
- revisione dei Comuni con stato insufficiente.

## 6. Integrazione nel sito principale
La cartella contiene già il sito originario con la sezione eventi integrata. Dopo il collaudo, collegare il dominio o sostituire il deploy soltanto mediante un deploy versionato e reversibile. Conservare l’ultima versione pubblica come rollback.

## 7. Comandi locali

```bash
npm install
npm run check
npm test
npm run dev
```

Con PostgreSQL esterno:

```bash
npm run db:apply:external
npm run db:check
```

Con Netlify Database locale, avviare `netlify dev` e applicare le migrazioni tramite la Netlify CLI.
