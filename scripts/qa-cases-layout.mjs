import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const paths=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
let executablePath;for(const p of paths)if(await fs.access(p).then(()=>true).catch(()=>false)){executablePath=p;break}
const browser=await chromium.launch({headless:true,executablePath});const results=[];
for(const [width,height] of [[390,844],[319,650],[700,650],[601,650]]){
 const page=await browser.newPage({viewport:{width,height}});await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});
 await page.evaluate(()=>{const s=document.querySelector('#contexto');window.scrollTo(0,s.offsetTop+.68*(s.offsetHeight-innerHeight))});await page.waitForTimeout(1300);
 const data=await page.evaluate(()=>{const panel=document.querySelector('.washing-explanation'),definition=document.querySelector('.washing-definition').getBoundingClientRect(),cases=document.querySelector('.washing-cases').getBoundingClientRect();return {width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,scroll:scrollY,panel:panel.scrollTop,definitionBottom:definition.bottom,casesTop:cases.top}});
 if(width<601){await page.mouse.move(width/2,450);await page.mouse.wheel(0,240);await page.waitForTimeout(800);data.native=await page.evaluate(()=>({scroll:scrollY,panel:document.querySelector('.washing-explanation').scrollTop}));await page.locator('[data-case-preview="six-kings"]').scrollIntoViewIfNeeded();await page.screenshot({path:new URL(`../evidence/sportswashing-cases-${width}-final.jpg`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85})}
 else{await page.locator('a[data-case="saudi-f1"]').hover({position:{x:40,y:35}});await page.waitForTimeout(450);const before=await page.locator('.washing-case-preview').boundingBox();await page.locator('a[data-case="saudi-f1"]').hover({position:{x:190,y:65}});await page.waitForTimeout(450);const after=await page.locator('.washing-case-preview').boundingBox();data.follows=before.y!==after.y||before.x!==after.x;data.previewWithinViewport=after.x>=0&&after.x+after.width<=width}
 results.push(data);await page.close();
}
await browser.close();console.log(JSON.stringify(results,null,2));await fs.writeFile(new URL('../evidence/sportswashing-cases-layout.json',import.meta.url),JSON.stringify(results,null,2));
if(results.some(r=>r.overflow||r.width<601&&(r.casesTop<r.definitionBottom||r.native.panel<=r.panel||Math.abs(r.native.scroll-r.scroll)>2)||r.previewWithinViewport===false||r.follows===false))process.exitCode=1;
