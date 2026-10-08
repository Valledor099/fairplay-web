import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const candidates=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
let executablePath;for(const path of candidates)if(await fs.access(path).then(()=>true).catch(()=>false)){executablePath=path;break}
const browser=await chromium.launch({headless:true,executablePath});
const results=[];
const shot=(page,name)=>page.screenshot({path:new URL('../evidence/refresh-'+name+'.jpg',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85});
for(const [width,height] of [[325,650],[1024,768],[390,844],[1440,900]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width<600});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1600);
 const fonts=await page.evaluate(()=>({heading:getComputedStyle(document.querySelector('h1')).fontFamily,body:getComputedStyle(document.body).fontFamily}));
 assert.match(fonts.heading,/Barlow/);assert.match(fonts.body,/Manrope/);
 const clipping=await page.evaluate(()=>{const r=document.querySelector('.shared-wordmark').getBoundingClientRect();return {left:r.left,right:r.right,width:innerWidth}});
 assert.ok(clipping.left>=0&&clipping.right<=width+1,JSON.stringify(clipping));
 await shot(page,`${width}-final-hero`);
 for(const id of ['nosotros','tickets']){
  await page.evaluate(id=>window.scrollTo(0,document.getElementById(id).offsetTop-95),id);await page.waitForTimeout(1600);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await shot(page,`${width}-final-${id}`);
 }
 assert.equal(await page.locator('[data-route-scene]').count(),0);
 if(width===390){
  await page.goto('http://127.0.0.1:4181/#entradas',{waitUntil:'networkidle'});
  await page.locator('[data-date]').first().click();await page.locator('[data-time]:not(:disabled)').first().click();
  await page.locator('#guest-name').fill('Revisión visual');await page.locator('#guest-email').fill('visual@example.com');
  await page.locator('button[type=submit]').click();await page.locator('[data-confirm]').click();await page.locator('.confirmation .qr').waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await shot(page,'mobile-final-confirmation');
 }
 assert.deepEqual(errors,[]);results.push({width,height,fonts,clipping,errors});await page.close();
}
for(const mode of ['reduced','no-js']){
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-js'});
 await page.goto('http://127.0.0.1:4181/#nosotros',{waitUntil:'networkidle'});
 if(mode==='reduced')await page.waitForTimeout(1600);
 const data=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,titleFont:getComputedStyle(document.querySelector('.about-title')).fontFamily,photo:document.querySelector('.about-visual img').naturalWidth,hiddenWordCount:[...document.querySelectorAll('.about-title .motion-word')].filter(el=>+getComputedStyle(el).opacity<1).length}));
 assert.equal(data.overflow,false);assert.match(data.titleFont,/Barlow/);assert.ok(data.photo>0);assert.equal(data.hiddenWordCount,0);
 await shot(page,mode+'-final-about');results.push({mode,...data});await page.close();
}
await browser.close();await fs.writeFile(new URL('../evidence/refresh-final-qa.json',import.meta.url),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
