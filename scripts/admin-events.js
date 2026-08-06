const token = document.querySelector('#token');
const out = document.querySelector('#admin-output');
const wrap = document.querySelector('#admin-table-wrap');

token.value = sessionStorage.getItem('eventsAdminToken') || '';
token.addEventListener('input', () => sessionStorage.setItem('eventsAdminToken', token.value));

const headers = () => ({
  authorization: `Bearer ${token.value}`,
  'content-type': 'application/json',
});

async function call(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
  return data;
}

function renderTable(rows) {
  wrap.replaceChildren();
  if (!rows?.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Nessun dato.';
    wrap.append(empty);
    return;
  }
  const keys = Object.keys(rows[0]).slice(0, 10);
  const scroller = document.createElement('div');
  scroller.style.overflow = 'auto';
  const table = document.createElement('table');
  table.className = 'admin-table';
  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  keys.forEach((key) => {
    const cell = document.createElement('th');
    cell.textContent = key;
    headRow.append(cell);
  });
  head.append(headRow);
  const body = document.createElement('tbody');
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    keys.forEach((key) => {
      const td = document.createElement('td');
      const value = row[key];
      td.textContent = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
      tr.append(td);
    });
    body.append(tr);
  });
  table.append(head, body);
  scroller.append(table);
  wrap.append(scroller);
}

document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', async () => {
  out.textContent = 'Esecuzione…';
  wrap.replaceChildren();
  try {
    let data;
    const action = button.dataset.action;
    if (action === 'status') data = await call('/api/admin/status');
    if (action === 'bootstrap') data = await call('/api/admin/bootstrap', { method: 'POST' });
    if (action === 'ingest') data = await call('/api/admin/trigger', { method: 'POST', body: JSON.stringify({ action: 'ingest', limit: 8 }) });
    if (action === 'coverage') data = await call('/api/admin/trigger', { method: 'POST', body: JSON.stringify({ action: 'coverage' }) });
    if (action === 'review') {
      data = await call('/api/admin/review');
      renderTable(data.items);
    }
    if (action === 'submissions') {
      data = await call('/api/admin/submissions');
      renderTable(data.submissions);
    }
    if (action === 'sources') {
      data = await call('/api/admin/sources');
      renderTable(data.sources);
    }
    out.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    out.textContent = error.message;
  }
}));
