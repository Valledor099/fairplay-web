import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[],captionsOnly=process.argv.includes('--captions');
for(const [width,height] of captionsOnly?[[390,844],[325,650]]:[[1209,884],[390,844],[325,650]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width<600,isMobile:width<600});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('.event-copy img').count(),0);
 assert.equal(await page.locator('.washing-definition a').count(),0);
 for(const [name,index] of captionsOnly?[['first',0]]:[['first',0],['last',5],['reverse',0]]){
  await page.evaluate(index=>{const s=document.querySelector('#evento');scrollTo(0,s.offsetTop+((3.8+index*.9)/8.95)*(s.offsetHeight-innerHeight))},index);await page.waitForTimeout(2300);
  await page.locator('.collection-card img').evaluateAll(images=>Promise.all(images.map(img=>{img.loading='eager';return img.decode().catch(()=>{})})));
  const data=await page.evaluate(()=>{const cards=[...document.querySelectorAll('.collection-card')];return {counter:document.querySelector('.collection-current').textContent,rewardsOpacity:+getComputedStyle(document.querySelector('#recompensas')).opacity,overflow:document.documentElement.scrollWidth>innerWidth,cards:cards.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:e.offsetWidth,height:e.offsetHeight,transform:e.style.transform,visible:getComputedStyle(e).visibility}})}});
  assert.equal(data.counter,name==='last'?'06':'01');assert.equal(data.overflow,false);assert.equal(new Set(data.cards.map(c=>c.height)).size,1);
  assert.ok(data.rewardsOpacity>=.99);assert.ok(data.cards.every(c=>c.left>=0&&c.right<=width+1&&c.bottom<=height-40&&c.visible==='visible'),JSON.stringify({width,data}));
  const captions=await page.locator('.collection-caption').evaluateAll(elements=>elements.map(e=>({height:e.clientHeight,content:e.scrollHeight})));
  if(captionsOnly)assert.ok(captions.every(c=>c.content<=c.height),JSON.stringify({width,captions}));
  await page.screenshot({path:new URL(`../evidence/card-hand-${width}-${name}.jpg`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85});results.push({width,name,...data});
 }
 const photo=page.locator('[data-product-photo]').first();
 if(width<600){await photo.tap();assert.equal(await photo.getAttribute('aria-pressed'),'true')}else{await photo.hover();assert.equal(await photo.getAttribute('aria-pressed'),'true')}
 await page.locator('[data-collection-next]').click();await page.waitForTimeout(1700);assert.equal(await page.locator('.collection-current').textContent(),'02');
 assert.deepEqual(errors,[]);await page.close();
}
await browser.close();await fs.writeFile(new URL(captionsOnly?'../evidence/card-hand-captions-qa.json':'../evidence/card-hand-qa.json',import.meta.url),JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>({width:r.width,name:r.name,counter:r.counter,heights:r.cards.map(c=>c.height)})),null,2));
