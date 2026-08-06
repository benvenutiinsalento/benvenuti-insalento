import { bootstrapStatus, bootstrapSystem } from './_shared/bootstrap.mjs';
import { runIngestionBatch } from './_shared/ingestion.mjs';

export default async () => {
  const status = await bootstrapStatus();
  let bootstrap = null;
  if (Number(status.total || 0) < 96) bootstrap = await bootstrapSystem();
  const ingestion = await runIngestionBatch({ limit: 1, runType: 'ingestion' });
  return new Response(JSON.stringify({ ok: true, bootstrap, ingestion }), {
    headers: { 'content-type': 'application/json' },
  });
};
export const config = { schedule: '17 * * * *' };
