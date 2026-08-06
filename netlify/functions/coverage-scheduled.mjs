import { calculateCoverage } from './_shared/coverage.mjs';
export default async()=>new Response(JSON.stringify(await calculateCoverage()),{headers:{'content-type':'application/json'}});
export const config={schedule:'41 2 * * *'};
