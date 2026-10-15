import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 base:'./',server:{port:4180,strictPort:true},preview:{port:4180,strictPort:true},
 build:{rollupOptions:{input:{
  main:fileURLToPath(new URL('./index.html',import.meta.url)),
  'ui-kit':fileURLToPath(new URL('./ui-kit.html',import.meta.url))
 }}}
});
