-- ============================================================================
-- PORTALE EVENTI SALENTO — Migrazione 0002: grant per ruolo service_role
-- Su Supabase il service_role bypassa la RLS ma necessita comunque dei GRANT
-- sugli oggetti: la migrazione 0001 li assegnava solo ad anon/authenticated.
-- (Su CI vanilla il ruolo service_role non esiste: tutto dentro un DO block.)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    -- Schema
    EXECUTE 'GRANT USAGE ON SCHEMA public TO service_role';
    -- Accesso completo su tutte le tabelle e viste presenti
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role';
    -- Sequence (bigserial/identity) per insert lato servizio
    EXECUTE 'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role';
    -- Funzioni RPC (search_events, expand_query_terms, has_role, imm_unaccent, ...)
    EXECUTE 'GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role';
    -- Oggetti FUTURI creati dall''utente che esegue questa migrazione (postgres):
    -- stessa matrice di permessi, cosi' ogni nuova tabella/funzione e' subito usabile.
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO service_role';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO service_role';
    -- Allineamento default privileges anche per anon/authenticated (lettura pubblica
    -- filtrata poi dalle policy RLS e dalle viste pubbliche).
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
       AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated';
      EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated';
    END IF;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Fine migrazione 0002
-- ---------------------------------------------------------------------------
