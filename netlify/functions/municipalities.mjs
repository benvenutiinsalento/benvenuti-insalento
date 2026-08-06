import { query } from './_shared/db.mjs';
import { MUNICIPALITIES } from './_shared/registry.mjs';
import { json,error } from './_shared/http.mjs';
export default async(req)=>{
 if(req.method!=='GET') return error('Metodo non consentito',405,'METHOD_NOT_ALLOWED');
 try{const rows=await query(`SELECT name,slug,coverage_status AS "coverageStatus",coverage_score AS "coverageScore" FROM municipalities ORDER BY name`);return json({ok:true,municipalities:rows},200,{'cache-control':'public,max-age=3600'});}catch(e){
  console.error('MUNICIPALITIES_DATABASE_FALLBACK',e);
  return json({ok:true,municipalities:MUNICIPALITIES.map(({name,slug})=>({name,slug,coverageStatus:'none',coverageScore:0})),verifiedFallback:true},200,{'cache-control':'public,max-age=3600'});
 }
};
export const config={path:'/api/municipalities'};
