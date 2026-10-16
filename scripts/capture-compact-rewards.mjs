import {createRequire} from 'node:module';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
const page=await browser.newPage({viewport:{width,height},isMobile:width<600,hasTouch:width<600});
await page.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});
await page.waitForFunction(()=>document.body.classList.contains('three-ready')||document.body.classList.contains('no-webgl'));
await page.evaluate(()=>document.querySelector('a[href="#recompensas"]').click());
await page.waitForTimeout(1800);
await page.screenshot({path:`evidence/rewards-compact-${name}.png`});
console.log(name,await page.locator('#recompensas').evaluate(el=>({top:el.getBoundingClientRect().top,opacity:getComputedStyle(el).opacity})));
await page.close();
}}finally{await browser.close()}
