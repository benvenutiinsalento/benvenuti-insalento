import crypto from 'node:crypto';

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function requireAdmin(req) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return { ok: false, status: 503, message: 'ADMIN_TOKEN non configurato' };
  const auth = req.headers.get('authorization') || '';
  const supplied = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return safeEqual(supplied, expected)
    ? { ok: true, actor: 'admin-token' }
    : { ok: false, status: 401, message: 'Autorizzazione non valida' };
}

export function requireIngestionSecret(req) {
  const expected = process.env.INGESTION_SECRET;
  if (!expected) return false;
  return safeEqual(req.headers.get('x-ingestion-secret') || '', expected);
}
