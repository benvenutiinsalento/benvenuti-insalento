import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('eventi.html');
const script = read('scripts/eventi-app.js');
const config = read('netlify.toml');
const home = read('index.html');

test('la sezione Eventi usa identità e navigazione del sito principale', () => {
  assert.match(html, /assets\/images\/benvenuti-in-salento-logo\.png/);
  assert.match(html, /assets\/favicon\.svg/);
  assert.match(html, /class="site-header" data-header/);
  assert.match(html, /class="site-footer"/);
  assert.match(html, /href="\/eventi"[^>]*aria-current="page"/);
  assert.match(home, /href="\/eventi"/);
});

test('routing, asset e API funzionano sotto /eventi senza duplicare i dati', () => {
  assert.match(html, /src="\/scripts\/eventi-app\.js\?v=\d+"/);
  assert.match(html, /href="\/styles\/eventi-app\.css\?v=\d+"/);
  assert.match(config, /from = "\/eventi\/\*"[\s\S]*to = "\/eventi\.html"/);
  assert.match(config, /from = "\/api\/\*"[\s\S]*eventi-salento\.pages\.dev\/api\/:splat/);
  assert.match(config, /from = "\/eventi-fallback\/\*"[\s\S]*eventi-salento\.pages\.dev\/fallback\/:splat/);
  assert.doesNotMatch(html, /iframe/i);
});

test('la ricerca pubblica preserva filtri, località, posizione e fallback', () => {
  for (const token of ['municipality', 'locality', 'categories', 'audiences', 'free', 'preset']) {
    assert.match(script, new RegExp(token));
  }
  assert.match(script, /api\('\/localities'\)/);
  assert.match(script, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(script, /eventi-fallback\/fallback\.json/);
  for (const preset of ['today', 'tonight', 'tomorrow', 'weekend', 'next7']) {
    assert.match(script, new RegExp(`id: '${preset}'`));
  }
});

test('SEO /eventi è canonico e genera structured data Evento dal dato API', () => {
  assert.match(html, /rel="canonical" href="https:\/\/benvenutiinsalento\.it\/eventi"/);
  assert.match(html, /property="og:url" content="https:\/\/benvenutiinsalento\.it\/eventi"/);
  assert.match(html, /"@type":"WebSite"/);
  assert.match(script, /'@type': 'Event'/);
  assert.match(script, /setEventJsonLd\(ev, occs\)/);
});

test('nessun secret amministrativo è incluso nel frontend', () => {
  const publicCode = `${html}\n${script}`;
  assert.doesNotMatch(publicCode, /service_role|SUPABASE_DB_URL|NETLIFY_AUTH_TOKEN|GITHUB_TOKEN/i);
});
