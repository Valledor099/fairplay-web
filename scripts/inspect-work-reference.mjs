import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire('C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const candidates=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
let executablePath;for(const p of candidates)if(await fs.access(p).then(()=>true).catch(()=>false)){executablePath=p;break}
const browser=await chromium.launch({headless:true,executablePath});
const page=await browser.newPage({viewport:{width:1440,height:900},ignoreHTTPSErrors:true});
await page.goto('https://tigranz.com/',{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(2500);
console.log(JSON.stringify(await page.evaluate(()=>({links:[...document.querySelectorAll('a')].map(a=>({text:a.innerText,href:a.href})),videos:[...document.querySelectorAll('video')].map(v=>({src:v.src,html:v.outerHTML.slice(0,1400)}))})),null,2));
const work=page.getByText('Work',{exact:true}).first();if(await work.count())await work.click({timeout:5000}).catch(()=>{});
const tencent=page.getByText('Tencent',{exact:true}).first();await tencent.scrollIntoViewIfNeeded();await page.waitForTimeout(2500);await page.evaluate(()=>{const link=[...document.querySelectorAll('a')].find(a=>a.textContent.trim()==='Tencent');window.scrollTo({top:link.getBoundingClientRect().top+window.scrollY-220,behavior:'instant'})});await page.waitForTimeout(2500);await tencent.hover();await page.waitForTimeout(5000);
await page.screenshot({path:new URL('../evidence/tigranz-work-reference.jpg',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),type:'jpeg',quality:85});
console.log(JSON.stringify(await page.evaluate(()=>({hoverVideos:[...document.querySelectorAll('video')].map(v=>({src:v.currentSrc,paused:v.paused,rect:v.getBoundingClientRect().toJSON()}))})),null,2));
await browser.close();
