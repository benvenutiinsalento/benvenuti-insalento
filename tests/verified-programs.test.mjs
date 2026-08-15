import test from 'node:test';
import assert from 'node:assert/strict';
import { listVerifiedEvents, verifiedEvents, loadVerifiedPrograms } from '../netlify/functions/_shared/verified-programs.mjs';
import { MUNICIPALITIES } from '../netlify/functions/_shared/registry.mjs';

test('ogni programma verificato conserva una fonte HTTPS specifica', () => {
  loadVerifiedPrograms().programs.forEach((program) => assert.match(program.url, /^https:\/\//));
});

test('l’archivio redazionale resta interrogabile per data, Comune e testo', () => {
  const all = verifiedEvents();
  assert.ok(all.length > 0);
  const sample = all.find((event) => event.startDate && event.town && event.title);
  const token = sample.title.split(/\s+/).find((part) => part.length >= 4) || sample.title;
  const result = listVerifiedEvents({ from: sample.startDate, to: sample.startDate, town: sample.town, q: token, pageSize: 100 });
  assert.ok(result.events.some((event) => event.id === sample.id));
});

test('il filtro Comune accetta lo slug usato dall’interfaccia', () => {
  const all = verifiedEvents();
  const sample = all.find((event) => MUNICIPALITIES.some((municipality) => municipality.name === event.town));
  const municipality = MUNICIPALITIES.find((item) => item.name === sample.town);
  const result = listVerifiedEvents({ from: sample.startDate, to: sample.startDate, town: municipality.slug, pageSize: 100 });
  assert.ok(result.events.some((event) => event.id === sample.id));
});

test('la ricerca geografica usa coordinate esplicite e il raggio', () => {
  const sample = verifiedEvents().find((event) => event.latitude != null && event.longitude != null);
  const result = listVerifiedEvents({
    from: sample.startDate,
    to: sample.startDate,
    town: sample.town,
    lat: sample.latitude,
    lng: sample.longitude,
    radius: 1,
    sort: 'distance',
    pageSize: 100,
  });
  const found = result.events.find((event) => event.id === sample.id);
  assert.ok(found);
  assert.equal(found.distanceKm, 0);
});

test('senza consenso alla posizione non viene calcolata una distanza fittizia', () => {
  const data = listVerifiedEvents({ lat: '', lng: '', pageSize: 100 });
  assert.ok(data.events.length > 0);
  assert.ok(data.events.every((event) => event.distanceKm == null));
});
