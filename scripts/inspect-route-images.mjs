import {createRequire} from 'node:module';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});await page.waitForTimeout(1000);
for(const fraction of [.16,.195,.24]){await page.evaluate(f=>{const el=document.querySelector('#evento');window.scrollTo(0,el.offsetTop+f*(el.offsetHeight-innerHeight))},fraction);await page.waitForTimeout(1800);console.log(await page.evaluate(()=>({scroll:scrollY,progress:document.querySelector('#passport-scene').dataset.progress,steps:[...document.querySelectorAll('.route-steps li')].map(e=>({current:e.getAttribute('aria-current'),complete:e.className})),photos:[...document.querySelectorAll('[data-route-scene]')].map(e=>({opacity:getComputedStyle(e).opacity,style:e.getAttribute('style')}))})));}
await browser.close();
