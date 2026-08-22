import {
  cleanPublicDescription,
  cleanPublicEventTitle,
  normalizePublicResults,
  ongoingTodayLabel,
  refinePublicCategories,
  resultsCounterText,
} from './eventi-display.js';

// Eventi Salento — app frontend (vanilla JS, hash routing, no framework)
// Accessibile: focus, aria, contrasto. Tutti i dati arrivano da /api/*.

const TZ = 'Europe/Rome';

// localStorage può lanciare (privacy mode, storage disabilitato): mai bloccare l'avvio
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignora */ } },
};

const state = {
  view: 'list',
  params: {},            // filtri correnti
  results: null,
  loading: false,
  error: null,
  fallback: false,
  categories: [],
  audiences: [],
  municipalities: [],
  localities: [],
  saved: new Set((() => { try { return JSON.parse(store.get('es_saved') || '[]'); } catch { return []; } })()),
  position: null,        // {lat,lng} solo con consenso
};

const PRESETS = [
  { id: 'today', label: 'Oggi' },
  { id: 'tonight', label: 'Stasera' },
  { id: 'tomorrow', label: 'Domani' },
  { id: 'weekend', label: 'Questo weekend' },
  { id: 'next7', label: 'Prossimi 7 giorni' },
];
const WEEKEND_NOTE = 'Il weekend comprende venerdì dalle 18:00, sabato e domenica.';

const $app = document.getElementById('app');
const DEFAULT_TITLE = document.title;

/* ── utilities ─────────────────────────────────────────────────────────── */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function fmtDate(iso, opts = {}) {
  try {
    return new Intl.DateTimeFormat('it-IT', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric', ...opts }).format(new Date(iso));
  } catch { return iso; }
}
function fmtTime(iso) {
  try { return new Intl.DateTimeFormat('it-IT', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso)); } catch { return ''; }
}
function dayParts(iso) {
  const dtf = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: '2-digit', month: 'short' }).format(new Date(iso));
  const [d, m] = dtf.replace('.', '').split(' ');
  return { d, m: m.slice(0, 3) };
}
function slugFromTitle(t) { return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

function clearEventJsonLd() {
  document.getElementById('event-jsonld')?.remove();
  document.title = DEFAULT_TITLE;
}

function setEventJsonLd(ev, occs) {
  clearEventJsonLd();
  const ordered = [...occs].sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
  if (!ordered.length) return;
  const placeName = [ev.venue, ev.locality_name, ev.municipality_name].filter(Boolean).join(', ');
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.title,
    startDate: ordered[0].start_at,
    endDate: ordered.at(-1).end_at || ordered.at(-1).start_at,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: ev.status === 'cancelled'
      ? 'https://schema.org/EventCancelled'
      : ev.status === 'postponed' ? 'https://schema.org/EventPostponed' : 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: placeName,
      address: [ev.address, ev.locality_name, ev.municipality_name, 'LE', 'Italia'].filter(Boolean).join(', '),
    },
    url: `${location.origin}/eventi#/evento/${encodeURIComponent(ev.slug)}`,
  };
  if (ev.description || ev.short_description) data.description = ev.description || ev.short_description;
  if (ev.organizer) data.organizer = { '@type': 'Organization', name: ev.organizer, ...(ev.organizer_url ? { url: ev.organizer_url } : {}) };
  const node = document.createElement('script');
  node.type = 'application/ld+json';
  node.id = 'event-jsonld';
  node.textContent = JSON.stringify(data);
  document.head.append(node);
  document.title = `${ev.title} | Eventi in Salento | Benvenuti in Salento`;
}

function formatWhen(ev) {
  const occs = (ev.event_occurrences ?? []).slice().sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
  if (!occs.length) return '';
  const first = occs[0];
  const last = occs[occs.length - 1];
  const f = fmtDate(first.start_at);
  const rawEnd = last.end_at || last.start_at;
  const displayEnd = last.end_at && fmtTime(last.end_at) === '00:00'
    ? new Date(new Date(last.end_at).getTime() - 1)
    : rawEnd;
  const l = fmtDate(displayEnd);
  const range = f === l ? f : `${f} — ${l}`;
  const timeParts = [];
  if (first.all_day) timeParts.push('tutto il giorno');
  else if (first.schedule_text === 'Orario non indicato') timeParts.push('orario non indicato');
  else {
    if (first.start_at) timeParts.push('dalle ' + fmtTime(first.start_at));
    if (first.schedule_text && !/[0-9]{1,2}:[0-9]{2}/.test(first.schedule_text)) timeParts.push(first.schedule_text);
    else if (first.end_at && fmtDate(first.start_at) === fmtDate(first.end_at)) timeParts.push('alle ' + fmtTime(first.end_at));
  }
  return timeParts.length ? `${range} · ${timeParts.join(' · ')}` : range;
}

