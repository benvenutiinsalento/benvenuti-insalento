import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
const root=process.cwd();
const required=['index.html','eventi.html','segnala-evento.html','netlify.toml','.env.example',
'data/municipalities.json','data/localities.json','data/verified-programs-2026.json',
'supabase/migrations/0001_init.sql','supabase/seeds/101_territory.sql','supabase/seeds/102_categories.sql',
'supabase/seeds/103_synonyms.sql','supabase/seeds/104_sources.sql'];
for(const f of required)if(!fs.existsSync(path.join(root,f)))throw new Error(`File mancante: ${f}`);
if(fs.existsSync(path.join(root,'netlify/database')))throw new Error('netlify/database presente: il database principale è Supabase (supabase/migrations).');
const functions=fs.readdirSync(path.join(root,'netlify/functions'),{recursive:true}).filter(f=>String(f).endsWith('.mjs'));
for(const f of functions)execFileSync(process.execPath,['--check',path.join(root,'netlify/functions',String(f))],{stdio:'ignore'});
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
if(pkg.dependencies?.['@netlify/database'])throw new Error('Dipendenza @netlify/database vietata dal mandato: usare Supabase.');
console.log(`Controllo completato: ${functions.length} moduli Netlify validi; migrazione Supabase e seed presenti.`);
