// Rasterise the exact public SVGs; no online images or generator dependencies.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');
const root=path.resolve(__dirname,'../site');
(async()=>{const m=JSON.parse(fs.readFileSync(path.join(root,'assets/atlas/manifest.json')));let rendered=0;
 for(const f of m.figures){if(f.version!=='review-2026-10-13.2'&&fs.existsSync(path.join(root,f.web))&&fs.existsSync(path.join(root,f.full)))continue;const svg=path.join(root,f.svg);
  await sharp(svg).resize({width:f.width}).webp({quality:86}).toFile(path.join(root,f.web));
  await sharp(svg).resize({width:f.width*2}).png().toFile(path.join(root,f.full));
 rendered++;}console.log('Rasterised '+rendered+' diagrams from exact reviewed SVGs; preserved existing reviewed pilot rasters.');
})().catch(e=>{console.error(e);process.exitCode=1;});