/* ── api ──────────────────────────────────────────────────────────────── */
async function api(path, opts = {}) {
  // timeout: nessuna richiesta può restare appesa per sempre (evita "caricamento infinito")
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeout || 25000);
  let signal = opts.signal;
  if (signal) {
    // combina il segnale esterno con il timeout (AbortSignal.any se disponibile)
    try { signal = AbortSignal.any([signal, ctrl.signal]); } catch { signal = ctrl.signal; }
  } else {
    signal = ctrl.signal;
  }
  try {
    const res = await fetch('/api' + path, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts,
      signal,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(body?.error?.message || `Errore ${res.status}`);
      err.code = body?.error?.code; err.status = res.status;
      throw err;
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

/* ── fallback dati (solo protezione temporanea) ────────────────────────── */
async function loadFallback() {
  try {
    const res = await fetch('/eventi-fallback/fallback.json', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function searchEvents() {
  // anti-loop: la ricerca non richiama MAI render() completo, solo renderResults().
  // Se una ricerca è già in corso, viene annullata e sostituita (mai concorrenti).
  state.loading = true; state.error = null; state.fallback = false;
  renderResults();

  const p = new URLSearchParams();
  const { params } = state;
  if (params.q) p.set('q', params.q);
  if (params.municipality) p.set('municipality', params.municipality);
  if (params.locality) p.set('locality', params.locality);
  if (params.preset) p.set('preset', params.preset);
  else if (params.date) p.set('date', params.date);
  if (params.categories?.length) p.set('categories', params.categories.join(','));
  if (params.audiences?.length) p.set('audiences', params.audiences.join(','));
  if (params.free) p.set('free', 'true');
  if (params.page > 1) p.set('page', String(params.page));
  if (state.position) { p.set('lat', state.position.lat); p.set('lng', state.position.lng); p.set('radius', state.radius || '20'); }
  const sort = new URLSearchParams(location.hash.split('?')[1] || '').get('sort');
  if (sort) p.set('sort', sort);

  // annulla un'eventuale richiesta precedente ancora in volo
  if (state._abort) state._abort.abort();
  const ctrl = new AbortController();
  state._abort = ctrl;

  try {
    const data = await api('/events?' + p.toString(), { signal: ctrl.signal });
    if (ctrl.signal.aborted) return;
    state.results = normalizePublicResults(data); state.fallback = false;
  } catch (err) {
    if (ctrl.signal.aborted || err.name === 'AbortError') return;
    if (err.status === 502 || err.code === 'db_error' || err.code === 'internal') {
      // fallback di emergenza: solo se l'API non risponde, mai se restituisce risultati vuoti
      const fb = await loadFallback();
      if (fb && fb.generated_at) {
        state.results = normalizePublicResults({ events: fb.events, pagination: { page: 1, limit: fb.events.length, total: fb.events.length, pages: 1 }, generated_at: fb.generated_at });
        state.fallback = true;
      } else {
        state.error = err.message;
      }
    } else {
      state.error = err.message;
    }
  } finally {
    if (!ctrl.signal.aborted) {
      state.loading = false;
      renderResults();
    }
  }
}

/* ── routing ───────────────────────────────────────────────────────────── */
function parseHash() {
  let h = location.hash.replace(/^#\/?/, '');
  if (!h) {
    if (/^\/admin(?:\/|$)/.test(location.pathname)) h = `admin/${location.pathname.replace(/^\/admin\/?/, '')}`;
    else h = location.pathname.replace(/^\/eventi\/?/, '');
  }
  const [pathPart, queryPart] = h.split('?');
  const seg = pathPart.split('/').filter(Boolean);
  const qp = new URLSearchParams(queryPart || '');
  const route = {
    name: seg[0] || 'list',
    args: seg.slice(1),
    qp,
  };
  if (route.name === 'cerca') route.name = 'list';
  return route;
}

function setPrivateRouteMeta(isPrivate) {
  let robots = document.querySelector('meta[name="robots"]');
  if (isPrivate) {
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.append(robots);
    }
    robots.content = 'noindex, nofollow';
    document.title = 'Area operatori | Benvenuti in Salento';
  } else {
    robots?.remove();
  }
}

function navigate(hash) { location.hash = hash; }

window.addEventListener('hashchange', () => { state.view = 'route'; render(); });

/* ── render ────────────────────────────────────────────────────────────── */
function render() {
  // guardia anti-rientro: se render è già in esecuzione, non riparte.
  // Rende strutturalmente impossibile qualsiasi loop di rendering.
  if (state._rendering) return;
  state._rendering = true;
  try {
    const route = parseHash();
    if (route.name !== 'evento') clearEventJsonLd();
    setPrivateRouteMeta(route.name === 'admin' || route.name === 'copertura');

    switch (route.name) {
      case '': case 'list': renderList(route); break;
      case 'evento': renderDetail(route); break;
      case 'comune': renderComune(route); break;
      case 'categoria': renderCategoria(route); break;
      case 'copertura': renderAdmin('coverage'); break;
      case 'segnala': renderSubmit(); break;
      case 'admin': renderAdmin(); break;
      default: renderList({ name: 'list', args: [], qp: new URLSearchParams() });
    }
  } finally {
    state._rendering = false;
  }
}

// gestione errori globale: mai una pagina bianca o bloccata silenziosamente
window.addEventListener('error', (e) => {
  console.error('Errore globale:', e.message);
  const el = document.getElementById('results') || document.getElementById('app');
  if (el && !el.querySelector('.alert')) {
    el.insertAdjacentHTML('afterbegin', `<div class="container"><div class="alert err" role="alert"><strong>Si è verificato un errore:</strong> ${esc(e.message)}. <button class="btn secondary small" onclick="location.reload()">Ricarica</button></div></div>`);
  }
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Promessa non gestita:', e.reason);
});

/* ── lista ─────────────────────────────────────────────────────────────── */
async function ensureTaxonomy() {
  if (state.categories.length) return;
  if (state._taxLoading) return state._taxPromise;
  state._taxLoading = true;
  state._taxPromise = (async () => {
    try {
      const [cat, mun, loc] = await Promise.all([
        api('/categories'),
        api('/municipalities'),
        api('/localities'),
      ]);
      state.categories = cat.categories || [];
      state.audiences = cat.audiences || [];
      state.municipalities = mun.municipalities || [];
      state.localities = loc.localities || [];
    } catch { /* filtri comunque disponibili in modo degradato */ }
  })();
  try { await state._taxPromise; } finally { state._taxLoading = false; }
}

async function renderList(route) {
  const qp = route.qp;
  const prev = state.params;
  const hasSearchFilter = ['q', 'municipality', 'locality', 'categories', 'audiences', 'free']
    .some((key) => qp.has(key));
  state.params = {
    q: qp.get('q') || '',
    municipality: qp.get('municipality') || '',
    locality: qp.get('locality') || '',
    // La home apre su Oggi; una ricerca o un filtro territoriale senza una
    // finestra esplicita deve invece cercare in tutti gli eventi futuri.
    preset: qp.get('preset') || (hasSearchFilter ? '' : 'today'),
    date: qp.get('date') || '',
    categories: qp.get('categories') ? qp.get('categories').split(',') : [],
    audiences: qp.get('audiences') ? qp.get('audiences').split(',') : [],
    free: qp.get('free') === 'true',
    page: parseInt(qp.get('page') || '1', 10) || 1,
    radius: qp.get('radius') || '20',
  };
  const initial = JSON.stringify(prev) !== JSON.stringify(state.params) || !state.results;
  try { await ensureTaxonomy(); } catch { /* la lista funziona anche senza tassonomia */ }

  $app.innerHTML = `
    <section class="hero">
      <div class="container">
        <h1>Che facciamo <em>stasera</em>?</h1>
        <p class="sub">Sagre, feste patronali, concerti e appuntamenti nel Salento. Ogni scheda mostra la fonte consultabile.</p>
        <div class="hero-badges"><span>Servizio gratuito</span><span>Nessuna registrazione</span><span>Posizione non obbligatoria</span><span>Fonti sempre visibili</span></div>
      </div>
    </section>
    <div class="container">
      <div class="search-panel">
        <form id="search-form" class="search-row" role="search">
          <div class="field" style="grid-column:1">
            <label for="q">Cosa cerchi?</label>
            <input id="q" name="q" type="search" autocomplete="off" placeholder="es. sagra del polpo, pizzica, birra…" value="${esc(state.params.q)}" />
          </div>
          <div class="field">
            <label for="municipality">Dove?</label>
            <select id="municipality" name="municipality">
              <option value="">Tutto il Salento</option>
              ${state.municipalities.map((m) => `<option value="${esc(m.slug)}" ${state.params.municipality === m.slug ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="locality">Frazione o marina</label>
            <select id="locality" name="locality">
              <option value="">Tutte le località</option>
              ${state.localities.map((l) => `<option value="${esc(l.slug)}" ${state.params.locality === l.slug ? 'selected' : ''}>${esc(l.name)} · ${esc(l.municipality?.name || '')}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="date">Quando?</label>
            <input id="date" name="date" type="date" value="${esc(state.params.date || '')}" />
          </div>
          <div class="search-actions">
            <button class="btn" type="submit">Cerca</button>
            <button class="btn secondary" type="button" id="btn-geo" aria-label="Usa la mia posizione (facoltativo)">⌖ Posizione</button>
            <div class="field" style="min-width:110px">
              <label for="radius">Raggio</label>
              <select id="radius" name="radius" ${state.position ? '' : 'disabled'}>
                <option value="5" ${state.radius === '5' ? 'selected' : ''}>5 km</option>
                <option value="10" ${state.radius === '10' ? 'selected' : ''}>10 km</option>
                <option value="20" ${state.radius === '20' ? 'selected' : ''}>20 km</option>
                <option value="30" ${state.radius === '30' ? 'selected' : ''}>30 km</option>
                <option value="50" ${state.radius === '50' ? 'selected' : ''}>50 km</option>
              </select>
            </div>
          </div>
        </form>
        <div class="presets" role="group" aria-label="Quando">
          ${PRESETS.map((p) => `<button class="preset" data-preset="${p.id}" aria-pressed="${state.params.preset === p.id}">${p.label}${p.id === 'weekend' ? ' <small title="' + WEEKEND_NOTE + '">ⓘ</small>' : ''}</button>`).join('')}
        </div>
        <div class="chips" role="group" aria-label="Categorie">
          <button class="chip chip-free" data-cat="free" aria-pressed="${state.params.free}">Gratis</button>
          <button class="chip" data-cat="famiglie-e-bambini" aria-pressed="${state.params.audiences.includes('famiglie-e-bambini')}">Per famiglie</button>
          ${state.categories.slice(0, 8).map((c) => `<button class="chip" data-cat="${esc(c.slug)}" aria-pressed="${state.params.categories.includes(c.slug)}">${esc(c.name)}</button>`).join('')}
          <details class="chip-more" style="position:relative"><summary style="cursor:pointer;padding:6px 8px">Altre…</summary>
            <div style="position:absolute;right:0;background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px;display:grid;gap:6px;width:220px;z-index:20;box-shadow:var(--shadow)">
              ${state.categories.slice(8).map((c) => `<label style="font-size:.85rem"><input type="checkbox" value="${esc(c.slug)}" ${state.params.categories.includes(c.slug) ? 'checked' : ''} /> ${esc(c.name)}</label>`).join('')}
            </div>
          </details>
        </div>
        <div class="small muted" style="margin-top:8px">${WEEKEND_NOTE} · La distanza richiede il consenso alla geolocalizzazione.</div>
      </div>

      ${state.fallback ? `<div class="alert warn" role="alert">⚠️ <strong>Dati di emergenza:</strong> l'API non è raggiungibile. Stai vedendo una copia di sicurezza generata automaticamente il ${esc(fmtDate(state.results.generated_at))}. I dati potrebbero non essere aggiornati e verranno sostituiti appena il servizio torna attivo. <a href="${location.hash}">Riprova</a></div>` : ''}
      ${state.error ? `<div class="alert err" role="alert">Errore: ${esc(state.error)}. <button class="btn secondary small" onclick="location.reload()">Riprova</button></div>` : ''}

      <div class="results-head">
        <h2>${resultsTitle()}</h2>
        <span class="results-meta" id="results-meta" aria-live="polite"></span>
      </div>
      <div id="results"></div>
    </div>`;

  bindListEvents();
  if (initial) await searchEvents();
  renderResults();
}

function resultsTitle() {
  const p = state.params;
  if (p.preset === 'today') return `Succede oggi`;
  if (p.preset === 'tonight') return `In programma stasera`;
  if (p.preset === 'tomorrow') return `Succede domani`;
  if (p.preset === 'weekend') return `Nel weekend`;
  if (p.preset === 'next7') return `Prossimi 7 giorni`;
  if (p.date) return `Eventi del ${fmtDate(p.date)}`;
  return 'Eventi in programma';
}

function bindListEvents() {
  const form = document.getElementById('search-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const qp = new URLSearchParams();
    const q = fd.get('q')?.trim();
    if (q) qp.set('q', q);
    const m = fd.get('municipality');
    if (m) qp.set('municipality', m);
    const locality = fd.get('locality');
    if (locality) qp.set('locality', locality);
    const d = fd.get('date');
    if (d) qp.set('date', d);
    if (!d && !state.params.preset) qp.set('preset', 'today');
    navigate('#/?' + qp.toString());
  });
  document.querySelectorAll('.preset').forEach((b) => b.addEventListener('click', () => {
    const qp = new URLSearchParams();
    qp.set('preset', b.dataset.preset);
    navigate('#/?' + qp.toString());
  }));
  document.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => {
    const qp = new URLSearchParams(location.hash.split('?')[1] || '');
    const slug = b.dataset.cat;
    if (slug === 'free') {
      const cur = qp.get('free') === 'true';
      cur ? qp.delete('free') : qp.set('free', 'true');
    } else if (slug === 'famiglie-e-bambini') {
      const list = (qp.get('audiences') || '').split(',').filter(Boolean);
      const i = list.indexOf(slug);
      i >= 0 ? list.splice(i, 1) : list.push(slug);
      list.length ? qp.set('audiences', list.join(',')) : qp.delete('audiences');
    } else {
      const list = (qp.get('categories') || '').split(',').filter(Boolean);
      const i = list.indexOf(slug);
      i >= 0 ? list.splice(i, 1) : list.push(slug);
      list.length ? qp.set('categories', list.join(',')) : qp.delete('categories');
    }
    navigate('#/?' + qp.toString());
  }));
  document.getElementById('btn-geo')?.addEventListener('click', () => askPosition());
  document.getElementById('radius')?.addEventListener('change', (e) => {
    state.radius = e.target.value;
    if (state.position) navigate('#/?' + new URLSearchParams(location.hash.split('?')[1] || '').toString());
  });
  document.querySelectorAll('.chip-more input').forEach((c) => c.addEventListener('change', () => {
    const qp = new URLSearchParams(location.hash.split('?')[1] || '');
    const list = Array.from(document.querySelectorAll('.chip-more input:checked')).map((x) => x.value)
      .concat(state.params.categories.filter((s) => !Array.from(document.querySelectorAll('.chip-more input')).some((x) => x.value === s)));
    list.length ? qp.set('categories', list.join(',')) : qp.delete('categories');
    navigate('#/?' + qp.toString());
  }));
}

function renderResults() {
  const el = document.getElementById('results');
  const meta = document.getElementById('results-meta');
  if (!el) return;
  if (state.loading) { if (meta) meta.textContent = 'Aggiornamento…'; el.innerHTML = '<div class="state"><div class="spinner" role="status" aria-label="Caricamento"></div>Caricamento eventi…</div>'; return; }
  if (state.error) { if (meta) meta.textContent = ''; el.innerHTML = `<div class="state">${esc(state.error)}</div>`; return; }
  if (!state.results) { if (meta) meta.textContent = ''; el.innerHTML = ''; return; }
  const events = state.results.events || [];
  if (meta) meta.textContent = resultsCounterText(state.results, (date) => fmtDate(date, { hour: '2-digit', minute: '2-digit' }));
  if (!events.length) {
    el.innerHTML = `<div class="state"><div class="big">🌊</div><h2>Nessun evento trovato</h2><p>Prova a cambiare data, Comune o a rimuovere qualche filtro.</p><a class="btn" href="#/">Azzera filtri</a></div>`;
    return;
  }
  el.innerHTML = events.map(cardHtml).join('') + paginationHtml();
  bindCardActions();
}

function cardHtml(ev) {
  const dp = dayParts(ev.first_start_at || ev.event_occurrences?.[0]?.start_at || new Date().toISOString());
  const cats = ev.category_slugs || [];
  const when = formatWhen(ev);
  const saved = state.saved.has(ev.id);
  const cancelled = ev.status === 'cancelled' || ev.status === 'postponed';
  const statusBadge = ev.status === 'cancelled' ? '<span class="badge cancelled">Annullato</span>'
    : ev.status === 'postponed' ? '<span class="badge postponed">Rinviato</span>' : '';
  const ongoing = ongoingTodayLabel(ev, state.params.preset, new Date(), (date) => fmtDate(date));
  const verifMap = { official: 'Fonte ufficiale', institutional: 'Fonte istituzionale', confirmed: 'Confermato', secondary: 'Da verificare', unverified: 'Non verificato', conflicting: 'In conflitto' };
  return `
  <article class="card" data-id="${esc(ev.id)}">
    <div class="card-top">
      <div class="card-day" aria-hidden="true"><div class="d">${dp.d}</div><div class="m">${dp.m}</div></div>
      <div style="flex:1;min-width:0">
        <div class="badges">
          ${cats.slice(0, 3).map((c) => `<span class="badge cat-${esc(c)}">${esc(catLabel(c))}</span>`).join('')}
          ${ev.is_free ? '<span class="badge free">Gratis</span>' : ''}
          ${ev.audience_slugs?.includes('famiglie-e-bambini') ? '<span class="badge">👨‍👩‍👧 Famiglie</span>' : ''}
          ${ongoing ? `<span class="badge ongoing">${esc(ongoing)}</span>` : ''}
          ${statusBadge}
        </div>
        <h3><a href="#/evento/${esc(ev.slug)}">${esc(ev.title)}</a></h3>
        <div class="when">${esc(when)}</div>
        <div class="where">📍 ${esc(ev.municipality_name)}${ev.locality_name ? ' · ' + esc(ev.locality_name) : ''}${ev.venue ? ' · ' + esc(ev.venue) : ''}
          ${ev.distance_km != null ? `<span class="distance">· a ~${ev.distance_km} km${['exact', 'address'].includes(ev.location_accuracy) ? '' : ' (approssimativa)'}</span>` : ''}</div>
      </div>
      <button class="btn secondary small fav" data-id="${esc(ev.id)}" aria-pressed="${saved}" aria-label="${saved ? 'Rimuovi dai salvati' : 'Salva evento'}">${saved ? '★' : '☆'}</button>
    </div>
    ${ev.short_description ? `<div class="desc"><p>${esc(ev.short_description)}</p></div>` : ''}
    <div class="source">
      <span class="verif ${esc(ev.verification_level)}">${esc(verifMap[ev.verification_level] || ev.verification_level)}</span>
      Fonte: <a href="${esc(ev.source_url)}" target="_blank" rel="noopener noreferrer nofollow">${esc(ev.source_name)}</a>
      · ultimo controllo ${esc(fmtDate(ev.last_checked_at, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }))}
    </div>
    <div class="card-actions">
      <a class="btn secondary small" target="_blank" rel="noopener" href="${mapsUrl(ev)}">Indicazioni</a>
      <button class="btn secondary small ics" data-ev-id="${esc(ev.id)}">Calendario</button>
      <button class="btn secondary small share" data-ev-id="${esc(ev.id)}">Condividi</button>
      <a class="btn secondary small" href="#/segnala?evento=${esc(ev.slug)}">Segnala errore</a>
    </div>
  </article>`;
}

function catLabel(slug) {
  const c = state.categories.find((x) => x.slug === slug);
  return c ? c.name : slug;
}

function mapsUrl(ev) {
  const q = [ev.venue, ev.address, ev.locality_name, ev.municipality_name].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || ev.municipality_name)}`;
}

function paginationHtml() {
  const { page, pages, total } = state.results.pagination;
  if (pages <= 1) return '';
  return `<nav class="pagination" aria-label="Paginazione">
    ${page > 1 ? `<a class="btn secondary small" href="#/?${withPage(page - 1)}">← Precedente</a>` : ''}
    <span class="muted" style="align-self:center;padding:0 10px">Pagina ${page} di ${pages} (${total} eventi)</span>
    ${page < pages ? `<a class="btn secondary small" href="#/?${withPage(page + 1)}">Successiva →</a>` : ''}
  </nav>`;
}
function withPage(p) {
  const qp = new URLSearchParams(location.hash.split('?')[1] || '');
  qp.set('page', String(p));
  return qp.toString();
}

function bindCardActions() {
  document.querySelectorAll('.fav').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.id;
    state.saved.has(id) ? state.saved.delete(id) : state.saved.add(id);
    store.set('es_saved', JSON.stringify([...state.saved]));
    renderResults();
  }));
  document.querySelectorAll('.ics').forEach((b) => b.addEventListener('click', () => {
    const ev = state.results.events.find((e) => e.id === b.dataset.evId);
    if (ev) downloadIcs(ev);
  }));
  document.querySelectorAll('.share').forEach((b) => b.addEventListener('click', () => {
    const ev = state.results.events.find((e) => e.id === b.dataset.evId);
    if (!ev) return;
    const url = location.origin + location.pathname + `#/evento/${ev.slug}`;
    const text = `${ev.title} — ${formatWhen(ev)} — ${ev.municipality_name}`;
    if (navigator.share) navigator.share({ title: ev.title, text, url }).catch(() => {});
    else {
      navigator.clipboard?.writeText(url).then(() => alert('Link copiato negli appunti')).catch(() => {});
    }
  }));
}

/* ── ICS ──────────────────────────────────────────────────────────────── */
function icsDt(d) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(d));
  const get = (t) => p.find((x) => x.type === t).value;
  const hh = get('hour') === '24' ? '00' : get('hour');
  return `${get('year')}${get('month')}${get('day')}T${hh}${get('minute')}00`;
}

function icsDate(d) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(d));
  const get = (t) => p.find((x) => x.type === t).value;
  return `${get('year')}${get('month')}${get('day')}`;
}

