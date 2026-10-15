import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import QRCode from 'qrcode';
import {qrPayload,initialBooking} from '../src/booking-model.js';
const require=createRequire(process.env.FAIRPLAY_SVG_MODULES||'C:/Users/AgusSanti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const sharp=require('sharp');
await fs.mkdir(new URL('../evidence/',import.meta.url),{recursive:true});
await sharp(fileURLToPath(new URL('../public/artwork/products/camiseta-product.webp',import.meta.url)))
 .png().toFile(fileURLToPath(new URL('../evidence/ui-kit-export-camiseta.png',import.meta.url)));
await fs.writeFile(new URL('../evidence/ui-kit-export-qr.svg',import.meta.url),await QRCode.toString(qrPayload(initialBooking(),'FP-DEMO-UIKIT'),{type:'svg',margin:3,color:{dark:'#051014',light:'#fcfcfc'}}));
console.log('Fotografía PNG y QR de demostración listos para exportar');
