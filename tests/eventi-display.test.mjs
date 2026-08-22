import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanPublicDescription,
  cleanPublicEventTitle,
  cleanPublicTitle,
  normalizePublicResults,
  ongoingTodayLabel,
  refinePublicCategories,
  resultsCounterText,
} from '../scripts/eventi-display.js';

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

test('usa il titolo vero solo quando è attestato dalla stessa fonte', () => {
  assert.equal(cleanPublicEventTitle({
    title: '. Due serate dedicate ai più piccoli. NOTIZIE',
    source_url: 'https://comune.otranto.le.it/novita',
  }), 'La Notte dei Bambini di Otranto');
  assert.equal(cleanPublicEventTitle({
    title: '. Due serate dedicate ai più piccoli. NOTIZIE',
    source_url: 'https://example.com/altro',
  }), 'Due serate dedicate ai più piccoli.');
  assert.equal(cleanPublicEventTitle({
    title: 'Notte dei Bambini dall’1',
    source_url: 'https://comune.otranto.le.it/novita/calendario-eventi-primavera-estate-2026/',
  }), 'Notte dei Bambini');
});

test('le descrizioni troncate finiscono all’ultima frase completa o vengono omesse', () => {
  assert.equal(
    cleanPublicDescription('Un concerto che va dritto al cuore. Il ricavato sarà destinato per la "Scu'),
    'Un concerto che va dritto al cuore.',
  );
  assert.equal(cleanPublicDescription('Testo estratto senza alcuna frase completa, proseguito automaticamente dalla pagina sorgente oltre il limite disponibile e che termina bruscamente per la Scu'), '');
  assert.equal(cleanPublicDescription('Descrizione breve e completa'), 'Descrizione breve e completa');
});

test('Oggi segnala un multi-day già iniziato senza cambiare la data reale', () => {
  const event = { event_occurrences: [{
    start_at: '2026-08-10T00:00:00+02:00',
    end_at: '2026-09-11T00:00:00+02:00',
  }] };
  assert.equal(
    ongoingTodayLabel(event, 'today', new Date('2026-08-22T12:00:00+02:00'), () => '10 set 2026'),
    'In corso fino al 10 set 2026',
  );
  assert.equal(ongoingTodayLabel(event, 'next7', new Date('2026-08-22T12:00:00+02:00')), '');
});

test('affina Altro soltanto con segnali inequivocabili', () => {
  assert.deepEqual(refinePublicCategories({ title: 'Rappresentazione teatrale “Matti da slegare”', category_slugs: ['altro'] }), ['teatro']);
  assert.deepEqual(refinePublicCategories({ title: 'La Notte dei Bambini di Otranto', category_slugs: ['altro'] }), ['famiglie-e-bambini']);
  assert.deepEqual(refinePublicCategories({ title: 'Serata d’estate', category_slugs: ['altro'] }), ['altro']);
  assert.deepEqual(refinePublicCategories({ title: 'Festival già classificato', category_slugs: ['festival'] }), ['festival']);
});
