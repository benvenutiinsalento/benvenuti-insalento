import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const destination=path.join(root,'dist');
fs.rmSync(destination,{recursive:true,force:true});
fs.mkdirSync(destination,{recursive:true});

const copy=(source,target=source)=>{
  const from=path.join(root,source),to=path.join(destination,target);
  fs.mkdirSync(path.dirname(to),{recursive:true});
  fs.cpSync(from,to,{recursive:true});
};

for(const name of fs.readdirSync(root))if(name.endsWith('.html'))copy(name);
for(const directory of ['assets','styles'])copy(directory);
for(const name of fs.readdirSync(path.join(root,'scripts')))if(name.endsWith('.js'))copy(`scripts/${name}`);
for(const name of ['municipalities.json','verified-programs-2026.json'])copy(`data/${name}`);
for(const name of ['robots.txt','sitemap.xml','salento_senza_stress_guida_v9_benvenutiinsalento.pdf'])copy(name);

console.log(`Sito pubblico generato in dist (${fs.readdirSync(destination).length} elementi principali).`);
