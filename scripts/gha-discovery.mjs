// ============================================================================
// GHA — Discovery settimanale (lunedì): sincronizza siti ufficiali da iPA e
// lancia batch di discovery (ricerca nuove fonti dai portali istituzionali).
// ============================================================================
import { bootstrapStatus, bootstrapSystem, syncIpaOfficialWebsites } from '../netlify/functions/_shared/bootstrap.mjs';
import { runIngestionBatch } from '../netlify/functions/_shared/ingestion.mjs';
import { getDb } from '../netlify/functions/_shared/db.mjs';

try {
  const status = await bootstrapStatus();
  if (Number(status.total || 0) < 96) {
    console.log('bootstrap iniziale...');
    console.log(JSON.stringify(await bootstrapSystem()));
  }
  try {
    const ipa = await syncIpaOfficialWebsites();
    console.log('iPA sync →', JSON.stringify(ipa));
  } catch (error) {
    console.log('iPA sync fallita (non bloccante):', String(error?.message || error));
  }
  for (let i = 0; i < 3; i += 1) {
    const result = await runIngestionBatch({ limit: 10, runType: 'discovery', discoveryOnly: true });
    console.log(`discovery batch ${i + 1} →`, JSON.stringify(result));
    if (!result.checked) break;
  }
} finally {
  const { pool } = await getDb(); await pool.end();
}
