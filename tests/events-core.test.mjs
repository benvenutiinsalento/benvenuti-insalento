import test from 'node:test';import assert from 'node:assert/strict';import {canonicalEventKey,deduplicateEvents,validateEvent,matchesEventFilters,classifyEvent} from '../netlify/functions/_shared/events-core.mjs';
const base={title:'Sagra ufficiale di prova',town:'Lecce',startDate:'2026-08-10',endDate:'2026-08-10',venue:'Piazza',primaryCategory:'Sagra',sourcePriority:2};
test('chiave canonica stabile',()=>assert.equal(canonicalEventKey(base),canonicalEventKey({...base,title:' Sagra ufficiale di prova '})));
test('deduplica fonti multiple',()=>assert.equal(deduplicateEvents([base,{...base,description:'Programma completo',sourcePriority:3}]).events.length,1));
test('validazione rifiuta anno passato come corrente',()=>assert.equal(validateEvent({...base,startDate:'2025-08-10',endDate:'2025-08-10'},2026).valid,false));
test('filtri data e comune',()=>assert.equal(matchesEventFilters(base,{from:'2026-08-10',to:'2026-08-10',town:'Lecce'}),true));

test('aggiornamento della stessa fonte sostituisce la data senza perdere descrizione', async () => {
  const { mergeSameSourceUpdate } = await import('../netlify/functions/_shared/events-core.mjs');
  const merged = mergeSameSourceUpdate(
    { title:'Evento', description:'Descrizione completa', startDate:'2026-08-01', endDate:'2026-08-01', occurrenceDates:['2026-08-01'], tags:['ufficiale'] },
    { title:'Evento aggiornato', description:'', startDate:'2026-08-03', endDate:'2026-08-03', occurrenceDates:['2026-08-03'], tags:['rinvio'] },
  );
  assert.equal(merged.startDate, '2026-08-03');
  assert.deepEqual(merged.occurrenceDates, ['2026-08-03']);
  assert.equal(merged.description, 'Descrizione completa');
  assert.deepEqual(merged.tags.sort(), ['rinvio','ufficiale']);
});

test('festival musicale non viene classificato automaticamente come sagra', () => {
  assert.equal(classifyEvent('Festival internazionale di musica e concerto'), 'Musica e pizzica');
});
