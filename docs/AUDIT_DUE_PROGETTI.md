# Audit dei due pacchetti ricevuti

## Sito `deploy`
Sito statico Netlify funzionante, con `index.html` alla radice, CSS e JavaScript vanilla, Netlify Forms e pagine editoriali. È stato conservato come base ufficiale.

## Progetto `eventi-salento-produzione-v9`
Progetto più avanzato basato su React/Vinext e Cloudflare D1/Drizzle. Conteneva moduli riutilizzabili per normalizzazione, deduplicazione, parsing, registri territoriali e test. Non era integrabile direttamente nel sito Netlify statico senza introdurre due runtime e due modalità di deploy differenti.

## Decisione
La v10 conserva il sito Netlify e migra i componenti generici utili del progetto v9 verso:
- Netlify Functions moderne;
- Netlify Database/PostgreSQL;
- frontend HTML/CSS/JavaScript coerente con il sito;
- pipeline senza eventi-esempio privilegiati;
- registro completo dei 96 Comuni;
- registro di 102 candidati Pro Loco da verificare;
- copertura misurabile e coda editoriale.

## Dati legacy
I vecchi eventi non sono caricati automaticamente. Possono essere importati solo dopo controllo delle fonti, delle date, dell'anno e dello stato corrente.
