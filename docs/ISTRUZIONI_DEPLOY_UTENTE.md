# Checklist deploy — cosa deve fare il titolare (passo passo)

Obiettivo: pubblicare il portale eventi su benvenutiinsalento.it/eventi con database Supabase,
aggiornamenti automatici GitHub Actions e backoffice protetto. Costo previsto: **0 €** (piani free).
Regole di sicurezza seguite:
- nessuna chiave segreta viene incollata in chat o salvata nel codice;
- le chiavi segrete vanno solo nei campi protetti di GitHub (Secrets) e Netlify (Environment variables);
- i token che mi dai possono essere revocati in qualsiasi momento.

Per ogni step: cosa fai, perché serve, se è reversibile, cosa mi comunichi.

---

## STEP 1 — Accounts gratuiti (se non li hai già)

1. **GitHub** — vai su https://github.com/join e crea l'account gratuito. Serve per il codice e gli
   aggiornamenti automatici (GitHub Actions). Reversibile: sì. Lo userai per gli step 2 e 3.
2. **Supabase** — vai su https://supabase.com e fai "Sign in with GitHub" (consigliato: un solo login).
   Serve per database, autenticazione redazione e sicurezza (RLS). Reversibile: sì.
3. **Netlify** — ce l'hai già (benvenutiinsalento.it ci vive). Nessuna azione qui.

Costo: 0 €. Nessuno chiede carta di credito.

**Mi comunichi quando fatto:** "account pronti".

---

## STEP 2 — Repository GitHub vuoto

1. Su https://github.com/new crea un repository:
   - Nome: `benvenuti-insalento`
   - Visibilità: **Public** (consigliata: Actions gratuite illimitate e il portale eventi è comunque pubblico;
     se preferisci Private funziona lo stesso, i minuti Actions gratuiti bastano).
   - Lascia spuntato **Add a README** (serve un primo commit; lo sostituiremo).
2. Crea il token che mi consente di caricare il progetto:
   - https://github.com/settings/personal-access-tokens/new
   - Nome: `deploy-benvenuti-insalento` · Scadenza: 90 giorni.
   - **Repository access**: *Only select repositories* → seleziona `benvenuti-insalento`.
   - **Permissions**: *Contents* = Read and Write · *Workflows* = Read and Write. Nient'altro.
   - Crea e copia il token (inizia con `github_pat_...`).
3. **Incollami in chat**: l'URL del repo (es. `https://github.com/tuousername/benvenuti-insalento`) e il token.

Cosa autorizzi: caricare e aggiornare *solo quel repository* (codice e workflow Actions). Perché serve:
è l'unico modo che ho per pubblicare il progetto su GitHub dalla sandbox. Reversibile: **sì — revochi il token
in un secondo** da Settings → Developer settings → Personal access tokens (e io non potrò più spingere nulla).

⚠️ Il token è come una password: incollalo una sola volta ri qui e lo userò per configurare tutto;
alla fine del progetto te lo farò revocare. Se preferisci non passarmelo, alternativa: carichi tu i file
via interfaccia ("Add file → Upload files") e poi lavoriamo solo via UI — più lento e scomodo.

**Mi comunichi:** URL repo + token.

---

## STEP 3 — Progetto Supabase

1. Su https://supabase.com/dashboard fai **New project**:
   - Organization: quella creata con la registrazione (ne esce una di default).
   - Name: `benvenuti-insalento-eventi` · **Region: Frankfurt (eu-central-1)** o West EU (più vicina in free).
   - **Database password**: generane una robusta e **salvala in un posto tuo sicuro** (serve dopo).
   - Piano: **Free** (niente carta).
   - Attendi ~2 minuti la creazione.
2. Raccogli 3 valori (li trovi qui):
   - **Project URL**: Settings → Data API → Project URL (es. `https://abcdefgh.supabase.co`).
   - **anon public key**: Settings → API Keys → `anon` `public` (chiave lunga, inizia per `eyJ...`).
   - **service_role key**: stessa pagina, riga `service_role` (SEGRETA: trattala come password).
   - **Connection string (URI)**: Settings → Database → sezione "Connection string" → tab **URI**
     (es. `postgresql://postgres.abcdefgh:[LA-TUA-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`).
     Sostituisci `[LA-TUA-PASSWORD]` con la password dello step 1.
