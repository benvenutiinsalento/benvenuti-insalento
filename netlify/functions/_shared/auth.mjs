// Autenticazione backoffice — Supabase Auth + ruoli nel database (mandato:
// nessun token manuale; ruoli admin/editor/reviewer/viewer in user_roles).
// Flusso: il browser fa login su Supabase Auth (email+password) e invia
// l'access token come Bearer. Qui verifichiamo il token chiamando GoTrue
// (/auth/v1/user) e poi carichiamo il ruolo dal database.
import crypto from 'node:crypto';
import { query } from './db.mjs';

const ROLE_RANK = { viewer: 1, reviewer: 2, editor: 3, admin: 4 };

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function bearerToken(req) {
  const auth = req.headers.get('authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
}

async function fetchAuthUser(token) {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!base || !apiKey) throw new Error('SUPABASE_URL / chiavi API non configurate');
  const response = await fetch(`${base}/auth/v1/user`, {
    headers: { apikey: apiKey, authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  return response.json(); // { id, email, ... }
}

export async function userRole(userId) {
  const rows = await query(
    `SELECT r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = $1::uuid`,
    [userId]);
  const names = rows.map((row) => row.name);
  return names.sort((a, b) => (ROLE_RANK[b] || 0) - (ROLE_RANK[a] || 0))[0] || null;
}

// requireRole(req, 'reviewer') -> { ok, actor, userId, role } | { ok:false, status, message }
export async function requireRole(req, minimum = 'viewer') {
  const token = bearerToken(req);
  if (!token) return { ok: false, status: 401, message: 'Accesso richiesto: effettua il login' };
  let user;
  try {
    user = await fetchAuthUser(token);
  } catch (error) {
    return { ok: false, status: 503, message: `Servizio autenticazione non raggiungibile: ${String(error.message || error).slice(0, 120)}` };
  }
  if (!user?.id) return { ok: false, status: 401, message: 'Sessione non valida o scaduta: rifai il login' };
  const role = await userRole(user.id);
  if (!role) return { ok: false, status: 403, message: 'Nessun ruolo assegnato a questo utente' };
  if ((ROLE_RANK[role] || 0) < (ROLE_RANK[minimum] || 1)) {
    return { ok: false, status: 403, message: `Ruolo insufficiente: serve almeno "${minimum}"` };
  }
  return { ok: true, actor: user.email || user.id, userId: user.id, role };
}

// Compatibilità verifiche interne: chiave segreta server-to-server (mai browser).
export function requireIngestionSecret(req) {
  const expected = process.env.INGESTION_SECRET;
  if (!expected) return false;
  return safeEqual(req.headers.get('x-ingestion-secret') || '', expected);
}
