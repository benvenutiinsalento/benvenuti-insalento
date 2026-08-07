// Mandato: TUTTO il crawling/scheduling avviene su GitHub Actions.
// Netlify ospita solo frontend + API leggere (niente cron lato Netlify).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const WORKFLOWS = '.github/workflows';

test('esistono i workflow schedulati obbligatori del mandato', () => {
  for (const file of ['ingest-frequent.yml', 'recheck-imminent.yml', 'daily-maintenance.yml', 'weekly-discovery.yml', 'tests.yml']) {
    assert.ok(fs.existsSync(new URL(`../${WORKFLOWS}/${file}`, import.meta.url)), `workflow mancante: ${file}`);
  }
});

test('cadenze del mandato: ingest 6h, ricontrollo 2h, manutenzione+discovery giorn/sett', () => {
  assert.match(read(`${WORKFLOWS}/ingest-frequent.yml`), /\*\/6 \* \* \*/);
  assert.match(read(`${WORKFLOWS}/recheck-imminent.yml`), /\*\/2 \* \* \*/);
  assert.match(read(`${WORKFLOWS}/daily-maintenance.yml`), /cron:/);
  assert.match(read(`${WORKFLOWS}/weekly-discovery.yml`), /\* \* 1/);
});

test('i workflow di crawling possono avviarsi anche manualmente (workflow_dispatch)', () => {
  for (const file of ['ingest-frequent.yml', 'recheck-imminent.yml', 'daily-maintenance.yml', 'weekly-discovery.yml']) {
    assert.match(read(`${WORKFLOWS}/${file}`), /workflow_dispatch/, `dispatch mancante: ${file}`);
  }
});

test('i segreti passano solo via secrets di GitHub, mai in chiaro', () => {
  for (const file of ['ingest-frequent.yml', 'recheck-imminent.yml', 'daily-maintenance.yml', 'weekly-discovery.yml']) {
    const yml = read(`${WORKFLOWS}/${file}`);
    assert.match(yml, /secrets\.SUPABASE_DB_URL/);
    assert.doesNotMatch(yml, /postgresql:\/\/postgres/i, 'URL database in chiaro nel workflow!');
  }
});

test('NESSUNO schedulatore rimane su Netlify: solo API leggere', () => {
  const dir = new URL('../netlify/functions/', import.meta.url);
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith('.mjs')) continue;
    const code = fs.readFileSync(path.join(dir.pathname, entry), 'utf8');
    assert.doesNotMatch(code, /schedule:\s*['"]/, `cron Netlify residuo in ${entry}`);
  }
});
