import { listEvents } from './_shared/event-repository.mjs';
import { listVerifiedEvents, loadVerifiedPrograms } from './_shared/verified-programs.mjs';
import { json, error, corsResponse, isoDateOrEmpty, parsePositiveInt } from './_shared/http.mjs';
export default async (req) => {
  const cors = corsResponse(req); if (cors) return cors;
  if (req.method !== 'GET') return error('Metodo non consentito',405,'METHOD_NOT_ALLOWED');
  try {
    const u=new URL(req.url);
    const data=await listEvents({
      from:isoDateOrEmpty(u.searchParams.get('from')||u.searchParams.get('date')),
      to:isoDateOrEmpty(u.searchParams.get('to')),
      town:u.searchParams.get('town')||'', category:u.searchParams.get('category')||'', priceType:u.searchParams.get('priceType')||'',
      family:u.searchParams.get('family')==='1', evening:u.searchParams.get('evening')==='1', q:(u.searchParams.get('q')||'').slice(0,120),
      lat:u.searchParams.get('lat'),lng:u.searchParams.get('lng'),radius:u.searchParams.get('radius'),sort:u.searchParams.get('sort')||'date',
      page:parsePositiveInt(u.searchParams.get('page'),1,10000),pageSize:parsePositiveInt(u.searchParams.get('pageSize'),30,100),
    });
    return json({ok:true,...data},200,{'cache-control':'public, max-age=60, stale-while-revalidate=300'});
  } catch(e){
    const u=new URL(req.url);const data=listVerifiedEvents({
      from:isoDateOrEmpty(u.searchParams.get('from')||u.searchParams.get('date')),to:isoDateOrEmpty(u.searchParams.get('to')),
      town:u.searchParams.get('town')||'',category:u.searchParams.get('category')||'',priceType:u.searchParams.get('priceType')||'',
      family:u.searchParams.get('family')==='1',evening:u.searchParams.get('evening')==='1',q:(u.searchParams.get('q')||'').slice(0,120),
      lat:u.searchParams.get('lat'),lng:u.searchParams.get('lng'),radius:u.searchParams.get('radius'),sort:u.searchParams.get('sort')||'date',
      page:parsePositiveInt(u.searchParams.get('page'),1,10000),pageSize:parsePositiveInt(u.searchParams.get('pageSize'),30,100),
    });
    console.error('EVENTS_DATABASE_FALLBACK', e);
    let meta = null; try { meta = loadVerifiedPrograms(); } catch { meta = null; }
    return json({ok:true,...data,verifiedFallback:true,
      fallbackNotice:'Elenco servito da archivio di riserva rigenerato quotidianamente: verificare sempre fonte e ultimo controllo su ogni scheda.',
      fallbackGeneratedAt: meta?.generatedAt || meta?.capturedAt || null,
      fallbackExpiresAt: meta?.expiresAt || null},
      200,{'cache-control':'public, max-age=60, stale-while-revalidate=300'});
  }
};
export const config={path:'/api/events',rateLimit:{windowLimit:120,windowSize:60,aggregateBy:['ip','domain']}};
