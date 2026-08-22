// Correzioni esclusivamente di presentazione: non modifica fonti, DB o ingestion.
const MONTHS = '(?:GEN|FEB|MAR|APR|MAG|GIU|LUG|AGO|SET|OTT|NOV|DIC)';

function decodeEntities(value) {
  return String(value ?? '')
    .replace(/&gt;/gi, '>')
    .replace(/&lt;/gi, '<')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ');
}

export function cleanPublicTitle(value) {
  let title = decodeEntities(value).replace(/\s+/g, ' ').trim();
  if (!title) return '';

  // I listing comunali spesso concatenano: articolo precedente + sezione CMS
  // + data editoriale + titolo dell'articolo corrente. In quel caso conserva
  // soltanto il testo successivo alla data editoriale.
  const cmsDate = new RegExp(`\\b(?:NOTIZIE|AVVISI)\\s+\\d{1,2}\\s+${MONTHS}\\s+\\d{2,4}\\s+(.+)$`, 'i');
  const datedMatch = title.match(cmsDate);
  if (datedMatch?.[1]) title = datedMatch[1];

  title = title
    .replace(/^[\s.,;:·|–—-]+/, '')
    .replace(/\s+(?:NOTIZIE|AVVISI|DETTAGLI(?:\s+DELLA\s+NOTIZIA)?)(?:\s+\d{1,2}\s+[A-Z]{3}\s+\d{2,4})?\s*$/i, '')
    .replace(/\s+Dettagli(?:\s+Cultura e tempo libero)?\s*$/i, '')
    .replace(/[\s,;:|–—-]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Questi segnali descrivono navigazione o comunicazioni amministrative,
  // non un titolo recuperabile senza inventare informazioni.
  if (!title || /^(?:Data\s*:|\[?\s*\d+\s*\]?\s+(?:\d+\s*)+>?$)/i.test(title)) return '';
  if (/\breport delle offerte di lavoro\b|\bsciopero nazionale\b|(?:^|\s)>>?(?:\s|$)/i.test(title)) return '';
  return title;
}

export function normalizePublicResults(payload) {
  const input = Array.isArray(payload?.events) ? payload.events : [];
  let removed = 0;
  const events = input.flatMap((event) => {
    const title = cleanPublicTitle(event?.title);
    if (!title) { removed += 1; return []; }
    return [{ ...event, title }];
  });
  const pagination = payload?.pagination || {};
  const originalTotal = Number(pagination.total);
  const total = Number.isFinite(originalTotal) ? Math.max(events.length, originalTotal - removed) : events.length;
  return { ...payload, events, pagination: { ...pagination, total }, removed_contaminated_titles: removed };
}

export function resultsCounterText(payload, formatGeneratedAt) {
  if (!payload?.pagination) return '';
  const total = Number(payload.pagination.total) || 0;
  const updated = typeof formatGeneratedAt === 'function' ? formatGeneratedAt(payload.generated_at) : '';
  return `${total} appuntamenti${updated ? ` · aggiornato ${updated}` : ''}`;
}
