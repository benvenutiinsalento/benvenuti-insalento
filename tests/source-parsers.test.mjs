import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePugliaJson } from '../netlify/functions/_shared/source-parsers.mjs';

const source = { url: 'https://example.org/open-data.json', entityName: 'Regione test', priority: 2, year: 2026 };

test('parser Puglia gestisce campi annidati e date italiane', () => {
  const payload = { result: { records: [{
    'Nome Evento': 'Festa reale di prova',
    periodo: { 'Data Inizio': '02/08/2026', 'Data Fine': '03/08/2026' },
    localizzazione: { Comune: 'Lecce', Luogo: 'Piazza Test', Indirizzo: 'Via Test 1' },
    Descrizione: 'Evento ufficiale',
    Prezzo: 'Ingresso gratuito',
    URL: 'https://example.org/evento',
  }] } };
  const events = parsePugliaJson(payload, source);
  assert.equal(events.length, 1);
  assert.equal(events[0].title, 'Festa reale di prova');
  assert.equal(events[0].startDate, '2026-08-02');
  assert.equal(events[0].endDate, '2026-08-03');
  assert.equal(events[0].town, 'Lecce');
  assert.equal(events[0].priceType, 'free');
});

test('parser Puglia individua un array non standard', () => {
  const payload = { meta: { version: 2 }, contenuto: { elencoManifestazioni: [{
    titolo: 'Concerto verificabile',
    dataEvento: '2026-08-05T21:00:00+02:00',
    comuneEvento: 'Otranto',
    luogo: 'Castello',
  }] } };
  const events = parsePugliaJson(payload, source);
  assert.equal(events.length, 1);
  assert.equal(events[0].startDate, '2026-08-05');
  assert.equal(events[0].town, 'Otranto');
});

test('parser Puglia non inventa eventi senza data o comune', () => {
  const events = parsePugliaJson([{ titolo: 'Evento incompleto' }], source);
  assert.deepEqual(events, []);
});
