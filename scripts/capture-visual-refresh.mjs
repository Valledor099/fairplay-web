import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');const paths=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];let executablePath;for(const p of paths)if(await fs.access(p).then(()=>true).catch(()=>false)){executablePath=p;break}
const browser=await chromium.launch({headless:true,executablePath});const prefix=process.argv[2]||'after';const results=[];
for(const [width,height] of [[1440,900],[390,844]]){
 const page=await browser.newPage({viewport:{width,height},isMobile:width<600,hasTouch:width<600});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700);
 for(const section of ['hero','washing','passport','collection','about','tickets','footer']){
  await page.evaluate(section=>{const washing=document.querySelector('#contexto'),event=document.querySelector('#evento');const positions={hero:0,washing:washing.offsetTop+.68*(washing.offsetHeight-innerHeight),passport:event.offsetTop+.16*(event.offsetHeight-innerHeight),collection:event.offsetTop+.63*(event.offsetHeight-innerHeight),about:document.querySelector('#nosotros').offsetTop-100,tickets:document.querySelector('#tickets').offsetTop-90,footer:document.querySelector('footer').offsetTop-100};window.scrollTo({top:positions[section],behavior:'instant'})},section);await page.waitForTimeout(1400);
  await page.screenshot({path:new URL(`../evidence/refresh-${prefix}-${width}-${section}.jpg`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:80});
  results.push(await page.evaluate(({section,width})=>({section,width,overflow:document.documentElement.scrollWidth>innerWidth,fonts:document.fonts.status,images:[...document.querySelectorAll('img')].filter(e=>e.getBoundingClientRect().bottom>0&&e.getBoundingClientRect().top<innerHeight).map(e=>({src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0}))}),{section,width}));
 }results.push({width,errors});await page.close();
}
await browser.close();await fs.writeFile(new URL(`../evidence/refresh-${prefix}-qa.json`,import.meta.url),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
