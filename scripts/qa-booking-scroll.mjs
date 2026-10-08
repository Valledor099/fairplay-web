import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[];
try{
 for(const mode of ['desktop','mobile','reduced']){
  const mobile=mode==='mobile';
  const page=await browser.newPage({viewport:mobile?{width:390,height:650}:{width:1280,height:650},isMobile:mobile,hasTouch:mobile,reducedMotion:mode==='reduced'?'reduce':'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});
  await page.locator('.hero-entry .ticket-cta-button').click();
  await page.waitForURL('**/#entradas');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight));
  assert.ok(await page.evaluate(()=>!['hidden','clip'].includes(getComputedStyle(document.documentElement).overflowY)));
  if(mobile){
   const client=await page.context().newCDPSession(page);
   await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:540}]});
   for(const y of [490,440,390,340,290,240,190]){
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y}]});
    await page.waitForTimeout(30);
   }
   await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await client.detach();
  }else{
   await page.mouse.move(650,450);await page.mouse.wheel(0,700);
  }
  await page.waitForFunction(()=>scrollY>100);
  const firstScroll=await page.evaluate(()=>scrollY);
  console.log(mode,'wheel/touch scroll',firstScroll);
  if(!mobile){
   await page.evaluate(()=>window.scrollTo(0,0));await page.waitForFunction(()=>scrollY<10);
   await page.locator('.reservation-card h1').focus();
   await page.keyboard.press('PageDown');await page.waitForFunction(()=>scrollY>100);
  }
  await page.locator('#guest-name').fill('Ana Prueba');
  await page.locator('#guest-email').fill('ana@example.com');
  await page.locator('#guest-accessibility').fill('Acceso sin escalones');
  const submit=page.locator('#booking-form [type=submit]');
  await submit.scrollIntoViewIfNeeded();
  const bottom=await page.evaluate(()=>scrollY);console.log(mode,'fields filled',bottom);
  assert.ok(bottom>100);
  await submit.click();await page.waitForURL('**/#revision');
  assert.ok((await page.locator('.review-data').textContent()).includes('Acceso sin escalones'));
  assert.equal(await page.evaluate(()=>scrollY),0);
  await page.locator('[data-edit]').click();
  assert.equal(await page.locator('#guest-accessibility').inputValue(),'Acceso sin escalones');
  await page.locator('[data-home]').click();await page.waitForURL('**/#tickets');
  await page.waitForTimeout(700);
  const landingBefore=await page.evaluate(()=>scrollY);
  await page.mouse.move(150,300);await page.mouse.wheel(0,-250);
  await page.waitForFunction(before=>scrollY<before-50,landingBefore);
  await page.locator('#tickets .ticket-cta-button').click();
  await page.waitForURL('**/#entradas');
  await page.mouse.move(190,400);await page.mouse.wheel(0,500);
  await page.waitForFunction(()=>scrollY>100);
  assert.deepEqual(errors,[]);
  results.push({mode,firstScroll,bottom,fields:'complete',review:'passed',returnScroll:'passed',reopen:'passed'});
  await page.close();
 }
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close()}
