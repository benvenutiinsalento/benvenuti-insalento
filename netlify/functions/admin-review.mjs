import { requireRole } from './_shared/auth.mjs';
import { query } from './_shared/db.mjs';
import { json, error } from './_shared/http.mjs';

export default async (req) => {
  try {
    if (req.method === 'GET') {
      const a = await requireRole(req, 'viewer');
      if (!a.ok) return error(a.message, a.status, 'UNAUTHORIZED');
      const rows = await query(`SELECT rq.*,e.title event_title,s.entity_name source_name
        FROM review_queue rq LEFT JOIN events e ON e.id=rq.event_id LEFT JOIN sources s ON s.id=rq.source_id
        WHERE rq.status='pending'
        ORDER BY CASE rq.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, rq.created_at
        LIMIT 500`);
      return json({ ok: true, items: rows });
    }
    if (req.method === 'PATCH') {
      const a = await requireRole(req, 'reviewer');
      if (!a.ok) return error(a.message, a.status, 'UNAUTHORIZED');
      const b = await req.json();
      const id = Number(b.id);
      const status = ['approved', 'rejected', 'resolved'].includes(b.status) ? b.status : null;
      if (!id || !status) return error('Dati non validi', 422, 'VALIDATION_ERROR');
      const rows = await query(`UPDATE review_queue SET status=$2,resolved_at=NOW(),resolved_by=$3,resolution_note=$4
        WHERE id=$1 RETURNING *`, [id, status, a.actor, String(b.note || '').slice(0, 1000)]);
      // Approvazione di un evento in coda = pubblicazione redazionale tracciata
      if (status === 'approved' && rows[0]?.event_id) {
        await query(`UPDATE events SET status='published',last_verified_at=NOW(),
          published_at=COALESCE(published_at,NOW()) WHERE id=$1 AND status='pending_review'`, [rows[0].event_id]);
        await query(`INSERT INTO event_status_history (event_id,from_status,to_status,reason,actor)
          VALUES ($1,'pending_review','published',$2,$3)`,
          [rows[0].event_id, String(b.note || 'Approvato dalla coda revisioni').slice(0, 500), a.actor]);
      }
      return json({ ok: true, item: rows[0] || null });
    }
    return error('Metodo non consentito', 405, 'METHOD_NOT_ALLOWED');
  } catch (e) {
    return error('Revisione fallita', 500, 'REVIEW_FAILED', String(e.message || e));
  }
};
export const config = { path: '/api/admin/review' };
