// Correzioni esclusivamente di presentazione: non modifica fonti, DB o ingestion.
const MONTHS = '(?:GEN|FEB|MAR|APR|MAG|GIU|LUG|AGO|SET|OTT|NOV|DIC)';

function decodeEntities(value) {
  return String(value ?? '')
    .replace(/&gt;/gi, '>')
    .replace(/&lt;/gi, '<')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&(?:rsquo|lsquo);/gi, "'")
    .replace(/&(?:rdquo|ldquo);/gi, '"')
    .replace(/&hellip;/gi, '…')
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
  if (/^un servizio straordinario di mobilità\b|^\d+\s+comunicato del sindaco\b/i.test(title)) return '';
  return title;
}

export function cleanPublicEventTitle(event) {
  const title = cleanPublicTitle(event?.title);
  if (!title) return '';
  const source = String(event?.source_url || '').replace(/\/$/, '');

  // Correzione editoriale verificata sulla stessa pagina ufficiale: nella
  // listing Otranto l'occhiello segue il titolo "La Notte dei Bambini di Otranto".
  if (source === 'https://comune.otranto.le.it/novita'
    && /^Due serate dedicate ai più piccoli\.?$/i.test(title)) {
    return 'La Notte dei Bambini di Otranto';
  }
  if (source === 'https://comune.otranto.le.it/novita/calendario-eventi-primavera-estate-2026'
    && /^Notte dei Bambini dall['’]1$/i.test(title)) {
    return 'Notte dei Bambini';
  }

  // In questi occhielli il nome dell'evento è già letteralmente presente:
  // si elimina solo il testo giornalistico circostante, senza inferire parole.
  const navigabile = title.match(/^torna\s+(Navig-?Abile)\b/i);
  if (navigabile) return navigabile[1].replace(/^navig/i, 'Navig');
  const notteRosa = title.match(/\bospita\s+(La notte in Rosa)\b/i);
  if (notteRosa) return 'La Notte in Rosa';
  return title;
}

export function cleanPublicDescription(value) {
  let description = decodeEntities(value).replace(/\s+/g, ' ').trim();
  if (!description) return '';
  description = description.replace(/^Dettagli della notizia\s+/i, '').trim();

  const terminal = /[.!?…]["'”’)]?$/u.test(description);
  const danglingQuote = /["'“‘][^"'”’]{0,45}$/u.test(description);
  const likelyCut = description.length >= 110 && !terminal;
  if (!danglingQuote && !likelyCut) return description;

  let lastBoundary = -1;
  const boundaries = description.matchAll(/[.!?…]["'”’)]?(?=\s|$)/gu);
  for (const match of boundaries) lastBoundary = match.index + match[0].length;
  return lastBoundary >= 35 ? description.slice(0, lastBoundary).trim() : '';
}

export function refinePublicCategories(event) {
  const current = Array.isArray(event?.category_slugs) ? event.category_slugs.filter(Boolean) : [];
  if (current.length !== 1 || current[0] !== 'altro') return current;
  const text = [event?.title, event?.short_description, event?.description].filter(Boolean).join(' ');
  const rules = [
    ['sagre', /\bsagra\b/i],
    ['feste-patronali', /\b(?:festa|festeggiamenti|festività)\s+patronal[ei]\b/i],
    ['festival', /\bfestival\b/i],
    ['concerti', /\b(?:concerto|in concerto|tribute band|tributo (?:a|ad)|omaggio a)\b/i],
    ['teatro', /\b(?:rappresentazione|spettacolo) teatral[ei]\b|\bcommedia\b/i],
    ['cinema', /\b(?:cinema|proiezione (?:del )?film|film festival)\b/i],
    ['arte-e-mostre', /\b(?:mostra|esposizione)\b/i],
    ['mercatini', /\bmercatino\b/i],
    ['sport', /\b(?:torneo|raduno (?:auto|moto|fiat)|escursioni? in bike)\b/i],
    ['visite-guidate', /\b(?:visita guidata|tour guidato)\b/i],
    ['workshop-e-laboratori', /\b(?:workshop|laboratorio)\b/i],
    ['religione', /\b(?:festa|festività) (?:di |della |dell['’])?(?:san|santa|santo|madonna|m\.ss\.)\b/i],
    ['famiglie-e-bambini', /\b(?:notte dei bambini|dedicat[ae] ai più piccoli|happy circus)\b/i],
  ];
  const match = rules.find(([, pattern]) => pattern.test(text));
  return match ? [match[0]] : current;
}

function romeDateKey(value) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value));
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function ongoingTodayLabel(event, preset, now = new Date(), formatDate) {
  if (preset !== 'today') return '';
  const today = romeDateKey(now);
  const occurrence = (event?.event_occurrences || []).find((item) => {
    if (!item?.start_at || !item?.end_at) return false;
    const start = romeDateKey(item.start_at);
    const endValue = new Date(item.end_at);
    const displayEnd = Number.isNaN(endValue.getTime()) ? endValue : new Date(endValue.getTime() - 1);
    const end = romeDateKey(displayEnd);
    return start < today && end >= today;
  });
  if (!occurrence) return '';
  const endValue = new Date(occurrence.end_at);
  const displayEnd = new Date(endValue.getTime() - 1);
  const label = typeof formatDate === 'function' ? formatDate(displayEnd) : romeDateKey(displayEnd);
  return `In corso fino al ${label}`;
}

export function normalizePublicResults(payload) {
  const input = Array.isArray(payload?.events) ? payload.events : [];
  let removed = 0;
  const events = input.flatMap((event) => {
    const title = cleanPublicEventTitle(event);
    if (!title) { removed += 1; return []; }
    const shortDescription = cleanPublicDescription(event?.short_description);
    const description = cleanPublicDescription(event?.description);
    const normalized = {
      ...event,
      title,
      short_description: shortDescription || null,
      description: description || null,
    };
    normalized.category_slugs = refinePublicCategories(normalized);
    return [normalized];
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
