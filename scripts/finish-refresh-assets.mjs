import fs from 'node:fs/promises';
await fs.copyFile(new URL('../src/typefaces.css',import.meta.url),new URL('../public/typefaces.css',import.meta.url));
for(const [directory,name] of [['barlowcondensed','barlow-condensed'],['manrope','manrope']]){
 const response=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${directory}/OFL.txt`);
 if(!response.ok)throw new Error('Font license '+response.status);
 await fs.writeFile(new URL(`../public/fonts/${name}-OFL.txt`,import.meta.url),await response.text());
}
await fs.appendFile(new URL('../public/information-static.css',import.meta.url),`\n/* Same locally served typography and new photography, without motion. */
body,button,input{font-family:Manrope,Arial,sans-serif}h1,h2,h3,.washing-wordmark,.washing-case-name,.washing-outro>p{font-family:'Barlow Condensed','Arial Narrow',sans-serif}h1,h2,.washing-outro>p{text-transform:uppercase}.washing-case-thumb{display:inline-block;width:70px;height:70px;margin-bottom:15px}.washing-case-thumb img{width:100%;height:100%;object-fit:cover}.washing-outro-media{max-height:400px;overflow:hidden}.washing-outro-media img{width:100%;object-fit:cover}.route-window,.photo-reveal-shutter,.ticket-photo-note,.footer-photo{display:none}.about-heading{margin-bottom:40px}.about-visual,.ticket-visual{margin:35px 0}.about-visual img,.ticket-visual img{display:block;width:100%;max-height:650px;object-fit:cover}figcaption{font-size:12px;margin-top:15px}figcaption span{margin-left:20px;color:#a4b7ad}.footer-scene>p{font:bold clamp(50px,10vw,150px)/.95 'Barlow Condensed',sans-serif}.footer-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:25px}\n`);
console.log('Local font licenses and static typography ready.');
