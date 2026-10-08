import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const build=path.join(root,'dist'),output=path.join(root,'.vercel','output');
await fs.access(path.join(build,'index.html'));
await fs.mkdir(path.join(output,'static'),{recursive:true});
await fs.cp(build,path.join(output,'static'),{recursive:true});
await fs.writeFile(path.join(output,'config.json'),JSON.stringify({version:3},null,2));
let files=0,bytes=0;
async function count(folder){for(const entry of await fs.readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())await count(file);else{files++;bytes+=(await fs.stat(file)).size}}}
await count(path.join(output,'static'));
console.log(JSON.stringify({output,files,megabytes:+(bytes/1024/1024).toFixed(2)},null,2));
