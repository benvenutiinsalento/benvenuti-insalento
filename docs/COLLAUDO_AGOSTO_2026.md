# COLLAUDO REALE — ciclo di verifica 2026-08-07 → 2026-08-16

Run di acquisizione: **#24** (pipeline reale: crawler → parser → normalizzazione → deduplicazione → verifica → database).
Eseguito il 07/08/2026, 15:16:17. Nessun evento inserito manualmente.

| Comune | Fonti interrogate | Riuscite | Fallite | Eventi trovati | Pubblicati (finestra) | In revisione | Duplicati |
|---|---|---|---|---|---|---|---|
| Lecce | 25 | 23 | 2 | 69 | 2 | 6 | 0 |
| Gallipoli | 25 | 25 | 0 | 7 | 0 | 0 | 0 |
| Otranto | 25 | 23 | 2 | 24 | 0 | 0 | 0 |
| Nardò | 2 | 2 | 0 | 5 | 0 | 0 | 0 |
| Porto Cesareo | 3 | 3 | 0 | 36 | 0 | 3 | 0 |
| Galatina | 3 | 3 | 0 | 47 | 0 | 10 | 0 |
| Leverano | 2 | 2 | 0 | 10 | 0 | 0 | 0 |
| Ugento | 25 | 25 | 0 | 12 | 0 | 0 | 0 |
| Tricase | 2 | 2 | 0 | 0 | 0 | 0 | 0 |
| Andrano | 2 | 2 | 0 | 0 | 0 | 0 | 0 |
| Botrugno | 3 | 3 | 0 | 23 | 0 | 4 | 0 |
| Bagnolo del Salento | 1 | 1 | 0 | 0 | 1 | 0 | 0 |
| Maglie | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| Melendugno | 2 | 2 | 0 | 19 | 0 | 3 | 0 |
| Casarano | 1 | 1 | 0 | 0 | 0 | 0 | 0 |

## Errori fonti (estratto)
- **Lecce**: Arcidiocesi di Lecce: HTTP_503 · Arcidiocesi di Lecce — Parrocchie e Vicarie: HTTP_503
- **Otranto**: Arcidiocesi di Otranto — Enti e Parrocchie — SANTUARIO MARIA SS. DELLE GRAZIE: HTTP_500 · Arcidiocesi di Otranto: HTTP_400

## Coverage warning (punto 6)
- ⚠️ **Andrano**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Bagnolo del Salento**: 1/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Botrugno**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Casarano**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Galatina**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Gallipoli**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Leverano**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Maglie**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Melendugno**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Nardò**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Otranto**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Porto Cesareo**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Tricase**: 0/2 eventi nei prossimi 10 giorni → avviso aperto
- ⚠️ **Ugento**: 0/2 eventi nei prossimi 10 giorni → avviso aperto

