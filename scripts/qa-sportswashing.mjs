import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const candidates=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'];
let executablePath;
for(const candidate of candidates)if(await fs.access(candidate).then(()=>true).catch(()=>false)){executablePath=candidate;break}
if(!executablePath)throw new Error('No installed Chromium browser found');
const browser=await chromium.launch({headless:true,executablePath});
const errors=[];
const results=[];
const out=new URL('../evidence/',import.meta.url);
await fs.mkdir(out,{recursive:true});
for(const [name,width,height,reduced] of [['desktop',1440,900,false],['mobile',390,844,false],['small-mobile',319,650,false],['reduced',390,844,true]]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(name+': '+e.message));
 await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.classList.contains('three-ready')||document.body.classList.contains('no-webgl'));
 if(!reduced){
  for(const [phase,p] of [['concealment',.32],['definition',.68],['handoff',.98]]){
   await page.evaluate(p=>{const el=document.querySelector('#contexto');window.scrollTo(0,el.offsetTop+p*(el.offsetHeight-innerHeight))},p);
   await page.waitForTimeout(1800);
   await page.screenshot({path:new URL(`sportswashing-new-${name}-${phase}.jpg`,out).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85});
   results.push(await page.evaluate(({name,phase})=>{
    const definition=document.querySelector('.washing-definition').getBoundingClientRect();
    const word=document.querySelector('.washing-wordmark').getBoundingClientRect();
    return {name,phase,overflow:document.documentElement.scrollWidth>innerWidth,definition:{top:definition.top,bottom:definition.bottom},word:{left:word.left,right:word.right},active:document.querySelector('#contexto').dataset.phase,passport:document.querySelector('#passport-scene').dataset.progress,body:document.body.className};
   },{name,phase}));
  }
  await page.evaluate(()=>window.scrollTo(0,document.querySelector('#evento').offsetTop+innerHeight*1.7));
  await page.waitForTimeout(1500);
  results.push(await page.evaluate(()=>({passportOpen:document.querySelector('#passport-scene').dataset.progress,completed:document.querySelector('#passport-scene').dataset.completed})));
  await page.evaluate(()=>{const el=document.querySelector('#contexto');window.scrollTo(0,el.offsetTop+.68*(el.offsetHeight-innerHeight))});
  await page.waitForTimeout(1500);
  results.push(await page.evaluate(()=>({reverse:document.querySelector('#contexto').dataset.phase,handoff:document.body.classList.contains('has-passport-handoff')})));
 }else{
  await page.locator('.washing-definition').scrollIntoViewIfNeeded();
  await page.screenshot({path:new URL(`sportswashing-new-${name}.jpg`,out).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85});
  results.push(await page.evaluate(()=>({reduced:true,height:document.querySelector('#contexto').offsetHeight,definitionVisible:getComputedStyle(document.querySelector('.washing-explanation')).visibility,overflow:document.documentElement.scrollWidth>innerWidth})));
 }
 await context.close();
}
const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
const page=await context.newPage();await page.goto('http://127.0.0.1:4181/');
await page.locator('.washing-definition').scrollIntoViewIfNeeded();
await page.screenshot({path:new URL('sportswashing-new-no-js.jpg',out).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85});
await context.close();await browser.close();
await fs.writeFile(new URL('sportswashing-new-qa.json',out),JSON.stringify({errors,results},null,2));
console.log(JSON.stringify({errors,results},null,2));
if(errors.length||results.some(r=>r.overflow))process.exitCode=1;
