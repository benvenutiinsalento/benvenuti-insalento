// Report copertura 96 Comuni (mandato): complete|good|partial|critical|missing.
// "complete" = monitoraggio tecnico elevato; NON certifica che ogni evento
// organizzato sul territorio sia presente. Metodologia esposta dall'API.
import { query, one } from './db.mjs';

function computeStatus({ score, working, active, registered, recentErrors }) {
  if (registered === 0) return 'missing';
  if (active === 0) return 'critical';
  if (score >= 80 && working > 0) return 'complete';
  if (score >= 55) return 'good';
  if (score >= 25) return 'partial';
  return recentErrors > 3 ? 'critical' : 'partial';
}

export async function calculateCoverage() {
  const run = await one(`INSERT INTO source_runs (run_type, status, actor) VALUES ('coverage','running','gha-coverage-report') RETURNING id, started_at`);
  const rows = await query(`
    SELECT v.id, v.name, v.slug, v.sources_registered, v.sources_active, v.sources_working,
           v.future_events, v.events_last_30d, v.recent_errors, m.official_website_verified,
           (SELECT COUNT(*) FROM review_queue rq
              JOIN events e ON e.id = rq.event_id
              WHERE rq.status = 'pending' AND rq.severity IN ('high','critical')
                AND e.municipality_id = m.id) AS pending_high_reviews
    FROM v_municipality_coverage v
    JOIN municipalities m ON m.id = v.id
    ORDER BY v.name`);

  const results = [];
  for (const row of rows) {
    let score = 0;
    if (row.official_website_verified) score += 15;
    if (Number(row.sources_working) > 0) score += 45;
    if (Number(row.sources_active) >= 3) score += 20;
    else if (Number(row.sources_active) >= 1) score += 10;
    if (Number(row.future_events) > 0) score += 10;
    if (Number(row.events_last_30d) >= 2) score += 10;
    score -= Math.min(20, Number(row.recent_errors) * 2);
    score -= Math.min(20, Number(row.pending_high_reviews) * 4);
    score = Math.max(0, Math.min(100, score));
    const status = computeStatus({
      score, working: Number(row.sources_working), active: Number(row.sources_active),
      registered: Number(row.sources_registered), recentErrors: Number(row.recent_errors),
    });
    results.push({ id: row.id, name: row.name, score, status });
    await query(
      `UPDATE municipalities SET coverage_score = $2, coverage_status = $3, last_coverage_check = NOW() WHERE id = $1`,
      [row.id, score, status]);
    await query(
      `INSERT INTO coverage_snapshots (municipality_id, score, status, sources_registered, sources_active,
          sources_working, future_events, events_last_30d, recent_errors, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (municipality_id, snapshot_date) DO UPDATE SET
         score = EXCLUDED.score, status = EXCLUDED.status,
         sources_registered = EXCLUDED.sources_registered, sources_active = EXCLUDED.sources_active,
         sources_working = EXCLUDED.sources_working, future_events = EXCLUDED.future_events,
         events_last_30d = EXCLUDED.events_last_30d, recent_errors = EXCLUDED.recent_errors,
         notes = EXCLUDED.notes`,
      [row.id, score, status, Number(row.sources_registered), Number(row.sources_active),
       Number(row.sources_working), Number(row.future_events), Number(row.events_last_30d),
       Number(row.recent_errors),
       'complete/good misurano la continuità del monitoraggio, non la totalità degli eventi organizzati']);
  }
  await query(
    `UPDATE source_runs SET status = 'completed', completed_at = NOW(),
       duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000, notes = $2 WHERE id = $1`,
    [run.id, `${rows.length} comuni valutati su vista v_municipality_coverage`]);
  return { municipalities: rows.length, results };
}

export async function coverageSummary({ publicOnly = true } = {}) {
  const municipalities = publicOnly
    ? await query(`SELECT name, slug, coverage_status, coverage_score, last_coverage_check
                   FROM municipalities ORDER BY name`)
    : await query(`SELECT * FROM v_municipality_coverage ORDER BY name`);
  const totals = await one(`SELECT COUNT(*)::int AS municipalities,
    COUNT(*) FILTER (WHERE coverage_status = 'complete')::int AS complete,
    COUNT(*) FILTER (WHERE coverage_status = 'good')::int AS good,
    COUNT(*) FILTER (WHERE coverage_status = 'partial')::int AS partial,
    COUNT(*) FILTER (WHERE coverage_status IN ('critical','missing'))::int AS critical_or_missing
    FROM municipalities`);
  const system = await one(`SELECT
    (SELECT COUNT(DISTINCT e.id) FROM events e JOIN event_occurrences o ON o.event_id = e.id
      WHERE e.status IN ('published','postponed') AND o.occurrence_date >= CURRENT_DATE) AS future_events,
    (SELECT COUNT(*)::int FROM sources WHERE active) AS active_sources,
    (SELECT COUNT(*)::int FROM review_queue WHERE status = 'pending') AS pending_reviews,
    (SELECT MAX(completed_at) FROM source_runs WHERE status IN ('completed','partial')) AS last_successful_run`);
  return {
    totals, system, municipalities,
    methodology: 'Lo stato misura la continuità del monitoraggio delle fonti per Comune; non certifica che ogni evento organizzato sul territorio sia stato pubblicato.',
  };
}
