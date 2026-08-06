import { requireAdmin } from './_shared/auth.mjs';
import { query } from './_shared/db.mjs';
import { json, error } from './_shared/http.mjs';

export default async (req) => {
  const auth = requireAdmin(req);
  if (!auth.ok) return error(auth.message, auth.status, 'UNAUTHORIZED');
  try {
    if (req.method === 'GET') {
      const rows = await query(`SELECT id,event_name,town,start_date,end_date,source_url,organizer_name,contact_email,notes,status,created_at
        FROM event_submissions WHERE status='pending' ORDER BY created_at DESC LIMIT 500`);
      return json({ ok: true, submissions: rows });
    }
    if (req.method === 'PATCH') {
      const body = await req.json();
      const id = String(body.id || '');
      const status = ['approved','rejected','duplicate'].includes(body.status) ? body.status : null;
      if (!id || !status) return error('Dati non validi', 422, 'VALIDATION_ERROR');
      const rows = await query(`UPDATE event_submissions SET status=$2,reviewed_at=NOW(),reviewed_by=$3 WHERE id=$1 RETURNING *`,
        [id, status, auth.actor]);
      return rows[0] ? json({ ok: true, submission: rows[0] }) : error('Segnalazione non trovata', 404, 'NOT_FOUND');
    }
    return error('Metodo non consentito', 405, 'METHOD_NOT_ALLOWED');
  } catch (e) {
    return error('Gestione segnalazioni fallita', 500, 'SUBMISSIONS_ADMIN_FAILED', String(e.message || e));
  }
};
export const config = { path: '/api/admin/submissions' };
