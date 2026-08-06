import { bootstrapStatus, bootstrapSystem, syncIpaOfficialWebsites } from './_shared/bootstrap.mjs';
import { runIngestionBatch } from './_shared/ingestion.mjs';

export default async () => {
  const status = await bootstrapStatus();
  let bootstrap = null;
  if (Number(status.total || 0) < 96) bootstrap = await bootstrapSystem();
  let ipa = null;
  try { ipa = await syncIpaOfficialWebsites(); } catch (error) { ipa = { error: String(error?.message || error) }; }
  const discovery = await runIngestionBatch({ limit: 1, runType: 'discovery', discoveryOnly: true });
  return new Response(JSON.stringify({ ok: true, bootstrap, ipa, discovery }), {
    headers: { 'content-type': 'application/json' },
  });
};
export const config = { schedule: '37 */6 * * *' };
