import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanPublicTitle, normalizePublicResults, resultsCounterText } from '../scripts/eventi-display.js';

test('rimuove boilerplate CMS senza inventare il titolo', () => {
  assert.equal(cleanPublicTitle('. Due serate dedicate ai più piccoli. NOTIZIE'), 'Due serate dedicate ai più piccoli.');
  assert.equal(
    cleanPublicTitle('sarà aperta anche la Farmacia Manieri-Elia NOTIZIE 17 AGO 26 Apollo Film Festival,'),
    'Apollo Film Festival',
  );
});

test('scarta titoli di navigazione o amministrativi non recuperabili', () => {
  assert.equal(cleanPublicTitle('. Data: Venerdì,'), '');
  assert.equal(cleanPublicTitle('. [ 1 ] 2 3 4 5 &gt; &gt;&gt;'), '');
  assert.equal(cleanPublicTitle('35esimo report delle offerte di lavoro AVVISI'), '');
});

test('normalizzazione e contatore descrivono esattamente i record visibili', () => {
  const result = normalizePublicResults({
    generated_at: '2026-08-22T12:00:00Z',
    pagination: { total: 3, page: 1, limit: 20, pages: 1 },
    events: [
      { id: '1', title: '. Due serate dedicate ai più piccoli. NOTIZIE' },
      { id: '2', title: 'sarà aperta anche la Farmacia Manieri-Elia NOTIZIE 17 AGO 26 Apollo Film Festival,' },
      { id: '3', title: '. Data: Venerdì,' },
    ],
  });
  assert.deepEqual(result.events.map((event) => event.title), ['Due serate dedicate ai più piccoli.', 'Apollo Film Festival']);
  assert.equal(result.pagination.total, 2);
  assert.equal(resultsCounterText(result, () => '22/08/2026, 14:00'), '2 appuntamenti · aggiornato 22/08/2026, 14:00');
});
