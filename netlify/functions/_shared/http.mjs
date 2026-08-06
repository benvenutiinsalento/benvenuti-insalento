const BASE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
};

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...BASE_HEADERS, ...headers },
  });
}

export function error(message, status = 400, code = 'BAD_REQUEST', details) {
  return json({ ok: false, error: { code, message, ...(details ? { details } : {}) } }, status);
}

export function parsePositiveInt(value, fallback, max = 100) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export function isoDateOrEmpty(value) {
  const text = String(value || '');
  return /^20\d{2}-\d{2}-\d{2}$/.test(text) ? text : '';
}

export function corsResponse(req) {
  if (req.method !== 'OPTIONS') return null;
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'access-control-allow-headers': 'authorization,content-type,x-ingestion-secret',
    },
  });
}
