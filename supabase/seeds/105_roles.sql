-- ============================================================================
-- SEED 105 — Ruoli obbligatori del mandato (admin / editor / reviewer / viewer)
-- Idempotente: upsert per nome.
-- ============================================================================
INSERT INTO roles (name, description) VALUES
  ('admin',    'Accesso completo: utenti, fonti, eventi, pubblicazione, impostazioni'),
  ('editor',   'Crea e modifica eventi e contenuti editoriali'),
  ('reviewer', 'Revisiona la coda eventi: approva, rifiuta, chiede modifiche'),
  ('viewer',   'Sola lettura su dashboard e report')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;
