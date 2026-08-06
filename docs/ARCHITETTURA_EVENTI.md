# Architettura eventi v10

Flusso: fonte ufficiale/autorizzata → controllo robots e condizioni → acquisizione → record grezzo → parsing/OCR → normalizzazione → deduplicazione → pubblicazione automatica solo per fonti con priorità 1–4 oppure revisione → API pubblica.

## Livelli di fonte
1. Open data e dataset istituzionali.
2. Comune, Regione, Provincia, diocesi e portali pubblici.
3. Pro Loco/associazione o organizzatore verificato.
4. Canale social ufficiale identificato.
5–6. Fonte secondaria: non pubblica automaticamente.

## Principio di completezza
Il sistema non può dimostrare matematicamente che ogni evento esistente sia stato comunicato online. Per questo misura separatamente:
- Comuni censiti;
- siti ufficiali verificati;
- fonti attive e fonti fallite;
- ultimo controllo riuscito;
- eventi futuri pubblicati;
- revisioni critiche pendenti.

Lo stato `complete` nel database significa “monitoraggio tecnico elevato secondo i criteri configurati”, non “garanzia assoluta che nessun evento non comunicato sia assente”.

## Database
L’access layer seleziona automaticamente:
- Netlify Database quando `DATABASE_URL` non è impostata;
- PostgreSQL esterno quando `DATABASE_URL` è presente.

La migrazione SQL è unica e resta in `netlify/database/migrations/0001_eventi_produzione/migration.sql`.

## Dataset estesi
Le fonti con molti record vengono elaborate a finestre riprendibili. Il cursore è conservato nella tabella `sources`; in questo modo un dataset regionale con più eventi del limite di una singola funzione viene completato nei cicli successivi senza ignorare silenziosamente i record rimanenti.