3. **NON incollare le chiavi in chat.** Inseriscile tu direttamente nei due posti protetti:
   - **GitHub Secrets** (repo → Settings → Secrets and variables → Actions → New repository secret):
     | Nome | Valore |
     |---|---|
     | `SUPABASE_URL` | Project URL |
     | `SUPABASE_DB_URL` | Connection string URI (con password) |
     | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
   - **Netlify** (sito benvenutiinsalento.it → Site configuration → Environment variables → Add a variable):
     | Nome | Valore |
     |---|---|
     | `SUPABASE_URL` | Project URL |
     | `SUPABASE_ANON_KEY` | anon public key |
     | `SUPABASE_DB_URL` | Connection string URI (con password) |

Cosa autorizzi: nulla verso di me — le chiavi restano nei vault di GitHub/Netlify. Perché servono:
le Actions scrivono/leggono il database; Netlify (le tue Functions) legge gli eventi per mostrarli.
Reversibile: sì — da Supabase puoi rigenerare le chiavi e cancellare il progetto.

**Mi comunichi solo:** "Supabase creato, secrets e variabili impostati" + la **Project URL** (quella posso vederla, non è segreta).

Io poi eseguirò migrazione + seed sul database reale tramite una Action dedicata (un click manuale).

4. **Primo utente redazione**: in Supabase → Authentication → Users → **Add user** →
   email tua + password provvisoria tua. **Mi comunichi l'email** (la userò per assegnarti il ruolo `admin`).

---

## STEP 4 — Collegare Netlify al repository (deploy automatici + preview)

Oggi pubblichi trascinando la cartella. Collegandola a GitHub, ogni mio push diventa un deploy e ogni pull
request una **preview di staging** (serve per la fase collaudo).

1. Su Netlify → site di benvenutiinsalento.it → **Site configuration → Build & deploy → Continuous deployment**
   (da alcune UI: "Link site to Git" / "Import an existing project").
2. Provider: **GitHub** → autorizzi Netlify (finestra GitHub) → scegli il repo `benvenuti-insalento`.
3. Build settings: li legge da `netlify.toml` (già configurato nel progetto: `npm run build`, publish `dist`).
4. Salva. Da ora: push su `main` = produzione; pull request = preview.

Cosa autorizzi: Netlify legge il repo e fa deploy automatici. Reversibile: sì (Unlink in qualsiasi momento).

**Mi comunichi:** "Netlify collegato".

---

## STEP 5 — (Facoltativo) Chiave OCR gratuita per le locandine

Il portale legge manifesti e PDF scansionati con OCR. Senza chiave funziona tutto lo stesso: semplicemente
quelli finiscono in revisione redazionale anziché essere letti automaticamente.

1. https://ocr.space/ocrapi/freekey → inserisci la tua email → ti arriva la chiave gratuita (25.000 richieste/mese).
2. Aggiungi in **GitHub Secrets**: nome `OCR_API_KEY`, valore la chiave.
3. Aggiungi in **GitHub Secrets**: nome `OCR_PROVIDER`, valore `ocrspace`.

**Mi comunichi:** "OCR fatto" (oppure "salta OCR").

---

## STEP 6 — Cosa NON devi fare

- ❌ Non comprare piani a pagamento (Supabase/Netlify/GitHub): se qualcosa sfiorasse i limiti free, te lo segnalo io prima.
- ❌ Non incollare password o service_role key in chat. In chat passano solo: URL repo, URL Supabase, token GitHub dello step 2 (revocabile), email admin, e i tuoi "fatto".
- ❌ Non modificare file nel progetto: ogni modifica passa da me con test.

---

## Stato attuale e sequenza

| # | Step | Dipende da te | Dipende da me |
|---|---|---|---|
| 1 | Accounts | ~10 min | — |
| 2 | Repo + token | ~5 min | push iniziale progetto |
| 3 | Supabase + secrets + admin | ~15 min | migrazione, seed, ruolo admin |
| 4 | Netlify↔GitHub | ~5 min | verifica preview |
| 5 | OCR (facoltativo) | ~5 min | attivazione parser OCR |
| 6 | — | — | collaudo reale, staging, produzione |

Nel frattempo io continuo il lavoro che non richiede account (API complete, workflow Actions, frontend).
