import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {EVENT} from '../src/event-config.js';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[];
const screenshot=(page,name)=>page.screenshot({path:new URL(`../evidence/${name}.jpg`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:88});
for(const [width,height] of [[1864,884],[1209,884],[390,844],[325,650]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width<600,isMobile:width<600});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1800);
 const hero=await page.evaluate(()=>{
  const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
  return {button:rect('.hero-entry .ticket-cta-button'),title:rect('#hero-title'),timer:rect('.countdown-digits'),overflow:document.documentElement.scrollWidth>innerWidth};
 });
 assert.equal(hero.overflow,false);assert.ok(hero.button.bottom<hero.timer.top);
 assert.ok(hero.button.left>=0&&hero.button.right<=width&&hero.button.bottom<height);
 assert.ok(hero.title.bottom<hero.button.top||hero.title.right<hero.button.left,JSON.stringify({width,hero}));
 const before=await page.locator('[data-countdown-value=seconds]').textContent();await page.waitForTimeout(1250);
 assert.notEqual(await page.locator('[data-countdown-value=seconds]').textContent(),before);
 if(width>600){
  await page.locator('.hero-entry .ticket-cta-button').hover();await page.waitForTimeout(900);
  assert.equal(await page.locator('.hero-ticket-cta').getAttribute('class'),'ticket-cta hero-ticket-cta is-open');
 }
 await screenshot(page,`single-day-hero-${width}`);
 await page.locator('.hero-entry .ticket-cta-button').click();
 await page.waitForURL('**/#entradas');
 assert.equal(await page.locator('[data-date],[data-time],#date-options,#time-options').count(),0);
 assert.equal(await page.locator('.booking-event time').textContent(),EVENT.label);
 await page.locator('#booking-form [type=submit]').click();
 assert.equal(await page.locator('#guest-name').getAttribute('aria-invalid'),'true');
 await page.locator('#guest-name').fill('Ana Prueba');await page.locator('#guest-email').fill('ana@example.com');
 await page.locator('[data-quantity="1"]').click();await page.locator('[data-quantity="1"]').click();
 await screenshot(page,`single-day-form-${width}`);
 await page.locator('#booking-form [type=submit]').click();await page.waitForURL('**/#revision');
 assert.ok((await page.locator('.review-data').textContent()).includes('Todo el día, sin turno'));
 await page.locator('[data-edit]').click();assert.equal(await page.locator('#guest-name').inputValue(),'Ana Prueba');
 assert.equal(await page.locator('#booking-quantity').textContent(),'3');
 await page.locator('[data-home]').click();await page.waitForURL('**/#tickets');
 await page.locator('#tickets .ticket-cta-button').click();
 assert.equal(await page.locator('#guest-email').inputValue(),'ana@example.com');
 await page.locator('#booking-form [type=submit]').click();await page.locator('[data-confirm]').click();
 await page.locator('.confirmation .qr').waitFor();
 assert.ok((await page.locator('.confirmation').textContent()).includes(EVENT.label));
 assert.ok((await page.locator('.confirmation').textContent()).includes('Todo el día'));
 const download=page.waitForEvent('download');await page.locator('.confirmation a[download]').click();
 assert.ok((await download).suggestedFilename().startsWith('FP-DEMO-'));
 await screenshot(page,`single-day-confirmation-${width}`);
 assert.deepEqual(errors,[]);results.push({width,height,...hero,booking:'passed',download:'passed',errors});await page.close();
}
for(const [name,now] of [['today','2026-12-12T15:00:00-03:00'],['finished','2026-12-13T00:00:00-03:00']]){
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.clock.setFixedTime(new Date(now));await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.hero-entry').getAttribute('data-phase'),name);
 assert.equal(await page.locator('[role=timer]').isVisible(),false);
 assert.ok((await page.locator('[data-countdown-status]').textContent()).includes(name==='today'?'Es hoy':'terminó'));
 await page.close();
}
const noJs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
await noJs.goto('http://127.0.0.1:4181/');assert.equal(await noJs.locator('.hero-event-date time').textContent(),EVENT.label);
assert.equal(await noJs.locator('[role=timer]').isVisible(),false);await noJs.close();
await browser.close();await fs.writeFile(new URL('../evidence/single-day-qa.json',import.meta.url),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
