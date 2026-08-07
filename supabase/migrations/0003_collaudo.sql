-- 0003_collaudo.sql — BLOCCO DI VERIFICA agosto 2026.
-- 1) Esiti per-fonte dell'ultima scansione (report "fonte registrata" vs
--    "fonte realmente funzionante", punto 2 del blocco).
-- 2) Tabella coverage_warnings: anomalie di copertura esplicite (punto 6).
-- 3) Indice sul run di acquisizione (tracciabilità ingestion_run_id, punto 5).

ALTER TABLE sources
  ADD COLUMN IF NOT EXISTS last_created_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_updated_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_review_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_duration_ms INTEGER;

-- Run che ha prodotto lo stato corrente della fonte (prova "crawl -> database")
ALTER TABLE sources
  ADD COLUMN IF NOT EXISTS last_run_id BIGINT REFERENCES source_runs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS events_last_seen_run_idx ON events(last_seen_run_id);

-- Avvisi di copertura: MAI interpretare "0 eventi = non ci sono eventi".
CREATE TABLE IF NOT EXISTS coverage_warnings (
  id BIGSERIAL PRIMARY KEY,
  municipality_id BIGINT NOT NULL REFERENCES municipalities(id),
  window_from DATE NOT NULL,
  window_to DATE NOT NULL,
  events_found INTEGER NOT NULL DEFAULT 0,
  threshold INTEGER NOT NULL DEFAULT 2,
  reason TEXT NOT NULL DEFAULT 'Sotto soglia plausibile per il periodo',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','dismissed')),
  run_id BIGINT REFERENCES source_runs(id) ON DELETE SET NULL,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  UNIQUE (municipality_id, window_from, window_to)
);
CREATE INDEX IF NOT EXISTS coverage_warnings_open_idx ON coverage_warnings(status, created_at DESC);

ALTER TABLE coverage_warnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS coverage_warnings_public_read ON coverage_warnings;
CREATE POLICY coverage_warnings_public_read ON coverage_warnings FOR SELECT USING (true);

DO $$
BEGIN
  BEGIN
    GRANT SELECT ON coverage_warnings TO anon, authenticated;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'grant anon saltato: %', SQLERRM;
  END;
  BEGIN
    GRANT SELECT, INSERT, UPDATE, DELETE ON coverage_warnings TO service_role;
    GRANT USAGE, SELECT ON SEQUENCE coverage_warnings_id_seq TO service_role;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'grant service_role saltato: %', SQLERRM;
  END;
END $$;
