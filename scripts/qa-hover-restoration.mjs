import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
await page.evaluate(()=>{const s=document.querySelector('#contexto');scrollTo(0,s.offsetTop+.54*(s.offsetHeight-innerHeight))});await page.waitForTimeout(1500);
await page.locator('[data-case="saudi-f1"] .washing-case-name').hover();await page.waitForTimeout(500);
const first=await page.evaluate(()=>({case:document.querySelector('.washing-case-preview').dataset.case,opacity:+getComputedStyle(document.querySelector('.washing-case-preview')).opacity}));
console.log('Early visible title:',first);assert.equal(first.case,'saudi-f1');assert.equal(first.opacity,1);
await page.evaluate(()=>{const s=document.querySelector('#contexto');scrollTo(0,s.offsetTop+.68*(s.offsetHeight-innerHeight))});await page.waitForTimeout(1500);
assert.equal(await page.locator('.washing-case-thumb').count(),0);
const cases=[];
for(const id of ['saudi-f1','six-kings','argentina-1978']){
 await page.locator(`[data-case="${id}"] .washing-case-name`).hover();
 await page.waitForFunction(id=>{const e=document.querySelector('.washing-case-preview');return e.dataset.case===id&&e.dataset.playback==='playing'},id,{timeout:22000});
 const frame=page.frames().find(f=>f.url().includes('/embed/'));const start=await frame.evaluate(()=>document.querySelector('video')?.currentTime||0);await page.waitForTimeout(1100);
 const end=await frame.evaluate(()=>document.querySelector('video')?.currentTime||0);assert.ok(end>start);cases.push({id,playing:true,advances:true});
 await page.screenshot({path:new URL('../evidence/hover-restored-'+id+'.jpg',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85});
}
await page.mouse.move(100,400);await page.waitForTimeout(350);assert.equal(await page.locator('.washing-case-preview').evaluate(e=>+getComputedStyle(e).opacity),0);
await page.locator('a[data-case="six-kings"]').focus();await page.waitForTimeout(500);assert.equal(await page.locator('.washing-case-preview').evaluate(e=>+getComputedStyle(e).opacity),1);
const popupPromise=page.waitForEvent('popup');await page.locator('a[data-case="six-kings"]').click();const popup=await popupPromise;const destination=popup.url();assert.ok(destination.includes('as.com'));await popup.close();
assert.deepEqual(errors,[]);await browser.close();const result={earlyTitle:first,cases,destination,errors};await fs.writeFile(new URL('../evidence/hover-restored-qa.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
