import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const base=process.env.FAIRPLAY_QA_URL||'http://127.0.0.1:4183/';
await fs.mkdir('evidence',{recursive:true});
const results=[];
async function active(page,section){assert.equal(await page.locator('[data-nav][aria-current=location]').getAttribute('data-nav'),section)}
async function openSection(page,hash){await page.evaluate(h=>{location.hash=h},hash);await page.waitForTimeout(450)}
async function noOverflow(page){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow')}
try{
 for(const config of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844},{name:'small',width:325,height:650},{name:'reduced',width:1280,height:800,reduced:true}]){
  const page=await browser.newPage({viewport:{width:config.width,height:config.height},reducedMotion:config.reduced?'reduce':'no-preference',isMobile:config.width<600,hasTouch:config.width<600,acceptDownloads:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.classList.contains('three-ready')||document.body.classList.contains('no-webgl'));
  await active(page,'inicio');await noOverflow(page);
  await page.screenshot({path:`evidence/heuristics-${config.name}-home.png`});
  await page.locator('.hero-ticket-cta .ticket-cta-button').click();await page.waitForURL('**/#entradas');
  await active(page,'tickets');
  assert.match(await page.locator('.booking-progress').innerText(),/Paso 1 de 3/);
  await page.locator('#booking-form [type=submit]').click();
  assert.equal(await page.locator('#guest-name').getAttribute('aria-invalid'),'true');
  await page.locator('#guest-name').fill('  Ana Prueba  ');await page.locator('#guest-email').fill('sin-formato');
  await page.locator('#guest-accessibility').fill('Acceso sin escalones');
  await page.locator('#booking-form [type=submit]').click();
  assert.match(await page.locator('#email-error').innerText(),/nombre@dominio.com/);
  assert.equal(await page.locator('#guest-email').evaluate(el=>el===document.activeElement),true);
  await page.locator('#guest-email').fill('ana@example.com');
  for(let i=0;i<5;i++)await page.locator('[data-quantity="1"]').click();
  assert.equal(await page.locator('[data-quantity="1"]').isDisabled(),true);
  await page.locator('#booking-form [type=submit]').click();await page.waitForURL('**/#revision');
  assert.match(await page.locator('.booking-progress').innerText(),/Paso 2 de 3/);
  assert.match(await page.locator('.review-data').innerText(),/6 entradas/);
  await page.locator('[data-edit]').click();
  assert.equal(await page.locator('#guest-name').inputValue(),'Ana Prueba');
  assert.equal(await page.locator('#guest-accessibility').inputValue(),'Acceso sin escalones');
  for(let i=0;i<5;i++)await page.locator('[data-quantity="-1"]').click();
  assert.equal(await page.locator('[data-quantity="-1"]').isDisabled(),true);
  await page.locator('#booking-form [type=submit]').click();
  await page.locator('[data-cancel]').click();
  assert.equal(await page.locator('dialog').isVisible(),true);
  assert.equal(await page.locator('dialog [value=continue]').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.locator('dialog [value=cancel]').getAttribute('class'),'button');
  await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('dialog [value=cancel]').evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Tab');assert.equal(await page.locator('dialog [value=continue]').evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});
  assert.match(await page.locator('.review-data').innerText(),/Ana Prueba/);
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`evidence/heuristics-${config.name}-review.png`,fullPage:true});await noOverflow(page);
  await page.locator('[data-confirm]').click();await page.waitForSelector('.confirmation .qr');
  assert.match(await page.locator('.booking-progress').innerText(),/Paso 3 de 3/);
  assert.match(await page.locator('.reservation-card h1').innerText(),/QR de prueba/);
  const download=page.waitForEvent('download');await page.locator('[data-download]').click();
  const file=await download;assert.match(file.suggestedFilename(),/^FP-DEMO-.+\.png$/);
  assert.equal(await file.failure(),null);await fs.access(await file.path());
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`evidence/heuristics-${config.name}-qr.png`,fullPage:true});await noOverflow(page);
  const code=await page.locator('.ticket-code').innerText();
  await page.locator('[data-finish]').click();await page.waitForURL('**/#inicio');await active(page,'inicio');
  await page.goBack();await page.waitForSelector('.confirmation .qr');
  assert.equal(await page.locator('.ticket-code').innerText(),code);
  await openSection(page,'#evento');await active(page,'evento');
  if(!config.reduced){
   await page.locator('[data-open-passport]').click();
   await page.waitForFunction(()=>Number(document.querySelector('#passport-scene').dataset.progress)>.30);
   assert.match(await page.locator('#passport-status').innerText(),/Vista previa/);
  }
  await page.screenshot({path:`evidence/heuristics-${config.name}-passport.png`});
  await openSection(page,'#recompensas');await active(page,'recompensas');
  await page.waitForFunction(()=>!document.querySelector('#recompensas').inert);
  assert.equal(await page.locator('.collection-current').innerText(),'1');
  await page.locator('[data-collection-next]').click();
  await page.waitForFunction(()=>document.querySelector('.collection-current').textContent==='2');
  assert.equal(new URL(page.url()).hash,'#recompensas');
  for(let index=3;index<=6;index++){
   await page.locator('[data-collection-next]').click();
   await page.waitForFunction(i=>document.querySelector('.collection-current').textContent===String(i),index);
   await page.waitForTimeout(350);
  }
  assert.equal(await page.locator('[data-collection-next]').isDisabled(),true);
  await page.locator('.collection-window').focus();await page.keyboard.press('Home');
  await page.waitForFunction(()=>document.querySelector('.collection-current').textContent==='1');
  assert.equal(await page.locator('[data-collection-prev]').isDisabled(),true);
  await page.locator('.site-menu summary').click();await page.locator('[data-nav=recompensas]').click();
  await page.waitForTimeout(1300);
  await page.screenshot({path:`evidence/heuristics-${config.name}-rewards.png`});
  await openSection(page,'#como-participar');await page.locator('#passport-help-title').waitFor({state:'visible'});
  await page.screenshot({path:`evidence/heuristics-${config.name}-help.png`});await noOverflow(page);
  await page.locator('#como-participar .inline-link').click();
  await page.locator('#booking-form [type=submit]').click();await page.locator('[data-cancel]').click();
  await page.locator('dialog [value=cancel]').click();await page.waitForURL('**/#tickets');
  await page.locator('#tickets .ticket-cta-button').click();
  assert.equal(await page.locator('#guest-name').inputValue(),'');assert.equal(await page.locator('#booking-quantity').innerText(),'1');
  assert.deepEqual(errors,[]);
  results.push({...config,validation:true,quantityBounds:true,editPreservesData:true,cancelKeepAndDiscard:true,download:true,historyKeepsQR:true,sectionIndicator:true,passportPreview:true,gallery:true,noOverflow:true,errors});
  console.log(config.name+' passed');await page.close();
 }
 // Fallos reales de generación y descarga, provocados en el límite del navegador.
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce',acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'#entradas',{waitUntil:'networkidle'});
 await page.locator('#guest-name').fill('María Ensayo');await page.locator('#guest-email').fill('maria@example.com');
 await page.locator('#booking-form [type=submit]').click();
 await page.evaluate(()=>{window.originalCanvas=HTMLCanvasElement.prototype.toDataURL;HTMLCanvasElement.prototype.toDataURL=function(){throw new Error('Fallo de prueba')}});
 await page.locator('[data-confirm]').click();await page.waitForSelector('[data-retry]');
 assert.match(await page.locator('.reservation-card').innerText(),/Tus datos siguen disponibles/);
 await page.screenshot({path:'evidence/heuristics-generation-error.png',fullPage:true});
 await page.evaluate(()=>{HTMLCanvasElement.prototype.toDataURL=window.originalCanvas});
 await page.locator('[data-retry]').click();await page.waitForSelector('.confirmation .qr');
 await page.evaluate(()=>{window.originalAnchor=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){throw new Error('Descarga de prueba bloqueada')}});
 await page.locator('[data-download]').click();assert.match(await page.locator('.download-status').innerText(),/No pudimos iniciar/);
 assert.equal(await page.locator('.confirmation .qr').count(),1);
 await page.evaluate(()=>{HTMLAnchorElement.prototype.click=window.originalAnchor});
 const retryDownload=page.waitForEvent('download');await page.locator('[data-download]').click();assert.equal(await (await retryDownload).failure(),null);
 assert.deepEqual(errors,[]);results.push({generationFailureAndRetry:true,downloadFailureAndRetry:true,errors});
 await page.close();
 // Un enlace guardado no salta el formulario ni muestra un éxito falso.
 const direct=await browser.newPage({reducedMotion:'reduce'});await direct.goto(base+'#confirmacion',{waitUntil:'networkidle'});
 await direct.waitForSelector('#booking-form');assert.equal(new URL(direct.url()).hash,'#entradas');await direct.close();
 results.push({directConfirmationGuard:true});
 await fs.writeFile('evidence/heuristics-qa.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close()}
