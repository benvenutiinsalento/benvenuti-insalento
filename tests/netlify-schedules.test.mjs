import test from 'node:test';
import assert from 'node:assert/strict';
import { config as ingestionConfig } from '../netlify/functions/ingest-scheduled.mjs';
import { config as discoveryConfig } from '../netlify/functions/discovery-scheduled.mjs';
import { config as coverageConfig } from '../netlify/functions/coverage-scheduled.mjs';

test('Netlify registra i tre aggiornamenti programmati', () => {
  assert.equal(ingestionConfig.schedule, '17 * * * *');
  assert.equal(discoveryConfig.schedule, '37 */6 * * *');
  assert.equal(coverageConfig.schedule, '41 2 * * *');
});
