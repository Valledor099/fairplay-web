import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[];
for(const [width,height] of process.argv.includes('--mobile')?[[390,844],[325,650]]:[[1864,884],[1209,884],[390,844],[325,650]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width<600,isMobile:width<600});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 for(const index of [0,2,5,0]){
  await page.evaluate(index=>{const s=document.querySelector('#evento');scrollTo(0,s.offsetTop+((3.8+index*.9)/8.95)*(s.offsetHeight-innerHeight))},index);
  await page.waitForTimeout(2300);
  await page.locator('.collection-card img').evaluateAll(images=>Promise.all(images.map(img=>{img.loading='eager';return img.decode().catch(()=>{})})));
  const data=await page.evaluate(()=>{
   const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,centre:(r.left+r.right)/2}};
   const stage=document.querySelector('.collection-window'),cards=[...document.querySelectorAll('.collection-card')],active=cards.find(c=>c.dataset.focused==='true');
   const exposed=Array(cards.length).fill(0),bounds=stage.getBoundingClientRect();
   const inertStates=cards.map(card=>card.inert);
   cards.forEach(card=>{card.inert=false;card.style.pointerEvents='auto'});
   for(let y=Math.max(0,bounds.top);y<Math.min(innerHeight,bounds.bottom);y+=12){
    for(let x=bounds.left;x<bounds.right;x+=12){
     const card=document.elementsFromPoint(x,y).map(e=>e.closest('.collection-card')).find(Boolean);
     if(card)exposed[cards.indexOf(card)]++;
    }
   }
   cards.forEach((card,i)=>{card.inert=inertStates[i];card.style.removeProperty('pointer-events')});
   return {stage:rect(stage),exposed,counter:document.querySelector('.collection-current').textContent,overflow:document.documentElement.scrollWidth>innerWidth,cards:cards.map(c=>({...rect(c),height:c.offsetHeight,photoHeight:c.querySelector('.collection-photo').offsetHeight,colour:getComputedStyle(c.querySelector('h3')).color,padding:getComputedStyle(c).padding,visible:getComputedStyle(c).visibility})),active:{...rect(active),transform:active.style.transform,title:rect(active.querySelector('h3'))}};
  });
  assert.equal(data.counter,String(index+1).padStart(2,'0'));assert.equal(data.overflow,false);
  assert.ok(Math.abs(data.active.centre-data.stage.centre)<2,JSON.stringify({width,index,data}));
  assert.ok(data.cards.every(c=>c.padding==='0px'&&Math.abs(c.height-c.photoHeight)<=1&&c.colour==='rgb(255, 255, 255)'&&c.visible==='visible'));
  assert.ok(data.cards.every(c=>c.left>=-1&&c.right<=width+1&&c.bottom<=height-35),JSON.stringify({width,index,data}));
  assert.ok(data.active.title.top>=data.active.top&&data.active.title.bottom<data.active.bottom);
  assert.ok(data.exposed.every(points=>points>2),JSON.stringify({width,index,exposed:data.exposed}));
  if(index===2)await page.screenshot({path:new URL(`../evidence/fullbleed-fan-${width}.jpg`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:88});
  results.push({width,index,...data});
 }
 const photo=page.locator('[data-product-photo]').first();
 if(width<600)await photo.tap();else await photo.hover();
 assert.equal(await photo.getAttribute('aria-pressed'),'true');
 await page.locator('[data-collection-next]').click();await page.waitForTimeout(2000);
 assert.equal(await page.locator('.collection-current').textContent(),'02');
 assert.deepEqual(errors,[]);await page.close();
}
for(const fallback of ['reduced','no-js']){
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce',javaScriptEnabled:fallback!=='no-js'});
 await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.collection-card').count(),6);
 assert.equal(await page.locator('.collection-caption h3').first().evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');
 await page.close();
}
await browser.close();await fs.writeFile(new URL('../evidence/fullbleed-fan-qa.json',import.meta.url),JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(r=>({width:r.width,index:r.index,counter:r.counter,centred:r.active.centre,fanWidth:Math.max(...r.cards.map(c=>c.right))-Math.min(...r.cards.map(c=>c.left))})),null,2));
