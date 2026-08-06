import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../eventi.html',import.meta.url),'utf8');
const script=fs.readFileSync(new URL('../scripts/events.js',import.meta.url),'utf8');

test('la pagina pubblica non mostra testi tecnici o amministrativi',()=>{
  for(const forbidden of ['database non configurato','copertura delle fonti','manca un evento?','carica altri','agenda territoriale verificabile']){
    assert.equal(html.toLowerCase().includes(forbidden),false,`Testo pubblico non ammesso: ${forbidden}`);
    assert.equal(script.toLowerCase().includes(forbidden),false,`Messaggio non ammesso: ${forbidden}`);
  }
});

test('la ricerca pubblica include posizione, filtri e ripristino',()=>{
  assert.match(html,/id="geo"/);assert.match(html,/name="radius"/);assert.match(html,/name="town"/);assert.match(html,/name="category"/);assert.match(html,/type="reset"/);
  assert.match(script,/navigator\.geolocation\.getCurrentPosition/);assert.match(script,/fallbackEvents/);
});
