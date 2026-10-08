import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const paths=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
let executablePath;for(const p of paths)if(await fs.access(p).then(()=>true).catch(()=>false)){executablePath=p;break}
const browser=await chromium.launch({headless:true,executablePath});
const errors=[],results=[];
const dir=new URL('../evidence/',import.meta.url);await fs.mkdir(dir,{recursive:true});
const screenshot=async(page,name)=>page.screenshot({path:new URL(name+'.jpg',dir).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85});
const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});
await page.evaluate(()=>{const section=document.querySelector('#contexto');window.scrollTo(0,section.offsetTop+.68*(section.offsetHeight-innerHeight))});await page.waitForTimeout(1600);
for(const id of ['saudi-f1','six-kings','argentina-1978']){
 await page.locator(`a[data-case="${id}"]`).hover();
 await page.waitForFunction(()=>['playing','unavailable'].includes(document.querySelector('.washing-case-preview').dataset.playback),{},{timeout:22000}).catch(()=>{});
 await page.waitForTimeout(3300);
 const info=await page.evaluate(()=>{const el=document.querySelector('.washing-case-preview'),r=el.getBoundingClientRect();return {case:el.dataset.case,playback:el.dataset.playback,opacity:getComputedStyle(el).opacity,rect:r.toJSON(),iframe:el.querySelector('iframe')?.src}});
 const videoFrame=page.frames().find(f=>f.url().includes('/embed/'));
 const firstTime=await videoFrame.evaluate(()=>document.querySelector('video')?.currentTime??0);await page.waitForTimeout(1200);
 info.media=await videoFrame.evaluate(()=>{const v=document.querySelector('video');return {time:v?.currentTime,paused:v?.paused,muted:v?.muted}});info.advances=info.media.time>firstTime;results.push(info);
 await screenshot(page,'sportswashing-case-'+id);
}
await page.mouse.move(100,100);await page.waitForTimeout(400);
results.push(await page.evaluate(()=>({leaveOpacity:getComputedStyle(document.querySelector('.washing-case-preview')).opacity})));
await page.locator('a[data-case="six-kings"]').focus();await page.waitForTimeout(400);await screenshot(page,'sportswashing-case-keyboard');
const popupPromise=page.waitForEvent('popup');await page.locator('a[data-case="six-kings"]').click();const popup=await popupPromise;results.push({destination:popup.url()});await popup.close();
for(const id of ['saudi-f1','argentina-1978']){const promise=page.waitForEvent('popup');await page.locator(`a[data-case="${id}"]`).click();const popup=await promise;results.push({caseLink:id,destination:popup.url()});await popup.close()}
await page.evaluate(()=>window.scrollTo(0,document.querySelector('#evento').offsetTop));await page.waitForTimeout(1500);
results.push(await page.evaluate(()=>({exitOpacity:getComputedStyle(document.querySelector('.washing-case-preview')).opacity,passport:document.querySelector('#passport-scene').dataset.progress})));
await page.close();
for(const [name,width,height,reduced] of [['mobile',390,844,false],['small-mobile',319,650,false],['reduced',390,844,true]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:reduced?'reduce':'no-preference'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(name+': '+e.message));
 await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});
 if(!reduced){await page.evaluate(()=>{const section=document.querySelector('#contexto');window.scrollTo(0,section.offsetTop+.68*(section.offsetHeight-innerHeight))});await page.waitForTimeout(1500)}
 await screenshot(page,'sportswashing-definition-'+name);await page.locator('[data-case-preview="six-kings"]').scrollIntoViewIfNeeded();await screenshot(page,'sportswashing-cases-'+name);
 await page.locator('[data-case-preview="six-kings"]').tap();await page.waitForTimeout(1800);await screenshot(page,'sportswashing-case-'+name+'-preview');
 results.push(await page.evaluate(({name})=>{const r=document.querySelector('.washing-case-preview').getBoundingClientRect();return {name,overflow:document.documentElement.scrollWidth>innerWidth,pressed:document.querySelector('[data-case-preview="six-kings"]').getAttribute('aria-pressed'),preview:r.toJSON(),panelScroll:document.querySelector('.washing-explanation').scrollTop}},{name}));
 await page.locator('[data-case-preview="six-kings"]').tap();
 await context.close();
}
const nojs=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});const staticPage=await nojs.newPage();await staticPage.goto('http://127.0.0.1:4181/');await staticPage.locator('.washing-cases').scrollIntoViewIfNeeded();await screenshot(staticPage,'sportswashing-cases-no-js');results.push({noJSLinks:await staticPage.locator('a[data-case]').count(),noJSPreview:await staticPage.locator('.washing-case-preview').isVisible()});await nojs.close();
await browser.close();await fs.writeFile(new URL('sportswashing-cases-qa.json',dir),JSON.stringify({errors,results},null,2));console.log(JSON.stringify({errors,results},null,2));
if(errors.length||results.some(r=>r.overflow||r.playback&&r.playback!=='playing'||r.advances===false||r.noJSPreview))process.exitCode=1;
