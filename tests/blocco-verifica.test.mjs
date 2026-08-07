// Test funzionali del BLOCCO DI VERIFICA (punto 8): filtri Weekend, Stasera.
import assert from 'node:assert/strict';
import test from 'node:test';
import { isEveningEvent, occursOnWeekend } from '../netlify/functions/_shared/verified-programs.mjs';
import { resolvePreset } from '../netlify/functions/_shared/events-core.mjs';

test('Weekend: venerdì con orario serale è incluso', () => {
  // 2026-08-07 è venerdì
  assert.equal(occursOnWeekend({ startDate: '2026-08-07', endDate: '2026-08-07', startTime: '21:00' }), true);
});

test('Weekend: venerdì mattina è escluso (solo dalle 18:00)', () => {
  assert.equal(occursOnWeekend({ startDate: '2026-08-07', endDate: '2026-08-07', startTime: '10:00', endTime: '12:00' }), false);
});

test('Weekend: venerdì tutto il giorno (giornaliero) è incluso', () => {
  assert.equal(occursOnWeekend({ startDate: '2026-08-07', endDate: '2026-08-07', startTime: null }), true);
});

test('Weekend: sabato mattina e domenica sono inclusi', () => {
  assert.equal(occursOnWeekend({ startDate: '2026-08-08', endDate: '2026-08-08', startTime: '09:30' }), true);
  assert.equal(occursOnWeekend({ startDate: '2026-08-09', endDate: '2026-08-09', startTime: '09:30' }), true);
});

test('Weekend: un evento multi-giorno che copre sabato è incluso anche se inizia giovedì', () => {
  assert.equal(occursOnWeekend({ startDate: '2026-08-06', endDate: '2026-08-09', startTime: '11:00' }), true);
});

test('Weekend: preset risolve a venerdì→domenica quando richiesto lunedì', () => {
  const preset = resolvePreset('weekend', new Date('2026-08-03T10:00:00+02:00')); // lunedì
  assert.equal(preset.from, '2026-08-07'); // venerdì
  assert.equal(preset.to, '2026-08-09'); // domenica
  assert.equal(preset.weekend, true);
});

test('Stasera: evento che inizia alle 18:00 o dopo è incluso', () => {
  assert.equal(isEveningEvent({ startTime: '18:00' }), true);
  assert.equal(isEveningEvent({ startTime: '21:30' }), true);
  assert.equal(isEveningEvent({ startTime: '17:45', endTime: '17:55' }), false);
});

test('Stasera: evento giornaliero ancora in corso (senza orario) è incluso', () => {
  assert.equal(isEveningEvent({ startTime: null }), true);
  assert.equal(isEveningEvent({}), true);
});

test('Stasera: pomeridiano che prosegue oltre le 18:00 è incluso', () => {
  assert.equal(isEveningEvent({ startTime: '16:00', endTime: '22:00' }), true);
  assert.equal(isEveningEvent({ startTime: '10:00', endTime: '13:00' }), false);
});

test('Stasera: dicitura “in serata” nel titolo/testo orari è inclusa', () => {
  assert.equal(isEveningEvent({ startTime: null, title: 'Passeggiata in serata' }), true);
  assert.equal(isEveningEvent({ originalTimeText: 'spettacolo serale ore 20' }), true);
});

// Regressione bug Leverano: surrogate orfano nell'HTML -> PG json rifiuta il payload
import { sanitizeText, sanitizeDeep } from '../netlify/functions/_shared/events-core.mjs';

test('Sanificazione: rimuove surrogati orfani e caratteri di controllo', () => {
  assert.equal(sanitizeText('Ciao 𝐅𝐄𝐒𝐓𝐀\uD835 mondo'), 'Ciao 𝐅𝐄𝐒𝐓𝐀 mondo');
  assert.equal(sanitizeText('abcd'), 'abcd');
  assert.equal(sanitizeText('normale àèìòù ç'), 'normale àèìòù ç');
  assert.equal(JSON.stringify(sanitizeDeep({ t: 'x\uD835y' })), '{"t":"xy"}');
});
