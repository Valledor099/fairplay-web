import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[];
try{
 for(const [name,width,height,reduced] of [['desktop',1440,900,false],['mobile',390,844,false],['small',325,650,false],['reduced',390,844,true]]){
  const mobile=width<600;
  const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:reduced?'reduce':'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4181/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>document.querySelector('#recompensas').parentElement.id==='contenido');
  if(!reduced){
   await page.waitForFunction(()=>document.body.classList.contains('three-ready'));
   await page.evaluate(()=>{const event=document.querySelector('#evento');window.scrollTo(0,event.offsetTop+.97*(event.offsetHeight-innerHeight))});
   await page.waitForTimeout(1500);
   assert.ok(await page.locator('#recompensas').evaluate(el=>Number(getComputedStyle(el).opacity)>.95));
   assert.ok(await page.locator('#recompensas').evaluate(el=>el.getBoundingClientRect().top<innerHeight*.15));
  }
  await page.evaluate(()=>window.scrollTo(0,document.querySelector('.collection-window').getBoundingClientRect().top+scrollY-115));
  await page.waitForTimeout(1200);
  const viewport=page.locator('.collection-window'),current=page.locator('.collection-current');
  const check=async index=>{
   await page.waitForFunction(index=>Number(document.querySelector('.collection-current').textContent)===index+1,index);
   await page.waitForFunction(index=>{
    const viewport=document.querySelector('.collection-window').getBoundingClientRect(),card=document.querySelectorAll('.collection-card')[index].getBoundingClientRect();
    return Math.abs((viewport.left+viewport.right-card.left-card.right)/2)<3;
   },index);
  };
  await check(0);
  const originalY=await page.evaluate(()=>scrollY);
  const first=await page.locator('.collection-card').first().boundingBox();assert.ok(first.width>width*(mobile?.8:.35));
  assert.equal(await page.locator('.collection-card').first().evaluate(el=>getComputedStyle(el).transform),'none');
  if(mobile){
   const client=await page.context().newCDPSession(page);
   await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width-40,y:350}]});
   for(let x=width-80;x>=40;x-=40){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:350}]});await page.waitForTimeout(40)}
   await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await client.detach();
   await check(1);
  }else{
   await page.mouse.move(width/2,350);await page.mouse.wheel(0,180);await check(1);
   assert.ok(Math.abs(await page.evaluate(()=>scrollY)-originalY)<5);
   await viewport.focus();await page.keyboard.press('ArrowRight');await check(2);
  }
  await viewport.focus();await page.keyboard.press('Home');await check(0);
  for(let index=1;index<6;index++){
   await page.locator('[data-collection-next]').click();await check(index);
  }
  assert.ok(await page.locator('[data-collection-next]').isDisabled());
  await page.locator('[data-collection-prev]').click();await check(4);
  await viewport.focus();await page.keyboard.press('End');await check(5);
  await page.evaluate(()=>window.scrollTo(0,document.querySelector('.collection-window').getBoundingClientRect().top+scrollY-115));
  await page.waitForTimeout(500);const beforeExit=await page.evaluate(()=>scrollY);
  console.log(name,'all six cards passed; checking page scroll at the edge');
  await page.mouse.move(width/2,300);await page.mouse.wheel(0,350);
  await page.waitForFunction(before=>scrollY>before+100,beforeExit);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('.footer-scene').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({path:new URL(`../evidence/horizontal-footer-${name}.jpg`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85});
  assert.equal(await page.locator('.footer-scene>p').evaluate(el=>{const copy=el.cloneNode(true);copy.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode(' ')));return (el.getAttribute('aria-label')||copy.textContent).replace(/\s+/g,' ').trim()}),'El deporte también se cuestiona.');
  await page.evaluate(()=>window.scrollTo(0,document.querySelector('#recompensas').offsetTop-92));await page.waitForTimeout(700);
  await page.screenshot({path:new URL(`../evidence/horizontal-collection-${name}.jpg`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85});
  assert.deepEqual(errors,[]);results.push({name,width,cardWidth:first.width,allSix:'passed',nativeSwipe:mobile,edgeExit:'passed',errors});
  console.log(name,'passed');await page.close();
 }
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close()}
