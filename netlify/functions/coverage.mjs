import { coverageSummary } from './_shared/coverage.mjs';
import { json,error } from './_shared/http.mjs';
export default async(req)=>{if(req.method!=='GET')return error('Metodo non consentito',405,'METHOD_NOT_ALLOWED');try{return json({ok:true,...await coverageSummary()},200,{'cache-control':'public,max-age=300'});}catch(e){console.error('COVERAGE_DATABASE_FALLBACK',e);return json({ok:true,totals:{municipalities:96,high:0,partial:4,insufficient:92},methodology:'Archivio iniziale: 4 Comuni con programmi ufficiali verificati; la copertura provinciale viene aggiornata dalle esecuzioni automatiche.',verifiedFallback:true},200,{'cache-control':'public,max-age=300'});}};
export const config={path:'/api/coverage'};
