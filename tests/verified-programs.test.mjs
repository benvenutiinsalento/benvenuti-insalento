import test from 'node:test';
import assert from 'node:assert/strict';
import { listVerifiedEvents, verifiedEvents } from '../netlify/functions/_shared/verified-programs.mjs';
import { loadVerifiedPrograms } from '../netlify/functions/_shared/verified-programs.mjs';

test('ogni programma verificato conserva una fonte HTTPS specifica', () => {
  loadVerifiedPrograms().programs.forEach((program) => assert.match(program.url, /^https:\/\//));
});

test('MEDinFEST compare sia l’8 sia il 9 agosto 2026', () => {
  for (const date of ['2026-08-08', '2026-08-09']) {
    const result = listVerifiedEvents({ from: date, to: date, town: 'Bagnolo del Salento', q: 'medinfest' });
    assert.equal(result.total, 1);
  }
});

test('il filtro Comune accetta anche lo slug usato dall’interfaccia', () => {
  const result = listVerifiedEvents({ from: '2026-08-08', to: '2026-08-08', town: 'bagnolo-del-salento', q: 'medinfest' });
  assert.equal(result.total, 1);
});

test('Sagra dell’Anguria di Botrugno compare solo il 17 agosto', () => {
  assert.equal(listVerifiedEvents({ from: '2026-08-17', to: '2026-08-17', town: 'Botrugno', q: 'anguria' }).total, 1);
  assert.equal(listVerifiedEvents({ from: '2026-08-18', to: '2026-08-18', town: 'Botrugno', q: 'anguria' }).total, 0);
});

test('Alex Britti è ricercabile a Botrugno il 27 agosto', () => {
  const result = listVerifiedEvents({ from: '2026-08-27', to: '2026-08-27', town: 'Botrugno', q: 'alex britti', category: 'Musica e pizzica' });
  assert.equal(result.total, 1);
});

test('Sant’Oronzo a Lecce usa le cinque date confermate dal documento 2026', () => {
  for (const day of [23, 24, 25, 26, 27]) {
    const date = `2026-08-${day}`;
    assert.equal(listVerifiedEvents({ from: date, to: date, town: 'Lecce', q: 'sant oronzo' }).total, 1);
  }
});

test('stasera, filtri combinati e distanza operano sugli eventi verificati', () => {
  const result = listVerifiedEvents({ from: '2026-08-12', to: '2026-08-12', town: 'Botrugno', category: 'Musica e pizzica', q: 'salento block', evening: true, lat: 40.064, lng: 18.325, radius: 5, sort: 'distance' });
  assert.equal(result.total, 1);
  assert.ok(result.events[0].distanceKm < 1);
  assert.ok(verifiedEvents().length >= 34);
});

test('senza consenso alla posizione non viene calcolata una distanza fittizia', () => {
  const data=listVerifiedEvents({from:'2026-08-04',to:'2026-08-10',lat:'',lng:'',pageSize:100});
  assert.ok(data.events.length>0);
  assert.ok(data.events.every(event=>event.distanceKm==null));
});
