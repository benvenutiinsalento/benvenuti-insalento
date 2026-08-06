# Rapporto qualità — versione 10.1.0

Data del controllo: 1 agosto 2026.

## Risultato tecnico
- sito Netlify originario preservato e integrato;
- 30 moduli Netlify sottoposti a controllo sintattico;
- 21 test automatici superati;
- 96 Comuni presenti nel registro territoriale;
- 102 candidature Pro Loco presenti nel registro iniziale;
- 20 fonti trasversali iniziali registrate;
- nessun evento precaricato per MEDinFEST, Andrano o altri casi campione;
- nessun dataset fittizio esposto al pubblico;
- supporto Netlify Database e PostgreSQL esterno;
- geolocalizzazione facoltativa e arrotondata prima dell’invio;
- rate limiting configurato sulle API pubbliche sensibili;
- coda di revisione e audit delle modifiche predisposti.

## Test coperti
- scoperta di pagine eventi, PDF e sitemap;
- riconoscimento ICS/PDF/sitemap;
- deduplicazione;
- aggiornamento della stessa fonte con cambio data;
- conservazione della descrizione già verificata;
- rifiuto di eventi con anno passato presentati come correnti;
- ricerca per data e Comune;
- classificazione che non confonde automaticamente festival e sagre;
- risoluzione di Comuni e località omonime o annidate;
- parser del dataset regionale con campi annidati e date italiane;
- esclusione di record privi di data o Comune.

## Limiti dichiarati
Il software è pronto per essere attivato e collaudato, ma lo ZIP non contiene già “tutti gli eventi della provincia”. La completezza reale nasce dall’esecuzione continuativa delle fonti, dalla verifica dei canali locali e dalla revisione editoriale.

Nessun crawler può rilevare un evento che non è stato pubblicato online, è presente soltanto in un luogo non accessibile, oppure è comunicato su un canale privato. Per questo il sistema mostra le lacune di copertura e accetta segnalazioni documentate.

## Verifiche non eseguibili nell’ambiente di costruzione
L’installazione completa delle dipendenze non è stata conclusa nell’ambiente isolato perché il mirror npm interno non ha reso disponibile `@netlify/database`. Sono stati comunque eseguiti i controlli sintattici e i test che non richiedono il servizio. L’installazione deve essere ripetuta dal repository ufficiale npm o durante il deploy Netlify.

## Condizione per dichiarare il portale operativo
La sezione può essere dichiarata operativa solo dopo:
1. deploy di staging riuscito;
2. migrazione database applicata;
3. bootstrap dei 96 Comuni;
4. sincronizzazione IPA;
5. cicli di ingestione completati;
6. revisione degli errori ad alta priorità;
7. controllo manuale a campione su tutti i gruppi territoriali;
8. verifica quotidiana per almeno alcuni giorni durante il collaudo.
