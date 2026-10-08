import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[],fallbackOnly=process.argv.includes('--fallback');
const shot=(page,name)=>page.screenshot({path:new URL('../evidence/comments-'+name+'.jpg',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85});
for(const [width,height] of fallbackOnly?[]:[[1864,884],[1209,884],[390,844],[325,650]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width<600,isMobile:width<600});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 for(const selector of ['.washing-mechanism-note','.washing-footer','.washing-cases-hint','.washing-outro>a','.about-heading>p','.collection-caption>p','.collection-earned'])assert.equal(await page.locator(selector).count(),0,selector);
 assert.ok((await page.locator('.washing-mechanism-media img').getAttribute('src')).includes('hidden-v2'));
 await page.evaluate(()=>{const s=document.querySelector('#contexto');scrollTo(0,s.offsetTop+.222*(s.offsetHeight-innerHeight))});await page.waitForTimeout(1700);await shot(page,width+'-silence');
 await page.evaluate(()=>{const s=document.querySelector('#contexto');scrollTo(0,s.offsetTop+.68*(s.offsetHeight-innerHeight))});await page.waitForTimeout(1500);
 if(width>600){
  const arrow=page.locator('a[data-case="argentina-1978"] .washing-case-arrow');const before=await arrow.evaluate(e=>({color:getComputedStyle(e).color,transform:getComputedStyle(e).transform,width:e.clientWidth}));
  await page.locator('a[data-case="argentina-1978"]').hover();await page.waitForTimeout(700);const after=await arrow.evaluate(e=>({color:getComputedStyle(e).color,transform:getComputedStyle(e).transform}));
  assert.ok(before.width>=46);assert.notEqual(before.color,after.color);assert.match(after.transform,/matrix\(-1/);assert.equal(await page.locator('.washing-case-preview').evaluate(e=>+getComputedStyle(e).opacity),1);
  await shot(page,width+'-arrow-hover');results.push({width,arrow:{before,after}});await page.mouse.move(100,100);
 }
 await page.evaluate(()=>{const s=document.querySelector('#evento');scrollTo(0,s.offsetTop+(3.8/8.95)*(s.offsetHeight-innerHeight))});await page.waitForTimeout(2300);
 await page.locator('.collection-card img').evaluateAll(images=>Promise.all(images.map(img=>{img.loading='eager';return img.decode().catch(()=>{})})));
 const hand=await page.evaluate(()=>{const stage=document.querySelector('.collection-window').getBoundingClientRect(),cards=[...document.querySelectorAll('.collection-card')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:e.offsetWidth,height:e.offsetHeight}});return {stage:stage.toJSON(),cards,span:Math.max(...cards.map(c=>c.right))-Math.min(...cards.map(c=>c.left))}});
 assert.ok(hand.cards.every(c=>c.left>=0&&c.right<=width+1&&c.top>=hand.stage.top-1&&c.bottom<=hand.stage.bottom+1),JSON.stringify({width,hand}));assert.equal(new Set(hand.cards.map(c=>c.height)).size,1);await shot(page,width+'-expanded-hand');results.push({width,hand});
 await page.evaluate(()=>scrollTo(0,document.querySelector('#tickets').offsetTop-90));await page.waitForTimeout(1800);
 const cta=page.locator('.ticket-cta');await cta.scrollIntoViewIfNeeded();await page.waitForTimeout(600);await shot(page,width+'-ticket-folded');
 if(width>600)await cta.hover();else await page.locator('.ticket-cta-button').focus();await page.waitForTimeout(1000);
 const tickets=await page.locator('.ticket-paper').evaluateAll(elements=>elements.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,transform:e.style.transform}}));
 assert.equal(await cta.getAttribute('class'),'ticket-cta is-open');assert.ok(tickets.every(t=>t.left>=0&&t.right<=width+1),JSON.stringify({width,tickets}));await shot(page,width+'-ticket-open');
 await page.locator('.ticket-cta-button').click();await page.locator('#booking-form').waitFor();assert.equal(await page.evaluate(()=>location.hash),'#entradas');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);results.push({width,tickets,errors});await page.close();
}
const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.goto('http://127.0.0.1:4181/#tickets',{waitUntil:'networkidle'});await reduced.locator('.ticket-cta-button').focus();assert.equal(await reduced.locator('.ticket-cta').getAttribute('class'),'ticket-cta is-open');await shot(reduced,'reduced-ticket');
await reduced.locator('a[data-case="six-kings"]').focus();assert.match(await reduced.locator('a[data-case="six-kings"] .washing-case-arrow').evaluate(e=>getComputedStyle(e).transform),/matrix\(-1/);await reduced.close();
const staticPage=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});await staticPage.goto('http://127.0.0.1:4181/#tickets',{waitUntil:'networkidle'});assert.equal(await staticPage.locator('.ticket-burst').isVisible(),false);assert.equal(await staticPage.locator('.ticket-cta-button').isVisible(),true);assert.equal(await staticPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await shot(staticPage,'no-js-ticket');await staticPage.close();results.push({fallbacks:true});
await browser.close();await fs.writeFile(new URL(fallbackOnly?'../evidence/nine-comments-fallback-qa.json':'../evidence/nine-comments-qa.json',import.meta.url),JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>({width:r.width,span:r.hand?.span,cardWidth:r.hand?.cards[0].width,errors:r.errors,arrows:!!r.arrow,tickets:!!r.tickets,fallbacks:r.fallbacks})),null,2));
