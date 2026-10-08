import fs from 'node:fs/promises';
const htmlUrl=new URL('../index.html',import.meta.url);
const html=await fs.readFile(htmlUrl,'utf8');
await fs.writeFile(htmlUrl,html.replace(/<span class="washing-case-thumb"[^>]*>[\s\S]*?<\/span>/g,''));
const cssUrl=new URL('../src/visual-refresh.css',import.meta.url);
let css=await fs.readFile(cssUrl,'utf8');
css=css.replace(/\.washing-case\[data-active\] \.washing-case-thumb img\{[^}]*\}\n?/g,'')
 .replace(/\.washing-case-thumb(?: img)?\{[^}]*\}\n?/g,'')
 .replace('padding:21px 28px 20px 88px','padding:21px 28px 20px 0')
 .replace('padding-left:64px','padding-left:0')
 .replace('padding:20px 25px 20px 78px','padding:20px 25px 20px 0')
 .replace('padding-left:67px','padding-left:0')
 .replaceAll('margin-left:78px','margin-left:0').replaceAll('margin-left:67px','margin-left:0');
await fs.writeFile(cssUrl,css);
const staticUrl=new URL('../public/information-static.css',import.meta.url);
await fs.writeFile(staticUrl,(await fs.readFile(staticUrl,'utf8')).replace(/\.washing-case-thumb(?: img)?\{[^}]*\}/g,''));
console.log('Removed case thumbnails and their reserved space.');
