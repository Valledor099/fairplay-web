import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[];
await fs.mkdir('evidence',{recursive:true});
try{
 for(const [name,width,height,reduced] of [['desktop',1440,900,false],['mobile',390,844,false],['small',325,650,false],['reduced',1280,800,true]]){
  const mobile=width<600;
  const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:reduced?'reduce':'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.FAIRPLAY_QA_URL||'http://127.0.0.1:4180/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.classList.contains('three-ready')||document.body.classList.contains('no-webgl'));
  await page.evaluate(()=>{location.hash='#recompensas'});
  const viewport=page.locator('.collection-window');
  await page.waitForFunction(()=>!document.querySelector('#recompensas').inert);
  await page.waitForTimeout(1300);
  const check=async index=>{
   await page.waitForFunction(index=>{
    const viewport=document.querySelector('.collection-window').getBoundingClientRect(),card=document.querySelectorAll('.collection-card')[index].getBoundingClientRect();
    return Number(document.querySelector('.collection-current').textContent)===index+1&&Math.abs((viewport.left+viewport.right-card.left-card.right)/2)<3;
   },index);
   await page.waitForTimeout(220);
  };
  const positionGallery=async()=>{
   await page.evaluate(()=>window.scrollTo(0,document.querySelector('.collection-window').getBoundingClientRect().top+scrollY-160));
   await page.waitForTimeout(500);
  };
  await check(0);await positionGallery();
  const first=await page.locator('.collection-card').first().boundingBox();
  assert.ok(first.width<=400&&first.width>=(mobile?width*.74:390));
  assert.ok(first.height<540);
  assert.equal(await page.locator('[data-collection-prev]').isDisabled(),true);
  for(let index=1;index<6;index++){await page.locator('[data-collection-next]').click();await check(index)}
  assert.ok(await page.locator('[data-collection-next]').isDisabled());
  await viewport.focus();await page.keyboard.press('Home');await check(0);
  // Rapid commands accumulate their requested destination while smooth scrolling is still running.
  await page.locator('[data-collection-next]').evaluate(button=>{button.click();button.click();button.click()});await check(3);
  await viewport.focus();await page.keyboard.press('ArrowLeft');await check(2);
  await page.keyboard.press('End');await check(5);await page.keyboard.press('Home');await check(0);
  await positionGallery();
  const box=await viewport.boundingBox(),y=box.y+Math.min(140,box.height/2);
  if(mobile){
   const client=await page.context().newCDPSession(page);
   await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width-40,y}]});
   for(let x=width-70;x>=55;x-=30){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await page.waitForTimeout(35)}
   await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await client.detach();
   await page.waitForFunction(()=>document.querySelector('.collection-window').scrollLeft>80);
  }else{
   await page.mouse.move(width/2,y);await page.mouse.wheel(310,0);
   await page.waitForFunction(()=>document.querySelector('.collection-window').scrollLeft>150);
   await viewport.focus();await page.keyboard.press('Home');await check(0);
   const photo=page.locator('[data-product-photo]').first();
   await photo.evaluate(el=>{window.collectionDragClicks=0;el.addEventListener('click',()=>window.collectionDragClicks++)});
   await page.mouse.move(width/2+70,y);await page.mouse.down();await page.mouse.move(width/2-240,y,{steps:16});await page.mouse.up();await check(1);
   assert.equal(await page.evaluate(()=>window.collectionDragClicks),0);
   assert.equal(await viewport.evaluate(el=>el.classList.contains('is-dragging')),false);
   await photo.click();assert.equal(await page.evaluate(()=>window.collectionDragClicks),1);
  }
  // An ordinary mouse wheel moves horizontally, including multiple small events in a burst.
  await viewport.focus();await page.keyboard.press('Home');await check(0);
  await page.locator('[data-collection-next]').click();await check(1);await positionGallery();
  const before=await page.evaluate(()=>({y:scrollY,x:document.querySelector('.collection-window').scrollLeft}));
  await page.mouse.move(width/2,y);
  for(let i=0;i<10;i++)await page.mouse.wheel(0,28);
  await page.waitForFunction(before=>document.querySelector('.collection-window').scrollLeft>before+200,before.x);
  await page.waitForTimeout(600);
  assert.ok(Math.abs(await page.evaluate(()=>scrollY)-before.y)<5);
  const after=await viewport.evaluate(el=>el.scrollLeft);
  assert.ok(Math.abs(after-before.x-280)<5,'wheel movement follows the accumulated delta without snapping back');
  await page.waitForTimeout(250);
  assert.ok(Math.abs(await viewport.evaluate(el=>el.scrollLeft)-after)<2);
  // Both ends hand vertical scrolling back to the page.
  await viewport.focus();await page.keyboard.press('End');await check(5);await positionGallery();
  const endY=await page.evaluate(()=>scrollY);
  await page.mouse.move(width/2,y);await page.mouse.wheel(0,280);
  await page.waitForFunction(before=>scrollY>before+100,endY);
  await page.waitForTimeout(800);
  await viewport.focus();await page.keyboard.press('Home');await check(0);await positionGallery();
  const startY=await page.evaluate(()=>scrollY);
  await page.mouse.move(width/2,y);await page.mouse.wheel(0,-280);
  await page.waitForFunction(before=>scrollY<before-100,startY);
  await page.waitForTimeout(800);
  await page.evaluate(()=>document.querySelector('a[href="#recompensas"]').click());await page.waitForTimeout(1600);
  await viewport.focus();await page.keyboard.press('ArrowRight');await check(1);
  await positionGallery();
  // A refresh with unchanged dimensions must preserve the current horizontal position.
  await page.evaluate(()=>window.dispatchEvent(new Event('resize')));await check(1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.evaluate(()=>document.querySelector('a[href="#recompensas"]').click());await page.waitForTimeout(1600);
  await page.screenshot({path:`evidence/rewards-compact-${name}.png`});
  assert.deepEqual(errors,[]);
  results.push({name,width,cardWidth:first.width,cardHeight:first.height,arrows:'passed',rapidClicks:'passed',keyboard:'passed',horizontalInput:'passed',mouseWheel:'passed',edgeExitBothDirections:'passed',resize:'passed',errors});
  console.log(name,'passed');await page.close();
 }
 await fs.writeFile('evidence/rewards-compact-qa.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close()}
