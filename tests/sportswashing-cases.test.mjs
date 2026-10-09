import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sportswashingCases,previewPosition} from '../src/sportswashing-cases-data.js';

test('each example links to its own context and has a distinct local photograph',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const posters=new Set();
 for(const [id,entry] of Object.entries(sportswashingCases)){
  posters.add(entry.poster);
  assert.ok(html.includes(`data-case="${id}" href="${entry.source}"`));
  assert.ok(html.includes(`data-case-preview="${id}"`));
  const poster=fs.readFileSync(new URL('../public/'+entry.poster,import.meta.url));assert.equal(poster.toString('ascii',8,12),'WEBP');
 }
 assert.equal(posters.size,3);
});

test('the floating window stays within the right column and viewport edges',()=>{
 for(const [width,height] of [[1440,900],[1280,720],[900,650],[700,650],[601,650]])for(const [x,y] of [[0,0],[width/2,height/2],[width,height]]){
  const size={width:360,height:265},p=previewPosition({x,y,...size,bounds:{left:0,top:0,width,height}});
  assert.ok(p.x>=Math.min(width*.52,width-size.width-18));assert.ok(p.x+size.width<=width-18);assert.ok(p.y>=95);assert.ok(p.y+size.height<=height-70);
 }
});
