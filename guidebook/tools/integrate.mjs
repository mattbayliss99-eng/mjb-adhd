#!/usr/bin/env node
// Run after build.mjs; sync CSP-compatible hosted files and the search manifest.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dist=path.join(root,'guidebook/dist');
const target=path.join(root,'site/guide');
fs.rmSync(target,{recursive:true,force:true}); fs.mkdirSync(target,{recursive:true});
for(const name of ['index.html','assets','static','guide-data.js','guide-data.json','routes.csv']) fs.cpSync(path.join(dist,name),path.join(target,name),{recursive:true});
fs.cpSync(path.join(root,'guidebook/visuals/web'),path.join(target,'visuals'),{recursive:true});
const data=JSON.parse(fs.readFileSync(path.join(dist,'guide-data.json'),'utf8'));
const registry=path.join(root,'site/js/registry.js');
let text=fs.readFileSync(registry,'utf8').replace(/\n    \/\* GUIDEBOOK START \*\/[\s\S]*?\/\* GUIDEBOOK END \*\/,?/,'');
const routes=[{id:'route.guide',slug:'guide/',title:'Guidebook',crumb:'Guidebook',group:'primary'},...data.pages.filter(p=>p.id!=='home').map(p=>({id:'route.guide.'+p.id,slug:'guide/index.html#/n/'+p.id,title:p.title,crumb:p.short||p.title,group:'guide',summary:p.summary,search:p.plain}))];
text=text.replace('const ROUTES = [','const ROUTES = [\n    /* GUIDEBOOK START */\n'+routes.map(r=>'    '+JSON.stringify(r)).join(',\n')+',\n    /* GUIDEBOOK END */');
fs.writeFileSync(registry,text);
const sitemap=path.join(root,'site/sitemap.xml');let xml=fs.readFileSync(sitemap,'utf8').replace(/\s*<url><loc>https:\/\/mjb-adhd.org.uk\/guide[^<]*<\/loc>[\s\S]*?<\/url>/g,'');
const urls=['/guide/',...data.pages.map(p=>'/guide/static'+p.route)];
xml=xml.replace('</urlset>',urls.map(u=>`  <url><loc>https://mjb-adhd.org.uk${u}</loc><lastmod>2026-10-06</lastmod></url>`).join('\n')+'\n</urlset>');fs.writeFileSync(sitemap,xml);
fs.writeFileSync(path.join(root,'guidebook/hosted-routes.json'),JSON.stringify(data.pages.map(p=>({id:p.id,title:p.title,interactive:'/guide/index.html#/n/'+p.id,static:'/guide/static'+p.route,status:p.status,sourceIds:p.srcs})),null,2)+'\n');
console.log(`Integrated ${data.pages.length} pages, search records and sitemap; offline inline-script editions stay outside the hosted folder.`);
