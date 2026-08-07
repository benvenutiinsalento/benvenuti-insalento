import { requireRole } from './_shared/auth.mjs';
import { json, error } from './_shared/http.mjs';

// Identità + ruolo dell'utente loggato (usata dalla UI backoffice dopo il login).
export default async (req) => {
  const a = await requireRole(req, 'viewer');
  if (!a.ok) return error(a.message, a.status, 'UNAUTHORIZED');
  return json({ ok: true, user: { id: a.userId, email: a.actor, role: a.role } });
};
export const config = { path: '/api/admin/me' };
