// Test unitari dei nuovi helper puri del layer Supabase (v13).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOccurrences, canAutoPublish, categorySlug, deriveConfidence,
  resolvePreset, verificationLevelForPriority,
} from '../netlify/functions/_shared/events-core.mjs';

test('categorySlug mappa i nomi legacy sui slug del mandato', () => {
  assert.equal(categorySlug('Sagre'), 'sagre');
  assert.equal(categorySlug('Musica e pizzica'), 'pizzica-e-musica-popolare');
  assert.equal(categorySlug('Per famiglie'), 'famiglie-e-bambini');
  assert.equal(categorySlug('Feste patronali'), 'feste-patronali');
  assert.equal(categorySlug('Nome ignoto'), 'altro');
});

test('verificationLevelForPriority segue la scala del mandato', () => {
  assert.equal(verificationLevelForPriority(1), 'official');
  assert.equal(verificationLevelForPriority(2), 'institutional');
  assert.equal(verificationLevelForPriority(3), 'institutional');
  assert.equal(verificationLevelForPriority(4), 'confirmed');
  assert.equal(verificationLevelForPriority(5), 'secondary');
  assert.equal(verificationLevelForPriority(6), 'secondary');
  assert.equal(verificationLevelForPriority(9), 'unverified');
});

test('deriveConfidence premia i parser strutturati e penalizza OCR senza score', () => {
  assert.equal(deriveConfidence({}, { parser_type: 'ics' }), 0.95);
  assert.equal(deriveConfidence({}, { parser_type: 'puglia_json' }), 0.95);
  assert.equal(deriveConfidence({}, { parser_type: 'poster' }), 0.6);
  assert.equal(deriveConfidence({ confidence: 0.93 }, { parser_type: 'poster' }), 0.93);
  assert.equal(deriveConfidence({}, { parser_type: 'generic_html' }), 0.8);
});

test('buildOccurrences non comprime mai date discontinue in un intervallo', () => {
  const occ = buildOccurrences({
    startDate: '2026-08-08', endDate: '2026-08-10',
    occurrenceDates: ['2026-08-08', '2026-08-10'], startTime: '21:00',
  });
  assert.deepEqual(occ.map((o) => o.date), ['2026-08-08', '2026-08-10']);
  assert.equal(occ.length, 2, 'le date non consecutive restano separate');
  assert.ok(occ.every((o) => o.startTime === '21:00'));
});

test('buildOccurrences espande eventi plurigiornalieri continui con testo orario originale', () => {
  const occ = buildOccurrences({
    startDate: '2026-08-01', endDate: '2026-08-07', startTime: '20:30',
    originalTimeText: 'ogni sera dalle 20:30',
  });
  assert.equal(occ.length, 7);
  assert.equal(occ[0].date, '2026-08-01');
  assert.equal(occ.at(-1).date, '2026-08-07');
  assert.equal(occ[0].scheduleText, 'ogni sera dalle 20:30');
});

test('buildOccurrences gestisce eventi oltre mezzanotte, senza orario e stati occorrenza', () => {
  const overnight = buildOccurrences({ startDate: '2026-08-15', startTime: '22:00', endTime: '02:00' });
  assert.equal(overnight[0].overnight, true);
  const allDay = buildOccurrences({ startDate: '2026-08-16' });
  assert.equal(allDay[0].allDay, true);
  assert.equal(allDay[0].startTime, null);
  const cancelled = buildOccurrences({ startDate: '2026-08-16', status: 'cancelled' });
  assert.equal(cancelled[0].status, 'cancelled');
});

test('canAutoPublish applica tutte le condizioni del mandato', () => {
  const base = {
    source: { approved: true, auto_publish: true },
    verificationLevel: 'institutional', confidence: 0.92,
    municipality: { id: 1 }, occurrences: [{ date: '2099-01-01' }], hasCriticalConflict: false,
  };
  assert.equal(canAutoPublish(base), true);
  assert.equal(canAutoPublish({ ...base, source: { approved: false, auto_publish: true } }), false, 'fonte non approvata');
  assert.equal(canAutoPublish({ ...base, source: { approved: true, auto_publish: false } }), false, 'auto-publish disattivato');
  assert.equal(canAutoPublish({ ...base, verificationLevel: 'secondary' }), false, 'livello troppo basso');
  assert.equal(canAutoPublish({ ...base, confidence: 0.89 }), false, 'confidence sotto soglia 0.90');
  assert.equal(canAutoPublish({ ...base, occurrences: [{ date: '2020-01-01' }] }), false, 'nessuna occorrenza futura');
  assert.equal(canAutoPublish({ ...base, hasCriticalConflict: true }), false, 'conflitto critico');
});

test('resolvePreset: oggi/domani/7 giorni in Europe/Rome', () => {
  const friday = new Date('2026-08-07T14:00:00Z'); // 16:00 CEST di venerdì 7 agosto 2026
  assert.deepEqual(resolvePreset('oggi', friday), { from: '2026-08-07', to: '2026-08-07' });
  assert.deepEqual(resolvePreset('domani', friday), { from: '2026-08-08', to: '2026-08-08' });
  assert.deepEqual(resolvePreset('prossimi 7 giorni', friday), { from: '2026-08-07', to: '2026-08-13' });
  const evening = resolvePreset('stasera', friday);
  assert.equal(evening.from, '2026-08-07');
  assert.equal(evening.evening, true);
});

test('resolvePreset weekend: venerdì-sabato-domenica; se già dentro, da oggi', () => {
  const friday = new Date('2026-08-07T12:00:00Z');
  assert.deepEqual(resolvePreset('weekend', new Date('2026-08-06T12:00:00Z')), { from: '2026-08-07', to: '2026-08-09', weekend: true });
  assert.deepEqual(resolvePreset('weekend', friday), { from: '2026-08-07', to: '2026-08-09', weekend: true });
  assert.deepEqual(resolvePreset('weekend', new Date('2026-08-08T12:00:00Z')), { from: '2026-08-08', to: '2026-08-09', weekend: true });
  assert.deepEqual(resolvePreset('weekend', new Date('2026-08-09T12:00:00Z')), { from: '2026-08-09', to: '2026-08-09', weekend: true });
  assert.equal(resolvePreset('non esiste'), null);
});
