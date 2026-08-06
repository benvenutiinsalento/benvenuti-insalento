const form=document.querySelector('#events-search');
const grid=document.querySelector('#events-grid');
const statusBox=document.querySelector('#events-status');
const meta=document.querySelector('#results-meta');
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
function setRange(type){
  const today=romeToday();let from=today,to=today;
  form.evening.value=type==='evening'?'1':'';
  if(type==='tomorrow')from=to=addDays(today,1);
  if(type==='seven')to=addDays(today,6);
  if(type==='weekend'){const d=new Date(`${today}T12:00:00`),day=d.getDay(),delta=day===0?0:6-day;from=addDays(today,delta);to=addDays(from,1)}
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
function isEvening(event){const match=String(event.startTime||'').match(/^(\d{1,2})(?::(\d{2}))?/);return match?Number(match[1])*60+Number(match[2]||0)>=1080:false}
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

const months=['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
function longDate(event){
  const format=new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long'});
  const start=format.format(new Date(`${event.startDate}T12:00:00`));
  const end=format.format(new Date(`${event.endDate}T12:00:00`));
  return `${event.startDate===event.endDate?start:`${start} – ${end}`}${event.startTime?` · ore ${event.startTime}`:''}`;
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
  const source=dialog.querySelector('.dialog-source');source.hidden=!event.sourceUrl;if(event.sourceUrl)source.href=event.sourceUrl;
  dialog.showModal();
}

async function load(){
  if(loading)return;loading=true;statusBox.classList.remove('is-empty');statusBox.textContent='Cerco gli appuntamenti…';
  const params=new URLSearchParams(new FormData(form));params.set('pageSize','100');for(const [key,value] of [...params])if(!value)params.delete(key);
  try{
    let events=[];
    try{const response=await fetch(`/api/events?${params}`);if(!response.ok)throw new Error();const data=await response.json();events=data.events||[]}catch{events=await fallbackEvents(params)}
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
    form.lat.value=position.coords.latitude.toFixed(5);form.lng.value=position.coords.longitude.toFixed(5);form.radius.value=form.radius.value||'50';form.sort.value='distance';
    note.textContent=`Eventi entro ${form.radius.value} km`;geoButton.classList.add('is-active');geoButton.disabled=false;load();
  },()=>{note.textContent='Permesso non concesso: scegli un Comune';form.radius.value='';geoButton.disabled=false},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
}

document.querySelectorAll('[data-range]').forEach(button=>button.addEventListener('click',()=>setRange(button.dataset.range)));
geoButton.addEventListener('click',requestPosition);
form.radius.addEventListener('change',()=>{if(form.radius.value&&!form.lat.value)requestPosition()});
form.addEventListener('submit',event=>{event.preventDefault();selectQuick('');form.evening.value='';load()});
form.from.addEventListener('change',()=>{selectQuick('');form.evening.value=''});form.to.addEventListener('change',()=>{selectQuick('');form.evening.value=''});
form.addEventListener('reset',()=>setTimeout(()=>{form.lat.value='';form.lng.value='';form.evening.value='';form.sort.value='date';geoButton.classList.remove('is-active');document.querySelector('#geo-status').textContent='Usa la posizione del dispositivo';form.from.value=romeToday();form.to.value=addDays(romeToday(),6);selectQuick('seven');load()},0));
grid.addEventListener('click',event=>{const button=event.target.closest('.event-open');if(button)openEvent(renderedEvents[Number(button.dataset.index)])});
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});

form.from.value=romeToday();form.to.value=addDays(romeToday(),6);populateMunicipalities();load();
