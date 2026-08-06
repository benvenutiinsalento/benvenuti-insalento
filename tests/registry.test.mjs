import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const root=new URL('../',import.meta.url);const municipalities=JSON.parse(fs.readFileSync(new URL('data/municipalities.json',root)));const pro=JSON.parse(fs.readFileSync(new URL('data/pro-loco-registry.json',root)));const sources=JSON.parse(fs.readFileSync(new URL('data/source-registry.json',root)));
test('provincia completa nel registro',()=>assert.equal(municipalities.length,96));
test('registro Pro Loco esteso',()=>assert.ok(pro.length>=100));
test('fonti hanno URL HTTPS e priorità valida',()=>sources.coreSources.forEach(s=>{assert.match(s.url,/^https:\/\//);assert.ok(s.priority>=1&&s.priority<=6)}));

test('risolve il Comune più specifico nel testo',async()=>{
 const {municipalityFromText}=await import('../netlify/functions/_shared/registry.mjs');
 assert.equal(municipalityFromText('Pro Loco San Donato di Lecce Galugnano').name,'San Donato di Lecce');
 assert.equal(municipalityFromText('Pro Loco Torre Vado').name,'Morciano di Leuca');
});
