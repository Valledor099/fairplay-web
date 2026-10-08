import fs from 'node:fs/promises';
const file=new URL('../index.html',import.meta.url);let html=await fs.readFile(file,'utf8');
for(const [id,asset] of [['saudi-f1','saudi-f1'],['six-kings','six-kings'],['argentina-1978','argentina-1978']]){
 const marker=`data-case="${id}"`;const start=html.indexOf(marker);const end=html.indexOf('>',start)+1;if(html.slice(end,end+80).includes('washing-case-thumb'))continue;
 html=html.slice(0,end)+`<span class="washing-case-thumb" aria-hidden="true"><img src="./artwork/news/${asset}.webp" width="1400" height="933" alt="" loading="lazy" decoding="async"></span>`+html.slice(end);
}
await fs.writeFile(file,html);