function downloadIcs(ev) {
  const occs = (ev.event_occurrences || []).slice(0, 30);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//EventiSalento//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Eventi Salento'];
  occs.forEach((o, i) => {
    const unknownTime = o.all_day || o.schedule_text === 'Orario non indicato';
    const timing = unknownTime
      ? [`DTSTART;VALUE=DATE:${icsDate(o.start_at)}`]
      : [`DTSTART:${icsDt(o.start_at)}`, ...(o.end_at ? [`DTEND:${icsDt(o.end_at)}`] : [])];
    lines.push('BEGIN:VEVENT', `UID:${ev.id}-${i}@eventisalento`, `DTSTAMP:${icsDt(new Date())}`, ...timing,
      `SUMMARY:${ev.title}`, `LOCATION:${[ev.venue, ev.locality_name, ev.municipality_name].filter(Boolean).join(', ')}`,
      `DESCRIPTION:${(ev.short_description || '').slice(0, 100)} — Fonte: ${ev.source_url}`, 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${slugFromTitle(ev.title)}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── geolocalizzazione con consenso ────────────────────────────────────── */
function askPosition() {
  if (!('geolocation' in navigator)) { alert('Geolocalizzazione non disponibile su questo dispositivo.'); return; }
  const ok = confirm('Vuoi usare la tua posizione per vedere gli eventi vicini? La posizione viene usata solo per la ricerca e non viene salvata.');
  if (!ok) return;
  navigator.geolocation.getCurrentPosition((pos) => {
    state.position = { lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) };
    const qp = new URLSearchParams(location.hash.split('?')[1] || '');
    qp.set('radius', state.radius || '20');
    navigate('#/?' + qp.toString());
    render();
  }, () => { alert('Posizione non disponibile. Puoi comunque cercare per Comune.'); }, { enableHighAccuracy: false, timeout: 8000 });
}

/* ── dettaglio evento ─────────────────────────────────────────────────── */
async function renderDetail(route) {
  const slug = route.args[0];
  $app.innerHTML = '<div class="container"><div class="state"><div class="spinner" role="status"></div>Caricamento evento…</div></div>';
  try {
    const { event: rawEvent } = await api(`/events/${encodeURIComponent(slug)}`);
    const cleanTitle = cleanPublicEventTitle(rawEvent);
    if (!cleanTitle) throw new Error('Evento non disponibile: titolo sorgente non valido');
    const ev = {
      ...rawEvent,
      title: cleanTitle,
      short_description: cleanPublicDescription(rawEvent.short_description) || null,
      description: cleanPublicDescription(rawEvent.description) || null,
    };
    ev.category_slugs = refinePublicCategories(ev);
    const occs = ev.event_occurrences || [];
    setEventJsonLd(ev, occs);
    const catLabels = (ev.category_slugs || []).map((c) => catLabel(c));
    $app.innerHTML = `
    <div class="container">
      <nav aria-label="Breadcrumb" style="margin:14px 0"><a href="#/">Eventi</a> › <span>${esc(ev.municipality_name)}</span> › <span aria-current="page">${esc(ev.title)}</span></nav>
      <article class="detail-hero">
        <div class="badges">${catLabels.map((c) => `<span class="badge">${esc(c)}</span>`).join('')}${ev.is_free ? '<span class="badge free">Gratis</span>' : ''}</div>
        <h1>${esc(ev.title)}</h1>
        ${ev.subtitle ? `<p class="sub" style="margin:4px 0">${esc(ev.subtitle)}</p>` : ''}
        <p class="muted">📍 ${esc(ev.municipality_name)}${ev.locality_name ? ' · ' + esc(ev.locality_name) : ''}${ev.venue ? ' · ' + esc(ev.venue) : ''}${ev.distance_km != null ? ` · a ~${ev.distance_km} km da te` : ''}</p>
        ${ev.address ? `<p class="muted">${esc(ev.address)}</p>` : ''}
        ${ev.price_text ? `<p class="small"><strong>Prezzo:</strong> ${esc(ev.price_text)}</p>` : ''}
        ${ev.organizer ? `<p class="small"><strong>Organizzatore:</strong> ${esc(ev.organizer)}</p>` : ''}
        ${ev.booking_text ? `<p class="small"><strong>Prenotazione:</strong> ${esc(ev.booking_text)}</p>` : ''}
        ${ev.contact_text ? `<p class="small"><strong>Contatti:</strong> ${esc(ev.contact_text)}</p>` : ''}
        <div class="source" style="margin-top:10px">
          <span class="verif ${esc(ev.verification_level)}">${esc(ev.verification_level)}</span>
          <strong>Fonte:</strong> <a href="${esc(ev.source_url)}" target="_blank" rel="noopener noreferrer nofollow">${esc(ev.source_name)}</a>
          · ultimo controllo ${esc(fmtDate(ev.last_checked_at, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }))}
          · prima scoperta ${esc(fmtDate(ev.first_discovered_at))}
        </div>
      </article>
      <div class="detail-grid">
        <div class="detail-box">
          <h2>Quando</h2>
          ${occs.length ? occs.map((o) => `<div class="occ-row ${esc(o.status)}"><span class="date">${esc(fmtDate(o.start_at, { weekday: 'long' }))}</span> — <span class="time">${o.all_day ? 'tutto il giorno' : o.schedule_text === 'Orario non indicato' ? 'orario non indicato' : 'dalle ' + esc(fmtTime(o.start_at)) + (o.end_at ? ' alle ' + esc(fmtTime(o.end_at)) : '')}${o.schedule_text && o.schedule_text !== 'Orario non indicato' ? ' · ' + esc(o.schedule_text) : ''}</span></div>`).join('') : '<p class="muted">Date in aggiornamento — consulta la fonte.</p>'}
        </div>
        <div>
          <div class="detail-box">
            <h2>Informazioni</h2>
            <p>${esc(ev.description || ev.short_description || 'Descrizione non disponibile: apri la fonte indicata.')}</p>
            ${ev.accessibility_notes ? `<p class="small"><strong>Accessibilità:</strong> ${esc(ev.accessibility_notes)}</p>` : ''}
            <div class="card-actions">
              <a class="btn small" target="_blank" rel="noopener" href="${mapsUrl(ev)}">Indicazioni</a>
              <button class="btn secondary small" id="ics-detail">Calendario</button>
              <button class="btn secondary small" id="share-detail">Condividi</button>
              <button class="btn secondary small" id="fav-detail" aria-pressed="${state.saved.has(ev.id)}">${state.saved.has(ev.id) ? '★ Salvato' : '☆ Salva'}</button>
            </div>
          </div>
          <div class="detail-box">
            <h2>Fonte</h2>
            <p class="small">Questo evento è stato censito da <a href="${esc(ev.source_url)}" target="_blank" rel="noopener noreferrer nofollow">${esc(ev.source_name)}</a>. Verifica sempre programma e orari sulla fonte prima di partire.</p>
            <p class="small muted">Livello di verifica: ${esc(ev.verification_level)} · Confidenza: ${ev.confidence_score != null ? (ev.confidence_score * 100).toFixed(0) + '%' : 'n/d'}</p>
            <p class="small muted">Localizzazione: ${esc(ev.location_accuracy)}</p>
          </div>
        </div>
      </div>
    </div>`;
    document.getElementById('ics-detail')?.addEventListener('click', () => downloadIcs({ ...ev, event_occurrences: occs }));
    document.getElementById('share-detail')?.addEventListener('click', () => {
      const url = location.origin + location.pathname + `#/evento/${ev.slug}`;
      if (navigator.share) navigator.share({ title: ev.title, text: `${ev.title} — ${ev.municipality_name}`, url }).catch(() => {});
      else navigator.clipboard?.writeText(url).then(() => alert('Link copiato'));
    });
    document.getElementById('fav-detail')?.addEventListener('click', () => {
      state.saved.has(ev.id) ? state.saved.delete(ev.id) : state.saved.add(ev.id);
      store.set('es_saved', JSON.stringify([...state.saved]));
      document.getElementById('fav-detail').textContent = state.saved.has(ev.id) ? '★ Salvato' : '☆ Salva';
    });
  } catch (err) {
    $app.innerHTML = `<div class="container"><div class="alert err" role="alert">${esc(err.message)}. <a href="#/">Torna alla lista</a></div></div>`;
  }
}

/* ── Comune / categoria ───────────────────────────────────────────────── */
async function renderComune(route) {
  const slug = route.args[0];
  $app.innerHTML = `<div class="container"><div class="state"><div class="spinner" role="status"></div></div></div>`;
  const mun = state.municipalities.find((m) => m.slug === slug) || (await api('/municipalities')).municipalities.find((m) => m.slug === slug);
  if (!mun) { $app.innerHTML = '<div class="container"><div class="alert err">Comune non trovato.</div></div>'; return; }
  navigate(`#/?municipality=${slug}&preset=next7`);
}

async function renderCategoria(route) {
  const slug = route.args[0];
  navigate(`#/?categories=${slug}&preset=next7`);
}

/* ── segnala evento ───────────────────────────────────────────────────── */
function renderSubmit() {
  const qp = parseHash().qp;
  const eventoPrefill = qp.get('evento') || '';
  $app.innerHTML = `
  <div class="container" style="max-width:720px">
    <h1>Segnala un evento</h1>
    <p class="muted">Conosci un evento che non è nel nostro calendario? Segnalalo: entra in coda di revisione e verrà verificato prima della pubblicazione. Non pubblichiamo segnalazioni non verificate.</p>
    <form id="submit-form" class="form-grid" novalidate>
      <div class="field"><label for="s-event_title">Nome evento *</label><input id="s-event_title" name="event_title" required minlength="3" /></div>
      <div class="form-grid two">
        <div class="field"><label for="s-municipality_name">Comune *</label><input id="s-municipality_name" name="municipality_name" list="mun-list" required /><datalist id="mun-list">${state.municipalities.map((m) => `<option value="${esc(m.name)}">`).join('')}</datalist></div>
        <div class="field"><label for="s-locality_name">Frazione / marina / località</label><input id="s-locality_name" name="locality_name" /></div>
      </div>
      <div class="form-grid two">
        <div class="field"><label for="s-date_text">Data (anche testo libero, es. "15-17 agosto") *</label><input id="s-date_text" name="date_text" required placeholder="es. 15 agosto 2026" /></div>
        <div class="field"><label for="s-time_text">Orario</label><input id="s-time_text" name="time_text" placeholder="es. dalle 20:30" /></div>
      </div>
      <div class="field"><label for="s-venue">Luogo</label><input id="s-venue" name="venue" placeholder="es. Piazza del Popolo" /></div>
      <div class="field"><label for="s-description">Descrizione</label><textarea id="s-description" name="description" rows="3"></textarea></div>
      <div class="form-grid two">
        <div class="field"><label for="s-organizer">Organizzatore</label><input id="s-organizer" name="organizer" /></div>
        <div class="field"><label for="s-contact_email">Email di contatto</label><input id="s-contact_email" name="contact_email" type="email" /></div>
      </div>
      <div class="field"><label for="s-source_url">Link alla fonte (pagina, locandina, post)</label><input id="s-source_url" name="source_url" type="url" placeholder="https://…" /></div>
      <div class="field" hidden aria-hidden="true"><label for="s-website">Non compilare</label><input id="s-website" name="website" tabindex="-1" autocomplete="off" /></div>
      <button class="btn" type="submit">Invia segnalazione</button>
      <p class="form-note">* campi obbligatori. La segnalazione viene esaminata da un revisore: potremmo contattarti per conferma.</p>
      <div id="submit-result"></div>
    </form>
  </div>`;
  if (eventoPrefill) {
    document.getElementById('s-event_title').value = eventoPrefill;
  }
  document.getElementById('submit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {};
    for (const [k, v] of fd.entries()) if (String(v).trim()) payload[k] = String(v).trim();
    const res = document.getElementById('submit-result');
    res.innerHTML = '<div class="state"><div class="spinner" role="status"></div>Invio…</div>';
    try {
      const r = await api('/submit', { method: 'POST', body: JSON.stringify(payload) });
      res.innerHTML = `<div class="alert ok" style="background:#e8f5ec;border-color:#bfe3c9;color:#1b6b3a" role="status"><strong>Grazie!</strong> Segnalazione ricevuta (codice ${esc(r.id.slice(0, 8))}). Verrà verificata prima della pubblicazione.</div>`;
      e.target.reset();
    } catch (err) {
      res.innerHTML = `<div class="alert err" role="alert">${esc(err.message)}</div>`;
    }
  });
}

/* ── admin ────────────────────────────────────────────────────────────── */
const ADMIN_VIEWS = ['queue', 'sources', 'duplicates', 'submissions', 'coverage', 'audit'];
let adminState = { user: null, roles: [], view: 'queue', items: [] };

async function renderAdmin(requestedView = '') {
  const route = parseHash();
  const view = requestedView || route.args[0] || 'queue';
  $app.innerHTML = `
  <div class="container" style="max-width:1000px">
    <h1>Backoffice</h1>
    <div id="admin-body"><div class="state"><div class="spinner" role="status"></div></div></div>
  </div>`;
  await adminBoot(view);
}

async function adminBoot(view) {
  const body = document.getElementById('admin-body');
  try {
    const token = store.get('es_admin_token');
    if (!token) { renderAdminLogin(body); return; }
    const me = await api('/admin/me', { headers: { Authorization: `Bearer ${token}` } });
    adminState.user = me.user; adminState.roles = me.roles;
    renderAdminShell(body, view);
  } catch {
    store.set('es_admin_token', '');
    renderAdminLogin(body);
  }
}

function renderAdminLogin(body) {
  body.innerHTML = `
  <div class="card" style="max-width:420px;margin:0 auto">
    <h2>Accesso operatori</h2>
    <p class="muted small">L'accesso è riservato agli operatori autorizzati del portale. Usa l'email e la password configurate su Supabase Auth.</p>
    <form id="login-form" class="form-grid">
      <div class="field"><label for="a-email">Email</label><input id="a-email" type="email" required autocomplete="username" /></div>
      <div class="field"><label for="a-password">Password</label><input id="a-password" type="password" required autocomplete="current-password" /></div>
      <button class="btn" type="submit">Accedi</button>
      <div id="login-error"></div>
    </form>
  </div>`;
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('a-email').value;
    const password = document.getElementById('a-password').value;
    const errEl = document.getElementById('login-error');
    try {
      // login server-side: il frontend non conosce mai le credenziali Supabase
      const { token, user, roles } = await api('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      store.set('es_admin_token', token);
      adminState.user = user; adminState.roles = roles;
      location.hash = '#/admin/queue';
      location.reload();
    } catch (err) { errEl.innerHTML = `<div class="alert err" role="alert">${esc(err.message)}</div>`; }
  });
}

function renderAdminShell(body, view) {
  body.innerHTML = `
  <nav class="admin-nav" aria-label="Backoffice">
    ${ADMIN_VIEWS.map((v) => `<a href="#/admin/${v}" aria-current="${v === view ? 'page' : ''}">${v}</a>`).join('')}
    <span class="muted small" style="align-self:center">${esc(adminState.user?.email || '')} · ${adminState.roles.join(', ')}</span>
    <button class="btn secondary small" id="logout">Esci</button>
  </nav>
  <div id="admin-view"></div>`;
  document.getElementById('logout').addEventListener('click', () => { store.set('es_admin_token', ''); location.hash = '#/admin'; location.reload(); });
  adminLoadView(view);
}

async function adminLoadView(view) {
  const el = document.getElementById('admin-view');
  const token = store.get('es_admin_token');
  el.innerHTML = '<div class="state"><div class="spinner" role="status"></div></div>';
  try {
    if (view === 'queue') {
      const d = await api('/admin/queue?status=open', { headers: { Authorization: `Bearer ${token}` } });
      el.innerHTML = `<h2>Coda di revisione (${d.items.length})</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tipo</th><th>Motivo</th><th>Priorità</th><th>Data</th><th>Azioni</th></tr></thead><tbody>${
        d.items.map((i) => `<tr><td>${esc(i.entity_type)}</td><td>${esc(i.reason)}</td><td>${esc(i.priority)}</td><td>${esc(fmtDate(i.created_at, { day: '2-digit', month: '2-digit' }))}</td><td>
        <button class="btn small" data-decide="${i.id}" data-decision="approved">Approva</button>
        <button class="btn secondary small" data-decide="${i.id}" data-decision="rejected">Rifiuta</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Nessuna voce in coda</td></tr>'}</tbody></table></div>`;
      el.querySelectorAll('[data-decide]').forEach((b) => b.addEventListener('click', async () => {
        await api(`/admin/queue/${b.dataset.decide}/decide`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ decision: b.dataset.decision }) });
        adminLoadView('queue');
      }));
    } else if (view === 'sources') {
      const d = await api('/admin/sources?failed=true', { headers: { Authorization: `Bearer ${token}` } });
      el.innerHTML = `<h2>Fonti con errori / da controllare (${d.sources.length})</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Fonte</th><th>Comune</th><th>Errori</th><th>Ultimo successo</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>${
        d.sources.map((s) => `<tr><td>${esc(s.name)}<br><span class="muted small">${esc(s.url)}</span></td><td>${esc(s.municipalities?.name || '—')}</td><td>${s.consecutive_errors}</td><td>${s.last_success_at ? esc(fmtDate(s.last_success_at, { day: '2-digit', month: '2-digit' })) : 'mai'}</td><td>${esc(s.status)}</td><td>
        ${s.status === 'active' ? `<button class="btn secondary small" data-src="${s.id}" data-status="paused">Pausa</button>` : `<button class="btn secondary small" data-src="${s.id}" data-status="active">Attiva</button>`}
        <button class="btn secondary small" data-reparse="${s.id}">Riesegui</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">Nessuna fonte con errori</td></tr>'}</tbody></table></div>`;
      el.querySelectorAll('[data-src]').forEach((b) => b.addEventListener('click', async () => {
        await api(`/admin/sources/${b.dataset.src}/status`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: b.dataset.status }) });
        adminLoadView('sources');
      }));
      el.querySelectorAll('[data-reparse]').forEach((b) => b.addEventListener('click', async () => {
        await api(`/admin/sources/${b.dataset.reparse}/reparse`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        alert('Riesecuzione completata.');
        adminLoadView('sources');
      }));
    } else if (view === 'duplicates') {
      const d = await api('/admin/duplicates', { headers: { Authorization: `Bearer ${token}` } });
      el.innerHTML = `<h2>Duplicati candidati (${d.candidates.length})</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>A</th><th>B</th><th>Similitudine</th><th>Metodo</th><th>Azioni</th></tr></thead><tbody>${
        d.candidates.map((c) => `<tr><td>${esc(c.event_a?.title || c.event_a_id)}</td><td>${esc(c.event_b?.title || c.event_b_id)}</td><td>${(c.similarity * 100).toFixed(0)}%</td><td>${esc(c.method)}</td><td>
        <button class="btn small" data-dup="${c.id}" data-status="confirmed">Conferma</button>
        <button class="btn secondary small" data-dup="${c.id}" data-status="rejected">Falso positivo</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Nessun candidato</td></tr>'}</tbody></table></div>`;
      el.querySelectorAll('[data-dup]').forEach((b) => b.addEventListener('click', async () => {
        await api(`/admin/duplicates/${b.dataset.dup}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: b.dataset.status }) });
        adminLoadView('duplicates');
      }));
    } else if (view === 'submissions') {
      const d = await api('/admin/submissions', { headers: { Authorization: `Bearer ${token}` } });
      el.innerHTML = `<h2>Segnalazioni utenti (${d.submissions.length})</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Evento</th><th>Comune</th><th>Data</th><th>Fonte</th><th>Azioni</th></tr></thead><tbody>${
        d.submissions.map((s) => `<tr><td>${esc(s.event_title)}</td><td>${esc(s.municipality_name)}</td><td>${esc(s.date_text)}</td><td class="small">${s.source_url ? `<a href="${esc(s.source_url)}" target="_blank" rel="noopener">fonte</a>` : '—'}</td><td>
        <button class="btn small" data-sub="${s.id}" data-status="approved">Approva</button>
        <button class="btn secondary small" data-sub="${s.id}" data-status="rejected">Rifiuta</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Nessuna segnalazione</td></tr>'}</tbody></table></div>`;
      el.querySelectorAll('[data-sub]').forEach((b) => b.addEventListener('click', async () => {
        await api(`/admin/submissions/${b.dataset.sub}/decide`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: b.dataset.status }) });
        adminLoadView('submissions');
      }));
    } else if (view === 'coverage') {
      const d = await api('/admin/coverage', { headers: { Authorization: `Bearer ${token}` } });
      el.innerHTML = `<h2>Copertura 96 Comuni</h2><div class="coverage-grid">${d.municipalities.map((m) => `<div class="coverage-card"><strong>${esc(m.municipality_name)}</strong><div><span class="cov-state ${m.coverage_state}">${esc(m.coverage_state)}</span></div><div class="small muted">fonti: ${m.sources_active}/${m.sources_registered} · futuri: ${m.future_events} · 30g: ${m.events_last_30d} · err7g: ${m.errors_7d}</div></div>`).join('')}</div>`;
    } else if (view === 'audit') {
      const d = await api('/admin/audit-log', { headers: { Authorization: `Bearer ${token}` } });
      el.innerHTML = `<h2>Audit log (ultime 200)</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Quando</th><th>Azione</th><th>Entità</th><th>Chi</th></tr></thead><tbody>${
        d.items.map((i) => `<tr><td class="small">${esc(fmtDate(i.created_at, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }))}</td><td>${esc(i.action)}</td><td class="small">${esc(i.entity_type || '')} ${esc((i.entity_id || '').slice(0, 8))}</td><td class="small">${esc((i.actor_id || '').slice(0, 8))}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">Nessun log</td></tr>'}</tbody></table></div>`;
    }
  } catch (err) {
    el.innerHTML = `<div class="alert err" role="alert">${esc(err.message)}</div>`;
  }
}

/* ── avvio ────────────────────────────────────────────────────────────── */
try {
  render();
} catch (err) {
  console.error('Errore di avvio:', err);
  $app.innerHTML = `<div class="container"><div class="alert err" role="alert"><strong>Errore di avvio:</strong> ${esc(err.message || 'imprevisto')}. <button class="btn secondary small" onclick="location.reload()">Ricarica</button></div></div>`;
}
