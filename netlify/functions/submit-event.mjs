import { query } from './_shared/db.mjs';
import { json,error,corsResponse,isoDateOrEmpty } from './_shared/http.mjs';
function emailOk(v){return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
export default async(req)=>{
 const cors=corsResponse(req);if(cors)return cors;if(req.method!=='POST')return error('Metodo non consentito',405,'METHOD_NOT_ALLOWED');
 try{const body=await req.json();if(String(body.website||''))return json({ok:true});
 const name=String(body.eventName||'').trim().slice(0,180),town=String(body.town||'').trim().slice(0,100),email=String(body.contactEmail||'').trim().slice(0,200);
 if(body.privacyConsent!=='yes')return error('È necessario accettare l’informativa privacy',422,'PRIVACY_CONSENT_REQUIRED');
 if(name.length<3||town.length<2||!emailOk(email))return error('Dati obbligatori non validi',422,'VALIDATION_ERROR');
 const sourceUrl=/^https?:\/\//i.test(String(body.sourceUrl||''))?String(body.sourceUrl).slice(0,1000):null;
 if(!sourceUrl&&!email)return error('Inserisci una fonte pubblica oppure un contatto email verificabile',422,'SOURCE_OR_CONTACT_REQUIRED');
 const startDate=isoDateOrEmpty(body.startDate)||null,endDate=isoDateOrEmpty(body.endDate)||null;
 if(startDate&&endDate&&endDate<startDate)return error('La data finale non può precedere quella iniziale',422,'DATE_RANGE_INVALID');
 await query(`INSERT INTO event_submissions(event_name,town,start_date,end_date,source_url,organizer_name,contact_email,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
 [name,town,startDate,endDate,sourceUrl,String(body.organizerName||'').slice(0,180)||null,email||null,String(body.notes||'').slice(0,3000)||null]);
 return json({ok:true,message:'Segnalazione ricevuta e inviata alla verifica editoriale.'},201);
 }catch(e){console.error('SUBMISSION_FAILED',e);return error('Invio non riuscito',500,'SUBMISSION_FAILED');}
};
export const config={path:'/api/event-submissions',rateLimit:{windowLimit:5,windowSize:60,aggregateBy:['ip','domain']}};
