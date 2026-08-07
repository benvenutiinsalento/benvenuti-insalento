# Struttura del progetto sorgente completo

Repository unico: **github.com/benvenutiinsalento/benvenuti-insalento** (branch `main`).
Ogni push su `main` pubblica automaticamente su Netlify (`benvenutiinsalento.it`).

Ricostruzione da zero (provata in CI ad ogni push):

```bash
npm ci
npm test        # 62+ test
npm run build   # check + test + build statico in dist/
```

## Dove sta ogni componente richiesto dal mandato

| Componente richiesto | Posizione reale nel repository |
|---|---|
| `package.json` / `package-lock.json` | radice |
| Frontend (HTML/CSS/JS) | `*.html`, `styles/`, `scripts/events.js`, `scripts/main.js` |
| Backend (API) | `netlify/functions/` (events, municipalities, health, event-detail, localities, categories, search-suggestions, coverage, coverage-summary, submit-event, admin-*) |
| Crawler | `netlify/functions/_shared/ingestion.mjs` (fetch, robots, snapshot, cursori) + scheduler `scripts/gha-ingest.mjs` |
| Parser | `netlify/functions/_shared/source-parsers.mjs` (ICS, JSON-LD, RSS, open data Puglia, PDF/poster OCR, HTML datato) |
| Discovery | `netlify/functions/_shared/discovery.mjs` + `scripts/gha-discovery.mjs` (+ `bootstrap.mjs` registro Pro Loco/IPA) |
| Database migrations | `supabase/migrations/0001_init.sql`, `0002_grants.sql`, `0003_collaudo.sql` |
| Seed territorio/categorie/fonti | `supabase/seeds/` |
| Workflow (scheduling) | `.github/workflows/` — **tutto** lo scheduling è qui (nessun cron Netlify) |
| Test | `tests/*.test.mjs` (`node --test`) |
| Config di deploy | `netlify.toml` |
| Variabili ambiente (modello) | `.env.example` |

## Workflows (GitHub Actions — unico schedulatore ammesso)

| File | Cadenza | Compito |
|---|---|---|
| `ingest-frequent.yml` | ogni 6 ore | crawl fonti prioritarie (pipeline completa) |
| `recheck-imminent.yml` | ogni 2 ore | ricontrollo mirato eventi < 72h |
| `daily-maintenance.yml` | ogni notte 03:30 | archiviazione, copertura, **COVERAGE_WARNING**, rigenerazione fallback da Supabase, report copertura |
| `weekly-discovery.yml` | lunedì 04:45 | discovery fonti (IPA + registri) |
| `tests.yml` | push/PR | CI verde obbligatoria |

## Segreti (mai nel codice)

- GitHub Secrets: `SUPABASE_URL`, `SUPABASE_DB_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Netlify env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_DB_URL`
- Nessun `ADMIN_TOKEN`: il backoffice usa **Supabase Auth** + ruoli `user_roles`
  (`admin` / `editor` / `reviewer` / `viewer`).
