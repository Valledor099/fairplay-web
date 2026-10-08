import fs from 'node:fs';
import path from 'node:path';
const home=process.env.USERPROFILE;
const candidates=[
 path.join(process.env.APPDATA||home,'com.vercel.cli','Data','auth.json'),
 path.join(process.env.LOCALAPPDATA||home,'com.vercel.cli','Data','auth.json'),
 path.join(home,'.local','share','com.vercel.cli','auth.json'),
 path.join(home,'.vercel','auth.json')
];
const npm='C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js';
const npx=path.resolve('.deploy-tools/npm-cache/_npx');
const installed=fs.existsSync(npx)?fs.readdirSync(npx).map(folder=>path.join(npx,folder,'node_modules','vercel','dist','index.js')).filter(file=>fs.existsSync(file)):[];
console.log(JSON.stringify({node:process.version,npm:fs.existsSync(npm),installed,authFiles:candidates.filter(file=>fs.existsSync(file)),environmentTokenAvailable:Boolean(process.env.VERCEL_TOKEN)},null,2));
