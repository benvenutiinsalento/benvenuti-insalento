const form=document.querySelector('#events-search');
const grid=document.querySelector('#events-grid');
const statusBox=document.querySelector('#events-status');
const meta=document.querySelector('#results-meta');
const fallbackNotice=document.querySelector('#fallback-notice');
const template=document.querySelector('#event-card');
const geoButton=document.querySelector('#geo');
const dialog=document.querySelector('#event-dialog');
let loading=false;
let fallbackPayload=null;
let renderedEvents=[];

const romeToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const addDays=(iso,n)=>{const d=new Date(`${iso}T12:00:00`);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const normalize=(value='')=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const distanceKm=(a,b,c,d)=>{const rad=v=>v*Math.PI/180,x=rad(c-a),y=rad(d-b),q=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;return 6371*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))};

function selectQuick(type){document.querySelectorAll('[data-range]').forEach(button=>button.classList.toggle('is-active',button.dataset.range===type))}
function clearTimeFlags(){form.evening.value='';form.weekend.value=''}
function setRange(type){
  const today=romeToday();let from=today,to=today;clearTimeFlags();
  form.evening.value=type==='evening'?'1':'';
  if(type==='tomorrow')from=to=addDays(today,1);
  if(type==='seven')to=addDays(today,6);
  if(type==='weekend'){
    // Weekend (mandato): venerdì dalle 18:00, sabato, domenica.
    form.weekend.value='1';
    const dow=new Date(`${today}T12:00:00`).getUTCDay(); // 0=dom..6=sab
    if(dow===6){to=addDays(today,1)} // sabato: oggi+domani
    else if(dow===0){to=today} // domenica: solo oggi
    else {const toFri=(5-dow+7)%7;from=addDays(today,toFri);to=addDays(from,2)}
  }
  form.from.value=from;form.to.value=to;selectQuick(type);load();
}

async function populateMunicipalities(){
  try{
    const response=await fetch('/api/municipalities');
    if(!response.ok)throw new Error();
    const data=await response.json();
    addMunicipalities(data.municipalities||[]);
  }catch{
    try{const response=await fetch('/data/municipalities.json');addMunicipalities(await response.json())}catch{}
  }
}
function addMunicipalities(items){
  const seen=new Set([...form.town.options].map(option=>option.value));
  for(const item of items){if(seen.has(item.slug))continue;const option=document.createElement('option');option.value=item.slug;option.textContent=item.name;form.town.append(option);seen.add(item.slug)}
}

function flattenFallback(payload){
  return (payload.programs||[]).flatMap(program=>program.events.map((event,index)=>({
    id:`${program.key}-${index+1}`,slug:`${program.key}-${index+1}`,town:program.municipality,locality:'',
    latitude:program.latitude??null,longitude:program.longitude??null,sourceUrl:program.documentUrl||program.url,
    sourceName:program.entityName,description:'',priceType:'unknown',priceText:'',secondaryCategories:[],tags:[],audiences:[],
    verificationLevel:program.priority<=1?'primary':'institutional',status:'published',...event
  })));
}
function occurs(event,from,to){return (!from||event.endDate>=from)&&(!to||event.startDate<=to)}
function timeMinutes(value){const match=String(value||'').match(/^(\d{1,2})(?::(\d{2}))?/);return match?Number(match[1])*60+Number(match[2]||0):null}
function isEvening(event){
  // "Stasera": dicitura serale, inizio >= 18:00, evento giornaliero ancora in
  // corso (nessun orario), pomeridiano che entra in serata.
  if(/sera|serata|notturn|a cena|mezzanotte|cena spettacolo|in serata/i.test(`${event.title} ${event.originalTimeText||''}`))return true;
  const start=timeMinutes(event.startTime);
  if(start==null)return true;
  if(start>=1080)return true;
  const end=timeMinutes(event.endTime);
  return end!=null&&end>=1080&&end>start;
}
function occursOnWeekend(event){
  // venerdì dalle 18:00 (o tutto il giorno), sabato e domenica
  const from=event.startDate,to=event.endDate||event.startDate;
  const cursor=new Date(`${from}T12:00:00`),end=new Date(`${to}T12:00:00`);let guard=0;
  while(cursor<=end&&guard<90){
    const dow=cursor.getDay();
    if(dow===0||dow===6)return true;
    if(dow===5&&isEvening(event))return true;
    cursor.setDate(cursor.getDate()+1);guard++;
  }
  return false;
}
function isFamily(event){
  const hay=normalize([event.title,event.description,event.primaryCategory,...(event.tags||[]),...(event.audiences||[])].join(' '));
  return (event.audiences||[]).some(a=>/famiglie|bambini/.test(normalize(a)))||/bambin|famigli|laborator|giochi|animazione|burattin/.test(hay);
}
function localFilter(events,params){
  const municipality=form.town.options[form.town.selectedIndex]?.textContent||'';
  const tokens=normalize(params.get('q')).split(/\s+/).filter(Boolean);
  const hasCoordinates=params.has('lat')&&params.has('lng');
  const lat=hasCoordinates?Number(params.get('lat')):NaN,lng=hasCoordinates?Number(params.get('lng')):NaN,radius=Number(params.get('radius'));
  let result=events.filter(event=>{
    if(!occurs(event,params.get('from'),params.get('to')))return false;
    if(params.get('town')&&normalize(event.town)!==normalize(municipality))return false;
    const category=params.get('category');
    if(category&&event.primaryCategory!==category&&!(event.secondaryCategories||[]).includes(category))return false;
    if(params.get('evening')==='1'&&!isEvening(event))return false;
    if(params.get('weekend')==='1'&&!occursOnWeekend(event))return false;
    if(params.get('family')==='1'&&!isFamily(event))return false;
    const haystack=normalize([event.title,event.description,event.town,event.venue,event.primaryCategory,...(event.tags||[])].join(' '));
    return tokens.every(token=>haystack.includes(token));
  }).map(event=>Number.isFinite(lat)&&Number.isFinite(lng)&&event.latitude!=null?{...event,distanceKm:distanceKm(lat,lng,event.latitude,event.longitude)}:event);
  if(Number.isFinite(radius)&&radius>0)result=result.filter(event=>event.distanceKm!=null&&event.distanceKm<=radius);
  result.sort(params.get('sort')==='distance'?(a,b)=>(a.distanceKm??Infinity)-(b.distanceKm??Infinity):(a,b)=>`${a.startDate} ${a.startTime||'99:99'}`.localeCompare(`${b.startDate} ${b.startTime||'99:99'}`));
  return result;
}
async function fallbackEvents(params){
  if(!fallbackPayload){const response=await fetch('/data/verified-programs-2026.json');if(!response.ok)throw new Error();fallbackPayload=await response.json()}
  return localFilter(flattenFallback(fallbackPayload),params);
}