## Eventi noti verificati (punto 7)
- **MEDinFEST**: 1 eventi. Esempio: “MEDinFEST 2026 — II edizione” (Bagnolo del Salento, published, fonte: MEDinFEST — sito ufficiale, run #15)
- **Festa patronale Andrano**: **NESSUNO — anomalia**
- **Sant'Oronzo Lecce**: 1 eventi. Esempio: “Festeggiamenti dei Santi Oronzo, Giusto e Fortunato” (Lecce, published, fonte: Comune di Lecce — festività patronali 2026, run #15)
- **Eventi Leverano**: 6 eventi. Esempio: “Un Natale per tutti 2025” (Leverano, completed, fonte: Comune di Leverano — Manifestazioni ed Eventi, run #24)
- **Eventi Galatina**: 6 eventi. Esempio: “Cronaca” (Galatina, completed, fonte: Città di Galatina — Eventi (portale civico), run #24)
- **Eventi Ugento**: 6 eventi. Esempio: “Adeguamento liturgico della chiesa Cattedrale. IL PROGETTO VINCITORE DEL CONCORSO PER L’ADEGUAMENTO LITURGICO.” (Ugento, completed, fonte: Diocesi di Ugento-Santa Maria di Leuca — Parrocchie — Diocesi Ugento Santa Maria di Leuca, run #24)

## Metriche finali A–J (punto 12)

- **A.** Fonti registrate: **655**
- **B.** Fonti realmente funzionanti: **154**
- **C.** Fonti fallite: **13**
- **D.** Eventi futuri totali: **8**
- **E.** Eventi prossimi 7 giorni: **3**
- **F.** Comuni con almeno un evento: **4**
- **G.** Comuni senza copertura: **92**
- **H.** Eventi acquisiti automaticamente: **279**
- **I.** Eventi inseriti manualmente: **0**
- **J.** Eventi in revisione: **35**


---

## Aggiornamento finale — 7 agosto 2026 (post collaudo completo)

Eseguite tutte le passate: backfill fonti dei 96 Comuni, sweep di discovery assistito (14 nuove fonti registrate con tracciamento in `source_discoveries`), ingestione aggregatori, passate editoriali con audit (`actor: welcome.to.salento2024@gmail.com`), fix critici (sanitizzazione JSON Unicode, parser date senza anno, close-out eventi di giornata, weekend/stasera, dedup diocesi).

### Metriche finali A–J (query reali sul DB, 07/08/2026)

| Metrica | Valore | Nota |
|---|---|---|
| A — Fonti registrate | 655 | |
| B — Fonti realmente funzionanti | 157 | ultime 48h, controllo reale riuscito |
| C — Fonti fallite | 14 | con conseguenze note: warning aperti, fonte disattivata o coda revisione |
| D — Eventi futuri pubblicati | 113 | |
| E — Eventi prossimi 7 giorni | 42 | |
| F — Comuni con eventi pubblicati | 46 | |
| G — Comuni senza copertura | 50 | vedi coverage_warnings aperti |
| H — Eventi da fonte automatica | 415 | |
| I — Eventi inseriti manualmente | 0 | nessun evento manuale: solo pipeline |
| J — In coda di revisione | 3 | |

**Verifica live**: `GET /api/events` → `total=114`, `fallback=false`, header `x-backend-status: supabase`. `GET /api/health` → `status: ok`.

### Finestra 7–16 agosto 2026 — 15 Comuni del collaudo (eventi pubblicati)

| Comune | Eventi pubblicati 7–16/8 | Note |
|---|---|---|
| Lecce | 6 | |
| Gallipoli | 1 | + altri fuori finestra |
| Otranto | 1 | parser potenziato (date senza anno): 2→14 candidati |
| Nardò | 1 | |
| Porto Cesareo | 2 | |
| Galatina | 10 | fonti galatina.it / galatina.info |
| Ugento | 1 | |
| Tricase | 6 | |
| Bagnolo del Salento | 1 | |
| Maglie | 1 | Mercatino del Gusto (oggi 7/8) |
| Melendugno | 4 | incluse date diocesi corrette |
| Leverano | 0 | COVERAGE_WARNING aperto: fonti deboli, discovery aggiuntiva pianificata |
| Andrano | 0 | COVERAGE_WARNING aperto (festa nota prevista a fine agosto, fuori/sotto-soglia finestra) |
| Botrugno | 0 in finestra | 3 eventi futuri 17–27/8 (festa + concerto reale del 27/8); fonte tour nazionale disattivata per falsi positivi |
| Casarano | 0 | COVERAGE_WARNING aperto: serve fonte originale più ricca |

Interpretazione onesta: zero eventi in finestra NON significa "nessun evento nel Comune" — i warning restano aperti e alimentano i prossimi cicli di discovery automatica (GitHub Actions) e le passate assistite.

### Fix principali applicati in questo blocco
1. `invalid input syntax for type json` — sanitizzazione Unicode (surrogati isolati) su tutto il payload JSONB + test di regressione.
2. 320/321 fonti senza `municipality_id` — backfill (272 collegate) + fonti `municipal_discovery` per tutti i 96 Comuni.
3. Filtro Weekend: frontend non passava il flag; ora regola backend venerdì ≥18:00 + sabato + domenica (SQL ISODOW 5,6,7).
4. Filtro Stasera esteso: serale, giornaliero in corso (all-day oggi), pomeridiano che entra in serata, più occorrenze.
5. Parser HTML: date senza anno ("13 agosto") e date multiple ("13, 14 e 15 agosto", "dal 19 giugno al 12 luglio") ora estratte come occorrenze distinte.
6. Close-out: evento di sola giornata odierna non viene più chiuso a mezzanotte (`occurrence_date >= CURRENT_DATE`); riaperti 2 eventi di oggi.
7. Fonte tour nazionale (Alex Britti, 22 date attribuite a Botrugno) disattivata; 6 eventi spurii rifiutati con tracciamento; conservato il concerto reale del 27/8.
8. Duplicati diocesi Lecce/Melendugno: scorciatoie senza data ora ereditano la data di sezione; 2 duplicati rifiutati e non più ricreati (verificato con re-ingestione: 24 candidati → revisione redazionale, 0 reati).
9. Rumore boilerplate eliminato (titoli tipo "Gratuito", "Salta al contenuto"), entità HTML decodificate nei titoli.

### Limiti noti residui
- 86 COVERAGE_WARNING aperti (volutamente visibili in backoffice, alimentano discovery automatica).
- Fonte OpenCities Tricase: pagina non strutturata → 0 candidati; serve parser dedicato.
- Prime esecuzioni schedulate GitHub Actions da osservare (ingest ogni 6h).

---

## Addendum serale — 7 agosto 2026 (verifica mirata Leverano/Andrano/Casarano)

Test mirato sulle fonti dei 3 Comuni con warning aperto. Risultati reali:

1. **Bug "town_missing" trovato e corretto**: i candidati da fonti comunali senza
   Comune nel testo cadevano in revisione (`town_missing`/`territory_unknown`) pur
   avendo una fonte con `municipality_id`. Ora l'evento eredita il Comune della fonte
   (`event-repository.mjs`). Test 74/74 verdi.
2. **Metrica J corretta**: contava solo `events.pending_review` (3). La coda reale
   (`review_queue` status `pending`) era ed è di ~530 elementi. Ora J le conta
   entrambe: numero vero degli elementi in attesa di revisione (in gran parte
   candidati fuori provincia dagli aggregatori regionali — da smaltire in backoffice).
3. **Fonti Leverano 909/910/923 disattivate**: pagine articolo/programmazione che
   estraevano avvisi amministrativi e navigazione come fossero eventi
   (34 voci di rumore rifiutate con storico; conservati i 4 contenuti culturali reali,
   archiviati come passati). Il PICCOLO PRINCIPE resta associato correttamente a Leverano.
4. **Andrano**: confermati in archivio "Festa di Santa Maria Maddalena" (30/7) e
   "Sagra te la Pitta" (3/8) — passati prima della finestra 7-16/8. Nessun evento
   futuro trovato dalle fonti attive: warning aperto, onesto.
5. **Esito onesto**: per Leverano, Andrano e Casarano NON pubblico eventi inventati.
   Il sistema segnala COVERAGE_WARNING aperti e la discovery continua (GHA settimanale
   + passate assistite) finché non emerge una fonte eventi affidabile.

Metriche aggiornate dopo pulizia: A=655, B=173, D=111, J=530 (coda reale esposta).
