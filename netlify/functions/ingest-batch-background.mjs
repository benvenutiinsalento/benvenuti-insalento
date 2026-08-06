import { requireIngestionSecret } from './_shared/auth.mjs';import { runIngestionBatch } from './_shared/ingestion.mjs';
export default async(req)=>{if(!requireIngestionSecret(req))return new Response('Unauthorized',{status:401});let body={};try{body=await req.json();}catch{}const result=await runIngestionBatch({limit:Math.min(30,Math.max(1,Number(body.limit)||12)),sourceIds:Array.isArray(body.sourceIds)?body.sourceIds:[]});return new Response(JSON.stringify(result),{headers:{'content-type':'application/json'}});};
export const config={path:'/api/internal/ingest-batch',background:true};