function showFallbackNotice(generatedAt,expiresAt,offline){
  const gen=generatedAt?new Date(generatedAt).toLocaleString('it-IT',{timeZone:'Europe/Rome'}):'—';
  const exp=expiresAt?new Date(expiresAt).toLocaleDateString('it-IT'):'—';
  fallbackNotice.hidden=false;
  fallbackNotice.innerHTML=`<strong>⚠️ Modalità di riserva attiva.</strong> ${offline?'Il servizio principale non risponde:':'Il database principale non risponde:'} stai vedendo l’archivio verificato aggiornato al <b>${gen}</b> (valido fino al ${exp}). Controlla sempre la fonte su ogni evento.`;
}
function hideFallbackNotice(){fallbackNotice.hidden=true;fallbackNotice.textContent=''}

const months=['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
function longDate(event){
  const format=new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long'});
  const start=format.format(new Date(`${event.startDate}T12:00:00`));
  const end=format.format(new Date(`${event.endDate}T12:00:00`));
  const multi=(event.occurrenceDates||[]).length>1?` · ${(event.occurrenceDates||[]).length} date`:'';
  return `${event.startDate===event.endDate?start:`${start} – ${end}`}${event.startTime?` · ore ${event.startTime}`:''}${multi}`;
}
function render(events){
  renderedEvents=events;grid.innerHTML='';
  for(const [index,event] of events.entries()){
    const node=template.content.cloneNode(true);const date=new Date(`${event.startDate}T12:00:00`);
    node.querySelector('.event-day').textContent=date.getDate();node.querySelector('.event-month').textContent=months[date.getMonth()];
    node.querySelector('.event-category').textContent=event.primaryCategory||'Evento';node.querySelector('h3').textContent=event.title;
    node.querySelector('.event-date').textContent=longDate(event);node.querySelector('.event-place').textContent=[event.venue,event.locality,event.town].filter(Boolean).join(' · ');
    node.querySelector('.event-distance').textContent=event.distanceKm!=null?`${event.distanceKm.toFixed(1)} km da te`:'';
    node.querySelector('.event-open').dataset.index=index;grid.append(node);
  }
}
function openEvent(event){
  dialog.querySelector('.dialog-category').textContent=event.primaryCategory||'Evento';dialog.querySelector('.dialog-title').textContent=event.title;
  dialog.querySelector('.dialog-date').textContent=longDate(event);dialog.querySelector('.dialog-place').textContent=[event.venue,event.locality,event.town].filter(Boolean).join(' · ');
  dialog.querySelector('.dialog-description').textContent=event.description||'Consulta il programma per tutti i dettagli e gli eventuali aggiornamenti.';
  dialog.querySelector('.dialog-price').textContent=event.priceType==='free'?'Ingresso gratuito':event.priceText||'';
  const directions=dialog.querySelector('.dialog-directions');
  const destination=event.latitude!=null&&event.longitude!=null?`${event.latitude},${event.longitude}`:encodeURIComponent([event.venue,event.locality,event.town,'Lecce'].filter(Boolean).join(', '));
  directions.href=`https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  const source=dialog.querySelector('.dialog-source');source.hidden=!event.sourceUrl;if(event.sourceUrl)source.href=event.sourceUrl;
  const verification=dialog.querySelector('.dialog-verification');
  const checked=event.lastCheckedAt?new Date(event.lastCheckedAt).toLocaleString('it-IT',{timeZone:'Europe/Rome'}):null;
  verification.textContent=[event.sourceName?`Fonte: ${event.sourceName}`:'',checked?`Ultimo controllo: ${checked}`:event.sourceName?'':'',event.status==='postponed'?'⚠️ Evento rinviato: verifica la nuova data sulla fonte':event.status==='cancelled'?'⚠️ Evento annullato':''].filter(Boolean).join(' · ');
  dialog.dataset.shareText=`${event.title} — ${event.town} · ${longDate(event)}\nhttps://benvenutiinsalento.it/eventi/${event.slug||''}`;
  dialog.showModal();
}

async function load(){
  if(loading)return;loading=true;hideFallbackNotice();statusBox.classList.remove('is-empty');statusBox.textContent='Cerco gli appuntamenti…';
  const params=new URLSearchParams(new FormData(form));params.set('pageSize','100');for(const [key,value] of [...params])if(!value)params.delete(key);
  try{
    let events=[];
    try{
      const response=await fetch(`/api/events?${params}`);if(!response.ok)throw new Error();
      const data=await response.json();events=data.events||[];
      if(data.total!=null)meta.dataset.total=data.total;
      if(data.verifiedFallback)showFallbackNotice(data.fallbackGeneratedAt,data.fallbackExpiresAt,false);
    }catch{events=await fallbackEvents(params);showFallbackNotice(fallbackPayload?.generatedAt||fallbackPayload?.capturedAt,fallbackPayload?.expiresAt,true)}
    render(events);meta.textContent=events.length===1?'1 evento trovato':`${events.length} eventi trovati`;
    statusBox.textContent=events.length?'':'Non ci sono appuntamenti con questi filtri. Prova a cambiare data, Comune o categoria.';statusBox.classList.toggle('is-empty',!events.length);
  }catch{render([]);meta.textContent='';statusBox.textContent='Non ci sono appuntamenti disponibili per questa ricerca. Riprova tra poco.';statusBox.classList.add('is-empty')}
  finally{loading=false}
}

function requestPosition(){
  const note=document.querySelector('#geo-status');
  if(!navigator.geolocation){note.textContent='Posizione non disponibile su questo dispositivo';return}
  note.textContent='Sto rilevando la posizione…';geoButton.disabled=true;
  navigator.geolocation.getCurrentPosition(position=>{
    form.lat.value=position.coords.latitude.toFixed(5);form.lng.value=position.coords.longitude.toFixed(5);form.radius.value=form.radius.value||'20';form.sort.value='distance';
    note.textContent=`Eventi entro ${form.radius.value} km`;geoButton.classList.add('is-active');geoButton.disabled=false;load();
  },()=>{note.textContent='Permesso non concesso: scegli un Comune';form.radius.value='';geoButton.disabled=false},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
}

document.querySelectorAll('[data-range]').forEach(button=>button.addEventListener('click',()=>setRange(button.dataset.range)));
geoButton.addEventListener('click',requestPosition);
form.radius.addEventListener('change',()=>{if(form.radius.value&&!form.lat.value)requestPosition();else load()});
form.family.addEventListener('change',load);
form.category.addEventListener('change',load);
form.town.addEventListener('change',()=>{form.lat.value='';form.lng.value='';form.radius.value='';form.sort.value='date';geoButton.classList.remove('is-active');load()});
form.addEventListener('submit',event=>{event.preventDefault();selectQuick('');clearTimeFlags();load()});
form.from.addEventListener('change',()=>{selectQuick('');clearTimeFlags()});form.to.addEventListener('change',()=>{selectQuick('');clearTimeFlags()});
form.addEventListener('reset',()=>setTimeout(()=>{form.lat.value='';form.lng.value='';clearTimeFlags();form.sort.value='date';geoButton.classList.remove('is-active');document.querySelector('#geo-status').textContent='Usa la posizione del dispositivo';form.from.value=romeToday();form.to.value=addDays(romeToday(),6);selectQuick('seven');load()},0));
grid.addEventListener('click',event=>{const button=event.target.closest('.event-open');if(button)openEvent(renderedEvents[Number(button.dataset.index)])});
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
dialog.querySelector('.dialog-share').addEventListener('click',async()=>{
  const text=dialog.dataset.shareText||document.title;
  try{if(navigator.share){await navigator.share({title:document.title,text,url:'https://benvenutiinsalento.it/eventi'});return}}catch{}
  try{await navigator.clipboard.writeText(text);const button=dialog.querySelector('.dialog-share');button.textContent='Copiato!';setTimeout(()=>{button.textContent='Condividi'},1600)}catch{}
});

form.from.value=romeToday();form.to.value=addDays(romeToday(),6);populateMunicipalities();load();
