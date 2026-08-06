import test from 'node:test';import assert from 'node:assert/strict';import {extractCandidateLinks,extractSitemapLinks,parserForUrl} from '../netlify/functions/_shared/discovery.mjs';
test('scopre pagine evento e PDF',()=>{const r=extractCandidateLinks('<a href="/eventi/estate-2026">Eventi estate</a><a href="/albo">Albo</a><a href="/programma.pdf">Programma</a>','https://comune.test/');assert.equal(r.length,2)});
test('parser da estensione',()=>{assert.equal(parserForUrl('https://x.test/a.ics'),'ics');assert.equal(parserForUrl('https://x.test/a.pdf'),'pdf')});
test('sitemap filtrata',()=>assert.equal(extractSitemapLinks('<loc>https://x.test/notizie</loc><loc>https://x.test/eventi</loc>').length,1));

test('riconosce sitemap come fonte di scoperta',()=>assert.equal(parserForUrl('https://comune.test/sitemap.xml'),'sitemap_discovery'));

test('sitemap include post-sitemap per la scoperta di secondo livello',()=>{
 const xml='<sitemapindex><sitemap><loc>https://comune.test/post-sitemap.xml</loc></sitemap></sitemapindex>';
 assert.deepEqual(extractSitemapLinks(xml),['https://comune.test/post-sitemap.xml']);
});

test('scopre pagine parrocchiali utili alle feste patronali',()=>{
 const html='<a href="/parrocchie/san-biagio">Parrocchia San Biagio</a><a href="/uffici/ragioneria">Ragioneria</a>';
 assert.deepEqual(extractCandidateLinks(html,'https://diocesi.test/').map(x=>x.url),['https://diocesi.test/parrocchie/san-biagio']);
});
